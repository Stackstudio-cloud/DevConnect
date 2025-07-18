import { Badge } from "@/components/ui/badge";
import { Clock, Zap, Star, UserPlus } from "lucide-react";

interface ActivityIndicatorProps {
  lastActive?: string;
  joinedDate?: string;
  activityLevel?: "low" | "medium" | "high";
  isNewUser?: boolean;
  className?: string;
}

export default function ActivityIndicator({ 
  lastActive, 
  joinedDate, 
  activityLevel = "medium",
  isNewUser = false,
  className = ""
}: ActivityIndicatorProps) {
  
  const getActivityBadge = () => {
    if (isNewUser) {
      return (
        <Badge className="bg-emerald-500 text-white shadow-lg">
          <UserPlus className="w-3 h-3 mr-1" />
          New User
        </Badge>
      );
    }

    if (!lastActive) return null;

    const lastActiveDate = new Date(lastActive);
    const now = new Date();
    const diffInHours = (now.getTime() - lastActiveDate.getTime()) / (1000 * 60 * 60);
    const diffInDays = diffInHours / 24;

    if (diffInHours < 1) {
      return (
        <Badge className="bg-green-500 text-white shadow-lg">
          <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse" />
          Online
        </Badge>
      );
    } else if (diffInHours < 24) {
      return (
        <Badge className="bg-blue-500 text-white shadow-lg">
          <Clock className="w-3 h-3 mr-1" />
          Active today
        </Badge>
      );
    } else if (diffInDays < 7) {
      return (
        <Badge className="bg-orange-500 text-white shadow-lg">
          <Clock className="w-3 h-3 mr-1" />
          Active this week
        </Badge>
      );
    } else if (diffInDays < 30) {
      return (
        <Badge variant="secondary" className="shadow-lg">
          <Clock className="w-3 h-3 mr-1" />
          Active this month
        </Badge>
      );
    }

    return null;
  };

  const getActivityLevelBadge = () => {
    if (activityLevel === "high") {
      return (
        <Badge className="bg-purple-500 text-white shadow-lg">
          <Zap className="w-3 h-3 mr-1" />
          Super Active
        </Badge>
      );
    } else if (activityLevel === "medium") {
      return (
        <Badge className="bg-indigo-500 text-white shadow-lg">
          <Star className="w-3 h-3 mr-1" />
          Active
        </Badge>
      );
    }
    
    return null;
  };

  const activityBadge = getActivityBadge();
  const levelBadge = getActivityLevelBadge();

  if (!activityBadge && !levelBadge) {
    return null;
  }

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {activityBadge}
      {levelBadge && !isNewUser && levelBadge}
    </div>
  );
}