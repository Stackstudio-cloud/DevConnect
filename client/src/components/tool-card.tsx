import { Badge } from "@/components/ui/badge";
import { ExternalLink, Star, DollarSign } from "lucide-react";

interface ToolCardProps {
  tool: any;
  onTap?: () => void;
}

export default function ToolCard({ tool, onTap }: ToolCardProps) {
  const getPricingColor = (pricing: string) => {
    switch (pricing) {
      case "free": return "bg-emerald-100 text-emerald-800";
      case "paid": return "bg-rose-100 text-rose-800";
      case "freemium": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPricingIcon = (pricing: string) => {
    if (pricing === "free") return null;
    return <DollarSign className="w-3 h-3" />;
  };

  return (
    <div 
      className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden cursor-pointer hover:shadow-2xl transition-shadow"
      onClick={onTap}
    >
      {/* Tool Icon/Image */}
      <div className="h-48 bg-gradient-to-br from-blue-600 to-blue-800 relative overflow-hidden flex items-center justify-center">
        {tool?.logoUrl ? (
          <img 
            src={tool.logoUrl} 
            alt={tool.name}
            className="w-20 h-20 object-contain"
          />
        ) : (
          <div className="text-white text-center">
            <div className="text-6xl mb-4">🛠️</div>
            <h3 className="text-2xl font-bold">{tool?.name}</h3>
          </div>
        )}
        <div className="absolute top-3 right-3 flex gap-2">
          <Badge className={getPricingColor(tool?.pricing || "free")}>
            {getPricingIcon(tool?.pricing)}
            {tool?.pricing?.charAt(0).toUpperCase() + tool?.pricing?.slice(1) || "Free"}
          </Badge>
          {tool?.platforms && (
            <Badge variant="secondary" className="bg-white/90 text-gray-800">
              {tool.platforms[0]}
            </Badge>
          )}
        </div>
      </div>

      {/* Tool Info */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xl font-bold text-gray-900">{tool?.name}</h3>
          <span className="text-sm text-gray-600 capitalize">{tool?.category}</span>
        </div>
        
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{tool?.description}</p>
        
        {/* Integration Tags */}
        <div className="flex flex-wrap gap-2 mb-3">
          {tool?.integrations?.slice(0, 4).map((integration: string) => (
            <Badge key={integration} variant="secondary" className="text-xs">
              {integration}
            </Badge>
          ))}
          {tool?.integrations?.length > 4 && (
            <Badge variant="secondary" className="text-xs">
              +{tool.integrations.length - 4} more
            </Badge>
          )}
        </div>

        {/* Compatibility/Features */}
        <div className="bg-gray-50 rounded-lg p-3 mb-3">
          <h4 className="text-sm font-semibold text-gray-900 mb-1">Key Features</h4>
          <div className="flex flex-wrap gap-1">
            {tool?.tags?.slice(0, 3).map((tag: string) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        {/* Popularity & Links */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center text-gray-500">
            <Star className="w-4 h-4 mr-1 text-yellow-500" />
            <span>Popularity: {tool?.popularity || 0}</span>
          </div>
          {tool?.websiteUrl && (
            <div className="flex items-center text-indigo-600">
              <ExternalLink className="w-4 h-4 mr-1" />
              <span className="font-medium">Visit Site</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
