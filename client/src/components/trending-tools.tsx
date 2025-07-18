import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, Star, ArrowRight } from "lucide-react";
import type { ToolProfile } from "@shared/schema";

interface TrendingToolsProps {
  onToolClick: (tool: ToolProfile) => void;
}

export default function TrendingTools({ onToolClick }: TrendingToolsProps) {
  const { data: tools, isLoading } = useQuery<ToolProfile[]>({
    queryKey: ["/api/tool-profiles"],
    select: (data) => data?.slice(0, 6) || [], // Show top 6 trending tools
  });

  if (isLoading || !tools?.length) {
    return null;
  }

  return (
    <Card className="mx-4 mb-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          Trending Tools
          <Badge variant="secondary" className="ml-auto">
            Popular
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {tools.map((tool) => (
            <div
              key={tool.id}
              className="bg-white rounded-lg p-3 border border-blue-100 hover:border-blue-300 transition-colors cursor-pointer"
              onClick={() => onToolClick(tool)}
            >
              <div className="flex items-center gap-2 mb-2">
                {tool.logoUrl ? (
                  <img 
                    src={tool.logoUrl} 
                    alt={tool.name}
                    className="w-8 h-8 object-contain"
                  />
                ) : (
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded text-white flex items-center justify-center text-sm font-bold">
                    {tool.name[0]}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm text-gray-900 truncate">
                    {tool.name}
                  </h4>
                  <p className="text-xs text-gray-500 capitalize">
                    {tool.category}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 text-yellow-500" />
                  <span className="text-xs text-gray-600">
                    {tool.popularity}
                  </span>
                </div>
                <Badge 
                  variant="outline" 
                  className={`text-xs ${
                    tool.pricing === "free" ? "border-green-300 text-green-700" :
                    tool.pricing === "paid" ? "border-red-300 text-red-700" :
                    "border-blue-300 text-blue-700"
                  }`}
                >
                  {tool.pricing}
                </Badge>
              </div>
            </div>
          ))}
        </div>
        
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full mt-4 text-blue-600 border-blue-300 hover:bg-blue-50"
          onClick={() => {/* Navigate to full tools list */}}
        >
          Explore All Tools
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
}