import { useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown } from "lucide-react";

export default function LiveTrades() {
  const { data: trades, isLoading, refetch } = trpc.trading.getAllTrades.useQuery();

  // Refetch trades every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 5000);

    return () => clearInterval(interval);
  }, [refetch]);

  if (isLoading) {
    return (
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="pt-6">
          <p className="text-slate-400">Loading live trades...</p>
        </CardContent>
      </Card>
    );
  }

  const openTrades = trades?.filter((t) => t.status === "OPEN") || [];
  const closedTrades = trades?.filter((t) => t.status === "CLOSED") || [];

  // Sort by newest first
  const sortedOpenTrades = [...openTrades].sort(
    (a, b) => new Date(b.entryTime).getTime() - new Date(a.entryTime).getTime()
  );

  const sortedClosedTrades = [...closedTrades].sort(
    (a, b) => new Date(b.exitTime || 0).getTime() - new Date(a.exitTime || 0).getTime()
  );

  return (
    <div className="space-y-6">
      {/* Open Trades Section */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">
          Open Trades ({openTrades.length})
        </h3>

        {sortedOpenTrades.length === 0 ? (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="pt-6">
              <p className="text-slate-400 text-center">No open trades at the moment</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {sortedOpenTrades.map((trade) => (
              <Card
                key={trade.id}
                className="bg-slate-800/50 border-slate-700 hover:border-yellow-500/50 transition-colors"
              >
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {trade.type === "LONG" ? (
                        <TrendingUp className="w-6 h-6 text-green-400" />
                      ) : (
                        <TrendingDown className="w-6 h-6 text-red-400" />
                      )}
                      <div>
                        <p className="font-semibold text-white">
                          {trade.type} Trade
                        </p>
                        <p className="text-sm text-slate-400">
                          {trade.signal || "Market Signal"}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className="bg-green-500/20 text-green-400 border-green-500/50"
                    >
                      OPEN
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-slate-400 mb-1">Entry Price</p>
                      <p className="text-lg font-semibold text-white">
                        ${parseFloat(trade.entryPrice).toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 mb-1">Quantity</p>
                      <p className="text-lg font-semibold text-white">
                        {parseFloat(trade.quantity).toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 mb-1">Entry Time</p>
                      <p className="text-sm text-white">
                        {new Date(trade.entryTime).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 mb-1">Duration</p>
                      <p className="text-sm text-white">
                        {Math.floor(
                          (Date.now() - new Date(trade.entryTime).getTime()) / 3600000
                        )}{" "}
                        hours
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Closed Trades Section */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">
          Recent Closed Trades ({closedTrades.length})
        </h3>

        {sortedClosedTrades.length === 0 ? (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="pt-6">
              <p className="text-slate-400 text-center">No closed trades yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {sortedClosedTrades.slice(0, 10).map((trade) => {
              const pnl = trade.pnl ? parseFloat(trade.pnl) : 0;
              const isProfit = pnl >= 0;

              return (
                <Card
                  key={trade.id}
                  className={`border-slate-700 transition-colors ${
                    isProfit
                      ? "bg-green-900/20 hover:border-green-500/50"
                      : "bg-red-900/20 hover:border-red-500/50"
                  }`}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {trade.type === "LONG" ? (
                          <TrendingUp
                            className={`w-6 h-6 ${
                              isProfit ? "text-green-400" : "text-red-400"
                            }`}
                          />
                        ) : (
                          <TrendingDown
                            className={`w-6 h-6 ${
                              isProfit ? "text-green-400" : "text-red-400"
                            }`}
                          />
                        )}
                        <div>
                          <p className="font-semibold text-white">
                            {trade.type} Trade
                          </p>
                          <p className="text-sm text-slate-400">
                            {trade.signal || "Market Signal"}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className={
                          isProfit
                            ? "bg-green-500/20 text-green-400 border-green-500/50"
                            : "bg-red-500/20 text-red-400 border-red-500/50"
                        }
                      >
                        {isProfit ? "+" : ""}
                        {pnl.toFixed(2)} USDT
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      <div>
                        <p className="text-xs text-slate-400 mb-1">Entry</p>
                        <p className="text-sm font-semibold text-white">
                          ${parseFloat(trade.entryPrice).toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 mb-1">Exit</p>
                        <p className="text-sm font-semibold text-white">
                          ${trade.exitPrice ? parseFloat(trade.exitPrice).toFixed(2) : "-"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 mb-1">P&L %</p>
                        <p
                          className={`text-sm font-semibold ${
                            isProfit ? "text-green-400" : "text-red-400"
                          }`}
                        >
                          {trade.pnlPercent ? `${parseFloat(trade.pnlPercent).toFixed(2)}%` : "-"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 mb-1">Closed</p>
                        <p className="text-xs text-white">
                          {trade.exitTime
                            ? new Date(trade.exitTime).toLocaleString()
                            : "-"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 mb-1">Duration</p>
                        <p className="text-xs text-white">
                          {trade.exitTime
                            ? `${Math.floor(
                                (new Date(trade.exitTime).getTime() -
                                  new Date(trade.entryTime).getTime()) /
                                  3600000
                              )} hrs`
                            : "-"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

