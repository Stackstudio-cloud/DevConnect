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
            <div className="p-4">
              {/* Profile Header */}
              <div className="relative mb-6">
                <div className="w-full h-48 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl overflow-hidden">
                  {type === "developers" && profile?.user?.profileImageUrl ? (
                    <img 
                      src={profile.user.profileImageUrl} 
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : type === "tools" && profile?.logoUrl ? (
                    <div className="flex items-center justify-center h-full">
                      <img 
                        src={profile.logoUrl} 
                        alt={profile.name}
                        className="w-20 h-20 object-contain"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white text-6xl font-bold">
                      {displayName[0]?.toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="absolute bottom-4 left-4 text-white">
                  <h3 className="text-2xl font-bold">{displayName}</h3>
                  <p className="text-lg opacity-90">
                    {type === "developers" ? profile?.title : profile?.category}
                  </p>
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
