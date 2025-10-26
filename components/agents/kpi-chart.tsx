"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card } from "@/components/ui/card";
import type { KPI } from "@/types";

interface KPIChartProps {
  data: KPI[];
  metric: "quality" | "aht" | "srr" | "voc";
  title: string;
  color: string;
}

export function KPIChart({ data, metric, title, color }: KPIChartProps) {
  const chartData = data.map((kpi) => ({
    date: new Date(kpi.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    value: kpi[metric],
  }));

  return (
    <div className="glass-card p-6 shadow-premium hover-lift animate-fade-scale">
      <h3 className="text-lg font-bold uppercase tracking-wide text-white mb-6">{title}</h3>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis
            dataKey="date"
            stroke="rgba(255,255,255,0.5)"
            fontSize={11}
            tickLine={false}
          />
          <YAxis
            stroke="rgba(255,255,255,0.5)"
            fontSize={11}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1A1A1A",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "12px",
              padding: "12px 16px",
              color: "white",
            }}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={3}
            dot={{ fill: color, r: 4 }}
            activeDot={{ r: 7, fill: color, strokeWidth: 2, stroke: "#0A0A0A" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

