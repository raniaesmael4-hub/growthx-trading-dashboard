import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Send } from "lucide-react";
import { toast } from "sonner";

export default function TelegramManager() {
  const [selectedLevel, setSelectedLevel] = useState<1 | 2 | 3>(1);
  const [isSending, setIsSending] = useState(false);

  const followupsQuery = trpc.admin.getPendingFollowups.useQuery();
  const sendFollowupMutation = trpc.telegram.sendFollowupMessage.useMutation({
    onSuccess: () => {
      toast.success("Message sent successfully!");
      setIsSending(false);
    },
    onError: (error: any) => {
      toast.error("Failed to send message: " + error.message);
      setIsSending(false);
    },
  });

  const sendBulkMutation = trpc.telegram.sendBulkFollowupMessages.useMutation({
    onSuccess: (data: any) => {
      toast.success(`Sent ${data.sent} messages! (${data.failed} failed)`);
      setIsSending(false);
    },
    onError: (error: any) => {
      toast.error("Failed to send bulk messages: " + error.message);
      setIsSending(false);
    },
  });

  const followups = followupsQuery.data || [];

  const followupMessages = {
    1: {
      title: "Don't Miss Out! 🎯",
      preview: "First follow-up - Remind about 73.64% win rate",
      description: "Hey! We noticed you're interested in our trading signals. Join our paid members and start receiving exclusive trading signals!",
    },
    2: {
      title: "Limited Time Offer! 🎁",
      preview: "Second follow-up - 50% OFF annual plans",
      description: "We're offering 50% OFF on annual plans this week only! Instead of $500/year, get VIP Unlimited for just $250!",
    },
    3: {
      title: "See What Others Are Making 💰",
      preview: "Third follow-up - Social proof & testimonials",
      description: "Join hundreds of successful traders. Money-back guarantee: If you're not satisfied after 30 days, we'll refund you 100%",
    },
  };

  const handleSendBulk = () => {
    if (followups.length === 0) {
      toast.error("No pending follow-ups to send");
      return;
    }

    setIsSending(true);
    sendBulkMutation.mutate({
      followupLevel: selectedLevel.toString() as any,
    });
  };

  return (
    <div className="space-y-4">
      {/* Follow-up Level Selection */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <MessageCircle className="w-5 h-5" />
            Send Telegram Follow-up Messages
          </CardTitle>
          <CardDescription>Send follow-up messages to non-paying users</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3].map((level) => (
              <button
                key={level}
                onClick={() => setSelectedLevel(level as 1 | 2 | 3)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedLevel === level
                    ? "border-blue-500 bg-blue-500/10"
                    : "border-slate-600 bg-slate-700/50 hover:border-slate-500"
                }`}
              >
                <div className="text-left">
                  <p className="font-bold text-white text-sm">{followupMessages[level as 1 | 2 | 3].title}</p>
                  <p className="text-xs text-gray-400 mt-1">{followupMessages[level as 1 | 2 | 3].preview}</p>
                </div>
              </button>
            ))}
          </div>

          {/* Message Preview */}
          <div className="bg-slate-700 p-4 rounded-lg border border-slate-600">
            <p className="text-sm text-gray-300 mb-2">
              <span className="font-bold text-white">Message Preview:</span>
            </p>
            <p className="text-sm text-gray-300 whitespace-pre-wrap">
              {followupMessages[selectedLevel].description}
            </p>
          </div>

          {/* Send Button */}
          <Button
            onClick={handleSendBulk}
            disabled={isSending || followups.length === 0}
            className="w-full bg-green-600 hover:bg-green-700 h-12 text-lg flex items-center justify-center gap-2"
          >
            <Send className="w-5 h-5" />
            {isSending ? "Sending..." : `Send to ${followups.length} Users`}
          </Button>
        </CardContent>
      </Card>

      {/* Pending Follow-ups List */}
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
                  <th className="text-left py-2 px-4">Messages Sent</th>
                </tr>
              </thead>
              <tbody>
                {followups.slice(0, 10).map((followup) => (
                  <tr key={followup.id} className="border-b border-slate-700 hover:bg-slate-700/50">
                    <td className="py-2 px-4 font-mono text-xs">{followup.telegramId}</td>
                    <td className="py-2 px-4 capitalize">{followup.plan.replace("_", " ")}</td>
                    <td className="py-2 px-4 text-xs max-w-xs truncate">{followup.reason}</td>
                    <td className="py-2 px-4">
                      <Badge variant="secondary">{followup.followupCount}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {followups.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                No pending follow-ups. All users have either paid or been marked inactive.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

