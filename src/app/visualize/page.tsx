import Visualizer from "@/components/Visualizer";

export const metadata = { title: "المتتبّع — فاهم" };

export default function VisualizePage() {
  return (
    <main className="mx-auto max-w-6xl px-4 pb-24 pt-10">
      <h1 className="text-3xl font-bold md:text-4xl">شاهد كودك وهو يعمل</h1>
      <p className="mt-2 max-w-2xl leading-8 text-muted">
        اكتب أي برنامج JavaScript، وسترى كل خطوة: أي سطر يعمل، المكدّس وإطاراته، والكومة بمصفوفاتها وكائناتها، والأسهم بينها.
      </p>
      <div className="mt-8">
        <Visualizer />
      </div>
    </main>
  );
}
