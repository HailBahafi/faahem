import ReviewSession from "@/components/ReviewSession";

export const metadata = { title: "المراجعة — فاهم" };

export default function ReviewPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 pb-24 pt-10">
      <h1 className="text-3xl font-bold md:text-4xl">المراجعة المتباعدة</h1>
      <p className="mt-2 leading-8 text-muted">
        ما تفهمه اليوم تنساه بعد أيام إن لم تعد إليه. كل درس أكملته يعود هنا بعد يوم، ثم 3 أيام، ثم أسبوع، وهكذا. إن أخطأت يعود غداً.
      </p>
      <div className="mt-8">
        <ReviewSession />
      </div>
    </main>
  );
}
