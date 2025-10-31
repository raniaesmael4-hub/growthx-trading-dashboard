import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";
import { BarChart3, Users, TrendingUp, Lock } from "lucide-react";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-800/50 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Growthx Trading Signals</h1>
            <p className="text-gray-400 mt-1">Professional Trading Bot & Management System</p>
          </div>
          {isAuthenticated && (
            <div className="text-right">
              <p className="text-sm text-gray-400">Logged in as: <span className="font-semibold">{user?.name}</span></p>
              <p className="text-xs text-gray-500 mt-1">Role: {user?.role === 'admin' ? '👑 Admin' : 'User'}</p>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Trading Dashboard Card */}
          <Card className="bg-slate-800 border-slate-700 hover:border-blue-500 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-400" />
                Trading Dashboard
              </CardTitle>
              <CardDescription>View backtesting metrics and live trades</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-300">
                Access real-time trading data, performance metrics, and profit calculations.
              </p>
              <Button 
                onClick={() => setLocation("/dashboard")}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Open Dashboard
              </Button>
            </CardContent>
          </Card>

          {/* Admin Panel Card - Only visible to admins */}
          {user?.role === 'admin' && (
            <Card className="bg-slate-800 border-slate-700 hover:border-amber-500 transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-5 h-5 text-amber-400" />
                  Admin Panel
                </CardTitle>
                <CardDescription>Manage leads, payments, and signals</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-300">
                  Manage all leads, track payments, send trading signals, and handle follow-ups.
                </p>
                <Button 
                  onClick={() => setLocation("/admin")}
                  className="w-full bg-amber-600 hover:bg-amber-700"
                >
                  Access Admin Panel
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Info Section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-slate-800 rounded-lg border border-slate-700">
            <div className="flex items-center gap-3 mb-3">
              <BarChart3 className="w-6 h-6 text-blue-400" />
              <h3 className="font-semibold">73.64% Win Rate</h3>
            </div>
            <p className="text-sm text-gray-400">Proven backtesting results with consistent performance</p>
          </div>

          <div className="p-6 bg-slate-800 rounded-lg border border-slate-700">
            <div className="flex items-center gap-3 mb-3">
              <Users className="w-6 h-6 text-green-400" />
              <h3 className="font-semibold">Lead Management</h3>
            </div>
            <p className="text-sm text-gray-400">Track all users, payments, and engagement metrics</p>
          </div>

          <div className="p-6 bg-slate-800 rounded-lg border border-slate-700">
            <div className="flex items-center gap-3 mb-3">
              <TrendingUp className="w-6 h-6 text-amber-400" />
              <h3 className="font-semibold">Signal Delivery</h3>
            </div>
            <p className="text-sm text-gray-400">Send trading signals to all paid subscribers instantly</p>
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-12 p-6 bg-slate-800 rounded-lg border border-slate-700">
          <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a href="/dashboard" className="p-3 bg-slate-700 hover:bg-slate-600 rounded transition text-sm">
              📊 Trading Dashboard
            </a>
            {user?.role === 'admin' && (
              <a href="/admin" className="p-3 bg-slate-700 hover:bg-slate-600 rounded transition text-sm">
                🔐 Admin Panel
              </a>
            )}
            <a href="https://t.me/Growthx_Signals_Bot" target="_blank" rel="noopener noreferrer" className="p-3 bg-slate-700 hover:bg-slate-600 rounded transition text-sm">
              💬 Telegram Bot
            </a>
            <a href="mailto:raniaesmael4@gmail.com" className="p-3 bg-slate-700 hover:bg-slate-600 rounded transition text-sm">
              📧 Support Email
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
