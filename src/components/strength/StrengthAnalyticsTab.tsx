import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { defaultExercises } from "@/data/exercises";
import { useStrengthAnalytics } from "@/hooks/useStrengthAnalytics";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { ExerciseProgressChart } from "@/components/workout/ExerciseProgressChart"; 

export function StrengthAnalyticsTab() {
  const { getExerciseStats } = useStrengthAnalytics();
  
  // Filter only weight exercises
  const weightExercises = defaultExercises.filter(e => e.category === "weights");

  return (
    <div className="space-y-4">
       {weightExercises.map(exercise => {
          const stats = getExerciseStats(exercise.id);
          // Show exercises even if no stats, to encourage usage? 
          // Or only show those with at least one session?
          // User said "Current e10RM, Best e10RM", if 0 it looks weird.
          // But "developer-aggregated strength log" implies a complete view.
          // I'll show all, with placeholders if no data.
          
          return (
            <Card key={exercise.id} className="glass-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{exercise.name}</CardTitle>
              </CardHeader>
              <CardContent>
                 <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Current 10RM</p>
                      <p className="text-2xl font-bold">{stats?.current10RM ? stats.current10RM.toFixed(1) : "-"} kg</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Best 10RM</p>
                      <p className="text-2xl font-bold text-primary">{stats?.best10RM ? stats.best10RM.toFixed(1) : "-"} kg</p>
                    </div>
                 </div>
                 
                 <div className="flex items-center gap-2 mb-4 text-sm">
                    {stats?.trend === "up" ? <TrendingUp className="h-4 w-4 text-green-500" /> :
                     stats?.trend === "down" ? <TrendingDown className="h-4 w-4 text-red-500" /> :
                     <Minus className="h-4 w-4 text-muted-foreground" />}
                    <span>Trend: {stats?.trend ? stats.trend.toUpperCase() : "N/A"}</span>
                 </div>
                 
                 <div className="h-[150px] w-full">
                   <ExerciseProgressChart exerciseId={exercise.id} />
                 </div>
              </CardContent>
            </Card>
          );
       })}
    </div>
  )
}
