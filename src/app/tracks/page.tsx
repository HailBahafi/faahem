import TrackCards from "@/components/TrackCards";

export const metadata = { title: "مسارات اللغات — فاهم" };

export default function TracksPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 pb-24 pt-10">
      <h1 className="text-3xl font-bold md:text-4xl">مسارات اللغات</h1>
      <p className="mt-2 max-w-2xl leading-8 text-muted">
        لكل لغة طريق كامل في أربعة مستويات: الأساسيات، المتوسط، المتقدم، الاحتراف. كل مستوى دروس متحركة ومشروع وشهادة.
      </p>
      <div className="mt-10">
        <TrackCards />
      </div>
    </main>
  );
}
