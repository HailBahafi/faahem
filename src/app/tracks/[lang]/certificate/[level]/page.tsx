import { notFound } from "next/navigation";
import CertificateView from "@/components/CertificateView";
import { LEVEL_NAMES, trackById, tracks } from "@/content/tracks";

export function generateStaticParams() {
  return tracks.flatMap((t) => t.levels.map((l) => ({ lang: t.id, level: String(l.id) })));
}

export const metadata = { title: "الشهادة — فاهم" };

export default async function TrackCertificatePage({ params }: { params: Promise<{ lang: string; level: string }> }) {
  const { lang, level: id } = await params;
  const track = trackById(lang);
  const level = track?.levels.find((l) => String(l.id) === id);
  if (!track || !level) notFound();
  return (
    <main className="mx-auto max-w-4xl px-4 pb-24 pt-10">
      <h1 className="mb-6 text-3xl font-bold print:hidden">
        شهادة {track.name}: {LEVEL_NAMES[level.id]}
      </h1>
      <CertificateView
        stage={level}
        what={`مستوى «${LEVEL_NAMES[level.id]}» في مسار ${track.name}`}
        footer={`${track.name} · المستوى ${level.id} من 4`}
      />
    </main>
  );
}
