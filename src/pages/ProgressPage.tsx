import { useState, useMemo } from "react";
import { useWorkoutData } from "@/hooks/useWorkoutData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, TrendingDown, Minus, Activity } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format, subDays, isAfter } from "date-fns";

export default function ProgressPage() {
  const { sessions, allExercises } = useWorkoutData();
  const [selectedExercise, setSelectedExercise] = useState<string>("all");
  const [timeRange, setTimeRange] = useState<string>("90");

  const completedSessions = sessions.filter(s => s.status === "completed");

  const exercisesWithData = useMemo(() => {
    const exerciseIds = new Set<string>();
    completedSessions.forEach(session => {
      session.exercises.forEach(ex => {
        if (ex.sets.some(s => s.completed && s.weight > 0)) {
          exerciseIds.add(ex.exerciseId);
        }
      });
    });
    return allExercises.filter(e => exerciseIds.has(e.id));
  }, [completedSessions, allExercises]);

  const chartData = useMemo(() => {
    const cutoffDate = subDays(new Date(), parseInt(timeRange));
    
    const filteredSessions = completedSessions.filter(s => 
      isAfter(new Date(s.startTime), cutoffDate)
    );

    if (selectedExercise === "all") {
      // Show weekly workout count
      const weeklyData: Record<string, number> = {};
      filteredSessions.forEach(session => {
        const weekKey = format(new Date(session.startTime), "yyyy-'W'ww");
        weeklyData[weekKey] = (weeklyData[weekKey] || 0) + 1;
      });
      return Object.entries(weeklyData)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([week, count]) => ({
          date: week,
          value: count,
        }));
    }

    // Show max weight for selected exercise over time
    const exerciseData: { date: string; value: number }[] = [];
    
    filteredSessions.forEach(session => {
      session.exercises
        .filter(ex => ex.exerciseId === selectedExercise)
        .forEach(ex => {
          const maxWeight = Math.max(...ex.sets.filter(s => s.completed).map(s => s.weight));
          if (maxWeight > 0) {
            exerciseData.push({
              date: format(new Date(session.startTime), "MMM d"),
              value: maxWeight,
            });
          }
        });
    });

    return exerciseData;
  }, [completedSessions, selectedExercise, timeRange]);

  const stats = useMemo(() => {
    const cutoffDate = subDays(new Date(), parseInt(timeRange));
    const filteredSessions = completedSessions.filter(s => 
      isAfter(new Date(s.startTime), cutoffDate)
    );

    const totalWorkouts = filteredSessions.length;
    const totalSets = filteredSessions.reduce(
      (acc, s) => acc + s.exercises.reduce(
        (a, e) => a + e.sets.filter(set => set.completed).length, 0
      ), 0
    );
    const totalVolume = filteredSessions.reduce(
      (acc, s) => acc + s.exercises.reduce(
        (a, e) => a + e.sets.filter(set => set.completed).reduce(
          (v, set) => v + (set.reps * set.weight), 0
        ), 0
      ), 0
    );

    return { totalWorkouts, totalSets, totalVolume };
  }, [completedSessions, timeRange]);

  if (completedSessions.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Progress</h1>
          <p className="text-muted-foreground">Track your training progress</p>
        </div>
        
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
            <Activity className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">No data yet</h3>
          <p className="text-muted-foreground max-w-sm">
            Complete some workouts to start tracking your progress.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Progress</h1>
        <p className="text-muted-foreground">Track your training progress</p>
      </div>

      <div className="flex gap-3">
        <Select value={selectedExercise} onValueChange={setSelectedExercise}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select exercise" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Weekly Workouts</SelectItem>
            {exercisesWithData.map(ex => (
              <SelectItem key={ex.id} value={ex.id}>{ex.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="30">30 days</SelectItem>
            <SelectItem value="90">90 days</SelectItem>
            <SelectItem value="365">1 year</SelectItem>
            <SelectItem value="9999">All time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-foreground">{stats.totalWorkouts}</div>
            <p className="text-sm text-muted-foreground">Workouts</p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-foreground">{stats.totalSets}</div>
            <p className="text-sm text-muted-foreground">Sets Completed</p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-foreground">
              {(stats.totalVolume / 1000).toFixed(1)}k
            </div>
            <p className="text-sm text-muted-foreground">Volume (kg)</p>
          </CardContent>
        </Card>
      </div>

      {chartData.length > 0 && (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-base">
              {selectedExercise === "all" ? "Weekly Workout Count" : "Weight Progress (kg)"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="date" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--primary))" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
