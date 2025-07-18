import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Share, MapPin, Clock, Users, X, Heart } from "lucide-react";

interface ProfileDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: any;
  type: "developers" | "tools";
  onSwipe: (action: "like" | "pass") => void;
}

export default function ProfileDetailModal({ 
  isOpen, 
  onClose, 
  profile, 
  type,
  onSwipe 
}: ProfileDetailModalProps) {
  if (!profile) return null;

  const displayName = type === "developers" && profile?.user ? 
    `${profile.user.firstName || ""} ${profile.user.lastName || ""}`.trim() || "Anonymous" :
    type === "tools" ? profile.name : "Anonymous";

  const handleSwipe = (action: "like" | "pass") => {
    onSwipe(action);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md h-full p-0 gap-0">
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4 text-white">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-white hover:bg-white/20"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h2 className="text-lg font-semibold">Profile Details</h2>
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20"
              >
                <Share className="w-5 h-5" />
              </Button>
            </div>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-6">
              {/* Profile Header - Larger and more impactful */}
              <div className="relative mb-8">
                <div className="w-full h-72 bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-700 rounded-2xl overflow-hidden shadow-2xl">
                  {type === "developers" && profile?.user?.profileImageUrl ? (
                    <img 
                      src={profile.user.profileImageUrl} 
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : type === "tools" && profile?.logoUrl ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8">
                        <img 
                          src={profile.logoUrl} 
                          alt={profile.name}
                          className="w-32 h-32 object-contain drop-shadow-lg"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white text-8xl font-bold">
                      {displayName[0]?.toUpperCase()}
                    </div>
                  )}
                  
                  {/* Enhanced gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  
                  {/* Status badges for developers */}
                  {type === "developers" && (
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
                  )}
                  
                  {/* Tool badges */}
                  {type === "tools" && (
                    <div className="absolute top-4 right-4 flex flex-col gap-2">
                      <Badge className={`text-sm font-semibold shadow-lg ${
                        profile?.pricing === "free" ? "bg-emerald-500 text-white" : 
                        profile?.pricing === "paid" ? "bg-red-500 text-white" : "bg-blue-500 text-white"
                      }`}>
                        {profile?.pricing?.charAt(0).toUpperCase() + profile?.pricing?.slice(1) || "Free"}
                      </Badge>
                      {profile?.platforms && (
                        <Badge variant="secondary" className="bg-white/95 text-gray-800 font-medium shadow-lg">
                          📱 {profile.platforms[0]}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Enhanced profile info overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <div className="flex items-end justify-between">
                    <div>
                      <h3 className="text-3xl font-bold mb-2 drop-shadow-lg">{displayName}</h3>
                      <p className="text-xl opacity-90 drop-shadow-lg">
                        {type === "developers" ? profile?.title : profile?.category}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                        <span className="text-lg font-bold">
                          {type === "developers" ? (
                            profile?.experience === "junior" ? "Jr Dev" :
                            profile?.experience === "mid" ? "Mid Level" :
                            profile?.experience === "senior" ? "Senior" : "Lead"
                          ) : (
                            <div className="flex items-center">
                              <Star className="w-4 h-4 mr-1 text-yellow-300" />
                              {profile?.popularity || 0}
                            </div>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {type === "developers" ? (
                <>
                  {/* About */}
                  {profile?.bio && (
                    <section className="mb-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">About</h4>
                      <p className="text-gray-700 leading-relaxed">{profile.bio}</p>
                    </section>
                  )}

                  {/* Skills */}
                  {profile?.skills && profile.skills.length > 0 && (
                    <section className="mb-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">Tech Stack</h4>
                      <div className="flex flex-wrap gap-2">
                        {profile.skills.map((skill: string) => (
                          <Badge key={skill} variant="secondary">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Project Interests */}
                  {profile?.projectInterests && profile.projectInterests.length > 0 && (
                    <section className="mb-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">Project Interests</h4>
                      <div className="flex flex-wrap gap-2">
                        {profile.projectInterests.map((interest: string) => (
                          <Badge key={interest} variant="outline">
                            {interest}
                          </Badge>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Preferences */}
                  <section className="mb-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Collaboration Preferences</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-2xl mb-1">
                          {profile?.availability === "available" ? "🟢" : 
                           profile?.availability === "busy" ? "🟡" : "🔴"}
                        </div>
                        <p className="text-sm font-medium text-gray-900">Availability</p>
                        <p className="text-xs text-gray-600 capitalize">
                          {profile?.availability?.replace("_", " ")}
                        </p>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl mb-1">
                          {profile?.remote ? "🌍" : "🏢"}
                        </div>
                        <p className="text-sm font-medium text-gray-900">Location</p>
                        <p className="text-xs text-gray-600">
                          {profile?.remote ? "Remote OK" : "In-person"}
                        </p>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl mb-1">⚡</div>
                        <p className="text-sm font-medium text-gray-900">Commitment</p>
                        <p className="text-xs text-gray-600 capitalize">
                          {profile?.collaborationType?.replace("_", " ")}
                        </p>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl mb-1">⭐</div>
                        <p className="text-sm font-medium text-gray-900">Experience</p>
                        <p className="text-xs text-gray-600 capitalize">
                          {profile?.experience}
                        </p>
                      </div>
                    </div>
                  </section>
                </>
              ) : (
                <>
                  {/* Tool Description */}
                  {profile?.description && (
                    <section className="mb-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">Description</h4>
                      <p className="text-gray-700 leading-relaxed">{profile.description}</p>
                    </section>
                  )}

                  {/* Integrations */}
                  {profile?.integrations && profile.integrations.length > 0 && (
                    <section className="mb-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">Integrations</h4>
                      <div className="flex flex-wrap gap-2">
                        {profile.integrations.map((integration: string) => (
                          <Badge key={integration} variant="secondary">
                            {integration}
                          </Badge>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Platforms */}
                  {profile?.platforms && profile.platforms.length > 0 && (
                    <section className="mb-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">Platforms</h4>
                      <div className="flex flex-wrap gap-2">
                        {profile.platforms.map((platform: string) => (
                          <Badge key={platform} variant="outline">
                            {platform}
                          </Badge>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Tool Info */}
                  <section className="mb-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Tool Information</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-2xl mb-1">💰</div>
                        <p className="text-sm font-medium text-gray-900">Pricing</p>
                        <p className="text-xs text-gray-600 capitalize">
                          {profile?.pricing || "Free"}
                        </p>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl mb-1">⭐</div>
                        <p className="text-sm font-medium text-gray-900">Popularity</p>
                        <p className="text-xs text-gray-600">
                          {profile?.popularity || 0}
                        </p>
                      </div>
                    </div>
                  </section>
                </>
              )}
            </div>
          </ScrollArea>

          {/* Action Buttons */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => handleSwipe("pass")}
              >
                <X className="w-4 h-4 mr-2" />
                Pass
              </Button>
              <Button 
                className="flex-1 bg-emerald-500 hover:bg-emerald-600"
                onClick={() => handleSwipe("like")}
              >
                <Heart className="w-4 h-4 mr-2" />
                Like
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
