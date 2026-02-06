export type Course = {
  id: number;
  title: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  martialArt: "BJJ" | "Boxing" | "MMA";
  teacher: string;
  duration: string;
  free?: boolean; // defaults to false
  createdAt: Date | string;
};
