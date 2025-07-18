import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Brain, Target, TrendingUp, Users, Zap, Heart } from "lucide-react";

interface CompatibilityScore {
  overall: number;
  skillMatch: number;
  experienceMatch: number;
  availabilityMatch: number;
  interestMatch: number;
  collaborationMatch: number;
  reasons: string[];
  improvements: string[];
}

interface SmartMatchingProps {
  profile1: any; // Current user
  profile2: any; // Potential match
  onMatchAction?: (action: "like" | "pass" | "super_like") => void;
}

export default function SmartMatching({ profile1, profile2, onMatchAction }: SmartMatchingProps) {
  const [compatibility, setCompatibility] = useState<CompatibilityScore | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Calculate compatibility when profiles change
  useEffect(() => {
    if (profile1 && profile2) {
      calculateCompatibility();
    }
  }, [profile1, profile2]);

  const calculateCompatibility = () => {
    setIsCalculating(true);
    
    // Simulate AI calculation with realistic delay
    setTimeout(() => {
      const score = performCompatibilityAnalysis(profile1, profile2);
      setCompatibility(score);
      setIsCalculating(false);
    }, 1500);
  };

  const performCompatibilityAnalysis = (p1: any, p2: any): CompatibilityScore => {
    // Skill Compatibility Analysis
    const skills1 = p1?.skills || [];
    const skills2 = p2?.skills || [];
    const commonSkills = skills1.filter((skill: string) => skills2.includes(skill));
    const uniqueSkills1 = skills1.filter((skill: string) => !skills2.includes(skill));
    const uniqueSkills2 = skills2.filter((skill: string) => !skills1.includes(skill));
    
    const skillOverlap = commonSkills.length / Math.max(skills1.length, skills2.length, 1);
    const complementaryFactor = (uniqueSkills1.length + uniqueSkills2.length) / 
      Math.max(skills1.length + skills2.length, 1);
    
    const skillMatch = Math.round((skillOverlap * 0.6 + complementaryFactor * 0.4) * 100);

    // Experience Compatibility
    const exp1 = getExperienceLevel(p1?.experience);
    const exp2 = getExperienceLevel(p2?.experience);
    const expDiff = Math.abs(exp1 - exp2);
    const experienceMatch = Math.round(Math.max(0, 100 - expDiff * 20));

    // Availability Compatibility
    const avail1 = p1?.availability === "available";
    const avail2 = p2?.availability === "available";
    const bothRemote = p1?.remote && p2?.remote;
    const availabilityMatch = (avail1 && avail2) ? (bothRemote ? 100 : 80) : 40;

    // Interest/Project Compatibility
    const interests1 = p1?.projectTypes || [];
    const interests2 = p2?.projectTypes || [];
    const commonInterests = interests1.filter((int: string) => interests2.includes(int));
    const interestMatch = Math.round((commonInterests.length / Math.max(interests1.length, interests2.length, 1)) * 100);

    // Collaboration Style Compatibility
    const collab1 = p1?.collaborationStyle || [];
    const collab2 = p2?.collaborationStyle || [];
    const compatibleStyles = checkCollaborationCompatibility(collab1, collab2);
    const collaborationMatch = Math.round(compatibleStyles * 100);

    // Overall Score (weighted average)
    const overall = Math.round(
      (skillMatch * 0.3 + 
       experienceMatch * 0.2 + 
       availabilityMatch * 0.2 + 
       interestMatch * 0.15 + 
       collaborationMatch * 0.15)
    );

    // Generate insights
    const reasons = generateMatchReasons(
      skillMatch, experienceMatch, availabilityMatch, interestMatch, collaborationMatch,
      commonSkills, commonInterests, p1, p2
    );

    const improvements = generateImprovements(
      skillMatch, experienceMatch, availabilityMatch, interestMatch,
      uniqueSkills1, uniqueSkills2, p1, p2
    );

    return {
      overall,
      skillMatch,
      experienceMatch,
      availabilityMatch,
      interestMatch,
      collaborationMatch,
      reasons,
      improvements
    };
  };

  const getExperienceLevel = (experience: string): number => {
    const levels = {
      "beginner": 1,
      "junior": 2,
      "mid": 3,
      "senior": 4,
      "lead": 5,
      "architect": 5
    };
    return levels[experience?.toLowerCase() as keyof typeof levels] || 3;
  };

  const checkCollaborationCompatibility = (styles1: string[], styles2: string[]): number => {
    // Compatible collaboration pairs
    const compatiblePairs = [
      ["Pair Programming", "Pair Programming"],
      ["Mentoring", "Learning"],
      ["Teaching", "Learning"],
      ["Leadership", "Following"],
      ["Team Player", "Team Player"],
      ["Independent", "Independent"]
    ];

    let compatibility = 0;
    for (const style1 of styles1) {
      for (const style2 of styles2) {
        const isDirectMatch = style1 === style2;
        const isCompatiblePair = compatiblePairs.some(pair => 
          (pair[0] === style1 && pair[1] === style2) ||
          (pair[1] === style1 && pair[0] === style2)
        );
        
        if (isDirectMatch) compatibility += 0.8;
        else if (isCompatiblePair) compatibility += 0.6;
      }
    }

    return Math.min(compatibility / Math.max(styles1.length, styles2.length, 1), 1);
  };

  const generateMatchReasons = (
    skillMatch: number, experienceMatch: number, availabilityMatch: number, 
    interestMatch: number, collaborationMatch: number,
    commonSkills: string[], commonInterests: string[], p1: any, p2: any
  ): string[] => {
    const reasons = [];

    if (skillMatch >= 70) {
      reasons.push(`Strong skill compatibility with ${commonSkills.length} shared technologies`);
    }
    if (commonSkills.length > 0) {
      reasons.push(`Both experienced in ${commonSkills.slice(0, 3).join(", ")}`);
    }
    if (experienceMatch >= 80) {
      reasons.push("Similar experience levels for smooth collaboration");
    } else if (experienceMatch >= 60) {
      reasons.push("Complementary experience levels for mentorship opportunities");
    }
    if (availabilityMatch >= 80) {
      reasons.push("Both actively looking for collaboration");
    }
    if (p1?.remote && p2?.remote) {
      reasons.push("Both comfortable with remote collaboration");
    }
    if (interestMatch >= 60) {
      reasons.push(`Shared interest in ${commonInterests.slice(0, 2).join(" and ")} projects`);
    }
    if (collaborationMatch >= 70) {
      reasons.push("Compatible working styles and collaboration preferences");
    }

    return reasons.slice(0, 4);
  };

  const generateImprovements = (
    skillMatch: number, experienceMatch: number, availabilityMatch: number, interestMatch: number,
    uniqueSkills1: string[], uniqueSkills2: string[], p1: any, p2: any
  ): string[] => {
    const improvements = [];

    if (skillMatch < 60 && uniqueSkills2.length > 0) {
      improvements.push(`Consider learning ${uniqueSkills2[0]} to increase skill compatibility`);
    }
    if (availabilityMatch < 60) {
      improvements.push("Update availability status to improve matching");
    }
    if (interestMatch < 40) {
      improvements.push("Add more project types to find better matches");
    }
    if (!p1?.remote && p2?.remote) {
      improvements.push("Consider enabling remote work for more opportunities");
    }

    return improvements.slice(0, 3);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 bg-green-50";
    if (score >= 60) return "text-yellow-600 bg-yellow-50";
    if (score >= 40) return "text-orange-600 bg-orange-50";
    return "text-red-600 bg-red-50";
  };

  const getOverallRating = (score: number) => {
    if (score >= 85) return "Excellent Match";
    if (score >= 70) return "Great Match";
    if (score >= 55) return "Good Match";
    if (score >= 40) return "Fair Match";
    return "Poor Match";
  };

  if (isCalculating) {
    return (
      <Card className="mb-4 bg-gradient-to-r from-purple-50 to-blue-50">
        <CardContent className="flex flex-col items-center justify-center py-8">
          <Brain className="w-8 h-8 text-purple-600 animate-pulse mb-4" />
          <h3 className="font-semibold mb-2">AI Analyzing Compatibility...</h3>
          <Progress value={66} className="w-48 mb-2" />
          <p className="text-sm text-gray-600 text-center">
            Calculating skill synergy, experience compatibility, and collaboration potential
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!compatibility) return null;

  return (
    <Card className="mb-4 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-600" />
          AI Compatibility Analysis
          <Badge className={`ml-auto ${getScoreColor(compatibility.overall)}`}>
            {compatibility.overall}% • {getOverallRating(compatibility.overall)}
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Overall Compatibility */}
        <div className="text-center p-4 bg-white rounded-lg border">
          <div className="text-3xl font-bold mb-2" style={{ color: compatibility.overall >= 70 ? '#16a34a' : compatibility.overall >= 50 ? '#ca8a04' : '#dc2626' }}>
            {compatibility.overall}%
          </div>
          <p className="text-sm text-gray-600">Overall Compatibility</p>
          <Progress value={compatibility.overall} className="mt-2" />
        </div>

        {/* Detailed Breakdown */}
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center p-3 bg-white rounded-lg">
            <Target className="w-5 h-5 mx-auto mb-1 text-blue-600" />
            <div className="font-semibold">{compatibility.skillMatch}%</div>
            <div className="text-xs text-gray-600">Skills</div>
          </div>
          <div className="text-center p-3 bg-white rounded-lg">
            <TrendingUp className="w-5 h-5 mx-auto mb-1 text-green-600" />
            <div className="font-semibold">{compatibility.experienceMatch}%</div>
            <div className="text-xs text-gray-600">Experience</div>
          </div>
          <div className="text-center p-3 bg-white rounded-lg">
            <Zap className="w-5 h-5 mx-auto mb-1 text-yellow-600" />
            <div className="font-semibold">{compatibility.availabilityMatch}%</div>
            <div className="text-xs text-gray-600">Availability</div>
          </div>
          <div className="text-center p-3 bg-white rounded-lg">
            <Users className="w-5 h-5 mx-auto mb-1 text-purple-600" />
            <div className="font-semibold">{compatibility.collaborationMatch}%</div>
            <div className="text-xs text-gray-600">Collaboration</div>
          </div>
        </div>

        {/* Match Reasons */}
        {compatibility.reasons.length > 0 && (
          <div className="bg-white p-4 rounded-lg">
            <h4 className="font-semibold text-sm mb-2 flex items-center gap-1">
              <Heart className="w-4 h-4 text-red-500" />
              Why you're compatible:
            </h4>
            <ul className="space-y-1">
              {compatibility.reasons.map((reason, index) => (
                <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                  <span className="text-green-600 font-bold">•</span>
                  {reason}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Improvement Suggestions */}
        {compatibility.improvements.length > 0 && (
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-sm mb-2 text-blue-800">
              💡 Suggestions to improve compatibility:
            </h4>
            <ul className="space-y-1">
              {compatibility.improvements.map((improvement, index) => (
                <li key={index} className="text-sm text-blue-700 flex items-start gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  {improvement}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <Button
            variant="outline"
            onClick={() => onMatchAction?.("pass")}
            className="flex-1"
          >
            Pass
          </Button>
          <Button
            onClick={() => onMatchAction?.("like")}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            <Heart className="w-4 h-4 mr-2" />
            Like
          </Button>
          {compatibility.overall >= 70 && (
            <Button
              onClick={() => onMatchAction?.("super_like")}
              className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-yellow-900"
            >
              ⭐ Super Like
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}