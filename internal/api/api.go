package api

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log/slog"
	"net/http"
	"sync"

	"github.com/bbcvasconcellos/ask-me-anything/internal/store/pgstore/pgstore"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/google/uuid"
	"github.com/gorilla/websocket"
	"github.com/jackc/pgx/v5"
)

type apiHandler struct {
	queries     *pgstore.Queries
	router      *chi.Mux
	upgrader    websocket.Upgrader
	subscribers map[string]map[*websocket.Conn]context.CancelFunc
	mu          *sync.Mutex
}

func (handler apiHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	handler.router.ServeHTTP(w, r)
}

func NewHandler(query *pgstore.Queries) http.Handler {
	api := apiHandler{
		queries:     query,
		upgrader:    websocket.Upgrader{CheckOrigin: func(r *http.Request) bool { return true }}, // add cors config to websocket
		subscribers: make(map[string]map[*websocket.Conn]context.CancelFunc),                     // stores all open connections with users
		mu:          &sync.Mutex{},
	}

	newRouter := chi.NewRouter()
	newRouter.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"https://*", "http://*"},
		AllowedMethods:   []string{"GET", "POST", "PATCH", "DELETE", "PUT", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: false,
		MaxAge:           300,
	}))
	newRouter.Use(middleware.RequestID, middleware.Recoverer, middleware.Logger)

	newRouter.Get("/subscribe/{room_id}", api.handleSubscribe)

	newRouter.Route("/api", func(route chi.Router) {
		route.Route("/rooms", func(route chi.Router) {
			route.Post("/", api.handleCreateRoom)
			route.Get("/", api.handleGetRooms)

			route.Route("/{room_id}/messages", func(route chi.Router) {
				route.Post("/", api.handleCreateRoomMessage)
				route.Get("/", api.handleGetRoomMessages)

				route.Route("/{message_id}", func(route chi.Router) {
					route.Get("/", api.handleGetMessageById)
					route.Patch("/react", api.handleReactToMessage)
					route.Delete("/react", api.handleRemoveReactionToMessage)
					route.Patch("/answered", api.handleMarkMessageAsAnswered)
				})
			})
		})
	})

	api.router = newRouter

	return api
}

func (handler apiHandler) handleSubscribe(w http.ResponseWriter, r *http.Request) {
	rawRoomID := chi.URLParam(r, "room_id")
	roomID, err := uuid.Parse(rawRoomID)
	if err != nil {
		http.Error(w, "Invalid room id", http.StatusBadRequest)
		return
	}

	_, err = handler.queries.GetRoom(r.Context(), roomID)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			http.Error(w, "Room not found", http.StatusBadRequest)
			return
		}
		http.Error(w, "Something went wrong", http.StatusInternalServerError)
		return
	}

	conn, err := handler.upgrader.Upgrade(w, r, nil)
	if err != nil {
		slog.Warn("Failed to upgrade connection")
		http.Error(w, "Failed to upgrade to websocket connection", http.StatusBadRequest)
		return
	}

	defer conn.Close()

	ctx, cancel := context.WithCancel(r.Context())

	handler.mu.Lock()
	if _, ok := handler.subscribers[rawRoomID]; !ok {
		handler.subscribers[rawRoomID] = make(map[*websocket.Conn]context.CancelFunc)
	}
	slog.Info("new client connected", "room_id", rawRoomID, "client_ip", r.RemoteAddr)
	handler.subscribers[rawRoomID][conn] = cancel
	handler.mu.Unlock()

	<-ctx.Done()

	handler.mu.Lock()
	delete(handler.subscribers[rawRoomID], conn)
	handler.mu.Unlock()
}

const (
	MessageKindMessageCreated = "message_created"
)

type MessageMessageCreated struct {
	ID      string `json:"id"`
	Message string `json:"message"`
}

type Message struct {
	Content string `json:"content"`
	Value   any    `json:"value"`
	RoomID  string `json:"-"` // does not include in our json body
}

func (handler apiHandler) handleNotifyClient(msg Message) {
	handler.mu.Lock()
	defer handler.mu.Unlock()

	subscribers, ok := handler.subscribers[msg.RoomID]
	if !ok || len(subscribers) == 0 {
		return
	}
	for conn, cancel := range subscribers {
		if err := conn.WriteJSON(msg); err != nil {
			slog.Error("Failed to send message to client", "error", err)
			cancel()
		}
	}
}

func (handler apiHandler) handleCreateRoom(w http.ResponseWriter, r *http.Request) {
	type _body struct {
		Theme string `json:"theme"`
	}
	var body _body
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		http.Error(w, "Invalid json", http.StatusBadRequest)
		return
	}

	roomID, err := handler.queries.InsertRooms(r.Context(), body.Theme)
	if err != nil {
		slog.Error("failed to insert room", "error", err)
		http.Error(w, "Something went wrong", http.StatusInternalServerError)
		return
	}

	type response struct {
		ID string `json:"id"`
	}

	data, _ := json.Marshal(response{ID: roomID.String()})
	w.Header().Set("Content-Type", "application/json")
	_, err = w.Write(data)
	if err != nil {
		http.Error(w, "Something went wrong", http.StatusInternalServerError)
		return
	}
}

func (handler apiHandler) handleGetRooms(w http.ResponseWriter, r *http.Request) {}

func (handler apiHandler) handleGetRoomMessages(w http.ResponseWriter, r *http.Request) {}

func (handler apiHandler) handleCreateRoomMessage(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Hello")
	rawRoomID := chi.URLParam(r, "room_id")
	roomID, err := uuid.Parse(rawRoomID)
	if err != nil {
		http.Error(w, "Room not found", http.StatusBadRequest)
		return
	}

	_, err = handler.queries.GetRoom(r.Context(), roomID)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			http.Error(w, "Something went wrong", http.StatusInternalServerError)
			return
		}
	}

	type _body struct {
		Message string `json:"message"`
	}

	var body _body
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		http.Error(w, "Invalid json", http.StatusBadRequest)
		return
	}

	messageID, err := handler.queries.InsertMessages(r.Context(), pgstore.InsertMessagesParams{
		RoomID:  roomID,
		Message: body.Message,
	})
	if err != nil {
		slog.Error("Failed to insert message", "error", err)
		http.Error(w, "Could not insert messages", http.StatusInternalServerError)
		return
	}

	type response struct {
		ID string `json:"id"`
	}

	data, _ := json.Marshal(response{ID: messageID.String()})
	w.Header().Set("Content-Type", "application/json")
	_, err = w.Write(data)
	if err != nil {
		http.Error(w, "Something went wrong", http.StatusInternalServerError)
		return
	}

	// async function call
	go handler.handleNotifyClient(Message{
		Content: MessageKindMessageCreated,
		RoomID:  rawRoomID,
		Value: MessageMessageCreated{
			ID:      messageID.String(),
			Message: body.Message,
		},
	})
}

func (handler apiHandler) handleGetMessageById(w http.ResponseWriter, r *http.Request) {}

func (handler apiHandler) handleReactToMessage(w http.ResponseWriter, r *http.Request) {}

func (handler apiHandler) handleRemoveReactionToMessage(w http.ResponseWriter, r *http.Request) {}

func (handler apiHandler) handleMarkMessageAsAnswered(w http.ResponseWriter, r *http.Request) {}
