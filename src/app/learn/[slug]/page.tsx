import { notFound } from "next/navigation";
import LessonView from "@/components/lesson/LessonView";
import { lessons } from "@/content/lessons";

export function generateStaticParams() {
  return Object.keys(lessons).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return { title: lessons[slug] ? `${lessons[slug].title} — فاهم` : "فاهم" };
}

export default async function LessonPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const lesson = lessons[slug];
  if (!lesson) notFound();
  return <LessonView lesson={lesson} />;
}
