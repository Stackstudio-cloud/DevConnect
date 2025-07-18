import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Briefcase, 
  Plus, 
  DollarSign, 
  Clock, 
  MapPin, 
  Star,
  Send,
  Filter,
  Search
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface FreelanceJob {
  id: string;
  title: string;
  description: string;
  budget: {
    type: "fixed" | "hourly";
    amount: number;
    currency: "USD" | "EUR" | "GBP";
  };
  duration: string;
  skills: string[];
  experienceLevel: "beginner" | "intermediate" | "expert";
  isRemote: boolean;
  location?: string;
  postedBy: {
    id: string;
    name: string;
    profileImageUrl?: string;
    rating: number;
    jobsPosted: number;
  };
  applicants: number;
  status: "open" | "in_progress" | "completed" | "cancelled";
  postedAt: string;
  deadline?: string;
}

interface FreelanceBoardProps {
  onJobApplied?: (jobId: string) => void;
}

export default function FreelanceBoard({ onJobApplied }: FreelanceBoardProps) {
  const [showJobForm, setShowJobForm] = useState(false);
  const [selectedJob, setSelectedJob] = useState<FreelanceJob | null>(null);
  const [filters, setFilters] = useState({
    skills: "",
    budget: "",
    experienceLevel: "",
    isRemote: false,
    budgetType: ""
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch freelance jobs
  const { data: jobs, isLoading } = useQuery<FreelanceJob[]>({
    queryKey: ["/api/freelance-jobs", filters],
  });

  // Post job mutation
  const postJobMutation = useMutation({
    mutationFn: async (jobData: Partial<FreelanceJob>) => {
      return apiRequest("/api/freelance-jobs", {
        method: "POST",
        body: jobData
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/freelance-jobs"] });
      setShowJobForm(false);
      toast({
        title: "Job Posted!",
        description: "Your freelance job is now live and accepting applications",
      });
    }
  });

  // Apply to job mutation
  const applyJobMutation = useMutation({
    mutationFn: async (jobId: string) => {
      return apiRequest(`/api/freelance-jobs/${jobId}/apply`, {
        method: "POST"
      });
    },
    onSuccess: (_, jobId) => {
      queryClient.invalidateQueries({ queryKey: ["/api/freelance-jobs"] });
      toast({
        title: "Application Sent!",
        description: "Your application has been submitted to the client",
      });
      onJobApplied?.(jobId);
    }
  });

  const getBudgetDisplay = (budget: FreelanceJob["budget"]) => {
    const symbol = budget.currency === "USD" ? "$" : budget.currency === "EUR" ? "€" : "£";
    if (budget.type === "hourly") {
      return `${symbol}${budget.amount}/hr`;
    }
    return `${symbol}${budget.amount.toLocaleString()}`;
  };

  const getExperienceColor = (level: string) => {
    switch (level) {
      case "beginner":
        return "bg-green-100 text-green-800";
      case "intermediate":
        return "bg-yellow-100 text-yellow-800";
      case "expert":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return `${Math.floor(diffInHours / 24)}d ago`;
    }
  };

  const JobForm = () => {
    const [formData, setFormData] = useState({
      title: "",
      description: "",
      budgetType: "fixed" as "fixed" | "hourly",
      budgetAmount: 0,
      currency: "USD" as "USD" | "EUR" | "GBP",
      duration: "",
      skills: [] as string[],
      experienceLevel: "intermediate" as "beginner" | "intermediate" | "expert",
      isRemote: true,
      location: "",
      deadline: ""
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      postJobMutation.mutate({
        ...formData,
        budget: {
          type: formData.budgetType,
          amount: formData.budgetAmount,
          currency: formData.currency
        }
      });
    };

    return (
      <Dialog open={showJobForm} onOpenChange={setShowJobForm}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Post a Freelance Job</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Job Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Full-Stack Developer for E-commerce Site"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Job Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the project, requirements, and expectations..."
                rows={4}
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="budgetType">Budget Type</Label>
                <Select value={formData.budgetType} onValueChange={(value) => 
                  setFormData(prev => ({ ...prev, budgetType: value as "fixed" | "hourly" }))
                }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed">Fixed Price</SelectItem>
                    <SelectItem value="hourly">Hourly Rate</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="budgetAmount">
                  {formData.budgetType === "hourly" ? "Rate" : "Budget"}
                </Label>
                <Input
                  id="budgetAmount"
                  type="number"
                  value={formData.budgetAmount}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    budgetAmount: parseFloat(e.target.value) || 0 
                  }))}
                  placeholder="0"
                  required
                />
              </div>

              <div>
                <Label htmlFor="currency">Currency</Label>
                <Select value={formData.currency} onValueChange={(value) => 
                  setFormData(prev => ({ ...prev, currency: value as "USD" | "EUR" | "GBP" }))
                }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                    <SelectItem value="GBP">GBP (£)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="duration">Duration</Label>
                <Select value={formData.duration} onValueChange={(value) => 
                  setFormData(prev => ({ ...prev, duration: value }))
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1 week">1 week</SelectItem>
                    <SelectItem value="2-4 weeks">2-4 weeks</SelectItem>
                    <SelectItem value="1-3 months">1-3 months</SelectItem>
                    <SelectItem value="3-6 months">3-6 months</SelectItem>
                    <SelectItem value="6+ months">6+ months</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="experienceLevel">Experience Level</Label>
                <Select value={formData.experienceLevel} onValueChange={(value) => 
                  setFormData(prev => ({ ...prev, experienceLevel: value as any }))
                }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="expert">Expert</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
                    setFormData(prev => ({ ...prev, skills: [...prev.skills, ...skills] }));
                    input.value = '';
                  }
                }}
              />
              <div className="flex flex-wrap gap-1 mt-2">
                {formData.skills.map((skill, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="cursor-pointer"
                    onClick={() => setFormData(prev => ({
                      ...prev,
                      skills: prev.skills.filter((_, i) => i !== index)
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
                onClick={() => setShowJobForm(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={postJobMutation.isPending}
                className="flex-1"
              >
                {postJobMutation.isPending ? "Posting..." : "Post Job"}
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
            <Briefcase className="w-5 h-5" />
            Freelance Job Board
            <Button
              size="sm"
              onClick={() => setShowJobForm(true)}
              className="ml-auto"
            >
              <Plus className="w-4 h-4 mr-1" />
              Post Job
            </Button>
          </CardTitle>

          {/* Filters */}
          <div className="grid grid-cols-2 gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <Input
                placeholder="Search by skills..."
                value={filters.skills}
                onChange={(e) => setFilters(prev => ({ ...prev, skills: e.target.value }))}
                className="pl-10"
              />
            </div>
            <Select value={filters.experienceLevel} onValueChange={(value) => 
              setFilters(prev => ({ ...prev, experienceLevel: value }))
            }>
              <SelectTrigger>
                <SelectValue placeholder="Experience level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All levels</SelectItem>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="expert">Expert</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse">
                  <div className="h-32 bg-gray-200 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : jobs?.length ? (
            <div className="space-y-4">
              {jobs.map(job => (
                <Card
                  key={job.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setSelectedJob(job)}
                >
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg">{job.title}</h4>
                          <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                            {job.description}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-green-600 flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            {getBudgetDisplay(job.budget)}
                          </div>
                          <Badge className={getExperienceColor(job.experienceLevel)}>
                            {job.experienceLevel}
                          </Badge>
                        </div>
                      </div>

                      {/* Job Details */}
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {job.duration}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {job.isRemote ? "Remote" : job.location || "On-site"}
                        </div>
                        <div className="flex items-center gap-1">
                          <Send className="w-4 h-4" />
                          {job.applicants} applicants
                        </div>
                      </div>

                      {/* Skills */}
                      <div className="flex flex-wrap gap-1">
                        {job.skills.slice(0, 5).map(skill => (
                          <Badge key={skill} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {job.skills.length > 5 && (
                          <Badge variant="outline" className="text-xs">
                            +{job.skills.length - 5} more
                          </Badge>
                        )}
                      </div>

                      {/* Client Info & Actions */}
                      <div className="flex items-center justify-between pt-2 border-t">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={job.postedBy.profileImageUrl} />
                            <AvatarFallback className="text-xs">
                              {job.postedBy.name[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium text-sm">{job.postedBy.name}</div>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <div className="flex items-center gap-1">
                                <Star className="w-3 h-3 text-yellow-500" />
                                {job.postedBy.rating.toFixed(1)}
                              </div>
                              <span>•</span>
                              <span>{job.postedBy.jobsPosted} jobs posted</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-xs text-gray-500 mb-1">
                            {formatTimeAgo(job.postedAt)}
                          </div>
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              applyJobMutation.mutate(job.id);
                            }}
                            disabled={applyJobMutation.isPending}
                          >
                            Apply
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Briefcase className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">No jobs found</h3>
              <p className="text-gray-600 mb-4">Try adjusting your filters or check back later</p>
              <Button onClick={() => setShowJobForm(true)}>
                Post the First Job
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Job Detail Modal */}
      <Dialog open={!!selectedJob} onOpenChange={() => setSelectedJob(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedJob && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedJob.title}</DialogTitle>
              </DialogHeader>

              <div className="space-y-6">
                {/* Budget and Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold">Budget</h4>
                    <div className="text-2xl font-bold text-green-600">
                      {getBudgetDisplay(selectedJob.budget)}
                    </div>
                    <Badge className={getExperienceColor(selectedJob.experienceLevel)}>
                      {selectedJob.experienceLevel} level
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold">Project Details</h4>
                    <div className="text-sm space-y-1">
                      <div>Duration: {selectedJob.duration}</div>
                      <div>Location: {selectedJob.isRemote ? "Remote" : selectedJob.location}</div>
                      <div>Posted: {formatTimeAgo(selectedJob.postedAt)}</div>
                      <div>Applicants: {selectedJob.applicants}</div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h4 className="font-semibold mb-2">Job Description</h4>
                  <p className="text-gray-600 whitespace-pre-line">{selectedJob.description}</p>
                </div>

                {/* Required Skills */}
                <div>
                  <h4 className="font-semibold mb-2">Required Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedJob.skills.map(skill => (
                      <Badge key={skill} variant="outline">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Client Information */}
                <div>
                  <h4 className="font-semibold mb-3">About the Client</h4>
                  <div className="flex items-center gap-3 p-4 border rounded-lg">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={selectedJob.postedBy.profileImageUrl} />
                      <AvatarFallback>
                        {selectedJob.postedBy.name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h5 className="font-medium">{selectedJob.postedBy.name}</h5>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500" />
                          {selectedJob.postedBy.rating.toFixed(1)} rating
                        </div>
                        <span>{selectedJob.postedBy.jobsPosted} jobs posted</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    onClick={() => applyJobMutation.mutate(selectedJob.id)}
                    disabled={applyJobMutation.isPending}
                    className="flex-1"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Apply for this Job
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <JobForm />
    </>
  );
}