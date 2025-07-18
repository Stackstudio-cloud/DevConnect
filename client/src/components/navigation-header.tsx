import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, User, Filter, RotateCcw } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import FilterModal, { type FilterOptions } from "./filter-modal";

interface NavigationHeaderProps {
  title?: string;
  cardType?: "developers" | "tools";
  onCardTypeChange?: (type: "developers" | "tools") => void;
  onFiltersChange?: (filters: FilterOptions) => void;
  onUndoLastSwipe?: () => void;
}

export default function NavigationHeader({ 
  title, 
  cardType = "developers", 
  onCardTypeChange,
  onFiltersChange,
  onUndoLastSwipe
}: NavigationHeaderProps) {
  const { user } = useAuth();
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [currentFilters, setCurrentFilters] = useState<FilterOptions>({
    skills: [],
    experience: [],
    availability: [],
    remote: false,
    location: "",
    popularityRange: [0, 100],
    categories: []
  });
  
  const { data: matches } = useQuery({
    queryKey: ["/api/matches"],
  });

  const matchCount = matches?.length || 0;

  if (title) {
    return (
      <header className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4 text-white">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.history.back()}
            className="text-white hover:bg-white/20"
          >
            <User className="w-5 h-5" />
          </Button>
          <div className="text-center">
            <h1 className="text-xl font-bold">{title}</h1>
          </div>
          <div className="w-10"></div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4 text-white relative">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          onClick={() => window.location.href = '/api/logout'}
        >
          <Avatar className="w-6 h-6">
            <AvatarImage src={user?.profileImageUrl} />
            <AvatarFallback>
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </AvatarFallback>
          </Avatar>
        </Button>
        
        <div className="text-center">
          <h1 className="text-xl font-bold">DevMatch</h1>
          <p className="text-xs opacity-80">Find your coding partner</p>
        </div>
        
        <div className="flex items-center gap-2">
          {onUndoLastSwipe && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onUndoLastSwipe}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors text-white"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          )}
          {onFiltersChange && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilterModal(true)}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors text-white relative"
            >
              <Filter className="w-4 h-4" />
              {(currentFilters.skills.length + currentFilters.experience.length + 
                currentFilters.availability.length + currentFilters.categories.length +
                (currentFilters.remote ? 1 : 0)) > 0 && (
                <span className="absolute -top-1 -right-1 bg-emerald-500 text-xs rounded-full w-4 h-4 flex items-center justify-center font-medium">
                  {currentFilters.skills.length + currentFilters.experience.length + 
                   currentFilters.availability.length + currentFilters.categories.length +
                   (currentFilters.remote ? 1 : 0)}
                </span>
              )}
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="p-2 hover:bg-white/20 rounded-lg transition-colors relative"
          >
            <Heart className="w-5 h-5" />
            {matchCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-emerald-500 text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                {matchCount}
              </span>
            )}
          </Button>
        </div>
      </div>
      
      {onCardTypeChange && (
        <div className="flex justify-center mt-3">
          <div className="bg-white/20 rounded-full p-1 flex">
            <Button
              variant="ghost"
              size="sm"
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                cardType === "developers"
                  ? "bg-white text-indigo-600"
                  : "text-white hover:bg-white/20"
              }`}
              onClick={() => onCardTypeChange("developers")}
            >
              Developers
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                cardType === "tools"
                  ? "bg-white text-indigo-600"
                  : "text-white hover:bg-white/20"
              }`}
              onClick={() => onCardTypeChange("tools")}
            >
              Tools & Apps
            </Button>
          </div>
        </div>
      )}
      
      <FilterModal
        isOpen={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        onApplyFilters={(filters) => {
          setCurrentFilters(filters);
          onFiltersChange?.(filters);
        }}
        currentFilters={currentFilters}
      />
    </header>
  );
}
