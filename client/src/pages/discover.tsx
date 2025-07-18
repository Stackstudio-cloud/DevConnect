import { useState } from "react";
import NavigationHeader from "@/components/navigation-header";
import BottomNavigation from "@/components/bottom-navigation";
import CardStack from "@/components/card-stack";
import MatchModal from "@/components/match-modal";

export default function Discover() {
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [matchedUser, setMatchedUser] = useState<any>(null);
  const [cardType, setCardType] = useState<"developers" | "tools">("developers");

  const handleMatch = (user: any) => {
    setMatchedUser(user);
    setShowMatchModal(true);
  };

  return (
    <div className="max-w-md mx-auto bg-white shadow-2xl min-h-screen relative overflow-hidden">
      <NavigationHeader 
        cardType={cardType}
        onCardTypeChange={setCardType}
      />
      
      <CardStack 
        cardType={cardType}
        onMatch={handleMatch}
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
