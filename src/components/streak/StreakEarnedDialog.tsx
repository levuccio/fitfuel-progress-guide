import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Flame, Trophy, ShieldCheck, Zap, Sparkles, Dumbbell, HeartPulse } from "lucide-react";
import { cn } from "@/lib/utils";

interface StreakEarnedDialogProps {
  isOpen: boolean;
  onClose: () => void;
  newlySecuredWeight2: boolean;
  newlySecuredWeight3: boolean;
  newlySecuredAbs: boolean;
  weight2Current: number;
  weight3Current: number;
  absCurrent: number;
  weight2MilestoneReached?: number;
  weight3MilestoneReached?: number;
  absMilestoneReached?: number;
  weight2SaveTokensEarned: number;
  weight3SaveTokensEarned: number;
  absSaveTokensEarned: number;
}

export function StreakEarnedDialog({
  isOpen,
  onClose,
  newlySecuredWeight2,
  newlySecuredWeight3,
  newlySecuredAbs,
  weight2Current,
  weight3Current,
  absCurrent,
  weight2MilestoneReached,
  weight3MilestoneReached,
  absMilestoneReached,
  weight2SaveTokensEarned,
  weight3SaveTokensEarned,
  absSaveTokensEarned,
}: StreakEarnedDialogProps) {
  const showContent = newlySecuredWeight2 || newlySecuredWeight3 || newlySecuredAbs ||
                       weight2MilestoneReached || weight3MilestoneReached || absMilestoneReached ||
                       weight2SaveTokensEarned > 0 || weight3SaveTokensEarned > 0 || absSaveTokensEarned > 0;

  if (!showContent) {
    return null; // Don't render if there's nothing to show
  }

  const anyMilestoneReached = weight2MilestoneReached || weight3MilestoneReached || absMilestoneReached;
  const anyTokensEarned = weight2SaveTokensEarned > 0 || weight3SaveTokensEarned > 0 || absSaveTokensEarned > 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] text-center">
        <DialogHeader className="items-center">
          <Sparkles className="h-12 w-12 text-yellow-400 animate-pulse-slow mb-2" />
          <DialogTitle className="text-2xl font-bold">
            {anyMilestoneReached ? "Milestone Reached!" : "Streak Update!"}
          </DialogTitle>
          <DialogDescription className="text-base text-muted-foreground">
            Congratulations on your amazing progress!
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          {newlySecuredWeight2 && (
            <div className="flex items-center justify-center gap-2 text-lg font-semibold text-red-500">
              <Zap className="h-6 w-6" />
              <span>2x Weights Streak: {weight2Current} weeks!</span>
            </div>
          )}
          {newlySecuredWeight3 && (
            <div className="flex items-center justify-center gap-2 text-lg font-semibold text-yellow-500">
              <Zap className="h-6 w-6" />
              <span>3x Weights Streak: {weight3Current} weeks!</span>
            </div>
          )}
          {newlySecuredAbs && (
            <div className="flex items-center justify-center gap-2 text-lg font-semibold text-green-500">
              <Zap className="h-6 w-6" />
              <span>Abs Streak: {absCurrent} weeks!</span>
            </div>
          )}

          {weight2MilestoneReached && (
            <div className="flex items-center justify-center gap-2 text-xl font-bold text-primary">
              <Flame className="h-7 w-7" />
              <span>{weight2MilestoneReached} Week 2x Weights Streak!</span>
            </div>
          )}
          {weight3MilestoneReached && (
            <div className="flex items-center justify-center gap-2 text-xl font-bold text-primary">
              <Flame className="h-7 w-7" />
              <span>{weight3MilestoneReached} Week 3x Weights Streak!</span>
            </div>
          )}
          {absMilestoneReached && (
            <div className="flex items-center justify-center gap-2 text-xl font-bold text-primary">
              <Flame className="h-7 w-7" />
              <span>{absMilestoneReached} Week Abs Streak!</span>
            </div>
          )}

          {anyTokensEarned && (
            <div className="flex flex-col items-center justify-center gap-2 text-base text-purple-500">
              <Zap className="h-5 w-5" />
              <span>You earned Streak Save Token(s)!</span>
              {weight2SaveTokensEarned > 0 && <span>+ {weight2SaveTokensEarned} for 2x Weights</span>}
              {weight3SaveTokensEarned > 0 && <span>+ {weight3SaveTokensEarned} for 3x Weights</span>}
              {absSaveTokensEarned > 0 && <span>+ {absSaveTokensEarned} for Abs</span>}
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