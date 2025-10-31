import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from "recharts";

interface BacktestingMetrics {
  monthlyReturnPercent?: string;
  quarterlyReturnPercent?: string;
  annualReturnPercent?: string;
}

interface ProfitCalculatorProps {
  metrics?: BacktestingMetrics;
}

export default function ProfitCalculator({ metrics }: ProfitCalculatorProps) {
  const [initialCapital, setInitialCapital] = useState(1000);

  // Performance rates from backtesting data (OPS Strategy)
  // Historical average monthly return: 10% (varies month to month, not fixed compound)
  // Last year annual return: 180% (based on average 10% per month)
  // Note: Actual monthly returns vary; this is the historical average for projections
  const monthlyReturn = metrics?.monthlyReturnPercent ? parseFloat(metrics.monthlyReturnPercent) / 100 : 0.2373;
  const annualReturn = metrics?.annualReturnPercent ? parseFloat(metrics.annualReturnPercent) / 100 : 2.8479;

  // Calculate compound interest projections
  const projections = useMemo(() => {
    const data = [];
    
    // Monthly projections (12 months)
    for (let month = 0; month <= 12; month++) {
      const monthlyValue = initialCapital * Math.pow(1 + monthlyReturn, month);
      data.push({
        month: month === 0 ? "Start" : `Month ${month}`,
        value: parseFloat(monthlyValue.toFixed(2)),
        profit: parseFloat((monthlyValue - initialCapital).toFixed(2)),
      });
    }
    
    return data;
  }, [initialCapital, monthlyReturn]);

  // Calculate specific timeframes
  const oneMonth = initialCapital * (1 + monthlyReturn) - initialCapital;
  const threeMonths = initialCapital * Math.pow(1 + monthlyReturn, 3) - initialCapital;
  const sixMonths = initialCapital * Math.pow(1 + monthlyReturn, 6) - initialCapital;
  const oneYear = initialCapital * Math.pow(1 + monthlyReturn, 12) - initialCapital;

  const oneMonthTotal = initialCapital + oneMonth;
  const threeMonthsTotal = initialCapital + threeMonths;
  const sixMonthsTotal = initialCapital + sixMonths;
  const oneYearTotal = initialCapital + oneYear;

  const oneMonthPercent = ((oneMonth / initialCapital) * 100).toFixed(2);
  const threeMonthsPercent = ((threeMonths / initialCapital) * 100).toFixed(2);
  const sixMonthsPercent = ((sixMonths / initialCapital) * 100).toFixed(2);
  const oneYearPercent = ((oneYear / initialCapital) * 100).toFixed(2);

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Calculate Your Potential Profit</CardTitle>
          <CardDescription className="text-slate-400">
            Based on our strategy's historical performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-300 mb-2 block">
                Initial Capital (USD)
              </label>
              <div className="flex items-center gap-2">
                <span className="text-yellow-400 text-xl">$</span>
                <Input
                  type="number"
                  value={initialCapital}
                  onChange={(e) => setInitialCapital(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                  placeholder="Enter initial capital"
                  min="0"
                  step="100"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profit Projections Cards */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Profit Projections</h3>
        <p className="text-sm text-slate-400 mb-4">
          Estimated returns based on historical performance
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 1 Month */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-400">1 Month</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Starting Capital:</span>
                <span className="text-white font-semibold">${initialCapital.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Projected Profit:</span>
                <span className="text-green-400 font-semibold">+${oneMonth.toLocaleString("en-US", { maximumFractionDigits: 2 })}</span>
              </div>
              <div className="border-t border-slate-700 pt-2 mt-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Total Value:</span>
                  <span className="text-yellow-400 font-bold">${oneMonthTotal.toLocaleString("en-US", { maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-slate-400">Return %:</span>
                  <span className="text-green-400 font-semibold">+{oneMonthPercent}%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 3 Months */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-400">3 Months (Quarter)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Starting Capital:</span>
                <span className="text-white font-semibold">${initialCapital.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Projected Profit:</span>
                <span className="text-green-400 font-semibold">+${threeMonths.toLocaleString("en-US", { maximumFractionDigits: 2 })}</span>
              </div>
              <div className="border-t border-slate-700 pt-2 mt-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Total Value:</span>
                  <span className="text-yellow-400 font-bold">${threeMonthsTotal.toLocaleString("en-US", { maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-slate-400">Return %:</span>
                  <span className="text-green-400 font-semibold">+{threeMonthsPercent}%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 6 Months */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-400">6 Months</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Starting Capital:</span>
                <span className="text-white font-semibold">${initialCapital.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Projected Profit:</span>
                <span className="text-green-400 font-semibold">+${sixMonths.toLocaleString("en-US", { maximumFractionDigits: 2 })}</span>
              </div>
              <div className="border-t border-slate-700 pt-2 mt-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Total Value:</span>
                  <span className="text-yellow-400 font-bold">${sixMonthsTotal.toLocaleString("en-US", { maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-slate-400">Return %:</span>
                  <span className="text-green-400 font-semibold">+{sixMonthsPercent}%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 1 Year */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-400">1 Year</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Starting Capital:</span>
                <span className="text-white font-semibold">${initialCapital.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Projected Profit:</span>
                <span className="text-green-400 font-semibold">+${oneYear.toLocaleString("en-US", { maximumFractionDigits: 2 })}</span>
              </div>
              <div className="border-t border-slate-700 pt-2 mt-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Total Value:</span>
                  <span className="text-yellow-400 font-bold">${oneYearTotal.toLocaleString("en-US", { maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-slate-400">Return %:</span>
                  <span className="text-green-400 font-semibold">+{oneYearPercent}%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Compound Interest Visualization */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">12-Month Compound Growth Projection</CardTitle>
          <CardDescription className="text-slate-400">
            Estimated account growth with compound interest over the next year
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={projections}>
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
              <XAxis 
                dataKey="month" 
                stroke="#94a3b8"
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                stroke="#94a3b8"
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1e293b",
                  border: "1px solid #475569",
                  borderRadius: "8px",
                }}
                labelStyle={{ color: "#f1f5f9" }}
                formatter={(value: number) => `$${value.toLocaleString("en-US", { maximumFractionDigits: 2 })}`}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#eab308"
                strokeWidth={3}
                dot={{ fill: "#eab308", r: 4 }}
                activeDot={{ r: 6 }}
                name="Total Account Value"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Profit Growth Chart */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Monthly Profit Accumulation</CardTitle>
          <CardDescription className="text-slate-400">
            Cumulative profit growth month by month
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={projections}>
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
              <XAxis 
                dataKey="month" 
                stroke="#94a3b8"
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                stroke="#94a3b8"
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `$${value.toLocaleString()}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1e293b",
                  border: "1px solid #475569",
                  borderRadius: "8px",
                }}
                labelStyle={{ color: "#f1f5f9" }}
                formatter={(value: number) => `$${value.toLocaleString("en-US", { maximumFractionDigits: 2 })}`}
              />
              <Legend />
              <Bar
                dataKey="profit"
                fill="#10b981"
                name="Cumulative Profit"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Disclaimer */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="pt-6">
          <p className="text-xs text-slate-400 text-center">
            <strong>Disclaimer:</strong> These projections are based on historical performance and are not guaranteed. 
            Past performance does not indicate future results. Trading involves risk, including the potential loss of principal. 
            Please do your own research and consult with a financial advisor before making investment decisions.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

