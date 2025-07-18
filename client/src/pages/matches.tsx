import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { format } from "date-fns";
import NavigationHeader from "@/components/navigation-header";
import BottomNavigation from "@/components/bottom-navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Calendar } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function Matches() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();

  const { data: matches, isLoading } = useQuery({
    queryKey: ["/api/matches"],
  });

  const getOtherUser = (match: any) => {
    return match.user1Id === user?.id ? match.user2 : match.user1;
  };

  const handleChatClick = (matchId: number) => {
    setLocation(`/chat/${matchId}`);
  };

  return (
    <div className="max-w-md mx-auto bg-white shadow-2xl min-h-screen relative overflow-hidden">
      <NavigationHeader title="Matches" />
      
      <div className="h-96 overflow-y-auto p-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
          </div>
        ) : matches && matches.length > 0 ? (
          <div className="space-y-4">
            {matches.map((match: any) => {
              const otherUser = getOtherUser(match);
              return (
                <Card 
                  key={match.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleChatClick(match.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-4">
                      <Avatar className="w-16 h-16">
                        <AvatarImage src={otherUser.profileImageUrl} />
                        <AvatarFallback>
                          {otherUser.firstName?.[0]}{otherUser.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {otherUser.firstName} {otherUser.lastName}
                          </h3>
                          <MessageCircle className="w-5 h-5 text-indigo-500" />
                        </div>
                        
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                          <Calendar className="w-4 h-4 mr-1" />
                          Matched {format(new Date(match.matchedAt), "MMM d")}
                        </div>
                        
                        <Badge variant="secondary" className="mt-2">
                          Start chatting!
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="text-6xl mb-4">💔</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No matches yet</h3>
            <p className="text-gray-600 px-4">
              Keep swiping to find your perfect coding partner!
            </p>
          </div>
        )}
      </div>

      <BottomNavigation currentTab="matches" />
    </div>
  );
}
