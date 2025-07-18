import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Send, 
  ArrowLeft, 
  Mic, 
  MicOff, 
  Paperclip, 
  Smile,
  MoreVertical,
  Clock,
  Check,
  CheckCheck
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import ConversationStarters from "@/components/conversation-starters";
import TypingIndicator from "@/components/typing-indicator";

interface Message {
  id: string;
  senderId: string;
  content: string;
  type: "text" | "voice" | "image";
  timestamp: string;
  status: "sending" | "sent" | "delivered" | "read";
  voiceUrl?: string;
  imageUrl?: string;
}

interface Match {
  id: string;
  user: any;
  profile: any;
  lastMessage?: Message;
  unreadCount: number;
}

export default function EnhancedChat() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [matchExpiration, setMatchExpiration] = useState<Date | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  // Fetch matches
  const { data: matches, isLoading: loadingMatches } = useQuery<Match[]>({
    queryKey: ["/api/matches"],
  });

  // Fetch messages for selected match
  const { data: messages, isLoading: loadingMessages } = useQuery<Message[]>({
    queryKey: ["/api/messages", selectedMatch?.id],
    enabled: !!selectedMatch,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async ({ matchId, content, type }: { matchId: string; content: string; type: string }) => {
      return apiRequest(`/api/messages`, {
        method: "POST",
        body: { matchId, content, type }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
      queryClient.invalidateQueries({ queryKey: ["/api/matches"] });
      setNewMessage("");
    }
  });

  // Mark messages as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (matchId: string) => {
      return apiRequest(`/api/matches/${matchId}/read`, { method: "POST" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/matches"] });
    }
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Mark messages as read when match is selected
  useEffect(() => {
    if (selectedMatch && selectedMatch.unreadCount > 0) {
      markAsReadMutation.mutate(selectedMatch.id);
    }
  }, [selectedMatch]);

  // Handle typing indicators
  useEffect(() => {
    if (newMessage.length > 0 && !isTyping) {
      setIsTyping(true);
      // Send typing start event via WebSocket
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      // Send typing stop event via WebSocket
    }, 1000);

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [newMessage]);

  // Calculate match expiration (72 hours from match creation)
  useEffect(() => {
    if (selectedMatch) {
      const matchDate = new Date(selectedMatch.user.createdAt);
      const expirationDate = new Date(matchDate.getTime() + 72 * 60 * 60 * 1000);
      setMatchExpiration(expirationDate);
    }
  }, [selectedMatch]);

  const handleSendMessage = (content?: string) => {
    const messageContent = content || newMessage;
    if (!messageContent.trim() || !selectedMatch) return;

    sendMessageMutation.mutate({
      matchId: selectedMatch.id,
      content: messageContent,
      type: "text"
    });
  };

  const getMessageStatusIcon = (status: string) => {
    switch (status) {
      case "sent":
        return <Check className="w-3 h-3 text-gray-400" />;
      case "delivered":
        return <CheckCheck className="w-3 h-3 text-gray-400" />;
      case "read":
        return <CheckCheck className="w-3 h-3 text-blue-500" />;
      default:
        return <Clock className="w-3 h-3 text-gray-300" />;
    }
  };

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const getTimeUntilExpiration = () => {
    if (!matchExpiration) return null;
    
    const now = new Date();
    const timeLeft = matchExpiration.getTime() - now.getTime();
    
    if (timeLeft <= 0) return "Expired";
    
    const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutesLeft = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hoursLeft > 0) {
      return `${hoursLeft}h ${minutesLeft}m left`;
    } else {
      return `${minutesLeft}m left`;
    }
  };

  const expirationTime = getTimeUntilExpiration();
  const isExpiringSoon = matchExpiration && (matchExpiration.getTime() - Date.now()) < 24 * 60 * 60 * 1000;

  if (!selectedMatch) {
    return (
      <div className="max-w-md mx-auto bg-gray-50 shadow-2xl min-h-screen">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4 text-white">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation("/")}
              className="text-white hover:bg-white/20"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold">Messages</h1>
          </div>
        </div>

        {/* Matches List */}
        <div className="p-4">
          {loadingMatches ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse">
                  <div className="flex items-center gap-3 p-3 bg-gray-200 rounded-lg">
                    <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-300 rounded mb-1"></div>
                      <div className="h-3 bg-gray-300 rounded w-3/4"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : matches?.length ? (
            <div className="space-y-2">
              {matches.map(match => (
                <Card
                  key={match.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setSelectedMatch(match)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={match.user.profileImageUrl} />
                        <AvatarFallback>
                          {match.user.firstName?.[0]}{match.user.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold truncate">
                            {match.user.firstName} {match.user.lastName}
                          </h4>
                          {match.lastMessage && (
                            <span className="text-xs text-gray-500">
                              {formatMessageTime(match.lastMessage.timestamp)}
                            </span>
                          )}
                        </div>
                        
                        {match.lastMessage ? (
                          <p className="text-sm text-gray-600 truncate">
                            {match.lastMessage.content}
                          </p>
                        ) : (
                          <p className="text-sm text-blue-600">
                            Start the conversation!
                          </p>
                        )}
                      </div>
                      
                      {match.unreadCount > 0 && (
                        <Badge className="bg-red-500 text-white">
                          {match.unreadCount}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">No matches yet</h3>
              <p className="text-gray-600 mb-4">Start swiping to find your coding partners!</p>
              <Button onClick={() => setLocation("/")}>
                Discover Developers
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-gray-50 shadow-2xl min-h-screen flex flex-col">
      {/* Chat Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4 text-white">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedMatch(null)}
            className="text-white hover:bg-white/20"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          
          <Avatar className="w-10 h-10">
            <AvatarImage src={selectedMatch.user.profileImageUrl} />
            <AvatarFallback>
              {selectedMatch.user.firstName?.[0]}{selectedMatch.user.lastName?.[0]}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <h2 className="font-semibold">
              {selectedMatch.user.firstName} {selectedMatch.user.lastName}
            </h2>
            <div className="flex items-center gap-2 text-sm opacity-90">
              {otherUserTyping ? (
                <span>Typing...</span>
              ) : (
                <span>
                  {selectedMatch.profile?.availability || "Available"}
                </span>
              )}
              
              {expirationTime && (
                <Badge 
                  variant="secondary" 
                  className={`text-xs ${isExpiringSoon ? 'bg-red-100 text-red-800' : 'bg-white/20 text-white'}`}
                >
                  {expirationTime}
                </Badge>
              )}
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20"
          >
            <MoreVertical className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4">
        {/* Conversation Starters (show when no messages) */}
        {(!messages || messages.length === 0) && (
          <ConversationStarters
            matchedUser={selectedMatch.user}
            onSendMessage={handleSendMessage}
            sharedSkills={selectedMatch.profile?.skills || []}
          />
        )}

        {/* Messages */}
        <div className="space-y-3">
          {messages?.map(message => (
            <div
              key={message.id}
              className={`flex ${message.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] px-4 py-2 rounded-2xl ${
                  message.senderId === user?.id
                    ? 'bg-blue-500 text-white'
                    : 'bg-white border border-gray-200'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <div className={`flex items-center gap-1 mt-1 ${
                  message.senderId === user?.id ? 'justify-end' : 'justify-start'
                }`}>
                  <span className={`text-xs ${
                    message.senderId === user?.id ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {formatMessageTime(message.timestamp)}
                  </span>
                  {message.senderId === user?.id && getMessageStatusIcon(message.status)}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Typing Indicator */}
        <TypingIndicator 
          isTyping={otherUserTyping} 
          userName={selectedMatch.user.firstName}
        />

        <div ref={messagesEndRef} />
      </ScrollArea>

      {/* Message Input */}
      <div className="p-4 bg-white border-t">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-gray-600"
          >
            <Paperclip className="w-5 h-5" />
          </Button>
          
          <div className="flex-1 relative">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              className="pr-10"
            />
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <Smile className="w-4 h-4" />
            </Button>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            className={`${isRecording ? 'text-red-500' : 'text-gray-400'} hover:text-gray-600`}
            onClick={() => setIsRecording(!isRecording)}
          >
            {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </Button>
          
          <Button
            onClick={() => handleSendMessage()}
            disabled={!newMessage.trim() || sendMessageMutation.isPending}
            size="sm"
            className="bg-blue-500 hover:bg-blue-600"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}