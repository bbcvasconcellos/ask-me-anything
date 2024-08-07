package api

import (
	"net/http"

	"github.com/bbcvasconcellos/ask-me-anything/internal/store/pgstore/pgstore"
	"github.com/go-chi/chi/v5"
)

type apiHandler struct {
	queries *pgstore.Queries
	router  *chi.Mux
}

func (handler apiHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	handler.router.ServeHTTP(w, r)
}

func NewHandler(q *pgstore.Queries) http.Handler {
	api := apiHandler{
		queries: q,
	}

	newRouter := chi.NewRouter()

	api.router = newRouter

	return api
}
