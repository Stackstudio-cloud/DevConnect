import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Layers, Heart, MessageCircle, User } from "lucide-react";

interface BottomNavigationProps {
  currentTab?: string;
}

export default function BottomNavigation({ currentTab }: BottomNavigationProps) {
  const [, setLocation] = useLocation();

  const navItems = [
    { id: "discover", icon: Layers, label: "Discover", path: "/discover" },
    { id: "matches", icon: Heart, label: "Matches", path: "/matches" },
    { id: "chat", icon: MessageCircle, label: "Chat", path: "/matches" },
    { id: "profile", icon: User, label: "Profile", path: "/profile-setup" },
  ];

  return (
    <nav className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
      <div className="flex justify-around items-center">
        {navItems.map((item) => (
          <Button
            key={item.id}
            variant="ghost"
            size="sm"
            className={`flex flex-col items-center gap-1 transition-colors ${
              currentTab === item.id
                ? "text-indigo-600"
                : "text-gray-400 hover:text-gray-600"
            }`}
            onClick={() => setLocation(item.path)}
          >
            <item.icon className="w-5 h-5" />
            <span className="text-xs font-medium">{item.label}</span>
          </Button>
        ))}
      </div>
    </nav>
  );
}
