import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  Legend, // Import Legend
} from "recharts";
import { useWorkoutData } from "@/hooks/useWorkoutData";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";

interface ExerciseProgressChartProps {
  exerciseId: string;
}

export function ExerciseProgressChart({ exerciseId }: ExerciseProgressChartProps) {
  const { getExerciseHistoryData } = useWorkoutData();
  const historyData = useMemo(() => getExerciseHistoryData(exerciseId), [exerciseId, getExerciseHistoryData]);

  if (historyData.length < 2) {
    return (
      <CardContent className="p-4 text-center text-muted-foreground text-sm">
        Not enough data to show progress (need at least 2 completed sessions).
      </CardContent>
    );
  }

  // Prepare data for Recharts, adding an index for the X-axis
  const chartData = historyData.map((dataPoint, index) => ({
    index: index,
    date: dataPoint.date,
    maxWeight: dataPoint.maxWeight,
    estimatedRM10: dataPoint.estimatedRM10, // Include estimatedRM10
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = chartData[label]; // label is the index
      return (
        <div className="rounded-lg border bg-popover p-2 text-sm shadow-md">
          <p className="font-semibold text-foreground">{format(new Date(dataPoint.date), "MMM d, yyyy")}</p>
          {payload.map((entry: any, i: number) => (
            <p key={i} style={{ color: entry.stroke }}>
              {entry.name}: {entry.value.toFixed(1)} kg
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{
            top: 10,
            right: 10,
            left: -20, // Adjust left margin to prevent Y-axis labels from being cut off
            bottom: 0,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
          <XAxis
            dataKey="index"
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickFormatter={(value) => `#${value + 1}`} // Show sequence number
            padding={{ left: 20, right: 20 }}
          />
          <YAxis
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickFormatter={(value) => `${value}kg`}
            domain={['auto', 'auto']} // Adjust domain dynamically
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend /> {/* Add Legend */}
          <Area
            type="monotone"
            dataKey="maxWeight"
            name="Max Weight" // Name for legend
            stroke="hsl(var(--primary))"
            fill="hsl(var(--primary) / 0.2)" // Transparent primary color (green)
            strokeWidth={2}
          />
          <Line
            type="monotone"
            dataKey="maxWeight"
            name="Max Weight" // Name for legend
            stroke="hsl(var(--primary))"
            dot={{ r: 4, fill: "hsl(var(--primary))" }}
            activeDot={{ r: 6, fill: "hsl(var(--primary))", stroke: "hsl(var(--primary))", strokeWidth: 2 }}
          />
          {chartData.some(d => d.estimatedRM10 !== undefined) && ( // Only show if RM10 data exists
            <Line
              type="monotone"
              dataKey="estimatedRM10"
              name="Est. RM10" // Name for legend
              stroke="hsl(var(--accent))" // Use a different color for RM10
              strokeWidth={2}
              dot={{ r: 4, fill: "hsl(var(--accent))" }}
              activeDot={{ r: 6, fill: "hsl(var(--accent))", stroke: "hsl(var(--accent))", strokeWidth: 2 }}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}