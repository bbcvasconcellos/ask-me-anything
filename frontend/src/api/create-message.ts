interface CreateMessageRequest {
  roomID: string;
  message: string;
}

export const createMessage = async ({
  roomID,
  message,
}: CreateMessageRequest) => {
  const response = await fetch(
    `${import.meta.env.VITE_APP_API_URL}/rooms/${roomID}/messages`,
    {
      method: "POST",
      body: JSON.stringify({ message }),
    }
  );

  const data: { id: string } = await response.json();

  return { messageId: data.id };
};
