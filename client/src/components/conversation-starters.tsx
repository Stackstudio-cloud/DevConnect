import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Lightbulb, Send, Refresh } from "lucide-react";

interface ConversationStartersProps {
  matchedUser: any;
  onSendMessage: (message: string) => void;
  sharedSkills?: string[];
  sharedInterests?: string[];
}

export default function ConversationStarters({ 
  matchedUser, 
  onSendMessage, 
  sharedSkills = [], 
  sharedInterests = [] 
}: ConversationStartersProps) {
  const [currentStarters, setCurrentStarters] = useState<string[]>([]);

  const generateStarters = () => {
    const userName = matchedUser?.user?.firstName || "there";
    const topSkill = sharedSkills[0] || "coding";
    const experience = matchedUser?.experience || "development";
    
    const starterTemplates = [
      `Hey ${userName}! I noticed we both work with ${topSkill}. What's your favorite project you've built with it?`,
      `Hi ${userName}! Your ${experience} experience looks interesting. What got you into that field?`,
      `Hey! I see we share an interest in ${topSkill}. Are you working on anything exciting with it lately?`,
      `Hi ${userName}! What's the most challenging ${topSkill} problem you've solved recently?`,
      `Hey! I'd love to hear about your experience with ${topSkill}. Any tips for someone looking to improve?`,
      `Hi ${userName}! Your profile caught my attention. What kind of projects are you looking to collaborate on?`,
      `Hey! I see you're ${matchedUser?.availability || "available for collaboration"}. What's your ideal project setup?`,
      `Hi ${userName}! We seem to have similar tech interests. Want to share what you're learning right now?`,
      `Hey! Your ${experience} background is impressive. Any interesting challenges you're facing lately?`,
      `Hi ${userName}! I'd love to connect and maybe collaborate. What kind of development work excites you most?`
    ];

    // Add skill-specific starters
    if (sharedSkills.length > 0) {
      starterTemplates.push(
        `I noticed we both use ${sharedSkills.join(", ")}. Have you worked on any cool projects combining these?`,
        `Our tech stacks overlap quite a bit! What's your experience been like with ${sharedSkills[0]}?`
      );
    }

    // Shuffle and pick 4 random starters
    const shuffled = starterTemplates.sort(() => 0.5 - Math.random());
    setCurrentStarters(shuffled.slice(0, 4));
  };

  // Generate initial starters when component mounts
  useState(() => {
    generateStarters();
  });

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <MessageCircle className="w-5 h-5 text-blue-600" />
          Conversation Starters
          <Button
            variant="ghost"
            size="sm"
            onClick={generateStarters}
            className="ml-auto text-blue-600 hover:bg-blue-50"
          >
            <Refresh className="w-4 h-4" />
          </Button>
        </CardTitle>
        
        {(sharedSkills.length > 0 || sharedInterests.length > 0) && (
          <div className="flex flex-wrap gap-1">
            <span className="text-sm text-gray-600">Based on shared:</span>
            {sharedSkills.slice(0, 3).map(skill => (
              <Badge key={skill} variant="secondary" className="text-xs">
                {skill}
              </Badge>
            ))}
            {sharedSkills.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{sharedSkills.length - 3} more
              </Badge>
            )}
          </div>
        )}
      </CardHeader>
      
      <CardContent className="space-y-3">
        {currentStarters.map((starter, index) => (
          <div
            key={index}
            className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors cursor-pointer group"
            onClick={() => onSendMessage(starter)}
          >
            <div className="flex items-start gap-3">
              <Lightbulb className="w-4 h-4 text-amber-500 mt-1 flex-shrink-0" />
              <p className="text-sm text-gray-700 flex-1 group-hover:text-blue-700">
                {starter}
              </p>
              <Send className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
            </div>
          </div>
        ))}
        
        <div className="pt-2 text-center">
          <p className="text-xs text-gray-500">
            💡 Tip: Click any message to send it instantly, or use it as inspiration!
          </p>
        </div>
      </CardContent>
    </Card>
  );
}