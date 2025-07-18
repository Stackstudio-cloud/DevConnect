import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Star, Bookmark, MessageSquare, X, Check } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface QuickActionsProps {
  profile: any;
  onSwipe?: (action: "like" | "pass" | "super_like") => void;
  onBookmark?: () => void;
  onMessage?: () => void;
  className?: string;
}

export default function QuickActions({ 
  profile, 
  onSwipe, 
  onBookmark, 
  onMessage,
  className = "" 
}: QuickActionsProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const swipeMutation = useMutation({
    mutationFn: async (action: "like" | "pass" | "super_like") => {
      return apiRequest(`/api/swipes`, {
        method: "POST",
        body: {
          targetId: profile.id,
          action
        }
      });
    },
    onSuccess: (data, action) => {
      queryClient.invalidateQueries({ queryKey: ["/api/swipes"] });
      
      if (data.isMatch && action === "like") {
        toast({
          title: "It's a Match! 🎉",
          description: `You and ${profile.user?.firstName || "this developer"} liked each other!`,
        });
      } else if (action === "super_like") {
        toast({
          title: "Super Like Sent! ⭐",
          description: "They'll know you're really interested!",
        });
      }
      
      onSwipe?.(action);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to register your action. Please try again.",
        variant: "destructive",
      });
    }
  });

  const bookmarkMutation = useMutation({
    mutationFn: async () => {
      const method = isBookmarked ? "DELETE" : "POST";
      return apiRequest(`/api/bookmarks/${profile.id}`, { method });
    },
    onSuccess: () => {
      setIsBookmarked(!isBookmarked);
      queryClient.invalidateQueries({ queryKey: ["/api/bookmarks"] });
      
      toast({
        title: isBookmarked ? "Bookmark Removed" : "Bookmarked!",
        description: isBookmarked 
          ? "Removed from your saved profiles" 
          : "Added to your saved profiles",
      });
      
      onBookmark?.();
    }
  });

  const handleAction = (action: "like" | "pass" | "super_like") => {
    swipeMutation.mutate(action);
  };

  return (
    <div className={`flex items-center justify-center gap-4 ${className}`}>
      {/* Pass */}
      <Button
        variant="outline"
        size="lg"
        onClick={() => handleAction("pass")}
        disabled={swipeMutation.isPending}
        className="w-14 h-14 rounded-full border-2 border-gray-300 hover:border-red-400 hover:bg-red-50 transition-all duration-200 group"
      >
        <X className="w-6 h-6 text-gray-500 group-hover:text-red-500" />
      </Button>

      {/* Bookmark */}
      <Button
        variant="outline"
        size="lg"
        onClick={() => bookmarkMutation.mutate()}
        disabled={bookmarkMutation.isPending}
        className={`w-12 h-12 rounded-full border-2 transition-all duration-200 ${
          isBookmarked 
            ? "border-blue-500 bg-blue-50 text-blue-600" 
            : "border-gray-300 hover:border-blue-400 hover:bg-blue-50"
        }`}
      >
        <Bookmark className={`w-5 h-5 ${isBookmarked ? "fill-current" : ""}`} />
      </Button>

      {/* Like */}
      <Button
        variant="outline"
        size="lg"
        onClick={() => handleAction("like")}
        disabled={swipeMutation.isPending}
        className="w-16 h-16 rounded-full border-2 border-gray-300 hover:border-green-400 hover:bg-green-50 transition-all duration-200 group"
      >
        <Heart className="w-7 h-7 text-gray-500 group-hover:text-green-500" />
      </Button>

      {/* Message (if matched) */}
      <Button
        variant="outline"
        size="lg"
        onClick={onMessage}
        className="w-12 h-12 rounded-full border-2 border-gray-300 hover:border-purple-400 hover:bg-purple-50 transition-all duration-200 group"
      >
        <MessageSquare className="w-5 h-5 text-gray-500 group-hover:text-purple-500" />
      </Button>

      {/* Super Like */}
      <Button
        variant="outline"
        size="lg"
        onClick={() => handleAction("super_like")}
        disabled={swipeMutation.isPending}
        className="w-14 h-14 rounded-full border-2 border-yellow-300 hover:border-yellow-400 hover:bg-yellow-50 transition-all duration-200 group relative"
      >
        <Star className="w-6 h-6 text-yellow-500 group-hover:text-yellow-600" />
        <Badge 
          variant="secondary" 
          className="absolute -top-2 -right-2 bg-yellow-100 text-yellow-800 text-xs px-1.5"
        >
          ⚡
        </Badge>
      </Button>
    </div>
  );
}