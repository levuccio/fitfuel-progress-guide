import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Flame, Zap, Trophy, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import confetti from "canvas-confetti";

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
  improvements?: { name: string; old: number; new: number; percent: number }[];
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
  improvements
}: StreakEarnedDialogProps) {
  useEffect(() => {
    if (isOpen) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  }, [isOpen]);

  const hasMilestone =
    weight2MilestoneReached || weight3MilestoneReached || absMilestoneReached;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            {hasMilestone ? <Trophy className="h-8 w-8 text-yellow-500" /> : <Flame className="h-6 w-6 text-orange-500" />}
            {hasMilestone ? "Milestone Reached!" : "Streak Update!"}
          </DialogTitle>
          <DialogDescription className="text-base text-muted-foreground">
            Congratulations on your amazing progress!
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {newlySecuredWeight2 && (
             <div className="flex items-center gap-2 text-green-500 font-medium">
                <CheckCircle className="h-5 w-5" /> Secured Week 2x Weights Streak!
             </div>
          )}
          {/* Add other newlySecured if needed, logic seems redundant with milestones/current display in original file */}
          
          <div className="grid grid-cols-3 gap-4 text-center">
             <div className="flex flex-col items-center">
                <span className="text-2xl font-bold">{weight2Current}</span>
                <span className="text-xs text-muted-foreground">2x Weeks</span>
             </div>
             <div className="flex flex-col items-center">
                <span className="text-2xl font-bold">{weight3Current}</span>
                <span className="text-xs text-muted-foreground">3x Weeks</span>
             </div>
             <div className="flex flex-col items-center">
                <span className="text-2xl font-bold">{absCurrent}</span>
                <span className="text-xs text-muted-foreground">Abs Weeks</span>
             </div>
          </div>

          {/* Milestones */}
          {weight2MilestoneReached && (
            <div className="bg-yellow-500/10 p-3 rounded-lg flex items-center justify-center gap-2 text-yellow-600 font-bold">
               <Trophy className="h-5 w-5" /> New 2x Streak Record: {weight2MilestoneReached} Weeks!
            </div>
          )}
          
          {/* Tokens */}
          {(weight2SaveTokensEarned > 0 || weight3SaveTokensEarned > 0 || absSaveTokensEarned > 0) && (
            <div className="bg-blue-500/10 p-3 rounded-lg flex flex-col items-center gap-1 text-blue-600">
               <div className="flex items-center gap-2 font-bold">
                  <Zap className="h-5 w-5" /> Streak Save Tokens Earned!
               </div>
               <div className="text-sm">
                  {weight2SaveTokensEarned > 0 && <span>+{weight2SaveTokensEarned} (2x) </span>}
                  {weight3SaveTokensEarned > 0 && <span>+{weight3SaveTokensEarned} (3x) </span>}
                  {absSaveTokensEarned > 0 && <span>+{absSaveTokensEarned} (Abs)</span>}
               </div>
            </div>
          )}
          
          {/* Performance Improvements */}
          {improvements && improvements.length > 0 && (
             <div className="bg-green-500/10 p-4 rounded-lg space-y-3">
               <h4 className="font-semibold flex items-center gap-2 text-green-700">
                 <TrendingUp className="h-5 w-5"/> 
                 Exercise Updates!
               </h4>
               <div className="space-y-2">
                 {improvements.map((imp, i) => (
                   <div key={i} className="text-sm border-l-2 border-green-500 pl-2">
                     <span className="font-medium block text-foreground">{imp.name}</span>
                     <div className="text-muted-foreground">
                       10RM: {imp.old > 0 ? imp.old.toFixed(1) : 0}kg  <span className="text-green-600 font-bold">{imp.new.toFixed(1)}kg</span> 
                       <span className="text-xs ml-1 bg-green-200 text-green-800 px-1 rounded">+{imp.percent.toFixed(0)}%</span>
                     </div>
                   </div>
                 ))}
               </div>
             </div>
          )}

        </div>

        <DialogFooter className="sm:justify-center">
          <Button onClick={onClose} className="w-full sm:w-auto">Awesome!</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Helper icon
import { CheckCircle } from "lucide-react";
