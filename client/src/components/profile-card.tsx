import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, Users } from "lucide-react";

interface ProfileCardProps {
  profile: any;
  onTap?: () => void;
}

export default function ProfileCard({ profile, onTap }: ProfileCardProps) {
  const displayName = profile?.user ? 
    `${profile.user.firstName || ""} ${profile.user.lastName || ""}`.trim() || "Anonymous" :
    "Anonymous";

  return (
    <div 
      className="bg-white rounded-3xl shadow-2xl border-2 border-gray-50 overflow-hidden cursor-pointer hover:shadow-[0_20px_60px_rgba(0,0,0,0.15)] transition-all duration-300 hover:scale-[1.02]"
      onClick={onTap}
    >
      {/* Profile Image - Larger and more prominent */}
      <div className="h-64 bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-700 relative overflow-hidden">
        {profile?.user?.profileImageUrl ? (
          <img 
            src={profile.user.profileImageUrl} 
            alt="Profile"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white text-7xl font-bold">
            {displayName[0]?.toUpperCase()}
          </div>
        )}
        
        {/* Gradient overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        
        {/* Status badges - more prominent */}
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <Badge className={`text-sm font-semibold shadow-lg ${
            profile?.availability === "available" ? "bg-emerald-500 text-white" : 
            profile?.availability === "busy" ? "bg-amber-500 text-white" : "bg-red-500 text-white"
          }`}>
            {profile?.availability === "available" ? "🟢 Available" : 
             profile?.availability === "busy" ? "🟡 Busy" : "🔴 Not Seeking"}
          </Badge>
          {profile?.remote && (
            <Badge variant="secondary" className="bg-white/95 text-gray-800 font-medium shadow-lg">
              🌍 Remote OK
            </Badge>
          )}
        </div>

        {/* Name and title overlay at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <div className="flex items-end justify-between">
            <div>
              <h3 className="text-2xl font-bold mb-1 drop-shadow-lg">{displayName}</h3>
              <p className="text-lg opacity-90 drop-shadow-lg">{profile?.title}</p>
            </div>
            <div className="text-right">
              <div className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
                <span className="text-lg font-bold">
                  {profile?.experience === "junior" ? "Jr Dev" :
                   profile?.experience === "mid" ? "Mid Level" :
                   profile?.experience === "senior" ? "Senior" : "Lead"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Info - Enhanced layout */}
      <div className="p-6">
        {/* Bio Preview - More prominent */}
        {profile?.bio && (
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 mb-4 border border-indigo-100">
            <p className="text-gray-700 line-clamp-3 leading-relaxed">
              {profile.bio}
            </p>
          </div>
        )}
        
        {/* Tech Stack - Larger and more colorful */}
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-2">Tech Stack</h4>
          <div className="flex flex-wrap gap-2">
            {profile?.skills?.slice(0, 5).map((skill: string, index: number) => (
              <Badge 
                key={skill} 
                className={`text-sm font-medium ${
                  index === 0 ? "bg-blue-100 text-blue-800" :
                  index === 1 ? "bg-green-100 text-green-800" :
                  index === 2 ? "bg-purple-100 text-purple-800" :
                  index === 3 ? "bg-orange-100 text-orange-800" :
                  "bg-pink-100 text-pink-800"
                }`}
              >
                {skill}
              </Badge>
            ))}
            {profile?.skills?.length > 5 && (
              <Badge variant="outline" className="text-sm font-medium border-dashed">
                +{profile.skills.length - 5} more
              </Badge>
            )}
          </div>
        </div>

        {/* Collaboration preferences - Enhanced */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <div className="text-2xl mb-1">
              {profile?.collaborationType === "quick" ? "⚡" :
               profile?.collaborationType === "long_term" ? "🎯" : "🔄"}
            </div>
            <p className="text-xs font-semibold text-gray-900">Collaboration</p>
            <p className="text-xs text-gray-600">
              {profile?.collaborationType === "quick" ? "Quick Projects" :
               profile?.collaborationType === "long_term" ? "Long-term" : "Both Types"}
            </p>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <div className="text-2xl mb-1">
              {profile?.location ? "📍" : "🌍"}
            </div>
            <p className="text-xs font-semibold text-gray-900">Location</p>
            <p className="text-xs text-gray-600 truncate">
              {profile?.location || "Remote"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
