// Measures retrieval quality on data/eval/questions.json.
// A question is a hit when a chunk from a document on its topic ranks in the top K.
// Usage: npx tsx scripts/eval-retrieval.ts [--k 5] [--min-hit-rate 0.8]
import { readFileSync } from "node:fs";
import { searchChunks } from "../src/lib/retrieval";

type Question = { id: string; topic: string; question: string };

const args = process.argv.slice(2);
const flag = (name: string, fallback: number) =>
  args.includes(name) ? Number(args[args.indexOf(name) + 1]) : fallback;
const k = flag("--k", 5);
const minHitRate = flag("--min-hit-rate", 0);

async function main() {
  const questions = JSON.parse(readFileSync("data/eval/questions.json", "utf8")) as Question[];
  let hits = 0;
  let reciprocalRankSum = 0;
  const misses: string[] = [];

  for (const q of questions) {
    const results = (await searchChunks(q.question, 20)).slice(0, k);
    const rank = results.findIndex((r) => r.document.topic === q.topic);
    if (rank >= 0) {
      hits++;
      reciprocalRankSum += 1 / (rank + 1);
    } else {
      misses.push(`${q.id}: ${q.question} -> ${results[0]?.document.topic ?? "no results"}`);
    }
  }

  const hitRate = hits / questions.length;
  console.log(`Hit rate @${k}: ${(hitRate * 100).toFixed(1)}% (${hits}/${questions.length})`);
  console.log(`MRR @${k}: ${(reciprocalRankSum / questions.length).toFixed(3)}`);
  if (misses.length) console.log(`Misses:\n  ${misses.join("\n  ")}`);
  if (hitRate < minHitRate) process.exit(1);
}

main();
