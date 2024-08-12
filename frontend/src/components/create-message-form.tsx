import { FormEvent, useRef } from "react";
import { useParams } from "react-router";
import { ArrowRight } from "lucide-react";
import { createMessage } from "../api/create-message";
import { toast } from "sonner";

export const CreateMessageForm = () => {
  const { roomID } = useParams();
  const messageRef = useRef<HTMLInputElement>(null);

  if(!roomID) {
    throw new Error("This component must be within a room page.");
  }

  const handleMessageSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const message = messageRef.current?.value.toString();

    if(!message || !roomID) {
      toast.info("Message or room id empty.")
      return;
    }

    try {
      await createMessage({ roomID, message });
    } catch(err) {
      console.error(err);
      toast.error("Error submitting your question. Please try again.")
    }
  }

  return (
    <form 
      className="bg-base-zinc-900 border border-base-zinc-800 flex justify-between items-center p-2 rounded-xl gap-2 ring-principal-orange-400 ring-offset-base-zinc-950 ring-offset-2 focus-within:ring-1"
      onSubmit={handleMessageSubmit}
    >
      <input 
        className="placeholder-base-zinc-500 bg-transparent outline-none box-content flex-1 text-sm text-base-zinc-100 ml-2" 
        placeholder="Ask something"
        autoComplete="off"
        ref={messageRef}
      />
      <button 
        className="bg-principal-orange-400 px-3 py-2 gap-1.5 flex items-center rounded-lg text-principal-orange-500 font-medium text-sm hover:opacity-75 transition-opacity ease-in duration-200"
        type="submit"
      >
        Ask!
        <ArrowRight className="size-4"/>
      </button>
    </form>
  )


}