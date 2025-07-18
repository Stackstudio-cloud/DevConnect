import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Settings, Heart, Target } from "lucide-react";

interface MatchPreferencesProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (preferences: MatchPreferences) => void;
  currentPreferences: MatchPreferences;
}

export interface MatchPreferences {
  experienceMatch: "any" | "similar" | "complementary";
  skillOverlap: [number, number]; // Min/max percentage of skill overlap
  availabilityMatch: boolean;
  remotePreference: "any" | "remote_only" | "local_only";
  projectTypes: string[];
  collaborationStyle: string[];
  timeCommitment: string[];
}

const PROJECT_TYPES = [
  "Open Source", "Startup", "Freelance", "Learning", "Competition",
  "Research", "Enterprise", "Side Project", "Portfolio"
];

const COLLABORATION_STYLES = [
  "Pair Programming", "Code Review", "Mentoring", "Teaching",
  "Leadership", "Following", "Independent", "Team Player"
];

const TIME_COMMITMENTS = [
  "Few Hours/Week", "Part Time", "Full Time", "Weekends Only",
  "Evenings", "Flexible", "Short Term", "Long Term"
];

export default function MatchPreferences({ 
  isOpen, 
  onClose, 
  onSave, 
  currentPreferences 
}: MatchPreferencesProps) {
  const [preferences, setPreferences] = useState<MatchPreferences>(currentPreferences);

  const handleProjectTypeToggle = (type: string) => {
    setPreferences(prev => ({
      ...prev,
      projectTypes: prev.projectTypes.includes(type)
        ? prev.projectTypes.filter(t => t !== type)
        : [...prev.projectTypes, type]
    }));
  };

  const handleCollaborationStyleToggle = (style: string) => {
    setPreferences(prev => ({
      ...prev,
      collaborationStyle: prev.collaborationStyle.includes(style)
        ? prev.collaborationStyle.filter(s => s !== style)
        : [...prev.collaborationStyle, style]
    }));
  };

  const handleTimeCommitmentToggle = (commitment: string) => {
    setPreferences(prev => ({
      ...prev,
      timeCommitment: prev.timeCommitment.includes(commitment)
        ? prev.timeCommitment.filter(c => c !== commitment)
        : [...prev.timeCommitment, commitment]
    }));
  };

  const savePreferences = () => {
    onSave(preferences);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Match Preferences
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Experience Matching */}
          <div>
            <Label className="text-base font-semibold mb-3 block">Experience Matching</Label>
            <div className="space-y-2">
              {[
                { value: "any", label: "Any experience level" },
                { value: "similar", label: "Similar experience level" },
                { value: "complementary", label: "Complementary (mentor/mentee)" }
              ].map(option => (
                <div key={option.value} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id={option.value}
                    name="experienceMatch"
                    checked={preferences.experienceMatch === option.value}
                    onChange={() => setPreferences(prev => ({ 
                      ...prev, 
                      experienceMatch: option.value as any 
                    }))}
                    className="w-4 h-4 text-blue-600"
                  />
                  <Label htmlFor={option.value}>{option.label}</Label>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Skill Overlap */}
          <div>
            <Label className="text-base font-semibold mb-3 block">
              Skill Overlap: {preferences.skillOverlap[0]}% - {preferences.skillOverlap[1]}%
            </Label>
            <p className="text-sm text-gray-600 mb-3">
              How much should your skills overlap with potential matches?
            </p>
            <Slider
              value={preferences.skillOverlap}
              onValueChange={(value) => setPreferences(prev => ({ 
                ...prev, 
                skillOverlap: value as [number, number] 
              }))}
              max={100}
              min={0}
              step={10}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Different skills</span>
              <span>Similar skills</span>
            </div>
          </div>

          <Separator />

          {/* Remote Preference */}
          <div>
            <Label className="text-base font-semibold mb-3 block">Location Preference</Label>
            <div className="space-y-2">
              {[
                { value: "any", label: "Any location (remote or local)" },
                { value: "remote_only", label: "Remote collaborations only" },
                { value: "local_only", label: "Local/same timezone only" }
              ].map(option => (
                <div key={option.value} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id={`remote_${option.value}`}
                    name="remotePreference"
                    checked={preferences.remotePreference === option.value}
                    onChange={() => setPreferences(prev => ({ 
                      ...prev, 
                      remotePreference: option.value as any 
                    }))}
                    className="w-4 h-4 text-blue-600"
                  />
                  <Label htmlFor={`remote_${option.value}`}>{option.label}</Label>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Availability Matching */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="availabilityMatch"
              checked={preferences.availabilityMatch}
              onCheckedChange={(checked) => setPreferences(prev => ({ 
                ...prev, 
                availabilityMatch: !!checked 
              }))}
            />
            <Label htmlFor="availabilityMatch" className="text-base font-semibold">
              Match similar availability status
            </Label>
          </div>

          <Separator />

          {/* Project Types */}
          <div>
            <Label className="text-base font-semibold mb-3 block">Preferred Project Types</Label>
            <div className="flex flex-wrap gap-2">
              {PROJECT_TYPES.map(type => (
                <Badge
                  key={type}
                  variant={preferences.projectTypes.includes(type) ? "default" : "outline"}
                  className="cursor-pointer hover:bg-primary/80"
                  onClick={() => handleProjectTypeToggle(type)}
                >
                  {type}
                </Badge>
              ))}
            </div>
          </div>

          <Separator />

          {/* Collaboration Style */}
          <div>
            <Label className="text-base font-semibold mb-3 block">Collaboration Style</Label>
            <div className="flex flex-wrap gap-2">
              {COLLABORATION_STYLES.map(style => (
                <Badge
                  key={style}
                  variant={preferences.collaborationStyle.includes(style) ? "default" : "outline"}
                  className="cursor-pointer hover:bg-primary/80"
                  onClick={() => handleCollaborationStyleToggle(style)}
                >
                  {style}
                </Badge>
              ))}
            </div>
          </div>

          <Separator />

          {/* Time Commitment */}
          <div>
            <Label className="text-base font-semibold mb-3 block">Time Commitment</Label>
            <div className="flex flex-wrap gap-2">
              {TIME_COMMITMENTS.map(commitment => (
                <Badge
                  key={commitment}
                  variant={preferences.timeCommitment.includes(commitment) ? "default" : "outline"}
                  className="cursor-pointer hover:bg-primary/80"
                  onClick={() => handleTimeCommitmentToggle(commitment)}
                >
                  {commitment}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button onClick={savePreferences} className="flex-1">
            <Heart className="w-4 h-4 mr-2" />
            Save Preferences
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}