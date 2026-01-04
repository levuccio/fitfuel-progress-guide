import { useMemo, useCallback } from "react";
import { useWorkoutData } from "@/hooks/useWorkoutData";
import { useActivityData } from "@/hooks/useActivityData";
import { StatCircle } from "@/components/StatCircle";
import { CalendarDays, Activity, Timer, Clock, Gamepad, Dumbbell, Bike } from "lucide-react";
import { isAfter, startOfWeek, endOfWeek } from "date-fns";
import { formatDurationShort } from "@/lib/utils";

export default function StatisticsPage() {
  const { sessions } = useWorkoutData();
  const { activityLogs, squashGames } = useActivityData();

  const completedSessions = sessions.filter(s => s.status === "completed");

  // Combine all durations for total time calculations
  const allDurationsInSeconds = useMemo(() => {
    return [
      ...completedSessions.map(s => s.totalDuration || 0),
      ...activityLogs.map(log => log.durationMinutes * 60),
      ...squashGames.map(game => game.durationMinutes * 60),
    ];
  }, [completedSessions, activityLogs, squashGames]);

  const totalWorkoutTimeOverallSeconds = useMemo(() => 
    allDurationsInSeconds.reduce((acc, duration) => acc + duration, 0),
    [allDurationsInSeconds]
  );
  const totalWorkoutTimeOverall = useMemo(() => 
    formatDurationShort(totalWorkoutTimeOverallSeconds),
    [totalWorkoutTimeOverallSeconds]
  );

  const getActivitiesThisWeek = useCallback((activities: { date: string; durationMinutes: number }[]) => {
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
    return activities.filter(activity => {
      const activityDate = new Date(activity.date);
      return isAfter(activityDate, weekStart) && isAfter(weekEnd, activityDate);
    });
  }, []);

  const sessionsThisWeekCount = useMemo(() => completedSessions.filter(session => {
    const sessionDate = new Date(session.startTime);
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
    return isAfter(sessionDate, weekStart) && isAfter(weekEnd, sessionDate);
  }).length, [completedSessions]);

  const activitiesThisWeekCount = useMemo(() => 
    getActivitiesThisWeek(activityLogs).length + getActivitiesThisWeek(squashGames).length,
    [activityLogs, squashGames, getActivitiesThisWeek]
  );
  const totalActivitiesThisWeek = sessionsThisWeekCount + activitiesThisWeekCount;

  const totalSessionsAndActivities = useMemo(() => 
    completedSessions.length + activityLogs.length + squashGames.length,
    [completedSessions, activityLogs, squashGames]
  );

  const totalWorkoutTimeThisWeekSeconds = useMemo(() => {
    const workoutTime = getActivitiesThisWeek(completedSessions.map(s => ({ date: s.startTime, durationMinutes: (s.totalDuration || 0) / 60 })))
      .reduce((acc, s) => acc + s.durationMinutes * 60, 0);
    const activityTime = getActivitiesThisWeek(activityLogs).reduce((acc, log) => acc + log.durationMinutes * 60, 0);
    const squashTime = getActivitiesThisWeek(squashGames).reduce((acc, game) => acc + game.durationMinutes * 60, 0);
    return workoutTime + activityTime + squashTime;
  }, [completedSessions, activityLogs, squashGames, getActivitiesThisWeek]);

  const totalWorkoutTimeThisWeek = useMemo(() => 
    formatDurationShort(totalWorkoutTimeThisWeekSeconds),
    [totalWorkoutTimeThisWeekSeconds]
  );

  const aleksejWins = useMemo(() => squashGames.filter(game => game.winner === "Aleksej").length, [squashGames]);
  const andreasWins = useMemo(() => squashGames.filter(game => game.winner === "Andreas").length, [squashGames]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Statistics</h1>
        <p className="text-muted-foreground">Your fitness journey at a glance</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
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
              icon={Gamepad}
              colorClass="bg-red-500/10 text-red-500"
            />
            <StatCircle
              value={aleksejWins}
              label="Aleksej Wins"
              icon={Gamepad}
              colorClass="bg-indigo-500/10 text-indigo-500"
            />
            <StatCircle
              value={andreasWins}
              label="Andreas Wins"
              icon={Gamepad}
              colorClass="bg-yellow-500/10 text-yellow-500"
            />
          </>
        )}
        {activityLogs.filter(log => log.type === "cycling").length > 0 && (
          <StatCircle
            value={activityLogs.filter(log => log.type === "cycling").length}
            label="Cycling Sessions"
            icon={Bike}
            colorClass="bg-cyan-500/10 text-cyan-500"
          />
        )}
        {completedSessions.length > 0 && (
          <StatCircle
            value={completedSessions.length}
            label="Workouts Completed"
            icon={Dumbbell}
            colorClass="bg-primary/10 text-primary"
          />
        )}
      </div>
    </div>
  );
}