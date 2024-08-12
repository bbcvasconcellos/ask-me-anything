interface RemoveMessageReactionRequest {
  roomID: string;
  messageId: string;
}

export const removeMessageReaction = async ({
  roomID,
  messageId,
}: RemoveMessageReactionRequest) => {
  await fetch(
    `${
      import.meta.env.VITE_APP_API_URL
    }/rooms/${roomID}/messages/${messageId}/react`,
    {
      method: "DELETE",
    }
  );
};
