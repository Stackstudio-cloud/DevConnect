import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, TrendingUp, Users, Lightbulb, X } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface SkillRecommendationsProps {
  currentSkills: string[];
  onSkillAdded?: (skill: string) => void;
}

export default function SkillRecommendations({ 
  currentSkills, 
  onSkillAdded 
}: SkillRecommendationsProps) {
  const [dismissedSkills, setDismissedSkills] = useState<string[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: recommendations, isLoading } = useQuery({
    queryKey: ["/api/skill-recommendations", currentSkills],
    enabled: currentSkills.length > 0,
  });

  const addSkillMutation = useMutation({
    mutationFn: async (skill: string) => {
      return apiRequest("/api/developer-profiles/me/skills", {
        method: "POST",
        body: { skill }
      });
    },
    onSuccess: (_, skill) => {
      queryClient.invalidateQueries({ queryKey: ["/api/developer-profiles/me"] });
      toast({
        title: "Skill Added!",
        description: `${skill} has been added to your profile`,
      });
      onSkillAdded?.(skill);
    }
  });

  // Generate smart recommendations based on current skills
  const generateRecommendations = () => {
    const skillMap: Record<string, string[]> = {
      "React": ["Next.js", "TypeScript", "Redux", "React Native", "Gatsby"],
      "JavaScript": ["TypeScript", "Node.js", "Vue.js", "Angular", "Express"],
      "Python": ["Django", "Flask", "FastAPI", "NumPy", "Pandas"],
      "Java": ["Spring", "Maven", "Gradle", "Hibernate", "Kotlin"],
      "CSS": ["Sass", "Tailwind CSS", "Styled Components", "CSS Modules"],
      "HTML": ["CSS", "JavaScript", "Bootstrap", "Accessibility"],
      "Node.js": ["Express", "MongoDB", "PostgreSQL", "GraphQL", "Socket.io"],
      "TypeScript": ["React", "Angular", "Vue.js", "Deno", "NestJS"],
      "Docker": ["Kubernetes", "AWS", "DevOps", "CI/CD", "Microservices"],
      "AWS": ["Docker", "Terraform", "Kubernetes", "Lambda", "S3"],
      "MongoDB": ["Mongoose", "Express", "Node.js", "GraphQL"],
      "PostgreSQL": ["SQL", "Prisma", "Sequelize", "Database Design"],
      "Git": ["GitHub Actions", "GitLab", "DevOps", "CI/CD"],
      "Angular": ["TypeScript", "RxJS", "NgRx", "Angular Material"],
      "Vue.js": ["Nuxt.js", "Vuex", "Pinia", "Vue Router"],
      "PHP": ["Laravel", "Symfony", "Composer", "MySQL"],
      "C#": [".NET", "ASP.NET", "Entity Framework", "Azure"],
      "Go": ["Gin", "Echo", "gRPC", "Docker", "Kubernetes"],
      "Rust": ["WebAssembly", "Actix", "Tokio", "Cargo"],
      "Swift": ["iOS", "Xcode", "SwiftUI", "Combine"],
      "Kotlin": ["Android", "Spring Boot", "Coroutines"]
    };

    const complementarySkills: string[] = [];
    const trendingSkills = ["TypeScript", "Next.js", "Tailwind CSS", "GraphQL", "Docker", "AWS", "Kubernetes"];
    
    // Find complementary skills
    currentSkills.forEach(skill => {
      const related = skillMap[skill] || [];
      related.forEach(relatedSkill => {
        if (!currentSkills.includes(relatedSkill) && !complementarySkills.includes(relatedSkill)) {
          complementarySkills.push(relatedSkill);
        }
      });
    });

    // Add trending skills not in current skills
    trendingSkills.forEach(skill => {
      if (!currentSkills.includes(skill) && !complementarySkills.includes(skill)) {
        complementarySkills.push(skill);
      }
    });

    return complementarySkills
      .filter(skill => !dismissedSkills.includes(skill))
      .slice(0, 8);
  };

  const recommendedSkills = generateRecommendations();

  if (isLoading || recommendedSkills.length === 0) {
    return null;
  }

  const dismissSkill = (skill: string) => {
    setDismissedSkills(prev => [...prev, skill]);
  };

  return (
    <Card className="mb-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Lightbulb className="w-5 h-5 text-blue-600" />
          Skill Recommendations
          <Badge variant="secondary" className="ml-auto">
            Smart Suggestions
          </Badge>
        </CardTitle>
        <p className="text-sm text-gray-600">
          Based on your current skills, these might complement your tech stack
        </p>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-1 gap-3">
          {recommendedSkills.map((skill, index) => {
            // Determine recommendation reason
            const isComplementary = currentSkills.some(currentSkill => {
              const skillMap: Record<string, string[]> = {
                "React": ["Next.js", "TypeScript", "Redux"],
                "JavaScript": ["TypeScript", "Node.js"],
                "Python": ["Django", "Flask"],
                // Add more mappings as needed
              };
              return skillMap[currentSkill]?.includes(skill);
            });
            
            const isTrending = ["TypeScript", "Next.js", "Tailwind CSS", "GraphQL", "Docker"].includes(skill);
            
            return (
              <div
                key={skill}
                className="flex items-center justify-between p-3 bg-white rounded-lg border border-blue-100"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="outline" 
                      className="text-sm font-medium"
                    >
                      {skill}
                    </Badge>
                    
                    {isTrending && (
                      <div className="flex items-center gap-1 text-xs text-orange-600">
                        <TrendingUp className="w-3 h-3" />
                        <span>Trending</span>
                      </div>
                    )}
                    
                    {isComplementary && (
                      <div className="flex items-center gap-1 text-xs text-green-600">
                        <Users className="w-3 h-3" />
                        <span>Pairs well</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => dismissSkill(skill)}
                    className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addSkillMutation.mutate(skill)}
                    disabled={addSkillMutation.isPending}
                    className="text-blue-600 border-blue-300 hover:bg-blue-50"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-xs text-blue-700">
            💡 Adding complementary skills can increase your match potential by up to 40%
          </p>
        </div>
      </CardContent>
    </Card>
  );
}