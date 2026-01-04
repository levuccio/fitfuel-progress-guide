import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Play, Clock, Dumbbell, MoreVertical, Pencil, Trash2, CalendarDays, Activity, Timer, Bike, Squash } from "lucide-react"; // Changed Tennis to Squash
import { useWorkoutData } from "@/hooks/useWorkoutData";
import { useActivityData } from "@/hooks/useActivityData";
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
import { formatDurationShort } from "@/lib/utils";
import { LogActivityDialog } from "@/components/activity/LogActivityDialog";
import { LogSquashDialog } from "@/components/activity/LogSquashDialog";

export default function WorkoutsPage() {
  const navigate = useNavigate();
  const { templates, activeSession, deleteTemplate, resumeSession, discardSession, updateTemplateOrder, sessions } = useWorkoutData();
  const { activityLogs, squashGames, addActivityLog, addSquashGame } = useActivityData();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<WorkoutTemplate | null>(null);
  const [isLogActivityDialogOpen, setIsLogActivityDialogOpen] = useState(false);
  const [activityTypeToLog, setActivityTypeToLog] = useState<"cycling" | "other">("cycling");
  const [isLogSquashDialogOpen, setIsLogSquashDialogOpen] = useState(false);

  const completedSessions = sessions.filter(s => s.status === "completed");

  // Combine all durations for total time calculations
  const allDurationsInSeconds = [
    ...completedSessions.map(s => s.totalDuration || 0),
    ...activityLogs.map(log => log.durationMinutes * 60),
    ...squashGames.map(game => game.durationMinutes * 60),
  ];

  const totalWorkoutTimeOverallSeconds = allDurationsInSeconds.reduce((acc, duration) => acc + duration, 0);
  const totalWorkoutTimeOverall = formatDurationShort(totalWorkoutTimeOverallSeconds);

  const getActivitiesThisWeek = (activities: { date: string; durationMinutes: number }[]) => {
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
    return activities.filter(activity => {
      const activityDate = new Date(activity.date);
      return isAfter(activityDate, weekStart) && isAfter(weekEnd, activityDate);
    });
  };

  const sessionsThisWeekCount = completedSessions.filter(session => {
    const sessionDate = new Date(session.startTime);
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
    return isAfter(sessionDate, weekStart) && isAfter(weekEnd, sessionDate);
  }).length;

  const activitiesThisWeekCount = getActivitiesThisWeek(activityLogs).length + getActivitiesThisWeek(squashGames).length;
  const totalActivitiesThisWeek = sessionsThisWeekCount + activitiesThisWeekCount;

  const totalSessionsAndActivities = completedSessions.length + activityLogs.length + squashGames.length;

  const totalWorkoutTimeThisWeekSeconds = getActivitiesThisWeek(completedSessions.map(s => ({ date: s.startTime, durationMinutes: (s.totalDuration || 0) / 60 })))
    .reduce((acc, s) => acc + s.durationMinutes * 60, 0) +
    getActivitiesThisWeek(activityLogs).reduce((acc, log) => acc + log.durationMinutes * 60, 0) +
    getActivitiesThisWeek(squashGames).reduce((acc, game) => acc + game.durationMinutes * 60, 0);
  const totalWorkoutTimeThisWeek = formatDurationShort(totalWorkoutTimeThisWeekSeconds);

  const aleksejWins = squashGames.filter(game => game.winner === "Aleksej").length;
  const andreasWins = squashGames.filter(game => game.winner === "Andreas").length;

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

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) {
      return;
    }

    const reorderedTemplates = Array.from(templates);
    const [removed] = reorderedTemplates.splice(result.source.index, 1);
    reorderedTemplates.splice(result.destination.index, 0, removed);

    updateTemplateOrder(reorderedTemplates);
  };

  const handleLogCycling = (durationMinutes: number) => {
    addActivityLog({
      id: crypto.randomUUID(),
      type: "cycling",
      durationMinutes,
      date: new Date().toISOString(),
    });
  };

  const handleLogSquash = (durationMinutes: number, winner: "Aleksej" | "Andreas") => {
    addSquashGame({
      id: crypto.randomUUID(),
      durationMinutes,
      winner,
      player1: "Aleksej",
      player2: "Andreas",
      date: new Date().toISOString(),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center">
            <Dumbbell className="inline-block h-7 w-7 mr-2 text-primary" />
            FitGutta
          </h1>
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

      <div className="grid grid-cols-2 gap-4">
        {/* Cycling Card */}
        <Card
          className="glass-card group hover:border-primary/50 transition-all cursor-pointer"
          onClick={() => {
            setActivityTypeToLog("cycling");
            setIsLogActivityDialogOpen(true);
          }}
        >
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
            <div className="space-y-1">
              <CardTitle className="text-lg flex items-center gap-2">
                Cycling
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Bike className="h-4 w-4" />
                <span>Log your cycling session</span>
              </div>
            </div>
            <Button className="w-full gap-2">
              <Plus className="h-4 w-4" />
              Log Cycling
            </Button>
          </CardContent>
        </Card>

        {/* Squash Card */}
        <Card
          className="glass-card group hover:border-primary/50 transition-all cursor-pointer"
          onClick={() => setIsLogSquashDialogOpen(true)}
        >
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
            <div className="space-y-1">
              <CardTitle className="text-lg flex items-center gap-2">
                Squash
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Squash className="h-4 w-4" /> {/* Changed Tennis to Squash */}
                <span>Log your squash game</span>
              </div>
            </div>
            <Button className="w-full gap-2">
              <Plus className="h-4 w-4" />
              Log Squash
            </Button>
          </CardContent>
        </Card>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="templates">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="grid grid-cols-2 gap-4"
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

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
        <StatCircle
          value={totalActivitiesThisWeek}
          label="Activities this week"
          icon={CalendarDays}
          colorClass="bg-blue-500/10 text-blue-500"
        />
        <StatCircle
          value={totalSessionsAndActivities}
          label="Total activities"
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
        {squashGames.length > 0 && (
          <>
            <StatCircle
              value={squashGames.length}
              label="Squash Games"
              icon={Squash} // Changed Tennis to Squash
              colorClass="bg-red-500/10 text-red-500"
            />
            <StatCircle
              value={aleksejWins}
              label="Aleksej Wins"
              icon={Squash} // Changed Tennis to Squash
              colorClass="bg-indigo-500/10 text-indigo-500"
            />
            <StatCircle
              value={andreasWins}
              label="Andreas Wins"
              icon={Squash} // Changed Tennis to Squash
              colorClass="bg-yellow-500/10 text-yellow-500"
            />
          </>
        )}
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

      <LogActivityDialog
        isOpen={isLogActivityDialogOpen}
        onClose={() => setIsLogActivityDialogOpen(false)}
        onSave={handleLogCycling}
        activityType="Cycling"
      />

      <LogSquashDialog
        isOpen={isLogSquashDialogOpen}
        onClose={() => setIsLogSquashDialogOpen(false)}
        onSave={handleLogSquash}
      />
    </div>
  );
}