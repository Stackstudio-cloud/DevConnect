import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Github, Star, GitFork, Calendar, ExternalLink, Sync, Check } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface GitHubIntegrationProps {
  onSkillsImported?: (skills: string[]) => void;
  onRepositoriesImported?: (repos: any[]) => void;
}

export default function GitHubIntegration({ 
  onSkillsImported, 
  onRepositoriesImported 
}: GitHubIntegrationProps) {
  const [githubUsername, setGithubUsername] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: githubData, isLoading: isLoadingGithub } = useQuery({
    queryKey: ["/api/github-profile", githubUsername],
    enabled: !!githubUsername && isConnected,
  });

  const connectMutation = useMutation({
    mutationFn: async (username: string) => {
      return apiRequest("/api/github/connect", {
        method: "POST",
        body: { username }
      });
    },
    onSuccess: (data) => {
      setIsConnected(true);
      queryClient.invalidateQueries({ queryKey: ["/api/github-profile"] });
      
      toast({
        title: "GitHub Connected!",
        description: `Successfully connected to ${githubUsername}`,
      });

      // Auto-import skills from repositories
      if (data.repositories) {
        const extractedSkills = extractSkillsFromRepos(data.repositories);
        onSkillsImported?.(extractedSkills);
        onRepositoriesImported?.(data.repositories.slice(0, 6)); // Top 6 repos
      }
    },
    onError: () => {
      toast({
        title: "Connection Failed",
        description: "Unable to connect to GitHub. Please check the username.",
        variant: "destructive",
      });
    }
  });

  const syncMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("/api/github/sync", { method: "POST" });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/github-profile"] });
      
      toast({
        title: "Sync Complete!",
        description: "Your GitHub data has been updated",
      });

      if (data.newSkills?.length > 0) {
        toast({
          title: "New Skills Detected!",
          description: `Found ${data.newSkills.length} new skills from your recent commits`,
        });
      }
    }
  });

  const extractSkillsFromRepos = (repositories: any[]) => {
    const skillMap: Record<string, string[]> = {
      "javascript": ["JavaScript", "Node.js"],
      "typescript": ["TypeScript"],
      "python": ["Python"],
      "java": ["Java"],
      "csharp": ["C#"],
      "cpp": ["C++"],
      "c": ["C"],
      "php": ["PHP"],
      "ruby": ["Ruby"],
      "go": ["Go"],
      "rust": ["Rust"],
      "swift": ["Swift"],
      "kotlin": ["Kotlin"],
      "dart": ["Dart", "Flutter"],
      "html": ["HTML"],
      "css": ["CSS"],
      "scss": ["Sass"],
      "vue": ["Vue.js"],
      "react": ["React"],
      "angular": ["Angular"],
      "svelte": ["Svelte"],
      "next": ["Next.js"],
      "nuxt": ["Nuxt.js"],
      "express": ["Express"],
      "fastapi": ["FastAPI"],
      "django": ["Django"],
      "flask": ["Flask"],
      "spring": ["Spring"],
      "docker": ["Docker"],
      "kubernetes": ["Kubernetes"],
      "terraform": ["Terraform"],
      "aws": ["AWS"],
      "gcp": ["Google Cloud"],
      "azure": ["Azure"]
    };

    const detectedSkills = new Set<string>();
    
    repositories.forEach(repo => {
      // Check primary language
      if (repo.language) {
        const lang = repo.language.toLowerCase();
        if (skillMap[lang]) {
          skillMap[lang].forEach(skill => detectedSkills.add(skill));
        } else {
          detectedSkills.add(repo.language);
        }
      }

      // Check repository name and description for framework mentions
      const text = `${repo.name} ${repo.description || ""}`.toLowerCase();
      Object.keys(skillMap).forEach(key => {
        if (text.includes(key)) {
          skillMap[key].forEach(skill => detectedSkills.add(skill));
        }
      });
    });

    return Array.from(detectedSkills);
  };

  const handleConnect = () => {
    if (githubUsername.trim()) {
      connectMutation.mutate(githubUsername.trim());
    }
  };

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Github className="w-5 h-5" />
          GitHub Integration
          {isConnected && (
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              <Check className="w-3 h-3 mr-1" />
              Connected
            </Badge>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {!isConnected ? (
          <div className="space-y-4">
            <div>
              <Label htmlFor="github-username">GitHub Username</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="github-username"
                  type="text"
                  placeholder="Enter your GitHub username"
                  value={githubUsername}
                  onChange={(e) => setGithubUsername(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleConnect()}
                />
                <Button 
                  onClick={handleConnect}
                  disabled={!githubUsername.trim() || connectMutation.isPending}
                  className="bg-gray-900 hover:bg-gray-800"
                >
                  {connectMutation.isPending ? "Connecting..." : "Connect"}
                </Button>
              </div>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">What we'll import:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Programming languages from your repositories</li>
                <li>• Frameworks and technologies you use</li>
                <li>• Your most starred and active repositories</li>
                <li>• Contribution activity and coding frequency</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Connected User Info */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center text-white font-bold">
                  {githubUsername[0]?.toUpperCase()}
                </div>
                <div>
                  <h4 className="font-semibold">@{githubUsername}</h4>
                  <p className="text-sm text-gray-600">
                    Connected • Last sync: {new Date().toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => syncMutation.mutate()}
                  disabled={syncMutation.isPending}
                >
                  <Sync className={`w-4 h-4 mr-1 ${syncMutation.isPending ? 'animate-spin' : ''}`} />
                  Sync
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(`https://github.com/${githubUsername}`, '_blank')}
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* GitHub Stats */}
            {githubData && (
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {githubData.public_repos || 0}
                  </div>
                  <div className="text-sm text-gray-600">Repositories</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {githubData.followers || 0}
                  </div>
                  <div className="text-sm text-gray-600">Followers</div>
                </div>
              </div>
            )}

            {/* Recent Repositories */}
            {githubData?.repositories && (
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Star className="w-4 h-4" />
                  Featured Repositories
                </h4>
                <div className="space-y-2">
                  {githubData.repositories.slice(0, 3).map((repo: any) => (
                    <div key={repo.id} className="p-3 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h5 className="font-medium text-blue-600">
                              {repo.name}
                            </h5>
                            {repo.language && (
                              <Badge variant="outline" className="text-xs">
                                {repo.language}
                              </Badge>
                            )}
                          </div>
                          {repo.description && (
                            <p className="text-sm text-gray-600 mt-1">
                              {repo.description}
                            </p>
                          )}
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Star className="w-3 h-3" />
                              {repo.stargazers_count}
                            </span>
                            <span className="flex items-center gap-1">
                              <GitFork className="w-3 h-3" />
                              {repo.forks_count}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(repo.updated_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}