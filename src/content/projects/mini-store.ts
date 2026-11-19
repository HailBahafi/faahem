import type { Project } from "@/lib/types";

export const miniStore: Project = {
  slug: "mini-store",
  stage: 6,
  title: "متجر صغير",
  brief:
    "صفحة متجر حقيقية في ملف HTML واحد: المنتجات مصفوفة في JavaScript تتحول إلى بطاقات في الصفحة، وكل بطاقة فيها زر «أضف إلى السلة»، والسلة تعرض عدد القطع والمجموع وتتحدث مع كل نقرة. تجمع هنا HTML و CSS (Grid و Flex) و DOM والأحداث في مشروع واحد.",
  lang: "html",
  steps: [
    "الصفحة جاهزة بالعربية ومن اليمين لليسار (dir=\"rtl\"). فيها رأس header يحوي السلة: عدد القطع في عنصر id=\"count\" والمجموع في id=\"total\" (يبدأ كل منهما بـ 0)، وزر تفريغ id=\"clear\". وتحته حاوية المنتجات id=\"products\".",
    "رتّب حاوية المنتجات بـ CSS Grid: اجعل #products بـ display: grid وثلاثة أعمدة متساوية وفراغاً بينها (gap). واجعل الـ header بـ display: flex ليصطف عنوان المتجر والسلة على سطر واحد.",
    "اكتب render() التي تمر على المصفوفة products وتنشئ لكل منتج بطاقة div بالصنف class=\"product\"، فيها h3 للاسم، وعنصر بالصنف class=\"price\" فيه السعر رقماً فقط (مثلاً 25)، وزر button نصه «أضف إلى السلة». أضف البطاقات إلى #products ونادِ render() مرة واحدة.",
    "اجعل المتغيرين count و total يحفظان حالة السلة، واكتب updateCart() التي تكتب قيمتيهما في #count و #total (textContent).",
    "أضف لكل زر مستمع حدث click يزيد count بواحد ويضيف سعر منتجه إلى total، ثم ينادي updateCart().",
    "اجعل زر #clear يعيد count و total إلى 0 ويحدّث السلة.",
    "اضغط «شغّل الاختبارات»، ثم جرّب الصفحة بنفسك في المعاينة: هل يتغير المجموع مع كل نقرة؟",
  ],
  starter: `<!doctype html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8">
<title>متجر صغير</title>
<style>
  body { font-family: sans-serif; margin: 0; padding: 16px; background: #f6f6f6; }
  header { /* flex: العنوان والسلة على سطر واحد */ }
  #products { /* grid: ثلاثة أعمدة و gap */ }
  .product { background: white; border-radius: 8px; padding: 12px; }
</style>
</head>
<body>
<header>
  <h1>متجري</h1>
  <div>السلة: <span id="count">0</span> قطع، المجموع <span id="total">0</span> ريال
    <button id="clear">تفريغ</button>
  </div>
</header>
<main id="products"></main>

<script>
  const products = [
    { name: "كوب قهوة", price: 25 },
    { name: "دفتر", price: 40 },
    { name: "قلم", price: 15 },
  ];

  let count = 0;
  let total = 0;

  function updateCart() {
    // اكتب count و total في #count و #total
  }

  function render() {
    // لكل منتج: div.product فيه h3 و .price و button
  }

  // نادِ render() هنا، وأضف حدث زر #clear
</script>
</body>
</html>
`,
  solution: `<!doctype html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8">
<title>متجر صغير</title>
<style>
  body { font-family: sans-serif; margin: 0; padding: 16px; background: #f6f6f6; }
  header { display: flex; justify-content: space-between; align-items: center; }
  #products { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
  .product { background: white; border-radius: 8px; padding: 12px; }
</style>
</head>
<body>
<header>
  <h1>متجري</h1>
  <div>السلة: <span id="count">0</span> قطع، المجموع <span id="total">0</span> ريال
    <button id="clear">تفريغ</button>
  </div>
</header>
<main id="products"></main>

<script>
  const products = [
    { name: "كوب قهوة", price: 25 },
    { name: "دفتر", price: 40 },
    { name: "قلم", price: 15 },
  ];

  let count = 0;
  let total = 0;

  function updateCart() {
    document.querySelector("#count").textContent = count;
    document.querySelector("#total").textContent = total;
  }

  function render() {
    const container = document.querySelector("#products");
    for (const product of products) {
      const card = document.createElement("div");
      card.className = "product";

      const title = document.createElement("h3");
      title.textContent = product.name;

      const price = document.createElement("span");
      price.className = "price";
      price.textContent = product.price;

      const button = document.createElement("button");
      button.textContent = "أضف إلى السلة";
      button.addEventListener("click", () => {
        count++;
        total += product.price;
        updateCart();
      });

      card.append(title, price, button);
      container.appendChild(card);
    }
  }

  render();

  document.querySelector("#clear").addEventListener("click", () => {
    count = 0;
    total = 0;
    updateCart();
  });
</script>
</body>
</html>
`,
  tests: [
    { name: "تظهر بطاقة .product لكل منتج من المصفوفة (3 بطاقات)", code: `document.querySelectorAll("#products .product").length === 3` },
    { name: "كل بطاقة فيها اسم المنتج في h3 وسعره في .price", code: `[...document.querySelectorAll(".product")].map(p => p.querySelector("h3").textContent + ":" + p.querySelector(".price").textContent.trim()).join("|") === "كوب قهوة:25|دفتر:40|قلم:15"` },
    { name: "كل بطاقة فيها زر «أضف إلى السلة»", code: `[...document.querySelectorAll(".product")].every(p => p.querySelector("button") && p.querySelector("button").textContent.includes("أضف"))` },
    { name: "السلة تبدأ بـ 0 قطع ومجموع 0", code: `document.querySelector("#count").textContent.trim() === "0" && document.querySelector("#total").textContent.trim() === "0"` },
    { name: "النقر على زر منتج يجعل العدد 1 والمجموع سعره", code: `(document.querySelectorAll(".product button")[1].click(), document.querySelector("#count").textContent.trim() === "1" && document.querySelector("#total").textContent.trim() === "40")` },
    { name: "عدة نقرات تجمع العدد والمجموع بشكل صحيح", code: `(() => { const b = document.querySelectorAll(".product button"); b[0].click(); b[0].click(); b[2].click(); return document.querySelector("#count").textContent.trim() === "3" && document.querySelector("#total").textContent.trim() === "65"; })()` },
    { name: "زر #clear يفرّغ السلة", code: `(() => { const b = document.querySelectorAll(".product button"); b[0].click(); b[1].click(); document.querySelector("#clear").click(); return document.querySelector("#count").textContent.trim() === "0" && document.querySelector("#total").textContent.trim() === "0"; })()` },
    { name: "#products مرتبة بـ Grid والـ header بـ Flex", code: `getComputedStyle(document.querySelector("#products")).display === "grid" && getComputedStyle(document.querySelector("header")).display === "flex"` },
    { name: "الصفحة عربية ومن اليمين لليسار", code: `document.documentElement.getAttribute("dir") === "rtl" && document.documentElement.getAttribute("lang") === "ar"` },
  ],
};
