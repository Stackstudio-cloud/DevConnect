import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";

interface TypingIndicatorProps {
  isTyping: boolean;
  userName?: string;
  className?: string;
}

export default function TypingIndicator({ 
  isTyping, 
  userName = "Someone", 
  className = "" 
}: TypingIndicatorProps) {
  const [dots, setDots] = useState(".");

  useEffect(() => {
    if (!isTyping) return;

    const interval = setInterval(() => {
      setDots(prev => {
        if (prev === "...") return ".";
        return prev + ".";
      });
    }, 500);

    return () => clearInterval(interval);
  }, [isTyping]);

  if (!isTyping) return null;

  return (
    <div className={`flex items-center gap-2 px-4 py-2 ${className}`}>
      <div className="flex items-center gap-1">
        {/* Animated typing bubbles */}
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
      
      <Badge variant="secondary" className="text-xs">
        {userName} is typing{dots}
      </Badge>
    </div>
  );
}