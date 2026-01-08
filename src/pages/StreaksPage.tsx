import { StreakDisplay } from "@/components/streak/StreakDisplay";
import { StrengthStreakDashboard } from "@/components/streak/StrengthStreakDashboard";

export default function StreaksPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Streaks</h1>
        <p className="text-muted-foreground">Track your workout consistency and milestones</p>
      </div>
      <StreakDisplay />
      <StrengthStreakDashboard />
    </div>
  );
}
