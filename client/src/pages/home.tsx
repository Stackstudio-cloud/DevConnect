import { useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import NavigationHeader from "@/components/navigation-header";
import BottomNavigation from "@/components/bottom-navigation";

export default function Home() {
  const [, setLocation] = useLocation();

  const { data: profile } = useQuery({
    queryKey: ["/api/profile"],
  });

  useEffect(() => {
    // If user doesn't have a profile, redirect to setup
    if (profile === null) {
      setLocation("/profile-setup");
    } else if (profile) {
      // If user has a profile, redirect to discover
      setLocation("/discover");
    }
  }, [profile, setLocation]);

  return (
    <div className="max-w-md mx-auto bg-white shadow-2xl min-h-screen relative overflow-hidden">
      <NavigationHeader />
      
      <div className="flex items-center justify-center h-96 p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>

      <BottomNavigation currentTab="discover" />
    </div>
  );
}
