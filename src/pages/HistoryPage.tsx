import { useWorkoutData } from "@/hooks/useWorkoutData";
import { useActivityData } from "@/hooks/useActivityData";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { formatDistanceToNow, format } from "date-fns";
import { Clock, CheckCircle, XCircle, Dumbbell, Pencil, Trash2, Bike, Gamepad } from "lucide-react";
import { formatDurationShort } from "@/lib/utils";
import { useState, useMemo } from "react";
import { EditDurationDialog } from "@/components/EditDurationDialog";
import { SessionDetailsDialog } from "@/components/workout/SessionDetailsDialog";
import { WorkoutSession } from "@/types/workout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StrengthAnalyticsTab } from "@/components/strength/StrengthAnalyticsTab";

type HistoryEntry = {
  id: string;
  type: "workout" | "cycling" | "squash";
  date: string;
  durationSeconds: number;
  name: string;
  details?: string;
  status?: "completed" | "paused" | "discarded";
  completedSets?: number;
  totalSets?: number;
  winner?: "Aleksej" | "Andreas";
  originalSession?: WorkoutSession;
};

export default function HistoryPage() {
  const { sessions, updateSessionDuration, deleteSession, updateSession, getLastSessionData } = useWorkoutData();
  const {
    activityLogs,
    squashGames,
    updateActivityLogDuration,
    deleteActivityLog,
    updateSquashGameDuration,
    deleteSquashGame,
  } = useActivityData();

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<HistoryEntry | null>(null);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingEntry, setDeletingEntry] = useState<HistoryEntry | null>(null);

  const [isSessionDetailsDialogOpen, setIsSessionDetailsDialogOpen] = useState(false);
  const [sessionToEdit, setSessionToEdit] = useState<WorkoutSession | null>(null);

  const allHistoryEntries = useMemo(() => {
    const workoutEntries: HistoryEntry[] = sessions
      .filter((s) => s.status === "completed")
      .map((session) => {
        const completedSets = session.exercises.reduce(
          (acc, ex) => acc + ex.sets.filter((s2) => s2.completed).length,
          0
        );
        const totalSets = session.exercises.reduce((acc, ex) => acc + ex.sets.length, 0);
        return {
          id: session.id,
          type: "workout",
          date: session.startTime,
          durationSeconds: session.totalDuration || 0,
          name: session.templateName,
          status: session.status,
          completedSets,
          totalSets,
          originalSession: session,
        };
      });

    const cyclingEntries: HistoryEntry[] = activityLogs.map((log) => ({
      id: log.id,
      type: "cycling",
      date: log.date,
      durationSeconds: log.durationMinutes * 60,
      name: "Cycling Session",
      details: "Outdoor ride",
    }));

    const squashEntries: HistoryEntry[] = squashGames.map((game) => ({
      id: game.id,
      type: "squash",
      date: game.date,
      durationSeconds: game.durationMinutes * 60,
      name: "Squash Game",
      winner: game.winner,
      details: `${game.player1} vs ${game.player2}`,
    }));

    const combinedEntries = [...workoutEntries, ...cyclingEntries, ...squashEntries];

    return combinedEntries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [sessions, activityLogs, squashGames]);

  const handleEditDuration = (entry: HistoryEntry) => {
    setEditingEntry(entry);
    setIsEditDialogOpen(true);
  };

  const handleSaveDuration = (newDurationMinutes: number) => {
    if (!editingEntry) return;
    const newDurationSeconds = newDurationMinutes * 60;

    switch (editingEntry.type) {
      case "workout":
        updateSessionDuration(editingEntry.id, newDurationSeconds);
        break;
      case "cycling":
        updateActivityLogDuration(editingEntry.id, newDurationMinutes);
        break;
      case "squash":
        updateSquashGameDuration(editingEntry.id, newDurationMinutes);
        break;
    }
    setIsEditDialogOpen(false);
    setEditingEntry(null);
  };

  const handleDeleteEntry = (entry: HistoryEntry) => {
    setDeletingEntry(entry);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (!deletingEntry) return;

    switch (deletingEntry.type) {
      case "workout":
        if (deletingEntry.originalSession) {
          deleteSession(deletingEntry.originalSession);
        }
        break;
      case "cycling":
        deleteActivityLog(deletingEntry.id);
        break;
      case "squash":
        deleteSquashGame(deletingEntry.id);
        break;
    }
    setIsDeleteDialogOpen(false);
    setDeletingEntry(null);
  };

  const handleEditSession = (session: WorkoutSession) => {
    setSessionToEdit(session);
    setIsSessionDetailsDialogOpen(true);
  };

  const handleSaveSessionChanges = (updatedSession: WorkoutSession) => {
    updateSession(updatedSession);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">History & Progress</h1>
        <p className="text-muted-foreground">{allHistoryEntries.length} activities logged</p>
      </div>

      <Tabs defaultValue="history" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="strength">Strength</TabsTrigger>
        </TabsList>
        
        <TabsContent value="history" className="space-y-4">
          {allHistoryEntries.length === 0 ? (
             <div className="flex flex-col items-center justify-center py-16 text-center">
               <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                 <Dumbbell className="w-8 h-8 text-muted-foreground" />
               </div>
               <h3 className="text-lg font-semibold text-foreground mb-2">No activities yet</h3>
               <p className="text-muted-foreground max-w-sm">
                 Complete your first workout or log an activity, and it will show up here.
               </p>
             </div>
          ) : (
             <div className="space-y-3">
               {allHistoryEntries.map((entry) => (
                 <Card key={entry.id} className="glass-card">
                   <CardContent className="p-4">
                     <div className="flex items-start justify-between">
                       <div className="space-y-1">
                         <h3 className="font-semibold text-foreground flex items-center gap-2">
                           {entry.type === "workout" && <Dumbbell className="h-5 w-5 text-primary" />}
                           {entry.type === "cycling" && <Bike className="h-5 w-5 text-blue-500" />}
                           {entry.type === "squash" && <Gamepad className="h-5 w-5 text-red-500" />}
                           {entry.name}
                         </h3>
                         <p className="text-sm text-muted-foreground">
                           {format(new Date(entry.date), "EEEE, MMM d 'at' h:mm a")}
                         </p>
                       </div>
                       <span className="text-xs text-muted-foreground">
                         {formatDistanceToNow(new Date(entry.date), { addSuffix: true })}
                       </span>
                     </div>

                     <div className="flex items-center gap-4 mt-3 text-sm">
                       <div className="flex items-center gap-1.5 text-muted-foreground">
                         <Clock className="h-4 w-4" />
                         <span>{formatDurationShort(entry.durationSeconds)}</span>
                         <Button
                           variant="ghost"
                           size="icon"
                           className="h-6 w-6"
                           onClick={() => handleEditDuration(entry)}
                         >
                           <Pencil className="h-3 w-3" />
                         </Button>
                       </div>

                       {entry.type === "workout" &&
                         entry.completedSets !== undefined &&
                         entry.totalSets !== undefined && (
                           <div className="flex items-center gap-1.5">
                             {entry.completedSets === entry.totalSets ? (
                               <CheckCircle className="h-4 w-4 text-success" />
                             ) : (
                               <XCircle className="h-4 w-4 text-warning" />
                             )}
                             <span
                               className={
                                 entry.completedSets === entry.totalSets ? "text-success" : "text-warning"
                               }
                             >
                               {entry.completedSets}/{entry.totalSets} sets (
                               {Math.round((entry.completedSets / entry.totalSets) * 100)}%)
                             </span>
                           </div>
                         )}

                       {entry.type === "squash" && entry.winner && (
                         <div className="flex items-center gap-1.5 text-muted-foreground">
                           <span>Winner: {entry.winner}</span>
                         </div>
                       )}
                     </div>

                     <div className="mt-3 flex justify-end gap-2">
                       {entry.type === "workout" && entry.originalSession && (
                         <Button
                           variant="outline"
                           size="sm"
                           onClick={() => handleEditSession(entry.originalSession!)}
                         >
                           <Pencil className="h-4 w-4 mr-2" /> Edit Session
                         </Button>
                       )}
                       <Button
                         variant="ghost"
                         size="icon"
                         className="text-destructive hover:bg-destructive/10"
                         onClick={() => handleDeleteEntry(entry)}
                       >
                         <Trash2 className="h-4 w-4" />
                       </Button>
                     </div>
                   </CardContent>
                 </Card>
               ))}
             </div>
          )}
        </TabsContent>
        
        <TabsContent value="strength">
           <StrengthAnalyticsTab />
        </TabsContent>
      </Tabs>

      {editingEntry && (
        <EditDurationDialog
          isOpen={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
          onSave={handleSaveDuration}
          currentDurationSeconds={editingEntry.durationSeconds}
          activityName={editingEntry.name}
        />
      )}

      {sessionToEdit && (
        <SessionDetailsDialog
          isOpen={isSessionDetailsDialogOpen}
          onClose={() => setIsSessionDetailsDialogOpen(false)}
          session={sessionToEdit}
          onSave={handleSaveSessionChanges}
          lastSessionData={getLastSessionData(sessionToEdit.templateId)}
        />
      )}

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deletingEntry?.name}</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this {deletingEntry?.type} entry? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
