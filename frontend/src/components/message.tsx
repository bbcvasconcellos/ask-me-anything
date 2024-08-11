import { useState } from "react";
import { ArrowUp } from "lucide-react"

interface MessageProps {
  numberOfLikes: number;
  comment: string;
  answered?: boolean;
}

export const Message = ({ numberOfLikes, comment, answered=false }: MessageProps) => {
  const [isLiked, setIsLiked] = useState(false); 
  const [totalLikes, setTotalLikes] = useState(numberOfLikes);
  
  const handleLike = () => {
    setIsLiked(prevState => !prevState);
    setTotalLikes(prevLikes => prevLikes+1);
  }

  return (
    <li data-answered={answered} className="ml-4 leading-relaxed text-base-zinc-100 data-[answered=true]:opacity-50 data-[answered=true]:pointer-events-none">
      {comment}
      <button 
        className={`mt-2.5 flex items-center gap-2 bg-transparent text-sm font-medium ${isLiked ? "text-principal-orange-400 hover:opacity-75 ease-in duration-200 transition-opacity" : "text-base-zinc-400 hover:text-base-zinc-300 ease-in duration-200 transition-colors"}`}
        onClick={handleLike}  
      >
        <ArrowUp className="h-4"/>
        Like ({totalLikes})
      </button>
    </li>
  )
}