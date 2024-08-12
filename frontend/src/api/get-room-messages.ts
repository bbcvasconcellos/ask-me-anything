interface GetRoomMessagesRequest {
  roomID: string;
}

export interface GetRoomMessagesResponse {
  messages: {
    id: string;
    roomID: string;
    likes: number;
    comment: string;
    answered: boolean;
  }[];
}

export const getRoomMessages = async ({
  roomID,
}: GetRoomMessagesRequest): Promise<GetRoomMessagesResponse> => {
  const response = await fetch(
    `${import.meta.env.VITE_APP_API_URL}/rooms/${roomID}/messages`,
    {
      method: "GET",
    }
  );

  const data: Array<{
    id: string;
    room_id: string;
    message: string;
    reaction_count: number;
    answered: boolean;
  }> = await response.json();

  return {
    messages: data.map((item) => {
      return {
        id: item.id,
        roomID: item.room_id,
        likes: item.reaction_count,
        comment: item.message,
        answered: item.answered,
      };
    }),
  };
};
