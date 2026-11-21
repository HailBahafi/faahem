"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PUBLISHED_LESSONS, STAGE_PROJECTS } from "@/content/published";
import { lessonTitle, type Stage } from "@/content/roadmap";
import { useAccount } from "@/lib/account";
import { useProgress } from "@/lib/progress";
import { Logo } from "./Header";
import { projectKey } from "./ProjectView";

/** What a stage requires: its published lessons, plus its project when one exists. */
export function stageRequirements(stage: Stage) {
  const lessonSlugs = stage.lessons.map((l) => l.slug).filter((s) => PUBLISHED_LESSONS.has(s));
  const project = STAGE_PROJECTS[stage.key ?? String(stage.id)];
  return { lessonSlugs, project };
}

export function stageComplete(stage: Stage, completed: string[]) {
  const { lessonSlugs, project } = stageRequirements(stage);
  if (!lessonSlugs.length) return false;
  return lessonSlugs.every((s) => completed.includes(s)) && (!project || completed.includes(projectKey(project.slug)));
}

/** `what` names the achievement ("المرحلة 3 «الأدوات»"); `footer` replaces "المرحلة 3 من 12". */
export default function CertificateView({ stage, what, footer }: { stage: Stage; what?: string; footer?: string }) {
  const { progress } = useProgress();
  const account = useAccount();
  const [name, setName] = useState("");
  useEffect(() => {
    if (account?.user && !name) setName(account.user.name);
  }, [account, name]);

  const { lessonSlugs, project } = stageRequirements(stage);
  const done = stageComplete(stage, progress.completed);
  const missing = lessonSlugs.filter((s) => !progress.completed.includes(s));
  const date = new Intl.DateTimeFormat("ar-SA-u-ca-gregory", { dateStyle: "long" }).format(new Date());

  if (!done) {
    return (
      <div className="rounded-2xl border border-line bg-surface p-6 leading-8">
        <h2 className="text-xl font-bold">لم تكتمل المرحلة بعد</h2>
        <p className="mt-2 text-muted">الشهادة تظهر عندما تجتاز اختبار كل دروس المرحلة{project ? " وتنجز مشروعها" : ""}.</p>
        <ul className="mt-4 space-y-1">
          {missing.map((s) => (
            <li key={s}>
              <Link className="text-accent hover:underline" href={`/learn/${s}`}>{lessonTitle(s)}</Link>
            </li>
          ))}
          {project && !progress.completed.includes(projectKey(project.slug)) && (
            <li>
              <Link className="text-accent hover:underline" href={`/project/${project.slug}`}>مشروع: {project.title}</Link>
            </li>
          )}
        </ul>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end gap-3 print:hidden">
        <label className="flex-1">
          <span className="mb-1 block text-sm text-muted">الاسم كما سيظهر في الشهادة</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border border-line bg-surface-2 px-4 py-2.5 outline-none focus:border-accent"
          />
        </label>
        <button onClick={() => window.print()} className="rounded-xl bg-accent px-5 py-2.5 font-semibold text-accent-fg">
          اطبع أو احفظ PDF
        </button>
      </div>

      <article className="certificate relative overflow-hidden rounded-3xl border-[10px] border-double bg-white p-10 text-center text-[#0f172a] shadow-2xl md:p-16" style={{ borderColor: stage.color }}>
        <div className="absolute inset-x-0 top-0 h-2" style={{ background: stage.color }} />
        <div className="flex justify-center">
          <span className="[&_*]:!text-[#0f172a]"><Logo /></span>
        </div>
        <p className="mt-8 text-sm tracking-[0.3em] text-[#64748b]">شهادة إتمام</p>
        <h2 className="mt-4 text-4xl font-bold md:text-5xl">{name || "اسمك هنا"}</h2>
        <p className="mx-auto mt-6 max-w-xl text-lg leading-9 text-[#334155]">
          أتمّ {what ?? `المرحلة ${stage.id} «${stage.title}»`} في منصة فاهم: {lessonSlugs.length} درساً، شاهد كل مفهوم يتحرك داخل الجهاز، وطبّقه، واجتاز اختبار الفهم في كل درس
          {project ? `، وأنجز مشروع «${project.title}»` : ""}.
        </p>
        <p className="mt-2 text-[#64748b]">{stage.goal}</p>
        <div className="mx-auto mt-10 flex max-w-md items-center justify-between border-t border-[#e2e8f0] pt-4 text-sm text-[#64748b]">
          <span>{date}</span>
          <span className="font-semibold" style={{ color: stage.color }}>
            {footer ?? `المرحلة ${stage.id} من 12`}
          </span>
        </div>
      </article>
    </div>
  );
}
