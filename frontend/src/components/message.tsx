import { useState } from "react";
import { useParams } from "react-router";
import { toast } from "sonner";
import { ArrowUp } from "lucide-react"
import { createMessageReaction } from "../api/create-message-reaction";
import { removeMessageReaction } from "../api/remove-message-reaction";

interface MessageProps {
  id: string;
  numberOfLikes: number;
  comment: string;
  answered?: boolean;
}

export const Message = ({ id: messageId, numberOfLikes, comment, answered=false }: MessageProps) => {
  const { roomID } = useParams();
  const [isLiked, setIsLiked] = useState(false); 

  const handleCreateMessageReaction = async () => {
    if(!roomID) {
      return
    }

    try {
      await createMessageReaction({ roomID, messageId })
    } catch(err) {
      console.error("error:", err)
      toast.error("Could not react to message")
    }
    setIsLiked(true)
  } 

  const handleRemoveMessageReaction = async () => {
    if(!roomID) {
      return
    }

    try {
      await removeMessageReaction({ roomID, messageId })
    } catch (err) {
      console.error("error:", err)
      toast.error("Could not remove reaction to message")
    }
    setIsLiked(false)
  }

  return (
    <li data-answered={answered} className="ml-4 leading-relaxed text-base-zinc-100 data-[answered=true]:opacity-50 data-[answered=true]:pointer-events-none">
      {comment}
      <button 
        className={`mt-2.5 flex items-center gap-2 bg-transparent text-sm font-medium ${isLiked ? "text-principal-orange-400 hover:opacity-75 ease-in duration-200 transition-opacity" : "text-base-zinc-400 hover:text-base-zinc-300 ease-in duration-200 transition-colors"}`}
        onClick={isLiked ? handleCreateMessageReaction : handleRemoveMessageReaction}  
      >
        <ArrowUp className="h-4"/>
        Like ({numberOfLikes})
      </button>
    </li>
  )
}