import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, CheckCircle2, Clock, Users, DollarSign, Send, Zap } from "lucide-react";
import { toast } from "sonner";
import TelegramManager from "./TelegramManager";

export default function AdminDashboard() {
  const [adminAccess, setAdminAccess] = useState(false);
  const [password, setPassword] = useState("");
  const [signalDialog, setSignalDialog] = useState(false);
  const [selectedLead, setSelectedLead] = useState<string | null>(null);
  const [signalText, setSignalText] = useState("");
  const [entryPrice, setEntryPrice] = useState("");
  const [exitPrice, setExitPrice] = useState("");
  const [stopLoss, setStopLoss] = useState("");
  const [takeProfit, setTakeProfit] = useState("");
  const [isSending, setIsSending] = useState(false);

  // Fetch data
  const leadsQuery = trpc.admin.getLeads.useQuery(undefined, { enabled: adminAccess });
  const statsQuery = trpc.admin.getLeadStats.useQuery(undefined, { enabled: adminAccess });
  const paymentsQuery = trpc.admin.getPayments.useQuery(undefined, { enabled: adminAccess });
  const revenueQuery = trpc.admin.getRevenueStats.useQuery(undefined, { enabled: adminAccess });
  const followupsQuery = trpc.admin.getPendingFollowups.useQuery(undefined, { enabled: adminAccess });

  // Mutations
  const sendSignalMutation = trpc.admin.sendSignal.useMutation({
    onSuccess: () => {
      toast.success("Signal sent successfully!");
      setSignalDialog(false);
      setSignalText("");
      setEntryPrice("");
      setExitPrice("");
      setStopLoss("");
      setTakeProfit("");
      setSelectedLead(null);
      setIsSending(false);
    },
    onError: (error) => {
      toast.error("Failed to send signal: " + error.message);
      setIsSending(false);
    },
  });

  const broadcastSignalMutation = trpc.admin.broadcastSignal.useMutation({
    onSuccess: (data) => {
      toast.success(`Signal sent to ${data.signalsSent} paid users!`);
      setSignalDialog(false);
      setSignalText("");
      setEntryPrice("");
      setExitPrice("");
      setStopLoss("");
      setTakeProfit("");
      setIsSending(false);
    },
    onError: (error) => {
      toast.error("Failed to broadcast signal: " + error.message);
      setIsSending(false);
    },
  });

  const confirmPaymentMutation = trpc.admin.confirmPayment.useMutation({
    onSuccess: () => {
      toast.success("Payment confirmed!");
      paymentsQuery.refetch();
      leadsQuery.refetch();
    },
    onError: (error) => {
      toast.error("Failed to confirm payment: " + error.message);
    },
  });

  const handleSendSignal = async () => {
    if (!signalText.trim()) {
      toast.error("Please enter a signal message");
      return;
    }

    setIsSending(true);

    if (selectedLead) {
      sendSignalMutation.mutate({
        telegramId: selectedLead,
        signalText,
        entryPrice: entryPrice || undefined,
        exitPrice: exitPrice || undefined,
        stopLoss: stopLoss || undefined,
        takeProfit: takeProfit || undefined,
      });
    }
  };

  const handleBroadcastSignal = async () => {
    if (!signalText.trim()) {
      toast.error("Please enter a signal message");
      return;
    }

    setIsSending(true);
    broadcastSignalMutation.mutate({
      signalText,
      entryPrice: entryPrice || undefined,
      exitPrice: exitPrice || undefined,
      stopLoss: stopLoss || undefined,
      takeProfit: takeProfit || undefined,
    });
  };

  if (!adminAccess) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Admin Access</CardTitle>
            <CardDescription>Enter password to access admin panel</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="password"
              placeholder="Enter admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter" && password === "admin123") {
                  setAdminAccess(true);
                }
              }}
              className="bg-slate-700 border-slate-600 text-white"
            />
            <Button
              onClick={() => {
                if (password === "admin123") {
                  setAdminAccess(true);
                } else {
                  toast.error("Incorrect password");
                }
              }}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Access Admin Panel
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const leads = leadsQuery.data || [];
  const stats = statsQuery.data;
  const payments = paymentsQuery.data || [];
  const revenue = revenueQuery.data;
  const followups = followupsQuery.data || [];
  const paidLeads = leads.filter(l => l.status === 'paid');

  return (
    <div className="min-h-screen bg-slate-900 p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
        <Button
          onClick={() => {
            setAdminAccess(false);
            setPassword("");
          }}
          variant="outline"
          className="border-slate-600 text-white hover:bg-slate-800"
        >
          Logout
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Leads</p>
                <p className="text-2xl font-bold text-white">{stats?.total || 0}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Paid Users</p>
                <p className="text-2xl font-bold text-green-400">{stats?.paid || 0}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Revenue</p>
                <p className="text-2xl font-bold text-yellow-400">${revenue?.confirmed || 0}</p>
              </div>
              <DollarSign className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Pending</p>
                <p className="text-2xl font-bold text-orange-400">${revenue?.pending || 0}</p>
              </div>
              <Clock className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="leads" className="w-full">
        <TabsList className="grid w-full grid-cols-5 bg-slate-800 border-slate-700">
          <TabsTrigger value="leads">Leads</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="signals">Send Signals</TabsTrigger>
          <TabsTrigger value="followups">Follow-ups</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
        </TabsList>

        {/* Leads Tab */}
        <TabsContent value="leads" className="space-y-4">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">All Leads ({leads.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-gray-300">
                  <thead className="border-b border-slate-700">
                    <tr>
                      <th className="text-left py-2 px-4">Name</th>
                      <th className="text-left py-2 px-4">Telegram ID</th>
                      <th className="text-left py-2 px-4">Status</th>
                      <th className="text-left py-2 px-4">Joined</th>
                      <th className="text-left py-2 px-4">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leads.map((lead) => (
                      <tr key={lead.id} className="border-b border-slate-700 hover:bg-slate-700/50">
                        <td className="py-2 px-4">{lead.firstName} {lead.lastName}</td>
                        <td className="py-2 px-4 font-mono text-xs">{lead.telegramId}</td>
                        <td className="py-2 px-4">
                          <Badge variant={lead.status === 'paid' ? 'default' : lead.status === 'lead' ? 'secondary' : 'destructive'}>
                            {lead.status}
                          </Badge>
                        </td>
                        <td className="py-2 px-4 text-xs">{new Date(lead.createdAt).toLocaleDateString()}</td>
                        <td className="py-2 px-4">
                          <Dialog open={signalDialog && selectedLead === lead.telegramId} onOpenChange={(open) => {
                            if (!open) {
                              setSignalDialog(false);
                              setSelectedLead(null);
                            }
                          }}>
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                onClick={() => {
                                  setSelectedLead(lead.telegramId);
                                  setSignalDialog(true);
                                }}
                                className="bg-blue-600 hover:bg-blue-700"
                              >
                                Send Signal
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-slate-800 border-slate-700">
                              <DialogHeader>
                                <DialogTitle className="text-white">Send Signal to {lead.firstName}</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <label className="text-sm text-gray-300">Signal Message *</label>
                                  <Textarea
                                    placeholder="Enter trading signal details..."
                                    value={signalText}
                                    onChange={(e) => setSignalText(e.target.value)}
                                    className="bg-slate-700 border-slate-600 text-white mt-1"
                                  />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="text-sm text-gray-300">Entry Price</label>
                                    <Input
                                      placeholder="e.g., 150.50"
                                      value={entryPrice}
                                      onChange={(e) => setEntryPrice(e.target.value)}
                                      className="bg-slate-700 border-slate-600 text-white mt-1"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-sm text-gray-300">Exit Price</label>
                                    <Input
                                      placeholder="e.g., 160.00"
                                      value={exitPrice}
                                      onChange={(e) => setExitPrice(e.target.value)}
                                      className="bg-slate-700 border-slate-600 text-white mt-1"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-sm text-gray-300">Stop Loss</label>
                                    <Input
                                      placeholder="e.g., 145.00"
                                      value={stopLoss}
                                      onChange={(e) => setStopLoss(e.target.value)}
                                      className="bg-slate-700 border-slate-600 text-white mt-1"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-sm text-gray-300">Take Profit</label>
                                    <Input
                                      placeholder="e.g., 170.00"
                                      value={takeProfit}
                                      onChange={(e) => setTakeProfit(e.target.value)}
                                      className="bg-slate-700 border-slate-600 text-white mt-1"
                                    />
                                  </div>
                                </div>
                                <Button
                                  onClick={handleSendSignal}
                                  disabled={isSending}
                                  className="w-full bg-green-600 hover:bg-green-700"
                                >
                                  {isSending ? "Sending..." : "Send Signal"}
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payments Tab */}
        <TabsContent value="payments" className="space-y-4">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Payment Records ({payments.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-gray-300">
                  <thead className="border-b border-slate-700">
                    <tr>
                      <th className="text-left py-2 px-4">Telegram ID</th>
                      <th className="text-left py-2 px-4">Plan</th>
                      <th className="text-left py-2 px-4">Amount</th>
                      <th className="text-left py-2 px-4">Method</th>
                      <th className="text-left py-2 px-4">Status</th>
                      <th className="text-left py-2 px-4">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((payment) => (
                      <tr key={payment.id} className="border-b border-slate-700 hover:bg-slate-700/50">
                        <td className="py-2 px-4 font-mono text-xs">{payment.telegramId}</td>
                        <td className="py-2 px-4 capitalize">{payment.plan.replace("_", " ")}</td>
                        <td className="py-2 px-4 font-bold">${payment.amount}</td>
                        <td className="py-2 px-4 capitalize">{payment.paymentMethod}</td>
                        <td className="py-2 px-4">
                          <Badge variant={payment.status === 'confirmed' ? 'default' : payment.status === 'pending' ? 'secondary' : 'destructive'}>
                            {payment.status}
                          </Badge>
                        </td>
                        <td className="py-2 px-4">
                          {payment.status === 'pending' && (
                            <Button
                              size="sm"
                              onClick={() => confirmPaymentMutation.mutate({ paymentId: payment.id })}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              Confirm
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Send Signals Tab */}
        <TabsContent value="signals" className="space-y-4">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Zap className="w-5 h-5" />
                Broadcast Trading Signal
              </CardTitle>
              <CardDescription>Send signal to all {paidLeads.length} paid users</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm text-gray-300">Signal Message *</label>
                <Textarea
                  placeholder="Enter trading signal details to send to all paid users..."
                  value={signalText}
                  onChange={(e) => setSignalText(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white mt-1 h-32"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-300">Entry Price</label>
                  <Input
                    placeholder="e.g., 150.50"
                    value={entryPrice}
                    onChange={(e) => setEntryPrice(e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-300">Exit Price</label>
                  <Input
                    placeholder="e.g., 160.00"
                    value={exitPrice}
                    onChange={(e) => setExitPrice(e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-300">Stop Loss</label>
                  <Input
                    placeholder="e.g., 145.00"
                    value={stopLoss}
                    onChange={(e) => setStopLoss(e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-300">Take Profit</label>
                  <Input
                    placeholder="e.g., 170.00"
                    value={takeProfit}
                    onChange={(e) => setTakeProfit(e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white mt-1"
                  />
                </div>
              </div>
              <Button
                onClick={handleBroadcastSignal}
                disabled={isSending || paidLeads.length === 0}
                className="w-full bg-purple-600 hover:bg-purple-700 h-12 text-lg flex items-center justify-center gap-2"
              >
                <Send className="w-5 h-5" />
                {isSending ? "Broadcasting..." : `Broadcast to ${paidLeads.length} Paid Users`}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Follow-ups Tab */}
        <TabsContent value="followups" className="space-y-4">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Pending Follow-ups ({followups.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-gray-300">
                  <thead className="border-b border-slate-700">
                    <tr>
                      <th className="text-left py-2 px-4">Telegram ID</th>
                      <th className="text-left py-2 px-4">Plan</th>
                      <th className="text-left py-2 px-4">Reason</th>
                      <th className="text-left py-2 px-4">Emails Sent</th>
                    </tr>
                  </thead>
                  <tbody>
                    {followups.slice(0, 10).map((followup) => (
                      <tr key={followup.id} className="border-b border-slate-700 hover:bg-slate-700/50">
                        <td className="py-2 px-4 font-mono text-xs">{followup.telegramId}</td>
                        <td className="py-2 px-4 capitalize">{followup.plan.replace("_", " ")}</td>
                        <td className="py-2 px-4 text-xs max-w-xs truncate">{followup.reason}</td>
                        <td className="py-2 px-4 font-bold text-blue-400">{followup.followupCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Email Manager Tab */}
        <TabsContent value="messages" className="space-y-4">
          <TelegramManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}
