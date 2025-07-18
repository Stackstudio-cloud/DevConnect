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
      className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden cursor-pointer hover:shadow-2xl transition-shadow"
      onClick={onTap}
    >
      {/* Profile Image */}
      <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 relative overflow-hidden">
        {profile?.user?.profileImageUrl ? (
          <img 
            src={profile.user.profileImageUrl} 
            alt="Profile"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white text-6xl font-bold">
            {displayName[0]?.toUpperCase()}
          </div>
        )}
        <div className="absolute top-3 right-3 flex gap-2">
          <Badge className="bg-emerald-500 text-white">
            {profile?.availability === "available" ? "Available" : 
             profile?.availability === "busy" ? "Busy" : "Not Seeking"}
          </Badge>
          {profile?.remote && (
            <Badge variant="secondary" className="bg-white/90 text-gray-800">
              Remote
            </Badge>
          )}
        </div>
      </div>

      {/* Profile Info */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xl font-bold text-gray-900">{displayName}</h3>
          <span className="text-lg text-gray-600">
            {profile?.experience === "junior" ? "Jr" :
             profile?.experience === "mid" ? "Mid" :
             profile?.experience === "senior" ? "Sr" : "Lead"}
          </span>
        </div>
        
        <p className="text-sm text-gray-600 mb-3">{profile?.title}</p>
        
        {/* Tech Stack */}
        <div className="flex flex-wrap gap-2 mb-3">
          {profile?.skills?.slice(0, 4).map((skill: string) => (
            <Badge key={skill} variant="secondary" className="text-xs">
              {skill}
            </Badge>
          ))}
          {profile?.skills?.length > 4 && (
            <Badge variant="secondary" className="text-xs">
              +{profile.skills.length - 4} more
            </Badge>
          )}
        </div>

        {/* Bio Preview */}
        {profile?.bio && (
          <div className="bg-gray-50 rounded-lg p-3 mb-3">
            <p className="text-sm text-gray-700 line-clamp-2">
              {profile.bio}
            </p>
          </div>
        )}

        {/* Collaboration Info */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center text-gray-500">
            {profile?.location && (
              <>
                <MapPin className="w-4 h-4 mr-1" />
                <span className="truncate">{profile.location}</span>
              </>
            )}
          </div>
          <div className="flex items-center">
            <Users className="w-4 h-4 mr-1 text-indigo-500" />
            <span className="font-medium text-indigo-600">
              {profile?.collaborationType === "quick" ? "Quick Projects" :
               profile?.collaborationType === "long_term" ? "Long-term" : "Both"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
