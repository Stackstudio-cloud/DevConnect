import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

interface MatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  matchedUser: any;
}

export default function MatchModal({ isOpen, onClose, matchedUser }: MatchModalProps) {
  const [, setLocation] = useLocation();

  const handleSendMessage = () => {
    // TODO: Navigate to chat with this match
    onClose();
    setLocation("/matches");
  };

  const displayName = matchedUser?.user ? 
    `${matchedUser.user.firstName || ""} ${matchedUser.user.lastName || ""}`.trim() || "Someone" :
    "Someone";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-sm mx-4 rounded-2xl">
        <div className="text-center p-6">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">It's a Match!</h2>
          <p className="text-gray-600 mb-6">
            You and {displayName} both want to collaborate. Start the conversation!
          </p>
          
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={onClose}
            >
              Keep Swiping
            </Button>
            <Button 
              className="flex-1 bg-indigo-500 hover:bg-indigo-600"
              onClick={handleSendMessage}
            >
              Send Message
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
