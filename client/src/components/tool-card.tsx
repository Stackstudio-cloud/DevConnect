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
      className="bg-white rounded-3xl shadow-2xl border-2 border-gray-50 overflow-hidden cursor-pointer hover:shadow-[0_20px_60px_rgba(0,0,0,0.15)] transition-all duration-300 hover:scale-[1.02]"
      onClick={onTap}
    >
      {/* Tool Icon/Image - Larger and more prominent */}
      <div className="h-64 bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 relative overflow-hidden flex items-center justify-center">
        {tool?.logoUrl ? (
          <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8">
            <img 
              src={tool.logoUrl} 
              alt={tool.name}
              className="w-24 h-24 object-contain drop-shadow-lg"
            />
          </div>
        ) : (
          <div className="text-white text-center">
            <div className="text-8xl mb-4 drop-shadow-lg">🛠️</div>
            <h3 className="text-3xl font-bold drop-shadow-lg">{tool?.name}</h3>
          </div>
        )}
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
        
        {/* Pricing and Platform badges - more prominent */}
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <Badge className={`text-sm font-semibold shadow-lg ${getPricingColor(tool?.pricing || "free")}`}>
            {getPricingIcon(tool?.pricing)}
            {tool?.pricing?.charAt(0).toUpperCase() + tool?.pricing?.slice(1) || "Free"}
          </Badge>
          {tool?.platforms && (
            <Badge variant="secondary" className="bg-white/95 text-gray-800 font-medium shadow-lg">
              📱 {tool.platforms[0]}
            </Badge>
          )}
        </div>

        {/* Tool name and category overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <div className="flex items-end justify-between">
            <div>
              <h3 className="text-2xl font-bold mb-1 drop-shadow-lg">{tool?.name}</h3>
              <p className="text-lg opacity-90 drop-shadow-lg capitalize">{tool?.category}</p>
            </div>
            <div className="text-right">
              <div className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
                <span className="text-sm font-bold flex items-center">
                  <Star className="w-4 h-4 mr-1 text-yellow-300" />
                  {tool?.popularity || 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tool Info - Enhanced layout */}
      <div className="p-6">
        {/* Description - More prominent */}
        {tool?.description && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 mb-4 border border-blue-100">
            <p className="text-gray-700 line-clamp-3 leading-relaxed">
              {tool.description}
            </p>
          </div>
        )}
        
        {/* Integration Tags - Larger and more colorful */}
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-2">Integrations</h4>
          <div className="flex flex-wrap gap-2">
            {tool?.integrations?.slice(0, 5).map((integration: string, index: number) => (
              <Badge 
                key={integration} 
                className={`text-sm font-medium ${
                  index === 0 ? "bg-emerald-100 text-emerald-800" :
                  index === 1 ? "bg-blue-100 text-blue-800" :
                  index === 2 ? "bg-violet-100 text-violet-800" :
                  index === 3 ? "bg-rose-100 text-rose-800" :
                  "bg-amber-100 text-amber-800"
                }`}
              >
                {integration}
              </Badge>
            ))}
            {tool?.integrations?.length > 5 && (
              <Badge variant="outline" className="text-sm font-medium border-dashed">
                +{tool.integrations.length - 5} more
              </Badge>
            )}
          </div>
        </div>

        {/* Key Features and Details */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <div className="text-2xl mb-1">💰</div>
            <p className="text-xs font-semibold text-gray-900">Pricing</p>
            <p className="text-xs text-gray-600 capitalize">
              {tool?.pricing || "Free"}
            </p>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <div className="text-2xl mb-1">
              {tool?.websiteUrl ? "🔗" : "📦"}
            </div>
            <p className="text-xs font-semibold text-gray-900">
              {tool?.websiteUrl ? "Website" : "Package"}
            </p>
            <p className="text-xs text-gray-600">
              {tool?.websiteUrl ? "Available" : "Available"}
            </p>
          </div>
        </div>

        {/* Key Features section */}
        {tool?.tags && tool.tags.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-2">Features</h4>
            <div className="flex flex-wrap gap-1">
              {tool.tags.slice(0, 4).map((tag: string) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
