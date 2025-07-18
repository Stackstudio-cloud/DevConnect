import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { 
  TrendingUp, 
  Users, 
  Target, 
  Calendar, 
  Award, 
  Brain,
  Activity,
  DollarSign
} from "lucide-react";

interface AnalyticsData {
  userMetrics: {
    profileViews: number;
    matchSuccess: number;
    projectCompletions: number;
    skillGrowth: number;
  };
  collaborationMetrics: {
    totalMatches: number;
    activeProjects: number;
    teamFormations: number;
    successRate: number;
  };
  performanceData: {
    weeklyActivity: Array<{ week: string; matches: number; projects: number; messages: number }>;
    skillProgression: Array<{ skill: string; level: number; growth: number }>;
    projectSuccess: Array<{ month: string; completed: number; success_rate: number }>;
  };
  marketInsights: {
    demandTrends: Array<{ skill: string; demand: number; growth: string }>;
    salaryData: Array<{ experience: string; average: number; range: string }>;
    industryGrowth: Array<{ sector: string; growth: number; color: string }>;
  };
}

export default function AnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState("30d");
  const [selectedMetric, setSelectedMetric] = useState("overview");

  // Fetch analytics data
  const { data: analytics, isLoading } = useQuery<AnalyticsData>({
    queryKey: ["/api/analytics", timeRange],
  });

  // Mock comprehensive analytics data
  const mockAnalytics: AnalyticsData = {
    userMetrics: {
      profileViews: 1247,
      matchSuccess: 89,
      projectCompletions: 23,
      skillGrowth: 156
    },
    collaborationMetrics: {
      totalMatches: 67,
      activeProjects: 8,
      teamFormations: 12,
      successRate: 92
    },
    performanceData: {
      weeklyActivity: [
        { week: "Week 1", matches: 12, projects: 3, messages: 45 },
        { week: "Week 2", matches: 18, projects: 2, messages: 62 },
        { week: "Week 3", matches: 15, projects: 4, messages: 38 },
        { week: "Week 4", matches: 22, projects: 5, messages: 71 }
      ],
      skillProgression: [
        { skill: "React", level: 85, growth: 12 },
        { skill: "TypeScript", level: 78, growth: 18 },
        { skill: "Node.js", level: 72, growth: 8 },
        { skill: "Python", level: 65, growth: 25 },
        { skill: "AWS", level: 58, growth: 31 }
      ],
      projectSuccess: [
        { month: "Jan", completed: 4, success_rate: 88 },
        { month: "Feb", completed: 6, success_rate: 92 },
        { month: "Mar", completed: 5, success_rate: 85 },
        { month: "Apr", completed: 8, success_rate: 94 }
      ]
    },
    marketInsights: {
      demandTrends: [
        { skill: "AI/ML", demand: 95, growth: "+43%" },
        { skill: "Cloud Native", demand: 88, growth: "+31%" },
        { skill: "TypeScript", demand: 82, growth: "+24%" },
        { skill: "DevOps", demand: 79, growth: "+19%" },
        { skill: "React", demand: 76, growth: "+12%" }
      ],
      salaryData: [
        { experience: "Junior", average: 75000, range: "$60K-90K" },
        { experience: "Mid", average: 110000, range: "$95K-125K" },
        { experience: "Senior", average: 150000, range: "$135K-180K" },
        { experience: "Lead", average: 185000, range: "$170K-220K" }
      ],
      industryGrowth: [
        { sector: "AI/ML", growth: 45, color: "#8884d8" },
        { sector: "FinTech", growth: 32, color: "#82ca9d" },
        { sector: "HealthTech", growth: 28, color: "#ffc658" },
        { sector: "EdTech", growth: 25, color: "#ff7300" },
        { sector: "E-commerce", growth: 18, color: "#00ff88" }
      ]
    }
  };

  const data = analytics || mockAnalytics;

  const MetricCard = ({ icon, title, value, change, color }: any) => (
    <Card className="relative overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${color}`}>
              {icon}
            </div>
            <div>
              <p className="text-sm text-gray-600">{title}</p>
              <p className="text-2xl font-bold">{value}</p>
            </div>
          </div>
          {change && (
            <Badge variant={change.startsWith('+') ? 'default' : 'secondary'} className="text-xs">
              {change}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Analytics Dashboard
          </CardTitle>
          <div className="flex gap-4">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 3 months</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={selectedMetric} onValueChange={setSelectedMetric}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="overview">Overview</SelectItem>
                <SelectItem value="collaboration">Collaboration</SelectItem>
                <SelectItem value="skills">Skills & Growth</SelectItem>
                <SelectItem value="market">Market Insights</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          icon={<Users className="w-5 h-5 text-white" />}
          title="Profile Views"
          value={data.userMetrics.profileViews.toLocaleString()}
          change="+23%"
          color="bg-blue-500"
        />
        <MetricCard
          icon={<Target className="w-5 h-5 text-white" />}
          title="Match Success"
          value={`${data.userMetrics.matchSuccess}%`}
          change="+8%"
          color="bg-green-500"
        />
        <MetricCard
          icon={<Award className="w-5 h-5 text-white" />}
          title="Projects Completed"
          value={data.userMetrics.projectCompletions}
          change="+12%"
          color="bg-purple-500"
        />
        <MetricCard
          icon={<TrendingUp className="w-5 h-5 text-white" />}
          title="Skill Growth Points"
          value={data.userMetrics.skillGrowth}
          change="+31%"
          color="bg-orange-500"
        />
      </div>

      {/* Activity Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.performanceData.weeklyActivity}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="matches" stroke="#8884d8" strokeWidth={2} />
              <Line type="monotone" dataKey="projects" stroke="#82ca9d" strokeWidth={2} />
              <Line type="monotone" dataKey="messages" stroke="#ffc658" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Skill Progression */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5" />
              Skill Progression
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.performanceData.skillProgression.map(skill => (
                <div key={skill.skill} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{skill.skill}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        +{skill.growth}%
                      </Badge>
                      <span className="text-sm text-gray-600">{skill.level}%</span>
                    </div>
                  </div>
                  <Progress value={skill.level} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Market Demand */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Market Demand
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.marketInsights.demandTrends.map(trend => (
                <div key={trend.skill} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <span className="font-medium">{trend.skill}</span>
                    <div className="text-sm text-gray-600">Demand Level</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-600">{trend.growth}</div>
                    <Progress value={trend.demand} className="w-20 h-2 mt-1" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Project Success Rate */}
      <Card>
        <CardHeader>
          <CardTitle>Project Success Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data.performanceData.projectSuccess}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="completed" fill="#8884d8" />
              <Bar dataKey="success_rate" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Industry Growth Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Industry Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={data.marketInsights.industryGrowth}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="growth"
                  label={({ sector, growth }) => `${sector}: ${growth}%`}
                >
                  {data.marketInsights.industryGrowth.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Salary Benchmarks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.marketInsights.salaryData.map(salary => (
                <div key={salary.experience} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <span className="font-medium">{salary.experience}</span>
                    <div className="text-sm text-gray-600">{salary.range}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-600">
                      ${salary.average.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">Average</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-600" />
            AI Performance Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-white rounded-lg">
              <div className="text-2xl font-bold text-purple-600">89%</div>
              <div className="text-sm text-gray-600">Recommendation Accuracy</div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg">
              <div className="text-2xl font-bold text-blue-600">94%</div>
              <div className="text-sm text-gray-600">Match Prediction Success</div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg">
              <div className="text-2xl font-bold text-green-600">76%</div>
              <div className="text-sm text-gray-600">Project Success Prediction</div>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-purple-100 rounded-lg">
            <p className="text-sm text-purple-800">
              <strong>AI Recommendation:</strong> Based on your activity patterns and skill growth, 
              consider focusing on AI/ML projects this quarter. Market demand is up 43% and aligns 
              with your learning trajectory.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}