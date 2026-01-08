import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useStreakData } from "@/hooks/useStreakData";
import { AlertCircle } from "lucide-react";

export function StreakRescueDialog() {
    const { streakState, weightBonusBalance, absBonusBalance, performRescue, ignoreRescue } = useStreakData();
    const rescue = streakState.rescueInProgress;

    if (!rescue) return null;

    const { weekId, type, cost = 1 } = rescue;
    const balance = type === "weights" ? weightBonusBalance : absBonusBalance;

    // Logic: Can user afford it?
    const canAfford = balance >= cost;

    const handleRescue = () => {
        if (canAfford) {
            performRescue(weekId, type);
        }
    };

    const handleIgnore = () => {
        ignoreRescue(weekId);
    };

    return (
        <Dialog open={true} onOpenChange={(open) => { if (!open) handleIgnore(); }}>
            <DialogContent className="sm:max-w-md border-red-500/50 bg-destructive/5">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-destructive">
                        <AlertCircle className="h-5 w-5" />
                        Streak At Risk!
                    </DialogTitle>
                    <DialogDescription className="pt-2">
                        You missed your {type === "weights" ? "Weights" : "Abs"} streak goal for <strong>Week {weekId}</strong>.
                        <br /><br />
                        Typically, this would reset your streak to zero. However, we noticed you have <strong>{balance} Bonus Tokens</strong> available!
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                    <p className="text-sm font-medium">
                        You need <strong>{cost} Tokens</strong> to save this streak.
                        <br />
                        Do you want to use them retroactively?
                    </p>
                    {!canAfford && (
                        <p className="text-xs text-muted-foreground mt-2 text-red-500">
                            (You only have {balance}. You cannot save this streak.)
                        </p>
                    )}
                </div>

                <DialogFooter className="flex-col sm:flex-row gap-2">
                    <Button variant="ghost" onClick={handleIgnore}>
                        No, Let it Reset
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleRescue}
                        disabled={!canAfford}
                    >
                        Yes, Rescue Streak (-{cost} Tokens)
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
