import { notFound } from "next/navigation";
import CertificateView from "@/components/CertificateView";
import { stages } from "@/content/roadmap";

export function generateStaticParams() {
  return stages.map((s) => ({ stage: String(s.id) }));
}

export const metadata = { title: "الشهادة — فاهم" };

export default async function CertificatePage({ params }: { params: Promise<{ stage: string }> }) {
  const { stage: id } = await params;
  const stage = stages.find((s) => String(s.id) === id);
  if (!stage) notFound();
  return (
    <main className="mx-auto max-w-4xl px-4 pb-24 pt-10">
      <h1 className="mb-6 text-3xl font-bold print:hidden">شهادة المرحلة {stage.id}</h1>
      <CertificateView stage={stage} />
    </main>
  );
}
