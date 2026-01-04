import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface EditDurationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newDurationMinutes: number) => void;
  currentDurationSeconds: number;
  activityName: string;
}

export function EditDurationDialog({
  isOpen,
  onClose,
  onSave,
  currentDurationSeconds,
  activityName,
}: EditDurationDialogProps) {
  const [newDurationMinutes, setNewDurationMinutes] = useState<number>(0);

  useEffect(() => {
    if (isOpen) {
      setNewDurationMinutes(Math.round(currentDurationSeconds / 60));
    }
  }, [isOpen, currentDurationSeconds]);

  const handleSave = () => {
    if (newDurationMinutes >= 0) {
      onSave(newDurationMinutes);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit {activityName} Duration</DialogTitle>
          <DialogDescription>
            Adjust the total duration for this {activityName.toLowerCase()} in minutes.
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
              min={0}
              value={newDurationMinutes}
              onChange={(e) => setNewDurationMinutes(parseInt(e.target.value) || 0)}
              className="col-span-3"
            />
            <span className="col-span-1 text-muted-foreground">minutes</span>
          </div>
        </div>
        <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}