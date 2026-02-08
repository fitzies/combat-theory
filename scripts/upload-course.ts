import Mux from "@mux/mux-node";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import { readFileSync, createReadStream, statSync } from "fs";
import { resolve } from "path";

// ── Types ──────────────────────────────────────────────────────────────────────

type SectionInput = {
  title: string;
  durationMinutes: number;
  videoFile?: string;
};

type VolumeInput = {
  name: string;
  durationMinutes: number;
  sections: SectionInput[];
};

type CourseInput = {
  title: string;
  description: string;
  imageUrl?: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  martialArt: "BJJ" | "Boxing" | "MMA";
  instructorId: string;
  duration: string;
  price?: number;
  volumes: VolumeInput[];
};

// ── Helpers ────────────────────────────────────────────────────────────────────

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function uploadToMux(
  mux: Mux,
  filePath: string,
  label: string,
): Promise<string> {
  const absolutePath = resolve(filePath);
  const fileSize = statSync(absolutePath).size;

  console.log(`  ⬆ Uploading "${label}" (${(fileSize / 1024 / 1024).toFixed(1)} MB)...`);

  // Create a direct upload
  const upload = await mux.video.uploads.create({
    cors_origin: "*",
    new_asset_settings: {
      playback_policy: ["public"],
    },
  });

  // Stream the file to the upload URL
  const fileStream = createReadStream(absolutePath);
  const response = await fetch(upload.url, {
    method: "PUT",
    body: fileStream as unknown as BodyInit,
    headers: {
      "Content-Length": fileSize.toString(),
    },
  });

  if (!response.ok) {
    throw new Error(`Upload failed for "${label}": ${response.statusText}`);
  }

  // Poll until the upload has an asset ID
  let assetId: string | undefined;
  for (let i = 0; i < 60; i++) {
    const check = await mux.video.uploads.retrieve(upload.id);
    if (check.asset_id) {
      assetId = check.asset_id;
      break;
    }
    await sleep(2000);
  }

  if (!assetId) {
    throw new Error(`Timed out waiting for asset ID for "${label}"`);
  }

  // Poll until the asset is ready
  console.log(`  ⏳ Processing "${label}"...`);
  for (let i = 0; i < 120; i++) {
    const asset = await mux.video.assets.retrieve(assetId);
    if (asset.status === "ready") {
      const playbackId = asset.playback_ids?.[0]?.id;
      if (!playbackId) throw new Error(`No playback ID for "${label}"`);
      console.log(`  ✅ Ready: "${label}" → ${playbackId}`);
      return playbackId;
    }
    if (asset.status === "errored") {
      throw new Error(`Mux processing errored for "${label}"`);
    }
    await sleep(3000);
  }

  throw new Error(`Timed out waiting for asset to be ready: "${label}"`);
}

// ── Main ───────────────────────────────────────────────────────────────────────

async function main() {
  const jsonPath = process.argv[2];
  if (!jsonPath) {
    console.error("Usage: npm run upload-course -- ./path/to/course.json");
    process.exit(1);
  }

  // Validate env vars
  const muxTokenId = process.env.MUX_TOKEN_ID;
  const muxTokenSecret = process.env.MUX_TOKEN_SECRET;
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

  if (!muxTokenId || !muxTokenSecret) {
    console.error("Missing MUX_TOKEN_ID or MUX_TOKEN_SECRET in environment");
    process.exit(1);
  }
  if (!convexUrl) {
    console.error("Missing NEXT_PUBLIC_CONVEX_URL in environment");
    process.exit(1);
  }

  // Read course metadata
  const raw = readFileSync(resolve(jsonPath), "utf-8");
  const course: CourseInput = JSON.parse(raw);

  console.log(`\n📦 Uploading course: "${course.title}"\n`);

  // Init clients
  const mux = new Mux({
    tokenId: muxTokenId,
    tokenSecret: muxTokenSecret,
  });
  const convex = new ConvexHttpClient(convexUrl);

  // Count total videos
  const totalVideos = course.volumes.reduce(
    (sum, vol) => sum + vol.sections.filter((s) => s.videoFile).length,
    0,
  );
  console.log(`📹 ${totalVideos} videos to upload\n`);

  // Upload videos and build volumes with playback IDs
  let uploaded = 0;
  const volumes = await Promise.all(
    course.volumes.map(async (volume) => {
      const sections = [];
      for (const section of volume.sections) {
        if (section.videoFile) {
          const playbackId = await uploadToMux(
            mux,
            section.videoFile,
            `${volume.name} / ${section.title}`,
          );
          uploaded++;
          console.log(`  [${uploaded}/${totalVideos}] done\n`);
          sections.push({
            title: section.title,
            durationMinutes: section.durationMinutes,
            muxPlaybackId: playbackId,
          });
        } else {
          sections.push({
            title: section.title,
            durationMinutes: section.durationMinutes,
          });
        }
      }
      return {
        name: volume.name,
        durationMinutes: volume.durationMinutes,
        sections,
      };
    }),
  );

  console.log(`\n💾 Creating course in Convex...\n`);

  // Create course in Convex
  const courseId = await convex.mutation(api.courses.createCourse, {
    title: course.title,
    description: course.description,
    imageUrl: course.imageUrl,
    difficulty: course.difficulty,
    martialArt: course.martialArt,
    instructorId: course.instructorId as any,
    duration: course.duration,
    price: course.price,
    volumes,
  });

  console.log(`✅ Course created! ID: ${courseId}`);
  console.log(`\n🎉 Done! "${course.title}" is live.\n`);
}

main().catch((err) => {
  console.error("❌ Error:", err.message ?? err);
  process.exit(1);
});
