"use client";

import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ZAxis } from "recharts";
import { Card } from "@/components/ui/card";

interface DataPoint {
  x: number;
  y: number;
  agent?: string;
}

interface CorrelationScatterProps {
  data: DataPoint[];
  xLabel: string;
  yLabel: string;
  title: string;
}

export function CorrelationScatter({ data, xLabel, yLabel, title }: CorrelationScatterProps) {
  return (
    <Card className="p-6">
      <h3 className="font-semibold text-slate-900 mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <ScatterChart>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            type="number"
            dataKey="x"
            name={xLabel}
            label={{ value: xLabel, position: "insideBottom", offset: -5 }}
            stroke="#64748b"
          />
          <YAxis
            type="number"
            dataKey="y"
            name={yLabel}
            label={{ value: yLabel, angle: -90, position: "insideLeft" }}
            stroke="#64748b"
          />
          <ZAxis range={[60, 60]} />
          <Tooltip
            cursor={{ strokeDasharray: "3 3" }}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                return (
                  <div className="bg-white p-3 border border-slate-200 rounded-lg shadow-lg">
                    {data.agent && <div className="font-semibold text-slate-900 mb-1">{data.agent}</div>}
                    <div className="text-sm text-slate-600">
                      {xLabel}: {data.x}
                    </div>
                    <div className="text-sm text-slate-600">
                      {yLabel}: {data.y}
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
          <Scatter data={data} fill="#3b82f6" />
        </ScatterChart>
      </ResponsiveContainer>
    </Card>
  );
}

