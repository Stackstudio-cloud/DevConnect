import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Code, Users, Zap } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
      <div className="max-w-md mx-auto min-h-screen flex flex-col">
        {/* Header */}
        <header className="text-center pt-16 pb-8">
          <div className="flex items-center justify-center mb-4">
            <Heart className="w-8 h-8 text-emerald-400 mr-2" />
            <Code className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-2">DevMatch</h1>
          <p className="text-lg opacity-90">Find your perfect coding partner</p>
        </header>

        {/* Features */}
        <div className="flex-1 px-6 py-8">
          <div className="space-y-6">
            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardContent className="p-6 text-center">
                <Users className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Connect with Developers</h3>
                <p className="text-white/80">Swipe through profiles of passionate developers looking for collaboration</p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardContent className="p-6 text-center">
                <Zap className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Discover Tools</h3>
                <p className="text-white/80">Find development tools and applications that integrate with your tech stack</p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardContent className="p-6 text-center">
                <Heart className="w-12 h-12 text-rose-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Match & Collaborate</h3>
                <p className="text-white/80">When both parties are interested, start building amazing projects together</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA */}
        <div className="p-6">
          <Button 
            onClick={() => window.location.href = '/api/login'}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-4 text-lg font-semibold rounded-2xl shadow-lg"
          >
            Get Started
          </Button>
          <p className="text-center text-white/70 text-sm mt-4">
            Join thousands of developers finding their perfect match
          </p>
        </div>
      </div>
    </div>
  );
}
