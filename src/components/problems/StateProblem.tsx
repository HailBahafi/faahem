"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState, type ReactNode } from "react";

type Mode = "local" | "shared";
type Part = "list" | "badge" | "cart" | "store";

const PRODUCTS = [
  { name: "Tea", price: 5 },
  { name: "Coffee", price: 12 },
  { name: "Cake", price: 18 },
];

const CODE: Record<Mode, string> = {
  local: `class _ProductListState extends State<ProductList> {
  int count = 0; // lives inside ProductList only
  // onPressed: () => setState(() { count++; })
}`,
  shared: `class Cart extends ChangeNotifier {
  int count = 0;
  void add() { count++; notifyListeners(); }
}
// ProductList, CartBadge, CartScreen: context.watch<Cart>()`,
};

const FRESH: Record<Part, number> = { list: 1, badge: 1, cart: 1, store: 0 };

/** A widget box: its name, how many times build() ran, and a flash each time it rebuilds. */
function Widget({ name, builds, children, className = "" }: { name: string; builds: number; children: ReactNode; className?: string }) {
  return (
    <div className={`relative overflow-hidden rounded-xl border border-line ${className}`}>
      <AnimatePresence>
        {builds > 1 && (
          <motion.span
            key={builds}
            initial={{ opacity: 0.55 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.9 }}
            className="pointer-events-none absolute inset-0 bg-accent"
          />
        )}
      </AnimatePresence>
      <div dir="ltr" className="relative flex items-center justify-between px-2 pt-1 text-[10px] text-muted">
        <span className="code">{name}</span>
        <span className="code">build ×{builds}</span>
      </div>
      <div className="relative">{children}</div>
    </div>
  );
}

function Phone({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="w-60 shrink-0 rounded-[2rem] border-4 border-line bg-bg p-3 shadow-lg">
      <div className="mb-2 text-center text-xs text-muted">{title}</div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

/** A two-screen shop: the cart count kept inside ProductList (badge never updates) versus a shared Cart store. */
export default function StateProblem() {
  const [mode, setMode] = useState<Mode>("local");
  const [count, setCount] = useState(0);
  const [builds, setBuilds] = useState<Record<Part, number>>(FRESH);

  const switchTo = (m: Mode) => {
    setMode(m);
    setCount(0);
    setBuilds(FRESH);
  };

  const add = () => {
    setCount((c) => c + 1);
    setBuilds((b) =>
      mode === "local"
        ? { ...b, list: b.list + 1 }
        : { list: b.list + 1, badge: b.badge + 1, cart: b.cart + 1, store: b.store + 1 },
    );
  };

  // In local mode only ProductList owns the count; the badge and the cart screen keep their own 0.
  const badge = mode === "shared" ? count : 0;
  const cartItems = mode === "shared" ? count : 0;

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        <motion.button
          whileTap={{ scale: 0.94 }}
          onClick={() => switchTo("local")}
          className={`rounded-2xl px-5 py-3 font-bold ${mode === "local" ? "bg-accent text-accent-fg shadow-lg shadow-accent/20" : "border border-line bg-surface"}`}
        >
          العدد داخل القائمة
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.94 }}
          onClick={() => switchTo("shared")}
          className={`rounded-2xl px-5 py-3 font-bold ${mode === "shared" ? "bg-accent text-accent-fg shadow-lg shadow-accent/20" : "border border-line bg-surface"}`}
        >
          متجر مشترك Cart
        </motion.button>
      </div>

      <pre dir="ltr" className="code mt-4 overflow-x-auto rounded-xl bg-code p-3 text-sm">{CODE[mode]}</pre>

      <AnimatePresence>
        {mode === "shared" && (
          <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-4">
            <Widget name="Cart (ChangeNotifier)" builds={builds.store + 1} className="bg-surface">
              <div dir="ltr" className="code flex flex-wrap items-center gap-x-4 px-3 pb-2 text-sm">
                <span>
                  count = <b className="text-num">{count}</b>
                </span>
                <span className="text-muted">listeners: ProductList, CartBadge, CartScreen</span>
              </div>
            </Widget>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-4 flex flex-wrap justify-center gap-6">
        <Phone title="شاشة المنتجات">
          <div className="flex items-center justify-between rounded-xl bg-surface px-3 py-2">
            <b dir="ltr">Shop</b>
            <Widget name="CartBadge" builds={builds.badge} className="w-24">
              <div className="flex items-center justify-center gap-1 pb-1">
                <span className="text-sm">السلة</span>
                <span className={`code min-w-6 rounded-full px-1.5 text-center text-sm font-bold ${badge ? "bg-err text-white" : "bg-code text-muted"}`}>{badge}</span>
              </div>
            </Widget>
          </div>
          <Widget name="ProductList" builds={builds.list} className="bg-surface">
            <div className="space-y-1.5 p-2">
              {PRODUCTS.map((p) => (
                <div key={p.name} dir="ltr" className="flex items-center justify-between rounded-lg bg-bg px-2 py-1.5">
                  <span className="text-sm">
                    {p.name} <span className="code text-muted">{p.price} SAR</span>
                  </span>
                  <motion.button
                    whileTap={{ scale: 0.85 }}
                    onClick={add}
                    aria-label={`add ${p.name}`}
                    className="h-7 w-7 rounded-full bg-accent font-bold text-accent-fg"
                  >
                    +
                  </motion.button>
                </div>
              ))}
              <div className="pt-1 text-center text-sm">
                في السلة: <b className="code text-num">{count}</b>
              </div>
            </div>
          </Widget>
        </Phone>

        <Phone title="شاشة السلة">
          <Widget name="CartScreen" builds={builds.cart} className="bg-surface">
            <div className="p-4 text-center">
              <div className="code text-3xl font-bold text-num">{cartItems}</div>
              <div className="text-sm text-muted">منتجات في السلة</div>
            </div>
          </Widget>
        </Phone>
      </div>

      <AnimatePresence mode="wait">
        {count >= 2 && (
          <motion.p key={mode} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-4 text-muted">
            {mode === "local" ? (
              <>
                القائمة تقول {count} والشارة وشاشة السلة تقولان 0. <b className="code text-fg">setState</b> أعاد بناء ProductList وحده،
                والعدد درج خاص بها لا يراه أحد غيرها. جرّب المتجر المشترك.
              </>
            ) : (
              <>
                الحالة في مكان واحد. كل ضغطة تغيّرها ثم <b className="code text-fg">notifyListeners</b> تنادي المستمعين الثلاثة،
                فيومض كل واحد وهو يعيد build من القيمة نفسها.
              </>
            )}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
