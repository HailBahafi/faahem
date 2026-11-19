import RoadmapMap from "@/components/RoadmapMap";

export const metadata = { title: "خارطة الطريق — فاهم" };

export default function RoadmapPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 pb-24 pt-10">
      <h1 className="text-3xl font-bold md:text-4xl">خارطة طريق الفل ستاك</h1>
      <p className="mt-2 max-w-2xl leading-8 text-muted">
        13 مرحلة من «كيف يعمل الحاسوب» إلى تصميم الأنظمة. كل مفهوم تراه متحركاً أولاً، ثم تكتبه بأكثر من لغة، وكل مرحلة تنتهي بمشروع حقيقي.
      </p>
      <div className="mt-10">
        <RoadmapMap />
      </div>
    </main>
  );
}
