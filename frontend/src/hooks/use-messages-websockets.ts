import { useEffect } from "react";
import { queryClient } from "../lib/react-query";
import { GetRoomMessagesResponse } from "../api/get-room-messages";

interface UseMessagesWebsocketsProps {
  roomID: string;
}

type WebhookMessage =
  | { kind: "message_created"; value: { id: string; message: string } }
  | { kind: "message_answered"; value: { id: string } }
  | { kind: "message_reaction_increased"; value: { id: string; count: number } }
  | {
      kind: "message_reaction_decreased";
      value: { id: string; count: number };
    };

export const useMessagesWebsockets = ({
  roomID,
}: UseMessagesWebsocketsProps) => {
  useEffect(() => {
    const ws = new WebSocket(`ws://localhost:8080/subscribe/${roomID}`);
    ws.onopen = () => console.log("websocket connected!");

    ws.onclose = () => console.log("websocket connection closed");

    ws.onmessage = (e) => {
      const data: WebhookMessage = JSON.parse(e.data);

      switch (data.kind) {
        case "message_created":
          queryClient.setQueryData<GetRoomMessagesResponse>(
            ["messages", roomID!],
            (state) => {
              return {
                messages: [
                  ...(state?.messages ?? []),
                  {
                    id: data.value.id,
                    comment: data.value.message,
                    likes: 0,
                    answered: false,
                  },
                ],
              };
            }
          );
          break;
        case "message_answered":
          queryClient.setQueryData<GetRoomMessagesResponse>(
            ["messages", roomID],
            (state) => {
              if (!state) {
                return undefined;
              }
              return {
                messages: state.messages.map((item) => {
                  if (item.id === data.value.id) {
                    return { ...item, answered: true };
                  }
                  return item;
                }),
              };
            }
          );
          break;
        case "message_reaction_decreased":
        case "message_reaction_increased":
          queryClient.setQueryData<GetRoomMessagesResponse>(
            ["messages", roomID],
            (state) => {
              if (!state) {
                return undefined;
              }
              return {
                messages: state.messages.map((item) => {
                  if (item.id === data.value.id) {
                    return { ...item, likes: data.value.count };
                  }
                  return item;
                }),
              };
            }
          );
          break;
      }
    };

    return () => ws.close();
  }, [roomID]);
};
