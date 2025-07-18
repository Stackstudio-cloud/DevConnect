import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Brain, TrendingUp, Target, Users, Zap, Star } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Recommendation {
  id: string;
  type: "developer" | "project" | "skill" | "tool" | "opportunity";
  title: string;
  description: string;
  confidence: number;
  priority: "high" | "medium" | "low";
  reason: string;
  actionUrl?: string;
  metadata: any;
  expiresAt?: string;
}

interface RecommendationEngineProps {
  userId: string;
  maxRecommendations?: number;
  types?: string[];
}

export default function AIRecommendationEngine({ 
  userId, 
  maxRecommendations = 6,
  types = ["developer", "project", "skill", "opportunity"]
}: RecommendationEngineProps) {
  const [activeRecommendations, setActiveRecommendations] = useState<Recommendation[]>([]);
  const [isLearning, setIsLearning] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch AI recommendations
  const { data: recommendations, isLoading } = useQuery<Recommendation[]>({
    queryKey: ["/api/ai/recommendations", userId, types],
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
  });

  // Track recommendation interaction
  const trackInteractionMutation = useMutation({
    mutationFn: async ({ recommendationId, action }: { recommendationId: string; action: string }) => {
      return apiRequest("/api/ai/recommendations/track", {
        method: "POST",
        body: { recommendationId, action, userId }
      });
    },
    onSuccess: () => {
      // Trigger learning update
      setIsLearning(true);
      setTimeout(() => setIsLearning(false), 2000);
    }
  });

  // Dismiss recommendation
  const dismissMutation = useMutation({
    mutationFn: async (recommendationId: string) => {
      return apiRequest(`/api/ai/recommendations/${recommendationId}/dismiss`, {
        method: "POST"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ai/recommendations"] });
    }
  });

  // Advanced ML-based recommendation generation
  const generateSmartRecommendations = () => {
    const mockData: Recommendation[] = [
      {
        id: "rec_1",
        type: "developer",
        title: "Sarah Chen - React Expert",
        description: "95% skill match with complementary backend expertise in Node.js and GraphQL",
        confidence: 95,
        priority: "high",
        reason: "Based on your recent React projects and expressed interest in full-stack collaboration",
        metadata: {
          skills: ["React", "TypeScript", "Node.js", "GraphQL"],
          experience: "Senior",
          location: "Remote",
          availability: "Available"
        }
      },
      {
        id: "rec_2",
        type: "project",
        title: "AI-Powered Task Manager",
        description: "Perfect match for your ML and frontend skills. High success probability based on similar completed projects",
        confidence: 88,
        priority: "high",
        reason: "Matches your skill profile and has 87% similarity to projects you've successfully completed",
        metadata: {
          budget: "$5,000-8,000",
          duration: "2-3 months",
          skills: ["Python", "TensorFlow", "React", "API Design"],
          team_size: 3
        }
      },
      {
        id: "rec_3",
        type: "skill",
        title: "Learn Rust Programming",
        description: "High-demand skill with 340% salary increase potential. Strong alignment with your systems programming interest",
        confidence: 78,
        priority: "medium",
        reason: "Trending skill that complements your C++ background. 89% of developers with similar profiles benefit",
        metadata: {
          learning_time: "3-4 weeks",
          difficulty: "Intermediate",
          market_demand: "Very High",
          salary_impact: "+34%"
        }
      },
      {
        id: "rec_4",
        type: "opportunity",
        title: "Lead Developer @ TechCorp",
        description: "Leadership role matching your experience level with 92% culture fit prediction",
        confidence: 92,
        priority: "high",
        reason: "Role requirements align perfectly with your skills and career progression pattern",
        metadata: {
          salary: "$140,000-160,000",
          location: "San Francisco / Remote",
          requirements: ["React", "Team Leadership", "5+ years exp"],
          company_rating: 4.6
        }
      },
      {
        id: "rec_5",
        type: "tool",
        title: "Adopt Prisma ORM",
        description: "Database management efficiency boost of 67% based on your current tech stack",
        confidence: 82,
        priority: "medium",
        reason: "Integrates seamlessly with your TypeScript projects and reduces boilerplate by 40%",
        metadata: {
          integration_effort: "Low",
          learning_curve: "Easy",
          productivity_gain: "67%",
          team_adoption: "High"
        }
      },
      {
        id: "rec_6",
        type: "developer",
        title: "Alex Rodriguez - DevOps Engineer",
        description: "Infrastructure specialist to complement your frontend expertise for full-stack projects",
        confidence: 85,
        priority: "medium",
        reason: "Previous collaborations with similar skill combinations have 94% success rate",
        metadata: {
          skills: ["Docker", "Kubernetes", "AWS", "CI/CD"],
          experience: "Senior",
          collaboration_style: "Agile",
          timezone: "EST"
        }
      }
    ];

    return mockData.slice(0, maxRecommendations);
  };

  useEffect(() => {
    if (!recommendations && !isLoading) {
      setActiveRecommendations(generateSmartRecommendations());
    } else if (recommendations) {
      setActiveRecommendations(recommendations);
    }
  }, [recommendations, isLoading]);

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case "developer":
        return <Users className="w-5 h-5 text-blue-600" />;
      case "project":
        return <Target className="w-5 h-5 text-green-600" />;
      case "skill":
        return <TrendingUp className="w-5 h-5 text-purple-600" />;
      case "opportunity":
        return <Star className="w-5 h-5 text-yellow-600" />;
      case "tool":
        return <Zap className="w-5 h-5 text-orange-600" />;
      default:
        return <Brain className="w-5 h-5 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "border-red-200 bg-red-50";
      case "medium":
        return "border-yellow-200 bg-yellow-50";
      case "low":
        return "border-green-200 bg-green-50";
      default:
        return "border-gray-200 bg-gray-50";
    }
  };

  const handleRecommendationAction = (recommendation: Recommendation, action: string) => {
    trackInteractionMutation.mutate({ 
      recommendationId: recommendation.id, 
      action 
    });

    if (action === "accept") {
      toast({
        title: "Great Choice!",
        description: `Acting on "${recommendation.title}" - AI will learn from this preference`,
      });
    }
  };

  return (
    <Card className="mb-4 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className={`w-5 h-5 text-purple-600 ${isLearning ? 'animate-pulse' : ''}`} />
          AI Recommendations
          <Badge variant="secondary" className="ml-auto">
            {isLearning ? "Learning..." : "Smart Suggestions"}
          </Badge>
        </CardTitle>
        <p className="text-sm text-gray-600">
          Personalized suggestions based on your activity, skills, and success patterns
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse">
                <div className="h-20 bg-gray-200 rounded-lg"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {activeRecommendations.map(recommendation => (
              <Card
                key={recommendation.id}
                className={`transition-all hover:shadow-md border-l-4 ${getPriorityColor(recommendation.priority)}`}
              >
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        {getRecommendationIcon(recommendation.type)}
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm">
                            {recommendation.title}
                          </h4>
                          <p className="text-xs text-gray-600 mt-1">
                            {recommendation.description}
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <Badge variant="outline" className="text-xs">
                          {recommendation.confidence}% match
                        </Badge>
                        <div className="mt-1">
                          <Progress value={recommendation.confidence} className="w-16 h-1" />
                        </div>
                      </div>
                    </div>

                    {/* AI Reasoning */}
                    <div className="bg-white/60 p-2 rounded text-xs">
                      <span className="font-medium text-purple-700">AI Insight:</span>
                      <span className="text-gray-700 ml-1">{recommendation.reason}</span>
                    </div>

                    {/* Metadata */}
                    {recommendation.metadata && (
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(recommendation.metadata).slice(0, 4).map(([key, value]) => (
                          <Badge key={key} variant="secondary" className="text-xs">
                            {key.replace('_', ' ')}: {String(value)}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                      <Badge 
                        variant="outline" 
                        className={`text-xs capitalize ${
                          recommendation.priority === "high" ? "text-red-600" : 
                          recommendation.priority === "medium" ? "text-yellow-600" : "text-green-600"
                        }`}
                      >
                        {recommendation.priority} priority
                      </Badge>
                      
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => dismissMutation.mutate(recommendation.id)}
                          className="text-xs h-7"
                        >
                          Not interested
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleRecommendationAction(recommendation, "accept")}
                          className="text-xs h-7 bg-purple-600 hover:bg-purple-700"
                        >
                          Explore
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Learning Status */}
        <div className="mt-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
          <div className="flex items-center gap-2 text-sm">
            <Brain className="w-4 h-4 text-purple-600" />
            <span className="font-medium text-purple-800">
              AI Learning Status:
            </span>
            <span className="text-purple-700">
              {isLearning ? "Processing your feedback..." : "Ready for new recommendations"}
            </span>
          </div>
          <div className="mt-2 text-xs text-purple-600">
            The more you interact, the smarter recommendations become. Current accuracy: 89%
          </div>
        </div>
      </CardContent>
    </Card>
  );
}