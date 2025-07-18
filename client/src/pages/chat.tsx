import { useState, useEffect, useRef } from "react";
import { useRoute } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Send } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Chat() {
  const [, params] = useRoute("/chat/:matchId");
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const matchId = params?.matchId ? parseInt(params.matchId) : null;

  const { data: messages, isLoading } = useQuery({
    queryKey: ["/api/matches", matchId, "messages"],
    enabled: !!matchId,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await apiRequest(
        "POST",
        `/api/matches/${matchId}/messages`,
        { content }
      );
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/matches", matchId, "messages"]
      });
      setMessage("");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    },
  });

  // Set up WebSocket connection
  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "chat_message" && data.matchId === matchId) {
        queryClient.invalidateQueries({
          queryKey: ["/api/matches", matchId, "messages"]
        });
      }
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [matchId, queryClient]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    sendMessageMutation.mutate(message);

    // Send WebSocket message for real-time updates
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: "chat_message",
        matchId,
        content: message,
        senderId: user?.id,
      }));
    }
  };

  if (!matchId) {
    return <div>Invalid match</div>;
  }

  return (
    <div className="max-w-md mx-auto bg-white shadow-2xl min-h-screen relative flex flex-col">
      {/* Header */}
      <header className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4 text-white">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.history.back()}
            className="text-white hover:bg-white/20"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          
          <Avatar className="w-10 h-10">
            <AvatarImage src="" />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
          
          <div>
            <h2 className="font-semibold">Chat</h2>
            <p className="text-sm opacity-80">Active now</p>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
          </div>
        ) : messages && messages.length > 0 ? (
          <>
            {messages.map((msg: any) => {
              const isOwn = msg.senderId === user?.id;
              return (
                <div
                  key={msg.id}
                  className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                >
                  <Card className={`max-w-xs ${isOwn ? "bg-indigo-500 text-white" : "bg-gray-100"}`}>
                    <CardContent className="p-3">
                      <p className="text-sm">{msg.content}</p>
                      <p className={`text-xs mt-1 ${isOwn ? "text-indigo-100" : "text-gray-500"}`}>
                        {format(new Date(msg.sentAt), "HH:mm")}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="text-4xl mb-4">💬</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Start the conversation!</h3>
            <p className="text-gray-600 px-4">
              Say hello and begin your collaboration journey.
            </p>
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
        <div className="flex space-x-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1"
            disabled={sendMessageMutation.isPending}
          />
          <Button
            type="submit"
            disabled={!message.trim() || sendMessageMutation.isPending}
            className="bg-indigo-500 hover:bg-indigo-600"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}
