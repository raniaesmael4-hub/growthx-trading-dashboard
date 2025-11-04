import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { trpc } from "../lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "./ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { CheckCircle, XCircle, Clock, DollarSign, Users } from "lucide-react";
import { useToast } from "../hooks/use-toast";

export function AdminPanel() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTier, setSelectedTier] = useState<Record<string, string>>({});
  const [selectedPlan, setSelectedPlan] = useState<Record<string, string>>({});

  // Fetch leads and stats
  const { data: leads = [], isLoading } = useQuery({
    queryKey: ["admin", "leads"],
    queryFn: () => trpc.admin.getLeads.query(),
  });

  const { data: payments = [] } = useQuery({
    queryKey: ["admin", "payments"],
    queryFn: () => trpc.admin.getPayments.query(),
  });

  const { data: stats } = useQuery({
    queryKey: ["admin", "leadStats"],
    queryFn: () => trpc.admin.getLeadStats.query(),
  });

  // Approve user mutation
  const approveUserMutation = useMutation({
    mutationFn: async ({ telegramId, tier, plan }: { 
      telegramId: string; 
      tier: string; 
      plan: string;
    }) => {
      return trpc.admin.approveUser.mutate({ telegramId, tier, plan });
    },
    onSuccess: (data, variables) => {
      if (data.success) {
        toast({
          title: "Success!",
          description: data.message || "User approved and subscription activated",
        });
        queryClient.invalidateQueries({ queryKey: ["admin", "leads"] });
        queryClient.invalidateQueries({ queryKey: ["admin", "payments"] });
        queryClient.invalidateQueries({ queryKey: ["admin", "leadStats"] });
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to approve user",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to approve user",
        variant: "destructive",
      });
    },
  });

  const handleApproveUser = (telegramId: string) => {
    const tier = selectedTier[telegramId];
    const plan = selectedPlan[telegramId];

    if (!tier || !plan) {
      toast({
        title: "Error",
        description: "Please select both tier and plan",
        variant: "destructive",
      });
      return;
    }

    approveUserMutation.mutate({ telegramId, tier, plan });
  };

  // Combine leads with their payments
  const leadsWithPayments = leads.map(lead => {
    const userPayments = payments.filter(p => p.telegramId === lead.telegramId);
    const pendingPayment = userPayments.find(p => p.status === "pending");
    const lastPayment = userPayments[0];
    
    return {
      ...lead,
      payments: userPayments,
      pendingPayment,
      lastPayment,
    };
  });

  // Filter for leads with pending payments
  const pendingApprovals = leadsWithPayments.filter(lead => lead.pendingPayment);

  if (isLoading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Panel</h1>
          <p className="text-muted-foreground">Manage users and subscriptions</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid Users</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.paid || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingApprovals.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${payments
                .filter(p => p.status === "confirmed")
                .reduce((sum, p) => sum + parseFloat(p.amount || "0"), 0)
                .toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Approvals */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Approvals</CardTitle>
          <CardDescription>
            Users waiting for subscription activation
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pendingApprovals.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No pending approvals
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Telegram ID</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Tier</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingApprovals.map((lead) => (
                  <TableRow key={lead.telegramId}>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {lead.firstName} {lead.lastName || ""}
                        </div>
                        {lead.username && (
                          <div className="text-sm text-muted-foreground">
                            @{lead.username}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="text-xs">{lead.telegramId}</code>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium">
                          ${lead.pendingPayment?.amount || "0"}
                        </div>
                        <div className="text-muted-foreground">
                          {lead.pendingPayment?.paymentMethod}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={selectedTier[lead.telegramId] || ""}
                        onValueChange={(value) =>
                          setSelectedTier({ ...selectedTier, [lead.telegramId]: value })
                        }
                      >
                        <SelectTrigger className="w-[120px]">
                          <SelectValue placeholder="Select tier" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="basic">Basic</SelectItem>
                          <SelectItem value="pro">Pro</SelectItem>
                          <SelectItem value="vip">VIP</SelectItem>
                          <SelectItem value="premium">Premium</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={selectedPlan[lead.telegramId] || ""}
                        onValueChange={(value) =>
                          setSelectedPlan({ ...selectedPlan, [lead.telegramId]: value })
                        }
                        disabled={selectedTier[lead.telegramId] === "premium"}
                      >
                        <SelectTrigger className="w-[120px]">
                          <SelectValue placeholder="Select plan" />
                        </SelectTrigger>
                        <SelectContent>
                          {selectedTier[lead.telegramId] === "premium" ? (
                            <SelectItem value="lifetime">Lifetime</SelectItem>
                          ) : (
                            <>
                              <SelectItem value="monthly">Monthly</SelectItem>
                              <SelectItem value="quarterly">Quarterly</SelectItem>
                              <SelectItem value="yearly">Yearly</SelectItem>
                            </>
                          )}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        onClick={() => handleApproveUser(lead.telegramId)}
                        disabled={approveUserMutation.isPending}
                      >
                        {approveUserMutation.isPending ? "Approving..." : "Approve"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* All Leads */}
      <Card>
        <CardHeader>
          <CardTitle>All Leads</CardTitle>
          <CardDescription>Complete list of all users</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Telegram ID</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payments</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leadsWithPayments.map((lead) => (
                <TableRow key={lead.telegramId}>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {lead.firstName} {lead.lastName || ""}
                      </div>
                      {lead.username && (
                        <div className="text-sm text-muted-foreground">
                          @{lead.username}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <code className="text-xs">{lead.telegramId}</code>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        lead.status === "paid"
                          ? "default"
                          : lead.status === "lead"
                          ? "secondary"
                          : "outline"
                      }
                    >
                      {lead.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {lead.payments.length > 0 ? (
                        <>
                          <div>{lead.payments.length} payment(s)</div>
                          <div className="text-muted-foreground">
                            Last: ${lead.lastPayment?.amount || "0"}
                          </div>
                        </>
                      ) : (
                        <span className="text-muted-foreground">No payments</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(lead.createdAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
