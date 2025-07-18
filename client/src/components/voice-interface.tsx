import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mic, MicOff, Volume2, VolumeX, Loader } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface VoiceCommand {
  command: string;
  action: string;
  parameters?: Record<string, any>;
  confidence: number;
}

interface VoiceInterfaceProps {
  onCommand?: (command: VoiceCommand) => void;
  isEnabled?: boolean;
}

export default function VoiceInterface({ onCommand, isEnabled = true }: VoiceInterfaceProps) {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lastCommand, setLastCommand] = useState<string>("");
  const [transcript, setTranscript] = useState<string>("");
  const [supportsSpeechRecognition, setSupportsSpeechRecognition] = useState(false);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const speechSynthRef = useRef<SpeechSynthesis | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Check for speech recognition support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSupportsSpeechRecognition(true);
      
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      
      recognition.onstart = () => {
        setIsListening(true);
      };
      
      recognition.onend = () => {
        setIsListening(false);
      };
      
      recognition.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscript += result[0].transcript;
          } else {
            interimTranscript += result[0].transcript;
          }
        }
        
        if (finalTranscript) {
          setTranscript(finalTranscript);
          processVoiceCommand(finalTranscript);
        } else {
          setTranscript(interimTranscript);
        }
      };
      
      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        toast({
          title: "Voice Error",
          description: "Unable to process voice command. Please try again.",
          variant: "destructive",
        });
      };
      
      recognitionRef.current = recognition;
    }

    // Check for speech synthesis support
    if ('speechSynthesis' in window) {
      speechSynthRef.current = window.speechSynthesis;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const processVoiceCommand = async (text: string) => {
    setIsProcessing(true);
    setLastCommand(text);
    
    // AI-powered command processing
    const command = parseVoiceCommand(text.toLowerCase());
    
    if (command) {
      onCommand?.(command);
      
      // Provide voice feedback
      if (command.confidence > 0.7) {
        speak(`Executing ${command.action}`);
      } else {
        speak("I'm not sure I understood that correctly. Could you try again?");
      }
    } else {
      speak("I didn't understand that command. Try saying 'help' for available commands.");
    }
    
    setIsProcessing(false);
  };

  const parseVoiceCommand = (text: string): VoiceCommand | null => {
    const commands = [
      // Navigation commands
      {
        patterns: ["go to discover", "show discover", "find developers", "browse profiles"],
        action: "navigate",
        parameters: { route: "/discover" }
      },
      {
        patterns: ["go to messages", "show messages", "open chat", "check messages"],
        action: "navigate",
        parameters: { route: "/chat" }
      },
      {
        patterns: ["go to profile", "show profile", "my profile", "edit profile"],
        action: "navigate",
        parameters: { route: "/profile" }
      },
      {
        patterns: ["go to teams", "show teams", "team projects", "find teams"],
        action: "navigate",
        parameters: { route: "/teams" }
      },
      
      // Interaction commands
      {
        patterns: ["like this profile", "swipe right", "yes", "like"],
        action: "swipe",
        parameters: { direction: "like" }
      },
      {
        patterns: ["pass", "swipe left", "no", "skip", "next"],
        action: "swipe",
        parameters: { direction: "pass" }
      },
      {
        patterns: ["super like", "really like", "love this"],
        action: "swipe",
        parameters: { direction: "super_like" }
      },
      
      // Search commands
      {
        patterns: ["search for", "find", "look for"],
        action: "search",
        parameters: { query: text.replace(/^(search for|find|look for)\s+/i, '') }
      },
      
      // Filter commands
      {
        patterns: ["filter by", "show only", "filter"],
        action: "filter",
        parameters: { criteria: text.replace(/^(filter by|show only|filter)\s+/i, '') }
      },
      
      // Message commands
      {
        patterns: ["send message", "write message", "message", "say"],
        action: "message",
        parameters: { content: text.replace(/^(send message|write message|message|say)\s+/i, '') }
      },
      
      // Help commands
      {
        patterns: ["help", "what can you do", "commands", "assistance"],
        action: "help",
        parameters: {}
      }
    ];

    for (const command of commands) {
      for (const pattern of command.patterns) {
        if (text.includes(pattern)) {
          const confidence = calculateConfidence(text, pattern);
          return {
            command: text,
            action: command.action,
            parameters: command.parameters,
            confidence
          };
        }
      }
    }

    return null;
  };

  const calculateConfidence = (text: string, pattern: string): number => {
    // Simple confidence calculation based on word overlap
    const textWords = text.split(' ');
    const patternWords = pattern.split(' ');
    const overlap = patternWords.filter(word => textWords.includes(word)).length;
    return overlap / patternWords.length;
  };

  const speak = (text: string) => {
    if (!speechSynthRef.current) return;
    
    setIsSpeaking(true);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 0.8;
    
    utterance.onend = () => {
      setIsSpeaking(false);
    };
    
    speechSynthRef.current.speak(utterance);
  };

  const toggleListening = () => {
    if (!recognitionRef.current) return;
    
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  const stopSpeaking = () => {
    if (speechSynthRef.current) {
      speechSynthRef.current.cancel();
      setIsSpeaking(false);
    }
  };

  if (!supportsSpeechRecognition || !isEnabled) {
    return null;
  }

  return (
    <Card className="fixed bottom-20 right-4 z-40 w-80 shadow-lg bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-indigo-900">Voice Assistant</h4>
            <Badge variant={isListening ? "default" : "secondary"} className="text-xs">
              {isListening ? "Listening..." : "Ready"}
            </Badge>
          </div>

          {/* Voice Controls */}
          <div className="flex items-center gap-3">
            <Button
              variant={isListening ? "destructive" : "default"}
              size="lg"
              onClick={toggleListening}
              className={`flex-1 ${isListening ? 'bg-red-500 hover:bg-red-600' : 'bg-indigo-600 hover:bg-indigo-700'}`}
            >
              {isProcessing ? (
                <Loader className="w-5 h-5 animate-spin mr-2" />
              ) : isListening ? (
                <MicOff className="w-5 h-5 mr-2" />
              ) : (
                <Mic className="w-5 h-5 mr-2" />
              )}
              {isProcessing ? "Processing..." : isListening ? "Stop" : "Start"}
            </Button>
            
            {isSpeaking && (
              <Button
                variant="outline"
                size="sm"
                onClick={stopSpeaking}
                className="text-purple-600 border-purple-300"
              >
                <VolumeX className="w-4 h-4 mr-1" />
                Stop
              </Button>
            )}
          </div>

          {/* Live Transcript */}
          {transcript && (
            <div className="p-2 bg-white rounded border border-indigo-200">
              <p className="text-sm text-gray-700">
                <span className="font-medium">You said:</span> "{transcript}"
              </p>
            </div>
          )}

          {/* Last Command */}
          {lastCommand && (
            <div className="p-2 bg-indigo-100 rounded border border-indigo-300">
              <p className="text-xs text-indigo-800">
                <span className="font-medium">Last command:</span> "{lastCommand}"
              </p>
            </div>
          )}

          {/* Quick Commands */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-indigo-700">Try saying:</p>
            <div className="grid grid-cols-2 gap-1 text-xs text-indigo-600">
              <div>"Go to discover"</div>
              <div>"Show messages"</div>
              <div>"Like this profile"</div>
              <div>"Search for React"</div>
              <div>"Send message"</div>
              <div>"Help"</div>
            </div>
          </div>

          {/* Status Indicator */}
          <div className="flex items-center gap-2 text-xs text-indigo-600">
            <div className={`w-2 h-2 rounded-full ${
              isListening ? 'bg-green-400 animate-pulse' : 
              isProcessing ? 'bg-yellow-400 animate-pulse' :
              isSpeaking ? 'bg-blue-400 animate-pulse' : 'bg-gray-400'
            }`}></div>
            <span>
              {isListening ? "Listening for commands..." : 
               isProcessing ? "Processing command..." :
               isSpeaking ? "Speaking response..." : "Voice assistant ready"}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}