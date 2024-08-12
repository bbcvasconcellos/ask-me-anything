import { FormEvent, useRef } from "react";
import { useNavigate } from "react-router";

import { toast } from "sonner";
import { ArrowRight } from "lucide-react";

import amaLogo from "../assets/ama-logo.svg";
import { createRoom } from "../api/create-room";

export function CreateRoom() {
  const navigate = useNavigate();
  const ref = useRef<HTMLInputElement>(null);

  const handleCreateRoom = async (event: FormEvent) => {
    event.preventDefault();
    const theme = ref.current?.value.toString();

    if(!theme) {
      toast.warning("Room theme not found");
      return;
    }
    try {
      const { roomID } = await createRoom({ theme });
      navigate(`/room/${roomID}`);
    } catch(err) {
      console.error("Error", err);
      toast.warning("Failed to create room.")
    }
  }

  return (
    <main className="h-screen flex items-center justify-center px-4">
      <div className="max-w-[450px] flex flex-col gap-6">
        <img src={amaLogo} alt="ama logo" className="h-10"/>
        <p className="leading-relaxed text-base-zinc-300 text-center">
          Create a public AmA (ask me anything) room and highlight the most important questions for the community!
        </p>
        <form 
          className="bg-base-zinc-900 border border-base-zinc-800 flex justify-between items-center p-2 rounded-xl gap-2 ring-principal-orange-400 ring-offset-base-zinc-950 ring-offset-2 focus-within:ring-1"
          onSubmit={handleCreateRoom}
        >
          <input 
            className="placeholder-base-zinc-500 bg-transparent outline-none box-content flex-1 text-sm text-base-zinc-100 ml-2" 
            placeholder="Type the name of the room"
            name="theme"  
            autoComplete="off"
            ref={ref}
            required
          />
          <button 
            className="bg-principal-orange-400 px-3 py-2 gap-1.5 flex items-center rounded-lg text-principal-orange-500 font-medium text-sm hover:opacity-75 transition-opacity ease-in duration-200"
            type="submit"
          >
            Create room
            <ArrowRight className="size-4"/>
          </button>
        </form>
      </div>
    </main>
  )
}