import Link from "next/link";
import { notFound } from "next/navigation";
import RoadmapMap from "@/components/RoadmapMap";
import { trackById, tracks } from "@/content/tracks";

export function generateStaticParams() {
  return tracks.map((t) => ({ lang: t.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const t = trackById((await params).lang);
  return { title: t ? `مسار ${t.name} — فاهم` : "فاهم" };
}

export default async function TrackPage({ params }: { params: Promise<{ lang: string }> }) {
  const track = trackById((await params).lang);
  if (!track) notFound();
  return (
    <main className="mx-auto max-w-4xl px-4 pb-24 pt-10">
      <Link href="/tracks" className="text-sm text-muted hover:text-accent">مسارات اللغات</Link>
      <h1 className="mt-1 text-3xl font-bold md:text-4xl">
        مسار <span className="code" style={{ color: track.color }}>{track.name}</span>
      </h1>
      <p className="mt-2 max-w-2xl leading-8 text-muted">{track.tagline}. من الأساسيات إلى الاحتراف، وكل مستوى ينتهي بمشروع وشهادة.</p>
      <div className="mt-10">
        <RoadmapMap stages={track.levels} certBase={`/tracks/${track.id}/certificate/`} unit="المستوى" />
      </div>
    </main>
  );
}
