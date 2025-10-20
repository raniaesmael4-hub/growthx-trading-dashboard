import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

interface BacktestingMetrics {
  netProfit?: number;
  netProfitPercent?: string;
  totalTrades?: number;
  winRate?: string;
  avgPnl?: string;
  profitFactor?: string;
  maxDrawdown?: string;
  monthlyReturnPercent?: string;
  quarterlyReturnPercent?: string;
  annualReturnPercent?: string;
}

interface BacktestingMetricsProps {
  metrics?: BacktestingMetrics;
}

export default function BacktestingMetrics({ metrics }: BacktestingMetricsProps) {
  if (!metrics) {
    return (
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="pt-6">
          <p className="text-slate-400">Loading backtesting data...</p>
        </CardContent>
      </Card>
    );
  }

  const winRate = metrics.winRate ? parseFloat(metrics.winRate) : 0;
  const loseRate = 100 - winRate;

  const performanceData = [
    { name: "Winning Trades", value: winRate, color: "#10b981" },
    { name: "Losing Trades", value: loseRate, color: "#ef4444" },
  ];

  const monthlyData = [
    { month: "Month 1", return: metrics.monthlyReturnPercent ? parseFloat(metrics.monthlyReturnPercent) : 0 },
    { month: "Month 3", return: metrics.quarterlyReturnPercent ? parseFloat(metrics.quarterlyReturnPercent) / 3 : 0 },
    { month: "Month 6", return: metrics.monthlyReturnPercent ? parseFloat(metrics.monthlyReturnPercent) * 6 : 0 },
    { month: "Year 1", return: metrics.annualReturnPercent ? parseFloat(metrics.annualReturnPercent) : 0 },
  ];

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-400">
              Average P&L per Trade
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              ${metrics.avgPnl || "0"}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-400">
              Profit Factor
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {metrics.profitFactor || "0"}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Gross Profit / Gross Loss
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-400">
              Maximum Drawdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-400">
              ${metrics.maxDrawdown || "0"}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Peak to Trough
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Win Rate Pie Chart */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Trade Win Rate Distribution</CardTitle>
          <CardDescription className="text-slate-400">
            {metrics.totalTrades?.toLocaleString()} total trades analyzed
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={performanceData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value.toFixed(1)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {performanceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => `${value.toFixed(2)}%`}
                contentStyle={{
                  backgroundColor: "#1e293b",
                  border: "1px solid #475569",
                  borderRadius: "8px",
                }}
                labelStyle={{ color: "#f1f5f9" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Return Comparison Chart */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Return Comparison</CardTitle>
          <CardDescription className="text-slate-400">
            Historical returns across different timeframes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
              <XAxis 
                dataKey="month" 
                stroke="#94a3b8"
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                stroke="#94a3b8"
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `${value.toFixed(0)}%`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1e293b",
                  border: "1px solid #475569",
                  borderRadius: "8px",
                }}
                labelStyle={{ color: "#f1f5f9" }}
                formatter={(value: number) => `${value.toFixed(2)}%`}
              />
              <Legend />
              <Bar
                dataKey="return"
                fill="#eab308"
                name="Return %"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Key Insights */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Key Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2"></div>
              <div>
                <p className="text-white font-medium">High Win Rate</p>
                <p className="text-sm text-slate-400">
                  {winRate.toFixed(2)}% of trades are profitable, indicating a strong strategy
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2"></div>
              <div>
                <p className="text-white font-medium">Consistent Performance</p>
                <p className="text-sm text-slate-400">
                  Profit factor of {metrics.profitFactor} shows healthy risk-reward ratio
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2"></div>
              <div>
                <p className="text-white font-medium">Controlled Risk</p>
                <p className="text-sm text-slate-400">
                  Maximum drawdown of ${metrics.maxDrawdown} demonstrates effective risk management
                </p>
              </div>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

