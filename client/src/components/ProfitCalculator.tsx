import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  const [initialCapital, setInitialCapital] = useState<number>(1000);

  const monthlyReturn = metrics?.monthlyReturnPercent 
    ? parseFloat(metrics.monthlyReturnPercent) 
    : 12.99;
  const quarterlyReturn = metrics?.quarterlyReturnPercent 
    ? parseFloat(metrics.quarterlyReturnPercent) 
    : 38.98;
  const annualReturn = metrics?.annualReturnPercent 
    ? parseFloat(metrics.annualReturnPercent) 
    : 155.91;

  // Calculate projections
  const projections = useMemo(() => {
    const data = [];
    
    // Monthly projections
    for (let i = 1; i <= 12; i++) {
      const monthlyProfit = initialCapital * (monthlyReturn / 100) * i;
      const total = initialCapital + monthlyProfit;
      data.push({
        period: `Month ${i}`,
        capital: initialCapital,
        profit: monthlyProfit,
        total: total,
        type: "Monthly",
      });
    }

    return data;
  }, [initialCapital, monthlyReturn]);

  const timeframeProjections = useMemo(() => {
    return [
      {
        label: "1 Month",
        profit: initialCapital * (monthlyReturn / 100),
        total: initialCapital + initialCapital * (monthlyReturn / 100),
        return: monthlyReturn,
      },
      {
        label: "3 Months (Quarter)",
        profit: initialCapital * (quarterlyReturn / 100),
        total: initialCapital + initialCapital * (quarterlyReturn / 100),
        return: quarterlyReturn,
      },
      {
        label: "6 Months",
        profit: initialCapital * (monthlyReturn / 100) * 6,
        total: initialCapital + initialCapital * (monthlyReturn / 100) * 6,
        return: monthlyReturn * 6,
      },
      {
        label: "1 Year",
        profit: initialCapital * (annualReturn / 100),
        total: initialCapital + initialCapital * (annualReturn / 100),
        return: annualReturn,
      },
    ];
  }, [initialCapital, monthlyReturn, quarterlyReturn, annualReturn]);

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Calculate Your Potential Profits</CardTitle>
          <CardDescription className="text-slate-400">
            Based on our strategy's historical performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="capital" className="text-slate-300 mb-2 block">
                Initial Capital (USD)
              </Label>
              <div className="flex items-center gap-2">
                <span className="text-yellow-400 font-semibold">$</span>
                <Input
                  id="capital"
                  type="number"
                  value={initialCapital}
                  onChange={(e) => setInitialCapital(Number(e.target.value))}
                  className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                  min="100"
                  step="100"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timeframe Projections */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Profit Projections</CardTitle>
          <CardDescription className="text-slate-400">
            Estimated returns based on historical performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {timeframeProjections.map((projection, idx) => (
              <div
                key={idx}
                className="p-4 bg-slate-700/50 border border-slate-600 rounded-lg hover:border-yellow-500/50 transition-colors"
              >
                <h4 className="text-sm font-medium text-slate-300 mb-3">
                  {projection.label}
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-sm">Starting Capital:</span>
                    <span className="text-white font-semibold">
                      ${initialCapital.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-sm">Projected Profit:</span>
                    <span className="text-green-400 font-semibold">
                      +${projection.profit.toLocaleString("en-US", {
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-slate-600">
                    <span className="text-slate-300 text-sm font-medium">Total Value:</span>
                    <span className="text-yellow-400 font-bold text-lg">
                      ${projection.total.toLocaleString("en-US", {
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-sm">Return %:</span>
                    <span className="text-green-400 text-sm font-semibold">
                      +{projection.return.toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Monthly Growth Chart */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">12-Month Growth Projection</CardTitle>
          <CardDescription className="text-slate-400">
            Estimated account growth over the next year
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={projections}>
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
              <XAxis 
                dataKey="period" 
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
                formatter={(value: number) => `$${value.toLocaleString("en-US", {
                  maximumFractionDigits: 2,
                })}`}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="total"
                stroke="#eab308"
                strokeWidth={2}
                dot={{ fill: "#eab308", r: 4 }}
                activeDot={{ r: 6 }}
                name="Total Account Value"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Disclaimer */}
      <Card className="bg-red-900/20 border-red-800/50">
        <CardContent className="pt-6">
          <p className="text-sm text-red-200">
            <strong>Disclaimer:</strong> These projections are based on historical performance and are not guaranteed. 
            Past performance does not indicate future results. Trading involves risk, including the potential loss of principal. 
            Please do your own research and consult with a financial advisor before making investment decisions.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

