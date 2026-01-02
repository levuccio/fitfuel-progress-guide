import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Play, Clock, Dumbbell, MoreVertical, Pencil, Trash2, CalendarDays, Activity, Timer } from "lucide-react";
import { useWorkoutData } from "@/hooks/useWorkoutData";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { PausedSessionBanner } from "@/components/workout/PausedSessionBanner";
import { WorkoutTemplate } from "@/types/workout";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";
import { StatCircle } from "@/components/StatCircle";
import { isAfter, startOfWeek, endOfWeek } from "date-fns";

export default function WorkoutsPage() {
  const navigate = useNavigate();
  const { templates, activeSession, deleteTemplate, resumeSession, discardSession, updateTemplateOrder, sessions } = useWorkoutData();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<WorkoutTemplate | null>(null);

  const completedSessions = sessions.filter(s => s.status === "completed");

  const formatDurationShort = (totalSeconds: number) => {
    if (totalSeconds < 60) return `${totalSeconds}s`;
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const sessionsThisWeek = completedSessions.filter(session => {
    const sessionDate = new Date(session.startTime);
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 }); // Monday as start of week
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 }); // Sunday as end of week
    return isAfter(sessionDate, weekStart) && isAfter(weekEnd, sessionDate);
  }).length;

  const totalSessions = completedSessions.length;

  const totalWorkoutTimeThisWeekSeconds = completedSessions
    .filter(session => {
      const sessionDate = new Date(session.startTime);
      const now = new Date();
      const weekStart = startOfWeek(now, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
      return isAfter(sessionDate, weekStart) && isAfter(weekEnd, sessionDate);
    })
    .reduce((acc, session) => acc + (session.totalDuration || 0), 0);
  const totalWorkoutTimeThisWeek = formatDurationShort(totalWorkoutTimeThisWeekSeconds);

  const totalWorkoutTimeOverallSeconds = completedSessions.reduce(
    (acc, session) => acc + (session.totalDuration || 0),
    0
  );
  const totalWorkoutTimeOverall = formatDurationShort(totalWorkoutTimeOverallSeconds);


  const handleStartWorkout = (templateId: string) => {
    navigate(`/workout/${templateId}`);
  };

  const handleDeleteTemplate = (template: WorkoutTemplate) => {
    setTemplateToDelete(template);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (templateToDelete) {
      deleteTemplate(templateToDelete.id);
      setTemplateToDelete(null);
    }
    setDeleteDialogOpen(false);
  };

  const getTotalSets = (template: WorkoutTemplate) => {
    return template.exercises.reduce((acc, ex) => acc + ex.sets, 0);
  };

  const getEstimatedTime = (template: WorkoutTemplate) => {
    const totalRestSeconds = template.exercises.reduce(
      (acc, ex) => acc + (ex.sets * ex.restSeconds),
      0
    );
    const workingTime = template.exercises.length * 3 * 60; // ~3 min per exercise
    const totalMinutes = Math.round((totalRestSeconds + workingTime) / 60);
    return totalMinutes;
  };

  // Handle drag end for reordering
  const onDragEnd = (result: DropResult) => {
    if (!result.destination) {
      return;
    }

    const reorderedTemplates = Array.from(templates);
    const [removed] = reorderedTemplates.splice(result.source.index, 1);
    reorderedTemplates.splice(result.destination.index, 0, removed);

    updateTemplateOrder(reorderedTemplates);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Workouts</h1>
          <p className="text-muted-foreground">Choose a workout to start training</p>
        </div>
        <Button onClick={() => navigate("/template/new")} className="gap-2">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">New Template</span>
        </Button>
      </div>

      {activeSession && (
        <PausedSessionBanner
          session={activeSession}
          onContinue={() => {
            resumeSession();
            navigate(`/workout/${activeSession.templateId}`);
          }}
          onDiscard={discardSession}
        />
      )}

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="templates">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="grid gap-4 sm:grid-cols-2"
            >
              {templates.map((template, index) => (
                <Draggable key={template.id} draggableId={template.id} index={index}>
                  {(provided, snapshot) => (
                    <Card
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={`glass-card group hover:border-primary/50 transition-all ${
                        snapshot.isDragging ? "shadow-xl ring-2 ring-primary" : ""
                      }`}
                    >
                      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                        <div className="space-y-1">
                          {template.dayOfWeek && (
                            <span className="text-xs font-medium text-primary uppercase tracking-wide">
                              {template.dayOfWeek}
                            </span>
                          )}
                          <CardTitle className="text-lg flex items-center gap-2">
                            {template.name}
                            {template.isCustom && (
                              <span className="text-xs font-normal text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                                Custom
                              </span>
                            )}
                          </CardTitle>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => navigate(`/template/${template.id}/edit`)}>
                              <Pencil className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteTemplate(template)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <Dumbbell className="h-4 w-4" />
                            <span>{template.exercises.length} exercises</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span>{getTotalSets(template)} sets</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Clock className="h-4 w-4" />
                            <span>~{getEstimatedTime(template)} min</span>
                          </div>
                        </div>
                        <Button
                          onClick={() => handleStartWorkout(template.id)}
                          className="w-full gap-2"
                          disabled={!!activeSession}
                        >
                          <Play className="h-4 w-4" />
                          Start Workout
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6"> {/* Changed grid-cols-2 to sm:grid-cols-4 */}
        <StatCircle
          value={sessionsThisWeek}
          label="Workouts this week"
          icon={CalendarDays}
          colorClass="bg-blue-500/10 text-blue-500"
        />
        <StatCircle
          value={totalSessions}
          label="Total workouts"
          icon={Activity}
          colorClass="bg-purple-500/10 text-purple-500"
        />
        <StatCircle
          value={totalWorkoutTimeThisWeek}
          label="Time this week"
          icon={Timer}
          colorClass="bg-green-500/10 text-green-500"
        />
        <StatCircle
          value={totalWorkoutTimeOverall}
          label="Total time"
          icon={Clock}
          colorClass="bg-orange-500/10 text-orange-500"
        />
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Template</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{templateToDelete?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}