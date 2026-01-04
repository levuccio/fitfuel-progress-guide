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

interface LogActivityDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (durationMinutes: number) => void;
  activityType: string;
}

export function LogActivityDialog({
  isOpen,
  onClose,
  onSave,
  activityType,
}: LogActivityDialogProps) {
  const [durationMinutes, setDurationMinutes] = useState<number>(30);

  const handleSave = () => {
    if (durationMinutes > 0) {
      onSave(durationMinutes);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Log {activityType}</DialogTitle>
          <DialogDescription>
            Enter the duration of your {activityType} session in minutes.
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
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Log Activity</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}