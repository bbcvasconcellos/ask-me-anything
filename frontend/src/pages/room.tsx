import { Suspense } from "react";
import { useParams } from "react-router";

import { toast } from "sonner";
import { Share2 } from "lucide-react";
import amaIcon from "../assets/ama-logo.svg"

import { Messages } from "../components/messages";
import { CreateMessageForm } from "../components/create-message-form";

export function Room() {
  const { roomID } = useParams();

  const handleShareRoom = () => {
    const url =  window.location.href.toString();

    if(navigator.share !== undefined && navigator.canShare()) {
      navigator.share({ url });
      toast.info("The URL was copied to the clipboard!");
    } else {
      navigator.clipboard.writeText(url);
      toast.info("The URL was copied to the clipboard!");
    }
  }

  return (
    <div className="mx-auto flex flex-col py-10 px-4 max-w-[640px] gap-6">

      <div className="flex flex-row items-center justify-between px-3 gap-3">
        <img  
          src={amaIcon} 
          alt="ama icon"
          className="h-5"  
        />
        <p className="flex-1 text-base-zinc-500 text-sm truncate">Room id: 
          <span className="text-base-zinc-300">&nbsp;{roomID}</span>
        </p>
        <button 
          className="bg-base-zinc-800 rounded-lg text-base-zinc-300 text-sm font-medium px-3 py-2 flex items-center gap-1.5 hover:bg-zinc-700 transition-colors ease-in duration-200"
          onClick={handleShareRoom}  
        > 
          Share<Share2 className="size-4"/>
        </button>
      </div>
      <div className="h-px w-full bg-base-zinc-900"/>

      <CreateMessageForm />
      
      <Suspense fallback={<p>Loading...</p>}>
        <Messages />
      </Suspense>
    </div> 
  )
}