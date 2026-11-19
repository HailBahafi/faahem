import AccountPanel from "@/components/AccountPanel";

export const metadata = { title: "حسابي — فاهم" };

export default function AccountPage() {
  return (
    <main className="mx-auto max-w-md px-4 pb-24 pt-10">
      <h1 className="mb-6 text-3xl font-bold">حسابي</h1>
      <AccountPanel />
    </main>
  );
}
