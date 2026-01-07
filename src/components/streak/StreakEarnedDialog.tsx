import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Flame, Trophy, ShieldCheck, Zap, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface StreakEarnedDialogProps {
  isOpen: boolean;
  onClose: () => void;
  newlySecuredKeep: boolean;
  newlySecuredPerfect: boolean;
  keepCurrent: number;
  perfectCurrent: number;
  keepStreakSavesEarned: number;
  newMilestoneReached?: number; // The milestone value if one was reached
  milestoneType?: "keep" | "perfect"; // Type of milestone reached
}

export function StreakEarnedDialog({
  isOpen,
  onClose,
  newlySecuredKeep,
  newlySecuredPerfect,
  keepCurrent,
  perfectCurrent,
  keepStreakSavesEarned,
  newMilestoneReached,
  milestoneType,
}: StreakEarnedDialogProps) {
  const showContent = newlySecuredKeep || newlySecuredPerfect || keepStreakSavesEarned > 0 || newMilestoneReached;

  if (!showContent) {
    return null; // Don't render if there's nothing to show
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] text-center">
        <DialogHeader className="items-center">
          <Sparkles className="h-12 w-12 text-yellow-400 animate-pulse-slow mb-2" />
          <DialogTitle className="text-2xl font-bold">
            {newMilestoneReached ? "Milestone Reached!" : "Streak Update!"}
          </DialogTitle>
          <DialogDescription className="text-base text-muted-foreground">
            Congratulations on your amazing progress!
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          {newlySecuredKeep && (
            <div className="flex items-center justify-center gap-2 text-lg font-semibold text-blue-500">
              <ShieldCheck className="h-6 w-6" />
              <span>Keep Streak: {keepCurrent} weeks!</span>
            </div>
          )}
          {newlySecuredPerfect && (
            <div className="flex items-center justify-center gap-2 text-lg font-semibold text-yellow-500">
              <Trophy className="h-6 w-6" />
              <span>Perfect Streak: {perfectCurrent} weeks!</span>
            </div>
          )}
          {newMilestoneReached && (
            <div className="flex items-center justify-center gap-2 text-xl font-bold text-primary">
              <Flame className="h-7 w-7" />
              <span>{newMilestoneReached} Week {milestoneType === "perfect" ? "Perfect" : "Keep"} Streak!</span>
            </div>
          )}
          {keepStreakSavesEarned > 0 && (
            <div className="flex items-center justify-center gap-2 text-base text-purple-500">
              <Zap className="h-5 w-5" />
              <span>You earned {keepStreakSavesEarned} Streak Save Token{keepStreakSavesEarned > 1 ? "s" : ""}!</span>
            </div>
          )}
        </div>
        <DialogFooter className="sm:justify-center">
          <Button onClick={onClose}>Awesome!</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}