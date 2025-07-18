import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { X, Filter } from "lucide-react";

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: FilterOptions) => void;
  currentFilters: FilterOptions;
}

export interface FilterOptions {
  skills: string[];
  experience: string[];
  availability: string[];
  remote: boolean;
  location: string;
  popularityRange: [number, number];
  categories: string[];
}

const POPULAR_SKILLS = [
  "JavaScript", "TypeScript", "React", "Node.js", "Python", "Go",
  "Rust", "Java", "C++", "Swift", "Kotlin", "Flutter", "Vue.js",
  "Angular", "Next.js", "Express", "Django", "Flask", "PostgreSQL",
  "MongoDB", "Redis", "Docker", "Kubernetes", "AWS", "Azure", "GCP"
];

const EXPERIENCE_LEVELS = [
  { value: "junior", label: "Junior (0-2 years)" },
  { value: "mid", label: "Mid-level (2-5 years)" },
  { value: "senior", label: "Senior (5+ years)" },
  { value: "lead", label: "Lead/Principal" }
];

const AVAILABILITY_OPTIONS = [
  { value: "available", label: "Available Now" },
  { value: "busy", label: "Busy (Limited)" },
  { value: "not_seeking", label: "Not Seeking" }
];

const TOOL_CATEGORIES = [
  "ide", "design", "database", "containerization", "version_control",
  "productivity", "communication", "testing", "monitoring", "deployment"
];

export default function FilterModal({ isOpen, onClose, onApplyFilters, currentFilters }: FilterModalProps) {
  const [filters, setFilters] = useState<FilterOptions>(currentFilters);

  const handleSkillToggle = (skill: string) => {
    setFilters(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  const handleExperienceToggle = (level: string) => {
    setFilters(prev => ({
      ...prev,
      experience: prev.experience.includes(level)
        ? prev.experience.filter(e => e !== level)
        : [...prev.experience, level]
    }));
  };

  const handleAvailabilityToggle = (availability: string) => {
    setFilters(prev => ({
      ...prev,
      availability: prev.availability.includes(availability)
        ? prev.availability.filter(a => a !== availability)
        : [...prev.availability, availability]
    }));
  };

  const handleCategoryToggle = (category: string) => {
    setFilters(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
  };

  const clearAllFilters = () => {
    setFilters({
      skills: [],
      experience: [],
      availability: [],
      remote: false,
      location: "",
      popularityRange: [0, 100],
      categories: []
    });
  };

  const applyFilters = () => {
    onApplyFilters(filters);
    onClose();
  };

  const activeFilterCount = 
    filters.skills.length + 
    filters.experience.length + 
    filters.availability.length + 
    filters.categories.length +
    (filters.remote ? 1 : 0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filters
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {activeFilterCount} active
                </Badge>
              )}
            </div>
            <Button variant="ghost" size="sm" onClick={clearAllFilters}>
              Clear All
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Skills */}
          <div>
            <Label className="text-base font-semibold mb-3 block">Skills</Label>
            <div className="flex flex-wrap gap-2">
              {POPULAR_SKILLS.map(skill => (
                <Badge
                  key={skill}
                  variant={filters.skills.includes(skill) ? "default" : "outline"}
                  className="cursor-pointer hover:bg-primary/80"
                  onClick={() => handleSkillToggle(skill)}
                >
                  {skill}
                  {filters.skills.includes(skill) && (
                    <X className="w-3 h-3 ml-1" />
                  )}
                </Badge>
              ))}
            </div>
          </div>

          <Separator />

          {/* Experience Level */}
          <div>
            <Label className="text-base font-semibold mb-3 block">Experience Level</Label>
            <div className="space-y-2">
              {EXPERIENCE_LEVELS.map(level => (
                <div key={level.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={level.value}
                    checked={filters.experience.includes(level.value)}
                    onCheckedChange={() => handleExperienceToggle(level.value)}
                  />
                  <Label htmlFor={level.value}>{level.label}</Label>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Availability */}
          <div>
            <Label className="text-base font-semibold mb-3 block">Availability</Label>
            <div className="space-y-2">
              {AVAILABILITY_OPTIONS.map(option => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={option.value}
                    checked={filters.availability.includes(option.value)}
                    onCheckedChange={() => handleAvailabilityToggle(option.value)}
                  />
                  <Label htmlFor={option.value}>{option.label}</Label>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Remote Work */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="remote"
              checked={filters.remote}
              onCheckedChange={(checked) => setFilters(prev => ({ ...prev, remote: !!checked }))}
            />
            <Label htmlFor="remote" className="text-base font-semibold">Remote Work Available</Label>
          </div>

          <Separator />

          {/* Tool Categories */}
          <div>
            <Label className="text-base font-semibold mb-3 block">Tool Categories</Label>
            <div className="flex flex-wrap gap-2">
              {TOOL_CATEGORIES.map(category => (
                <Badge
                  key={category}
                  variant={filters.categories.includes(category) ? "default" : "outline"}
                  className="cursor-pointer hover:bg-primary/80 capitalize"
                  onClick={() => handleCategoryToggle(category)}
                >
                  {category.replace("_", " ")}
                  {filters.categories.includes(category) && (
                    <X className="w-3 h-3 ml-1" />
                  )}
                </Badge>
              ))}
            </div>
          </div>

          <Separator />

          {/* Popularity Range */}
          <div>
            <Label className="text-base font-semibold mb-3 block">
              Popularity Range: {filters.popularityRange[0]} - {filters.popularityRange[1]}
            </Label>
            <Slider
              value={filters.popularityRange}
              onValueChange={(value) => setFilters(prev => ({ ...prev, popularityRange: value as [number, number] }))}
              max={100}
              min={0}
              step={5}
              className="w-full"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button onClick={applyFilters} className="flex-1">
            Apply Filters
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}