import Link from "next/link";
import HeroDemo from "@/components/HeroDemo";

const STEPS = [
  ["المشكلة", "موقف حقيقي يبيّن لماذا تحتاج المفهوم"],
  ["شاهد", "الذاكرة والكود يتحركان سطراً بسطر"],
  ["العب", "تكتب أنت، والرسم يتغيّر أمامك"],
  ["توقّع", "تخمّن النتيجة قبل أن تراها"],
  ["الكود", "نفس الفكرة بست لغات"],
  ["طبّق", "رتّب، أكمل، أصلح، ثم اكتب"],
  ["اختبر", "أسئلة تتبّع، لا أسئلة حفظ"],
];

const LANGS = ["JavaScript", "TypeScript", "Python", "Go", "Dart", "Rust"];

export default function Home() {
  return (
    <main>
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 pb-16 pt-12 md:grid-cols-[1fr_1.2fr] md:pt-20">
        <div>
          <span className="inline-block rounded-full border border-accent/40 bg-accent-soft/40 px-3 py-1 text-sm font-medium text-accent">
            كورس فل ستاك تفاعلي بالعربي
          </span>
          <h1 className="mt-5 text-4xl font-bold leading-[1.25] md:text-6xl">
            افهم البرمجة،
            <br />
            <span className="text-accent">لا تحفظها.</span>
          </h1>
          <p className="mt-5 max-w-md text-lg leading-8 text-muted">
            كل سطر تكتبه تراه وهو يتحرك داخل الذاكرة. عندما ترى ما يفعله الجهاز، لن تحتاج إلى حفظ شيء.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/learn/bits" className="rounded-2xl bg-accent px-6 py-3.5 text-lg font-bold text-accent-fg shadow-lg shadow-accent/25 hover:opacity-90">
              ابدأ الدرس الأول
            </Link>
            <Link href="/roadmap" className="rounded-2xl border border-line bg-surface px-6 py-3.5 text-lg font-semibold hover:border-accent">
              خارطة الطريق
            </Link>
          </div>
        </div>
        <HeroDemo />
      </section>

      <section className="border-y border-line bg-surface/60 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-2xl font-bold md:text-3xl">كل درس رحلة من 7 محطات</h2>
          <p className="mt-2 text-muted">لا تنتقل للدرس التالي حتى تثبت أنك فهمت.</p>
          <ol className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-7">
            {STEPS.map(([t, d], k) => (
              <li key={t} className="relative rounded-2xl border border-line bg-surface p-4">
                <span className="code text-3xl font-bold text-accent/30">{k + 1}</span>
                <div className="mt-1 font-bold">{t}</div>
                <div className="mt-1 text-sm leading-6 text-muted">{d}</div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-2xl font-bold md:text-3xl">مفهوم واحد، ست لغات</h2>
        <p className="mt-2 max-w-2xl leading-8 text-muted">
          تتعلّم الفكرة مرة واحدة، ثم ترى كيف تكتبها كل لغة. هكذا تفهم البرمجة نفسها، لا لغة واحدة فقط.
        </p>
        <div className="mt-6 flex flex-wrap gap-2" dir="ltr">
          {LANGS.map((l) => (
            <span key={l} className="code rounded-xl border border-line bg-surface px-4 py-2 text-sm">{l}</span>
          ))}
        </div>
      </section>
    </main>
  );
}
