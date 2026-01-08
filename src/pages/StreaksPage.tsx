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

      {/* Debugging Section for Production Diagnosis */}
      <div className="mt-8 p-4 border rounded-lg bg-gray-50 dark:bg-gray-900/50 text-xs font-mono overflow-hidden">
        <details>
          <summary className="cursor-pointer font-bold mb-2 opacity-50 hover:opacity-100 transition-opacity">
            Debug System Info (Click to expand)
          </summary>
          <div className="space-y-1 text-muted-foreground whitespace-pre-wrap">
            <DebugView />
          </div>
        </details>
      </div>
    </div>
  );
}

function DebugView() {
  const sessions = JSON.parse(localStorage.getItem("fittrack_sessions") || "[]");
  const streakState = JSON.parse(localStorage.getItem("fittrack_streak_state") || "{}");
  const weekSummaries = JSON.parse(localStorage.getItem("fittrack_week_summaries") || "[]");
  const migration = localStorage.getItem("fittrack_streak_migration_version");
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;

  return (
    <>
      <div>App Version: 1.0.5 (Fix Re-deployed)</div>
      <div>Timezone: {tz}</div>
      <div>Migration Ver: {migration} (Expected: 5)</div>
      <div>--------------------------------</div>
      <div>Streak State:</div>
      <div>{JSON.stringify(streakState, null, 2)}</div>
      <div>--------------------------------</div>
      <div>Last 3 Week Summaries:</div>
      <div>{JSON.stringify(weekSummaries.slice(-3), null, 2)}</div>
      <div>--------------------------------</div>
      <div>Total Sessions: {sessions.length}</div>
    </>
  );
}
