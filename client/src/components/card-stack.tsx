import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { X, Star, Heart } from "lucide-react";
import ProfileCard from "./profile-card";
import ToolCard from "./tool-card";
import ProfileDetailModal from "./profile-detail-modal";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useSwipe } from "@/hooks/use-swipe";

interface CardStackProps {
  cardType: "developers" | "tools";
  onMatch: (user: any) => void;
}

export default function CardStack({ cardType, onMatch }: CardStackProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<"like" | "pass" | null>(null);

  const { data: developers } = useQuery({
    queryKey: ["/api/discover/developers"],
    enabled: cardType === "developers",
  });

  const { data: tools } = useQuery({
    queryKey: ["/api/discover/tools"],
    enabled: cardType === "tools",
  });

  const swipeMutation = useMutation({
    mutationFn: async ({ targetId, targetType, action }: {
      targetId: string;
      targetType: string;
      action: "like" | "pass" | "super_like";
    }) => {
      const response = await apiRequest("POST", "/api/swipe", {
        targetId,
        targetType,
        action,
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.match) {
        const currentData = cardType === "developers" ? developers : tools;
        const currentItem = currentData?.[currentIndex];
        onMatch(currentItem);
      }
      
      // Invalidate discovery queries to get fresh data
      queryClient.invalidateQueries({ queryKey: ["/api/discover/developers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/discover/tools"] });
      queryClient.invalidateQueries({ queryKey: ["/api/matches"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to process swipe",
        variant: "destructive",
      });
    },
  });

  const currentData = cardType === "developers" ? developers : tools;
  const currentItem = currentData?.[currentIndex];
  const nextItem = currentData?.[currentIndex + 1];
  const backgroundItem = currentData?.[currentIndex + 2];

  const handleSwipe = (action: "like" | "pass" | "super_like") => {
    if (!currentItem) return;

    setSwipeDirection(action === "like" ? "like" : "pass");
    
    const targetId = cardType === "developers" ? currentItem.userId : currentItem.id.toString();
    const targetType = cardType === "developers" ? "developer" : "tool";

    swipeMutation.mutate({ targetId, targetType, action });

    setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
      setSwipeDirection(null);
    }, 500);
  };

  const { swipeProps } = useSwipe({
    onSwipeLeft: () => handleSwipe("pass"),
    onSwipeRight: () => handleSwipe("like"),
  });

  if (!currentData || currentData.length === 0) {
    return (
      <div className="relative h-96 p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {cardType === "developers" ? "No more developers nearby!" : "All tools explored!"}
          </h3>
          <p className="text-gray-600">
            {cardType === "developers" 
              ? "Check back later for new developers to connect with."
              : "You've seen all available tools. Check back for updates!"
            }
          </p>
        </div>
      </div>
    );
  }

  if (currentIndex >= currentData.length) {
    return (
      <div className="relative h-96 p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🎯</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">You're all caught up!</h3>
          <p className="text-gray-600">Come back later for more matches.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="relative h-[500px] p-4" style={{ perspective: "1000px" }}>
        {/* Background Cards (for stack effect) - Enhanced */}
        {backgroundItem && (
          <div className="absolute inset-4 bg-gradient-to-br from-gray-200 to-gray-300 rounded-3xl opacity-40 transform scale-95 shadow-lg" />
        )}
        {nextItem && (
          <div className="absolute inset-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl opacity-60 transform scale-[0.97] shadow-xl" />
        )}
        
        {/* Active Card */}
        <div 
          className={`absolute inset-4 transition-all duration-500 ${
            swipeDirection === "like" 
              ? "transform translate-x-full rotate-12 opacity-0" 
              : swipeDirection === "pass"
              ? "transform -translate-x-full -rotate-12 opacity-0"
              : ""
          }`}
          {...swipeProps}
        >
          {cardType === "developers" ? (
            <ProfileCard 
              profile={currentItem}
              onTap={() => setShowProfileModal(true)}
            />
          ) : (
            <ToolCard 
              tool={currentItem}
              onTap={() => setShowProfileModal(true)}
            />
          )}

          {/* Swipe Indicators */}
          <div 
            className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-200 ${
              swipeDirection === "like" ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="bg-emerald-500 text-white px-6 py-3 rounded-full font-bold text-lg transform rotate-12">
              <Heart className="w-5 h-5 inline mr-2" />
              MATCH!
            </div>
          </div>
          <div 
            className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-200 ${
              swipeDirection === "pass" ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="bg-red-500 text-white px-6 py-3 rounded-full font-bold text-lg transform -rotate-12">
              <X className="w-5 h-5 inline mr-2" />
              PASS
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center items-center gap-6 p-6">
        <Button
          size="lg"
          variant="outline"
          className="w-14 h-14 rounded-full border-2 border-gray-300 hover:border-red-500 hover:text-red-500 transition-all shadow-lg hover:shadow-xl"
          onClick={() => handleSwipe("pass")}
          disabled={swipeMutation.isPending}
        >
          <X className="w-6 h-6" />
        </Button>
        
        <Button
          size="lg"
          variant="outline"
          className="w-12 h-12 rounded-full border-2 border-gray-300 hover:border-yellow-500 hover:text-yellow-500 transition-all shadow-md"
          onClick={() => handleSwipe("super_like")}
          disabled={swipeMutation.isPending}
        >
          <Star className="w-5 h-5" />
        </Button>
        
        <Button
          size="lg"
          className="w-14 h-14 bg-emerald-500 border-2 border-emerald-500 rounded-full hover:bg-emerald-600 hover:border-emerald-600 transition-all shadow-lg hover:shadow-xl"
          onClick={() => handleSwipe("like")}
          disabled={swipeMutation.isPending}
        >
          <Heart className="w-6 h-6" />
        </Button>
      </div>

      {/* Profile Detail Modal */}
      <ProfileDetailModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        profile={currentItem}
        type={cardType}
        onSwipe={handleSwipe}
      />
    </>
  );
}
