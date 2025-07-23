import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const profileSchema = z.object({
  title: z.string().min(1, "Title is required"),
  bio: z.string().min(10, "Bio must be at least 10 characters"),
  experience: z.string().min(1, "Experience level is required"),
  availability: z.string().min(1, "Availability is required"),
  remote: z.boolean(),
  location: z.string().optional(),
  collaborationType: z.string().min(1, "Collaboration type is required"),
  timezone: z.string().optional(),
});

type ProfileForm = z.infer<typeof profileSchema>;

const skillOptions = [
  "React", "Vue.js", "Angular", "JavaScript", "TypeScript", "Node.js", "Python", "Java",
  "C++", "C#", "Go", "Rust", "PHP", "Ruby", "Swift", "Kotlin", "Flutter", "React Native",
  "PostgreSQL", "MySQL", "MongoDB", "Redis", "Docker", "Kubernetes", "AWS", "Azure",
  "GCP", "GraphQL", "REST APIs", "Machine Learning", "AI", "Blockchain", "DevOps",
  "UI/UX Design", "Product Management", "Data Science", "Mobile Development", "Game Development"
];

const projectInterestOptions = [
  "Web Applications", "Mobile Apps", "Desktop Software", "Games", "AI/ML Projects",
  "Blockchain/Crypto", "IoT", "DevTools", "Open Source", "Startups", "Enterprise Software",
  "E-commerce", "Social Media", "Content Management", "Analytics", "Automation Tools"
];

export default function ProfileSetup() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  const form = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      remote: true,
      availability: "available",
      collaborationType: "both",
    },
  });

  const createProfileMutation = useMutation({
    mutationFn: async (data: ProfileForm & { skills: string[]; projectInterests: string[] }) => {
      const response = await apiRequest("POST", "/api/profile", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
      toast({
        title: "Profile created!",
        description: "Welcome to DevConnect. Let's find your coding partner!",
      });
      setLocation("/discover");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ProfileForm) => {
    createProfileMutation.mutate({
      ...data,
      skills: selectedSkills,
      projectInterests: selectedInterests,
    });
  };

  const addSkill = (skill: string) => {
    if (!selectedSkills.includes(skill)) {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const removeSkill = (skill: string) => {
    setSelectedSkills(selectedSkills.filter(s => s !== skill));
  };

  const addInterest = (interest: string) => {
    if (!selectedInterests.includes(interest)) {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const removeInterest = (interest: string) => {
    setSelectedInterests(selectedInterests.filter(i => i !== interest));
  };

  return (
    <div className="max-w-md mx-auto bg-white shadow-2xl min-h-screen overflow-y-auto">
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white">
        <h1 className="text-2xl font-bold text-center">Create Your Profile</h1>
        <p className="text-center opacity-90 mt-2">Let's set up your developer profile</p>
      </div>

      <div className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Professional Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Full-Stack Developer" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bio</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Tell us about yourself and what you're passionate about..."
                          rows={4}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="experience"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Experience Level</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select experience level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="junior">Junior (0-2 years)</SelectItem>
                          <SelectItem value="mid">Mid-level (2-5 years)</SelectItem>
                          <SelectItem value="senior">Senior (5+ years)</SelectItem>
                          <SelectItem value="lead">Lead/Principal</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Skills & Technologies</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Select onValueChange={addSkill}>
                    <SelectTrigger>
                      <SelectValue placeholder="Add skills..." />
                    </SelectTrigger>
                    <SelectContent>
                      {skillOptions.map((skill) => (
                        <SelectItem key={skill} value={skill}>
                          {skill}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <div className="flex flex-wrap gap-2">
                    {selectedSkills.map((skill) => (
                      <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                        {skill}
                        <X 
                          className="w-3 h-3 cursor-pointer" 
                          onClick={() => removeSkill(skill)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Collaboration Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="availability"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Availability</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="available">Available</SelectItem>
                          <SelectItem value="busy">Busy but open</SelectItem>
                          <SelectItem value="not_seeking">Not seeking</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="collaborationType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Looking for</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="quick">Quick projects</SelectItem>
                          <SelectItem value="long_term">Long-term partnerships</SelectItem>
                          <SelectItem value="both">Both</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="remote"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          Open to remote collaboration
                        </FormLabel>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., San Francisco, CA" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Project Interests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Select onValueChange={addInterest}>
                    <SelectTrigger>
                      <SelectValue placeholder="Add project interests..." />
                    </SelectTrigger>
                    <SelectContent>
                      {projectInterestOptions.map((interest) => (
                        <SelectItem key={interest} value={interest}>
                          {interest}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <div className="flex flex-wrap gap-2">
                    {selectedInterests.map((interest) => (
                      <Badge key={interest} variant="secondary" className="flex items-center gap-1">
                        {interest}
                        <X 
                          className="w-3 h-3 cursor-pointer" 
                          onClick={() => removeInterest(interest)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button 
              type="submit" 
              className="w-full bg-indigo-500 hover:bg-indigo-600 py-3"
              disabled={createProfileMutation.isPending}
            >
              {createProfileMutation.isPending ? "Creating Profile..." : "Create Profile"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
