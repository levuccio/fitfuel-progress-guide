import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils"; // Import cn for conditional styling

interface LogSquashDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (durationMinutes: number, winner: "Aleksej" | "Andreas") => void;
}

export function LogSquashDialog({ isOpen, onClose, onSave }: LogSquashDialogProps) {
  const [durationMinutes, setDurationMinutes] = useState<number>(60);
  const [winner, setWinner] = useState<"Aleksej" | "Andreas">("Aleksej"); // Default winner

  const handleSave = () => {
    if (durationMinutes > 0 && winner) {
      onSave(durationMinutes, winner);
      onClose();
    }
  };

  const aleksejAvatarUrl = "https://i.postimg.cc/jnvrmTCz/D2147D31-2F00-48DD-9861-64B5FEB0C93D.png";
  const andreasAvatarUrl = "https://i.postimg.cc/rRgL3Tz9/FD0CA35B-B9F0-4A48-A579-B86E25EAB456.png";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Log Squash Game</DialogTitle>
          <DialogDescription>
            Enter the duration and select the winner of your squash game.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="duration" className="text-right">
              Duration
            </Label>
            <Input
              id="duration"
              type="number"
              min={1}
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(parseInt(e.target.value) || 0)}
              className="col-span-3"
            />
            <span className="col-span-1 text-muted-foreground">minutes</span>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">
              Winner
            </Label>
            <div className="col-span-3 flex gap-4">
              <Button
                variant="ghost"
                className={cn(
                  "flex flex-col items-center gap-2 p-2 rounded-lg transition-all",
                  winner === "Aleksej" ? "ring-2 ring-primary bg-primary/10" : "hover:bg-secondary"
                )}
                onClick={() => setWinner("Aleksej")}
              >
                <img src={aleksejAvatarUrl} alt="Aleksej" className="w-12 h-12 rounded-full object-cover" />
                <span className="text-sm font-medium">Aleksej</span>
              </Button>
              <Button
                variant="ghost"
                className={cn(
                  "flex flex-col items-center gap-2 p-2 rounded-lg transition-all",
                  winner === "Andreas" ? "ring-2 ring-primary bg-primary/10" : "hover:bg-secondary"
                )}
                onClick={() => setWinner("Andreas")}
              >
                <img src={andreasAvatarUrl} alt="Andreas" className="w-12 h-12 rounded-full object-cover" />
                <span className="text-sm font-medium">Andreas</span>
              </Button>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Log Game</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}