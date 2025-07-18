import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Users, 
  Plus, 
  Target, 
  Calendar, 
  MapPin, 
  Code, 
  Send,
  Crown,
  UserCheck,
  Clock
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface TeamProject {
  id: string;
  title: string;
  description: string;
  requiredSkills: string[];
  teamSize: number;
  currentMembers: TeamMember[];
  duration: string;
  timeCommitment: string;
  isRemote: boolean;
  status: "recruiting" | "in_progress" | "completed";
  deadline?: string;
  leaderId: string;
}

interface TeamMember {
  id: string;
  user: any;
  profile: any;
  role: "leader" | "member" | "pending";
  skills: string[];
  joinedAt: string;
}

interface TeamFormationProps {
  onTeamJoined?: (teamId: string) => void;
}

export default function TeamFormation({ onTeamJoined }: TeamFormationProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<TeamProject | null>(null);
  const [filterSkill, setFilterSkill] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch available teams
  const { data: teams, isLoading } = useQuery<TeamProject[]>({
    queryKey: ["/api/teams", filterSkill],
  });

  // Create team mutation
  const createTeamMutation = useMutation({
    mutationFn: async (teamData: Partial<TeamProject>) => {
      return apiRequest("/api/teams", {
        method: "POST",
        body: teamData
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/teams"] });
      setShowCreateForm(false);
      toast({
        title: "Team Created!",
        description: "Your team project is now live and recruiting members",
      });
    }
  });

  // Join team mutation
  const joinTeamMutation = useMutation({
    mutationFn: async (teamId: string) => {
      return apiRequest(`/api/teams/${teamId}/join`, {
        method: "POST"
      });
    },
    onSuccess: (_, teamId) => {
      queryClient.invalidateQueries({ queryKey: ["/api/teams"] });
      toast({
        title: "Join Request Sent!",
        description: "The team leader will review your application",
      });
      onTeamJoined?.(teamId);
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "recruiting":
        return "bg-green-100 text-green-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTeamProgress = (team: TeamProject) => {
    return (team.currentMembers.length / team.teamSize) * 100;
  };

  const CreateTeamForm = () => {
    const [formData, setFormData] = useState({
      title: "",
      description: "",
      requiredSkills: [] as string[],
      teamSize: 3,
      duration: "",
      timeCommitment: "",
      isRemote: true,
      deadline: ""
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      createTeamMutation.mutate(formData);
    };

    return (
      <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Team Project</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Project Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., AI-Powered Task Manager"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe your project, goals, and what you're looking for in team members..."
                rows={3}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="teamSize">Team Size</Label>
                <Select value={formData.teamSize.toString()} onValueChange={(value) => 
                  setFormData(prev => ({ ...prev, teamSize: parseInt(value) }))
                }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[2, 3, 4, 5, 6, 7, 8].map(size => (
                      <SelectItem key={size} value={size.toString()}>
                        {size} members
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="duration">Duration</Label>
                <Select value={formData.duration} onValueChange={(value) => 
                  setFormData(prev => ({ ...prev, duration: value }))
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-2 weeks">1-2 weeks</SelectItem>
                    <SelectItem value="1 month">1 month</SelectItem>
                    <SelectItem value="2-3 months">2-3 months</SelectItem>
                    <SelectItem value="6+ months">6+ months</SelectItem>
                    <SelectItem value="ongoing">Ongoing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="timeCommitment">Time Commitment</Label>
              <Select value={formData.timeCommitment} onValueChange={(value) => 
                setFormData(prev => ({ ...prev, timeCommitment: value }))
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Select time commitment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5-10 hours/week">5-10 hours/week</SelectItem>
                  <SelectItem value="10-20 hours/week">10-20 hours/week</SelectItem>
                  <SelectItem value="20+ hours/week">20+ hours/week</SelectItem>
                  <SelectItem value="flexible">Flexible</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Required Skills</Label>
              <Input
                placeholder="Enter skills separated by commas"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const input = e.target as HTMLInputElement;
                    const skills = input.value.split(',').map(s => s.trim()).filter(s => s);
                    setFormData(prev => ({ ...prev, requiredSkills: [...prev.requiredSkills, ...skills] }));
                    input.value = '';
                  }
                }}
              />
              <div className="flex flex-wrap gap-1 mt-2">
                {formData.requiredSkills.map((skill, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="cursor-pointer"
                    onClick={() => setFormData(prev => ({
                      ...prev,
                      requiredSkills: prev.requiredSkills.filter((_, i) => i !== index)
                    }))}
                  >
                    {skill} ×
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCreateForm(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createTeamMutation.isPending}
                className="flex-1"
              >
                {createTeamMutation.isPending ? "Creating..." : "Create Team"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <>
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Team Formation
            <Button
              size="sm"
              onClick={() => setShowCreateForm(true)}
              className="ml-auto"
            >
              <Plus className="w-4 h-4 mr-1" />
              Create Team
            </Button>
          </CardTitle>
        </CardHeader>

        <CardContent>
          {/* Filter */}
          <div className="mb-4">
            <Input
              placeholder="Filter by skill (e.g., React, Python)"
              value={filterSkill}
              onChange={(e) => setFilterSkill(e.target.value)}
            />
          </div>

          {/* Teams List */}
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse">
                  <div className="h-24 bg-gray-200 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : teams?.length ? (
            <div className="space-y-3">
              {teams.map(team => (
                <Card
                  key={team.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setSelectedTeam(team)}
                >
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg">{team.title}</h4>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {team.description}
                          </p>
                        </div>
                        <Badge className={getStatusColor(team.status)}>
                          {team.status}
                        </Badge>
                      </div>

                      {/* Progress */}
                      <div>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span>Team Progress</span>
                          <span>{team.currentMembers.length}/{team.teamSize} members</span>
                        </div>
                        <Progress value={getTeamProgress(team)} className="h-2" />
                      </div>

                      {/* Details */}
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {team.timeCommitment}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {team.duration}
                        </div>
                        {team.isRemote && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            Remote
                          </div>
                        )}
                      </div>

                      {/* Skills */}
                      <div className="flex flex-wrap gap-1">
                        {team.requiredSkills.slice(0, 4).map(skill => (
                          <Badge key={skill} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {team.requiredSkills.length > 4 && (
                          <Badge variant="outline" className="text-xs">
                            +{team.requiredSkills.length - 4} more
                          </Badge>
                        )}
                      </div>

                      {/* Team Members Preview */}
                      <div className="flex items-center gap-2">
                        <div className="flex -space-x-2">
                          {team.currentMembers.slice(0, 3).map(member => (
                            <Avatar key={member.id} className="w-6 h-6 border-2 border-white">
                              <AvatarImage src={member.user.profileImageUrl} />
                              <AvatarFallback className="text-xs">
                                {member.user.firstName?.[0]}
                              </AvatarFallback>
                            </Avatar>
                          ))}
                        </div>
                        {team.status === "recruiting" && (
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              joinTeamMutation.mutate(team.id);
                            }}
                            disabled={joinTeamMutation.isPending}
                            className="ml-auto"
                          >
                            <Send className="w-4 h-4 mr-1" />
                            Join
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No teams found</p>
              <p className="text-sm">Be the first to create a team project!</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Team Detail Modal */}
      <Dialog open={!!selectedTeam} onOpenChange={() => setSelectedTeam(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedTeam && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {selectedTeam.title}
                  <Badge className={getStatusColor(selectedTeam.status)}>
                    {selectedTeam.status}
                  </Badge>
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6">
                {/* Description */}
                <div>
                  <h4 className="font-semibold mb-2">Project Description</h4>
                  <p className="text-gray-600">{selectedTeam.description}</p>
                </div>

                {/* Project Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold">Project Details</h4>
                    <div className="text-sm space-y-1">
                      <div>Duration: {selectedTeam.duration}</div>
                      <div>Time: {selectedTeam.timeCommitment}</div>
                      <div>Remote: {selectedTeam.isRemote ? "Yes" : "No"}</div>
                      {selectedTeam.deadline && (
                        <div>Deadline: {new Date(selectedTeam.deadline).toLocaleDateString()}</div>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold">Team Progress</h4>
                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span>Members</span>
                        <span>{selectedTeam.currentMembers.length}/{selectedTeam.teamSize}</span>
                      </div>
                      <Progress value={getTeamProgress(selectedTeam)} />
                    </div>
                  </div>
                </div>

                {/* Required Skills */}
                <div>
                  <h4 className="font-semibold mb-2">Required Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedTeam.requiredSkills.map(skill => (
                      <Badge key={skill} variant="outline">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Team Members */}
                <div>
                  <h4 className="font-semibold mb-3">Team Members</h4>
                  <div className="space-y-3">
                    {selectedTeam.currentMembers.map(member => (
                      <div key={member.id} className="flex items-center gap-3 p-3 border rounded-lg">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={member.user.profileImageUrl} />
                          <AvatarFallback>
                            {member.user.firstName?.[0]}{member.user.lastName?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              {member.user.firstName} {member.user.lastName}
                            </span>
                            {member.role === "leader" && (
                              <Crown className="w-4 h-4 text-yellow-500" />
                            )}
                            {member.role === "pending" && (
                              <Badge variant="outline" className="text-xs">
                                Pending
                              </Badge>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {member.skills.slice(0, 3).map(skill => (
                              <Badge key={skill} variant="secondary" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                {selectedTeam.status === "recruiting" && (
                  <div className="flex gap-3">
                    <Button
                      onClick={() => joinTeamMutation.mutate(selectedTeam.id)}
                      disabled={joinTeamMutation.isPending}
                      className="flex-1"
                    >
                      <UserCheck className="w-4 h-4 mr-2" />
                      Request to Join
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <CreateTeamForm />
    </>
  );
}