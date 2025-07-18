import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertCircle, User, Briefcase, MapPin, Code, Target } from "lucide-react";
import type { DeveloperProfile } from "@shared/schema";

interface ProfileCompletionProps {
  profile: DeveloperProfile | null;
  onEditProfile: () => void;
}

interface CompletionItem {
  id: string;
  label: string;
  description: string;
  completed: boolean;
  icon: React.ReactNode;
  priority: "high" | "medium" | "low";
}

export default function ProfileCompletion({ profile, onEditProfile }: ProfileCompletionProps) {
  const [completionItems, setCompletionItems] = useState<CompletionItem[]>([]);
  const [completionPercentage, setCompletionPercentage] = useState(0);

  useEffect(() => {
    if (!profile) return;

    const items: CompletionItem[] = [
      {
        id: "basic_info",
        label: "Basic Information",
        description: "Add your title and bio",
        completed: !!(profile.title && profile.bio),
        icon: <User className="w-4 h-4" />,
        priority: "high"
      },
      {
        id: "skills",
        label: "Skills & Technologies",
        description: "Add at least 3 skills",
        completed: (profile.skills?.length || 0) >= 3,
        icon: <Code className="w-4 h-4" />,
        priority: "high"
      },
      {
        id: "experience",
        label: "Experience Level",
        description: "Set your experience level",
        completed: !!profile.experience,
        icon: <Briefcase className="w-4 h-4" />,
        priority: "high"
      },
      {
        id: "availability",
        label: "Availability Status",
        description: "Let others know your availability",
        completed: !!profile.availability,
        icon: <Target className="w-4 h-4" />,
        priority: "medium"
      },
      {
        id: "location",
        label: "Location & Remote",
        description: "Add your location and remote preferences",
        completed: !!(profile.location || profile.remote !== null),
        icon: <MapPin className="w-4 h-4" />,
        priority: "medium"
      },
      {
        id: "detailed_skills",
        label: "Comprehensive Skills",
        description: "Add 5+ skills for better matching",
        completed: (profile.skills?.length || 0) >= 5,
        icon: <Code className="w-4 h-4" />,
        priority: "low"
      },
      {
        id: "interests",
        label: "Project Interests",
        description: "Add your project interests",
        completed: (profile.interests?.length || 0) > 0,
        icon: <Target className="w-4 h-4" />,
        priority: "low"
      }
    ];

    setCompletionItems(items);

    const completedCount = items.filter(item => item.completed).length;
    const percentage = Math.round((completedCount / items.length) * 100);
    setCompletionPercentage(percentage);
  }, [profile]);

  if (!profile || completionPercentage >= 85) {
    return null; // Don't show if profile is mostly complete
  }

  const incompleteHighPriority = completionItems.filter(item => !item.completed && item.priority === "high");
  const incompleteMediumPriority = completionItems.filter(item => !item.completed && item.priority === "medium");

  return (
    <Card className="mx-4 mb-4 border-2 border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-600" />
            <h3 className="font-semibold text-gray-900">Complete Your Profile</h3>
          </div>
          <Badge variant="outline" className="border-amber-300 text-amber-700">
            {completionPercentage}% complete
          </Badge>
        </div>

        <div className="mb-4">
          <Progress value={completionPercentage} className="h-2 bg-amber-100" />
          <p className="text-sm text-gray-600 mt-1">
            A complete profile gets 3x more matches!
          </p>
        </div>

        {incompleteHighPriority.length > 0 && (
          <div className="mb-3">
            <h4 className="text-sm font-medium text-red-700 mb-2 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              High Priority
            </h4>
            <div className="space-y-1">
              {incompleteHighPriority.map(item => (
                <div key={item.id} className="flex items-center gap-2 text-sm">
                  {item.icon}
                  <span className="text-gray-700">{item.label}</span>
                  <span className="text-gray-500 text-xs">• {item.description}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {incompleteMediumPriority.length > 0 && (
          <div className="mb-3">
            <h4 className="text-sm font-medium text-amber-700 mb-2">Quick Improvements</h4>
            <div className="space-y-1">
              {incompleteMediumPriority.slice(0, 2).map(item => (
                <div key={item.id} className="flex items-center gap-2 text-sm">
                  {item.icon}
                  <span className="text-gray-700">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <Button 
          onClick={onEditProfile} 
          className="w-full bg-amber-600 hover:bg-amber-700 text-white"
          size="sm"
        >
          Complete Profile
        </Button>
      </CardContent>
    </Card>
  );
}