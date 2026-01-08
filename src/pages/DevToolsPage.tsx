import { Button } from "@/components/ui/button";
import { useStreakData } from "@/hooks/useStreakData";
import { getWeekId, prevWeekId, getUserTimezone } from "@/lib/date-utils";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DevToolsPage() {
    const { performRescue, ignoreRescue } = useStreakData();

    const simulateFailure = () => {
        // 1. Get current state
        const weekSummaries = JSON.parse(localStorage.getItem("fittrack_week_summaries") || "[]");
        const streakState = JSON.parse(localStorage.getItem("fittrack_streak_state") || "{}");
        const sessions = JSON.parse(localStorage.getItem("fittrack_sessions") || "[]");

        // 2. Determine "Last Week"
        const tz = getUserTimezone();
        const currentWeekId = getWeekId(new Date(), tz);
        const lastWeekId = prevWeekId(currentWeekId);

        // 3. Reset Last Week's progress to 0
        const newSummaries = weekSummaries.map((s: any) => {
            if (s.weekId === lastWeekId) {
                return { ...s, weightsCount: 0, absCount: 0, finalized: false, weightsCarryoverApplied: 0, absCarryoverApplied: 0 };
            }
            return s;
        });

        // If last week doesn't exist, create it
        if (!newSummaries.find((s: any) => s.weekId === lastWeekId)) {
            newSummaries.push({
                weekId: lastWeekId,
                weightsCount: 0, absCount: 0,
                finalized: false,
                updatedAt: new Date().toISOString()
            });
        }

        localStorage.setItem("fittrack_week_summaries", JSON.stringify(newSummaries));

        // 4. Reset streak state finalization so it tries to process last week again
        // And ensure we have tokens (give 5)
        localStorage.setItem("fittrack_streak_state", JSON.stringify({
            ...streakState,
            lastFinalizedWeekId: prevWeekId(lastWeekId), // Set to 2 weeks ago, so it processes Last Week
            weight2SaveTokens: 0, // Ensure no auto-save tokens so it triggers rescue
            rescueIgnoredWeeks: [], // Clear ignores
            rescueInProgress: undefined
        }));

        // Grant Bonus Tokens indirectly? 
        // Bonus tokens come from weekSummaries. 
        // Let's create a fake "Super Week" 3 weeks ago with 10 workouts to give bonus balance.
        const bonusWeekId = prevWeekId(prevWeekId(lastWeekId));
        // Check if exists
        const existingBonus = newSummaries.find((s: any) => s.weekId === bonusWeekId);
        if (existingBonus) {
            existingBonus.weightsCount = 10; // Gives 10-3 = 7 tokens
        } else {
            newSummaries.push({
                weekId: bonusWeekId, weightsCount: 10, absCount: 0, finalized: true, updatedAt: new Date().toISOString()
            });
        }
        localStorage.setItem("fittrack_week_summaries", JSON.stringify(newSummaries));

        toast.success("Simulation Setup!", { description: "Reloading page to trigger detection..." });
        setTimeout(() => {
            window.location.href = "/";
        }, 1500);
    };

    return (
        <div className="p-4 space-y-4">
            <h1 className="text-2xl font-bold">Developer Tools</h1>
            <Card>
                <CardHeader><CardTitle>Streak Testing</CardTitle></CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                        This will reset your Last Week's progress to 0, give you some bonus tokens, and rewinds the streak finalizer. 
                On reload, the app should think you failed last week but have tokens -> <strong>Rescue Dialog should appear.</strong>
                    </p>
                    <Button onClick={simulateFailure} variant="destructive">
                        Simulate "Missed Week" Scenario
                    </Button>
                </CardContent>
            </Card>
            <div className="text-xs text-muted-foreground">
                Note: This MANGLES your local data. Use on localhost or be ready to clear data.
            </div>
        </div>
    );
}
