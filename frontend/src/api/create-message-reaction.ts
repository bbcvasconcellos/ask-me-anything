interface CreateMessageReactionRequest {
  roomID: string;
  messageId: string;
}

export const createMessageReaction = async ({
  roomID,
  messageId,
}: CreateMessageReactionRequest) => {
  await fetch(
    `${
      import.meta.env.VITE_APP_API_URL
    }/rooms/${roomID}/messages/${messageId}/react`,
    {
      method: "PATCH",
    }
  );
};
