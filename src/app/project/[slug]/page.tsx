import { notFound } from "next/navigation";
import ProjectView from "@/components/ProjectView";
import { projects } from "@/content/projects";

export function generateStaticParams() {
  return Object.keys(projects).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return { title: projects[slug] ? `${projects[slug].title} — فاهم` : "فاهم" };
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = projects[slug];
  if (!project) notFound();
  return <ProjectView project={project} />;
}
