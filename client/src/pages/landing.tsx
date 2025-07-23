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
          <h1 className="text-4xl font-bold mb-2">DevConnect</h1>
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
        <div className="p-6 space-y-4">
          <Button 
            onClick={() => window.location.href = '/api/login'}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-4 text-lg font-semibold rounded-2xl shadow-lg"
          >
            Continue with Replit
          </Button>
          
          <div className="flex gap-3">
            <Button 
              onClick={() => {
                alert('GitHub OAuth requires app credentials. Contact support for setup instructions.');
              }}
              className="flex-1 bg-gray-800 hover:bg-gray-900 text-white py-3 text-sm font-semibold rounded-2xl shadow-lg flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd"/>
              </svg>
              GitHub
            </Button>
            
            <Button 
              onClick={() => {
                alert('X (Twitter) OAuth requires app credentials. Contact support for setup instructions.');
              }}
              className="flex-1 bg-black hover:bg-gray-900 text-white py-3 text-sm font-semibold rounded-2xl shadow-lg flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              X
            </Button>
          </div>
          
          <p className="text-center text-white/70 text-sm mt-4">
            Join thousands of developers finding their perfect match
          </p>
        </div>
      </div>
    </div>
  );
}
