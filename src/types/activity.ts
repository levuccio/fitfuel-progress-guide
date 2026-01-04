export interface ActivityLog {
  id: string;
  type: "cycling" | "other"; // Extend with more types as needed
  durationMinutes: number;
  date: string; // ISO string
}

export interface SquashGame {
  id: string;
  durationMinutes: number;
  winner: "Aleksej" | "Andreas";
  player1: "Aleksej";
  player2: "Andreas";
  date: string; // ISO string
}

export interface ActivityData {
  activityLogs: ActivityLog[];
  squashGames: SquashGame[];
}