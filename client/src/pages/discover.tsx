import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import NavigationHeader from "@/components/navigation-header";
import BottomNavigation from "@/components/bottom-navigation";
import CardStack from "@/components/card-stack";
import MatchModal from "@/components/match-modal";
import ProfileCompletion from "@/components/profile-completion";
import { useAuth } from "@/hooks/useAuth";
import type { FilterOptions } from "@/components/filter-modal";

export default function Discover() {
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [matchedUser, setMatchedUser] = useState<any>(null);
  const [cardType, setCardType] = useState<"developers" | "tools">("developers");
  const [filters, setFilters] = useState<FilterOptions | null>(null);
  const [lastSwipedId, setLastSwipedId] = useState<string | null>(null);
  
  const { user } = useAuth();

  // Get user's developer profile for completion check
  const { data: developerProfile } = useQuery({
    queryKey: ["/api/developer-profiles/me"],
    enabled: !!user,
  });

  const handleMatch = (user: any) => {
    setMatchedUser(user);
    setShowMatchModal(true);
  };

  const handleUndoLastSwipe = () => {
    if (lastSwipedId) {
      console.log("Undoing last swipe for:", lastSwipedId);
      setLastSwipedId(null);
    }
  };

  const handleEditProfile = () => {
    window.location.href = "/profile-setup";
  };

  return (
    <div className="max-w-md mx-auto bg-gray-50 shadow-2xl min-h-screen relative overflow-hidden">
      <NavigationHeader 
        cardType={cardType}
        onCardTypeChange={setCardType}
        onFiltersChange={setFilters}
        onUndoLastSwipe={lastSwipedId ? handleUndoLastSwipe : undefined}
      />
      
      {/* Profile Completion Prompt */}
      {cardType === "developers" && (
        <ProfileCompletion 
          profile={developerProfile}
          onEditProfile={handleEditProfile}
        />
      )}
      
      <CardStack 
        cardType={cardType}
        onMatch={handleMatch}
        filters={filters}
        onSwipe={(id) => setLastSwipedId(id)}
      />

      <BottomNavigation currentTab="discover" />

      <MatchModal
        isOpen={showMatchModal}
        onClose={() => setShowMatchModal(false)}
        matchedUser={matchedUser}
      />
    </div>
  );
}
