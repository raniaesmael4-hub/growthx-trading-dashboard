import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, Send, Zap } from "lucide-react";
import { toast } from "sonner";

export default function EmailManager() {
  const [selectedFollowupLevel, setSelectedFollowupLevel] = useState<"1" | "2" | "3">("1");
  const [isSending, setIsSending] = useState(false);

  // Fetch data
  const templatesQuery = trpc.email.getEmailTemplates.useQuery();
  const followupsQuery = trpc.admin.getPendingFollowups.useQuery();

  // Mutations
  const sendBulkEmailsMutation = trpc.email.sendBulkFollowupEmails.useMutation({
    onSuccess: (data) => {
      toast.success(`Sent ${data.sent} emails (${data.failed} failed)`);
      setIsSending(false);
    },
    onError: (error) => {
      toast.error("Failed to send emails: " + error.message);
      setIsSending(false);
    },
  });

  const handleSendBulkEmails = async () => {
    if (!selectedFollowupLevel) {
      toast.error("Please select a follow-up level");
      return;
    }

    setIsSending(true);
    sendBulkEmailsMutation.mutate({ followupLevel: selectedFollowupLevel });
  };

  const templates = templatesQuery.data;
  const followups = followupsQuery.data || [];
  const pendingCount = followups.filter(f => f.status === 'pending').length;

  return (
    <div className="space-y-6">
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Mail className="w-5 h-5" />
            Email Follow-up Manager
          </CardTitle>
          <CardDescription>Send automated follow-up emails to non-paying users</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-slate-700 rounded-lg">
              <p className="text-sm text-gray-400">Total Non-Paying Users</p>
              <p className="text-2xl font-bold text-white">{followups.length}</p>
            </div>
            <div className="p-4 bg-slate-700 rounded-lg">
              <p className="text-sm text-gray-400">Pending Follow-ups</p>
              <p className="text-2xl font-bold text-yellow-400">{pendingCount}</p>
            </div>
            <div className="p-4 bg-slate-700 rounded-lg">
              <p className="text-sm text-gray-400">Total Emails Sent</p>
              <p className="text-2xl font-bold text-green-400">
                {followups.reduce((sum, f) => sum + f.followupCount, 0)}
              </p>
            </div>
          </div>

          {/* Email Templates */}
          <div className="space-y-4">
            <h3 className="font-semibold text-white">Email Templates</h3>
            <div className="space-y-3">
              {templates && (
                <>
                  <div className="p-4 bg-slate-700 rounded-lg border border-slate-600 hover:border-blue-500 cursor-pointer transition" onClick={() => setSelectedFollowupLevel("1")}>
                    <div className="flex items-start justify-between">
                      <div>
                        <Badge variant={selectedFollowupLevel === "1" ? "default" : "secondary"} className="mb-2">
                          Follow-up 1 (Day 1)
                        </Badge>
                        <p className="font-semibold text-white">{templates.followup1.subject}</p>
                        <p className="text-sm text-gray-400 mt-1">{templates.followup1.preview}</p>
                      </div>
                      <input
                        type="radio"
                        name="template"
                        value="1"
                        checked={selectedFollowupLevel === "1"}
                        onChange={() => setSelectedFollowupLevel("1")}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div className="p-4 bg-slate-700 rounded-lg border border-slate-600 hover:border-orange-500 cursor-pointer transition" onClick={() => setSelectedFollowupLevel("2")}>
                    <div className="flex items-start justify-between">
                      <div>
                        <Badge variant={selectedFollowupLevel === "2" ? "default" : "secondary"} className="mb-2">
                          Follow-up 2 (Day 3)
                        </Badge>
                        <p className="font-semibold text-white">{templates.followup2.subject}</p>
                        <p className="text-sm text-gray-400 mt-1">{templates.followup2.preview}</p>
                      </div>
                      <input
                        type="radio"
                        name="template"
                        value="2"
                        checked={selectedFollowupLevel === "2"}
                        onChange={() => setSelectedFollowupLevel("2")}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div className="p-4 bg-slate-700 rounded-lg border border-slate-600 hover:border-green-500 cursor-pointer transition" onClick={() => setSelectedFollowupLevel("3")}>
                    <div className="flex items-start justify-between">
                      <div>
                        <Badge variant={selectedFollowupLevel === "3" ? "default" : "secondary"} className="mb-2">
                          Follow-up 3 (Day 7)
                        </Badge>
                        <p className="font-semibold text-white">{templates.followup3.subject}</p>
                        <p className="text-sm text-gray-400 mt-1">{templates.followup3.preview}</p>
                      </div>
                      <input
                        type="radio"
                        name="template"
                        value="3"
                        checked={selectedFollowupLevel === "3"}
                        onChange={() => setSelectedFollowupLevel("3")}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Send Button */}
          <div className="p-4 bg-blue-900/20 border border-blue-700 rounded-lg">
            <p className="text-sm text-blue-300 mb-3">
              ℹ️ This will send the selected email template to all non-paying users who haven't received this follow-up yet.
            </p>
            <Button
              onClick={handleSendBulkEmails}
              disabled={isSending || pendingCount === 0}
              className="w-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              {isSending ? "Sending..." : `Send Follow-up ${selectedFollowupLevel} to ${pendingCount} Users`}
            </Button>
          </div>

          {/* Pending Follow-ups List */}
          <div className="space-y-4">
            <h3 className="font-semibold text-white">Pending Follow-ups</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-gray-300">
                <thead className="border-b border-slate-700">
                  <tr>
                    <th className="text-left py-2 px-4">Telegram ID</th>
                    <th className="text-left py-2 px-4">Plan</th>
                    <th className="text-left py-2 px-4">Reason</th>
                    <th className="text-left py-2 px-4">Emails Sent</th>
                    <th className="text-left py-2 px-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {followups.slice(0, 10).map((followup) => (
                    <tr key={followup.id} className="border-b border-slate-700 hover:bg-slate-700/50">
                      <td className="py-2 px-4 font-mono text-xs">{followup.telegramId}</td>
                      <td className="py-2 px-4 capitalize">{followup.plan.replace("_", " ")}</td>
                      <td className="py-2 px-4 text-xs max-w-xs truncate">{followup.reason}</td>
                      <td className="py-2 px-4 font-bold text-blue-400">{followup.followupCount}</td>
                      <td className="py-2 px-4">
                        <Badge variant={followup.status === 'pending' ? 'secondary' : 'default'}>
                          {followup.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {followups.length > 10 && (
              <p className="text-sm text-gray-400 text-center">
                Showing 10 of {followups.length} pending follow-ups
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
