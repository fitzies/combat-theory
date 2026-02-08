import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import { readFileSync } from "fs";
import { resolve } from "path";

// ── Types ──────────────────────────────────────────────────────────────────────

type InstructorInput = {
  name: string;
  bio?: string;
  imageUrl?: string;
  subscriptionPrice: number;
  disciplines: string[];
};

// ── Main ───────────────────────────────────────────────────────────────────────

async function main() {
  const jsonPath = process.argv[2];
  if (!jsonPath) {
    console.error("Usage: npm run upload-instructor -- ./path/to/instructor.json");
    process.exit(1);
  }

  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!convexUrl) {
    console.error("Missing NEXT_PUBLIC_CONVEX_URL in environment");
    process.exit(1);
  }

  const raw = readFileSync(resolve(jsonPath), "utf-8");
  const instructor: InstructorInput = JSON.parse(raw);

  console.log(`\n🥋 Creating instructor: "${instructor.name}"\n`);

  const convex = new ConvexHttpClient(convexUrl);

  const instructorId = await convex.mutation(api.instructors.createInstructor, {
    name: instructor.name,
    bio: instructor.bio,
    imageUrl: instructor.imageUrl,
    subscriptionPrice: instructor.subscriptionPrice,
    disciplines: instructor.disciplines,
  });

  console.log(`✅ Instructor created! ID: ${instructorId}`);
  console.log(`\n🎉 Done! "${instructor.name}" is now on Fight Meta.\n`);
}

main().catch((err) => {
  console.error("❌ Error:", err.message ?? err);
  process.exit(1);
});
