import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useLocation } from "wouter";
import { Lock } from "lucide-react";

export default function AdminAccess() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [, setLocation] = useLocation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple password check - in production, this should be more secure
    const adminPassword = "admin123"; // Change this to your actual password
    
    if (password === adminPassword) {
      // Store in localStorage to remember login
      localStorage.setItem("adminAccess", "true");
      setLocation("/admin");
    } else {
      setError("Invalid password");
      setPassword("");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-slate-800 border-slate-700">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-amber-600/20 rounded-full">
              <Lock className="w-8 h-8 text-amber-400" />
            </div>
          </div>
          <CardTitle className="text-2xl text-white">Admin Access</CardTitle>
          <CardDescription>Enter your admin password to access the dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                type="password"
                placeholder="Enter admin password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                className="bg-slate-700 border-slate-600 text-white placeholder-gray-400"
              />
            </div>
            
            {error && (
              <div className="p-3 bg-red-900/20 border border-red-700 rounded text-sm text-red-300">
                {error}
              </div>
            )}
            
            <Button
              type="submit"
              className="w-full bg-amber-600 hover:bg-amber-700"
            >
              Access Admin Panel
            </Button>
          </form>

          <div className="mt-6 p-4 bg-slate-700/50 rounded text-sm text-gray-300">
            <p className="font-semibold mb-2">📝 Default Password:</p>
            <p className="font-mono bg-slate-800 p-2 rounded">admin123</p>
            <p className="text-xs text-gray-400 mt-2">Change this in production!</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
