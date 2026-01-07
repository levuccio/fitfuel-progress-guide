import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trophy, PlusCircle, Dumbbell, Sparkles } from "lucide-react";

type RewardType = "weekly-first" | "weekly-bonus";

export interface WeeklyRewardDialogData {
  type: RewardType;
  category: "weights" | "abs";
  countThisWeek: number;
  bonusTokensEarnedNow: number; // 0 for first-weekly, >=1 for bonus
}

interface WeeklyRewardDialogProps {
  isOpen: boolean;
  onClose: () => void;
  data: WeeklyRewardDialogData | null;
}

export function WeeklyRewardDialog({ isOpen, onClose, data }: WeeklyRewardDialogProps) {
  if (!data) return null;

  const title =
    data.type === "weekly-first"
      ? "Nice! Week started"
      : "Bonus earned!";

  const isWeights = data.category === "weights";

  const Icon = data.type === "weekly-first" ? Trophy : PlusCircle;

  const description =
    data.type === "weekly-first"
      ? `That was your first ${isWeights ? "weights" : "abs"} workout this week. Keep going!`
      : `That was your ${data.countThisWeek}${ordinalSuffix(data.countThisWeek)} ${isWeights ? "weights" : "abs"} workout this week — you earned ${data.bonusTokensEarnedNow} bonus token${data.bonusTokensEarnedNow === 1 ? "" : "s"}!`;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[440px] text-center">
        <DialogHeader className="items-center">
          <Sparkles className="h-12 w-12 text-yellow-400 animate-pulse-slow mb-2" />
          <DialogTitle className="text-2xl font-bold">{title}</DialogTitle>
          <DialogDescription className="text-base text-muted-foreground">
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="mx-auto w-fit flex items-center gap-2 rounded-full bg-primary/10 text-primary px-4 py-2">
            <Icon className="h-5 w-5" />
            <span className="font-semibold">
              {isWeights ? "Weights" : "Abs"} • {data.countThisWeek} this week
            </span>
          </div>

          {data.type === "weekly-bonus" && (
            <div className="mt-4 text-sm text-muted-foreground flex items-center justify-center gap-2">
              <Dumbbell className="h-4 w-4" />
              <span>
                Bonus tokens can be applied on the Streaks page.
              </span>
            </div>
          )}
        </div>

        <DialogFooter className="sm:justify-center">
          <Button onClick={onClose}>Awesome</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ordinalSuffix(n: number) {
  const j = n % 10;
  const k = n % 100;
  if (j === 1 && k !== 11) return "st";
  if (j === 2 && k !== 12) return "nd";
  if (j === 3 && k !== 13) return "rd";
  return "th";
}