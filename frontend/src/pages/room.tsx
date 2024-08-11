import { useParams } from "react-router";
import { toast } from "sonner";
import { ArrowRight, Share2 } from "lucide-react";
import amaIcon from "../assets/ama-logo.svg"
import { Message } from "../components/message";

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

      <form 
          className="bg-base-zinc-900 border border-base-zinc-800 flex justify-between items-center p-2 rounded-xl gap-2 ring-principal-orange-400 ring-offset-base-zinc-950 ring-offset-2 focus-within:ring-1"
        >
          <input 
            className="placeholder-base-zinc-500 bg-transparent outline-none box-content flex-1 text-sm text-base-zinc-100 ml-2" 
            placeholder="Ask something"
            autoComplete="off"
          />
        <button 
            className="bg-principal-orange-400 px-3 py-2 gap-1.5 flex items-center rounded-lg text-principal-orange-500 font-medium text-sm hover:opacity-75 transition-opacity ease-in duration-200"
            type="submit"
          >
            Ask!
            <ArrowRight className="size-4"/>
          </button>
      </form>

      <ol className="list-decimal list-outside px-3 space-y-8">
        <Message 
          comment="Which programming language should I use in my backend: Go or NodeJS?"
          numberOfLikes={123}
        />
      </ol>
    </div> 
  )
}