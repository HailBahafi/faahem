import type { Project } from "@/lib/types";

export const dartShoppingList: Project = {
  slug: "dart-shopping-list",
  stage: 0,
  track: "dart",
  level: 1,
  title: "قائمة تسوّق",
  brief:
    "تبني قلب تطبيق قائمة تسوّق بـ Dart: صنف Item لكل منتج، وصنف ShoppingList يحفظ المنتجات في Map خاصة بمفتاح الاسم، فلا يتكرر منتج ولا يُعدَّل من خارج الصنف. اكتب الصنفين فقط، بلا main: كل اختبار برنامج كامل يصنع قائمة ويستدعي دوالك. الأسماء تُحفظ نظيفة: بلا مسافات في الطرفين وبحروف صغيرة، فـ \" Milk\" و \"milk\" منتج واحد.",
  lang: "dart",
  steps: [
    "أكمل صنف Item: حقول name (String، final) و price (double، final) و qty (int، يتغير)، وباني Item(this.name, this.price, {this.qty = 1})، و getter اسمه total يرجع price × qty.",
    "في ShoppingList احفظ المنتجات في Map خاصة: final _items = <String, Item>{};‎. لماذا Map؟ لأن السؤال الأكثر تكراراً «هل هذا المنتج موجود؟» تجيبه بقفزة واحدة إلى المفتاح.",
    "اكتب add(String name, double price, {int qty = 1})‎: نظّف الاسم بـ trim()‎ و toLowerCase()‎. إن وُجد المنتج فزد كميته، وإلا فأضف Item جديداً. و remove(String name)‎ ترجع true إن حذفت شيئاً و false إن لم تجده.",
    "اكتب getters: count (عدد المنتجات المختلفة)، و units (مجموع الكميات)، و total (مجموع item.total)، و names (قائمة الأسماء مرتبة أبجدياً).",
    "اكتب cheaperThan(double limit)‎ التي ترجع قائمة أسماء المنتجات التي سعر القطعة فيها أقل من limit، مرتبة أبجدياً.",
    "اكتب receipt()‎: سطر لكل منتج بترتيب الأسماء بالشكل \"milk x2 = 9.00\"، ثم سطر أخير \"total = 12.00\"، والأسطر مفصولة بـ \\n. المبالغ بخانتين عشريتين (toStringAsFixed(2)‎).",
    "اضغط «شغّل الاختبارات». لكل اختبار يفشل، اقرأ اسمه وتتبّع ما يحدث في الـ Map خطوة خطوة، أو اكتب main مؤقتة تطبع القيم.",
  ],
  starter: `class Item {
  final String name;
  final double price;
  int qty;

  Item(this.name, this.price, {this.qty = 1});

  // the price of all units of this item
  double get total => 0;
}

class ShoppingList {
  final _items = <String, Item>{};

  void add(String name, double price, {int qty = 1}) {
    // clean the name, then add a new Item or raise the existing qty
  }

  bool remove(String name) {
    return false;
  }

  int get count => 0;
  int get units => 0;
  double get total => 0;
  List<String> get names => [];

  List<String> cheaperThan(double limit) => [];

  String receipt() => "";
}
`,
  solution: `class Item {
  final String name;
  final double price;
  int qty;

  Item(this.name, this.price, {this.qty = 1});

  double get total => price * qty;
}

class ShoppingList {
  final _items = <String, Item>{};

  String _clean(String name) => name.trim().toLowerCase();

  void add(String name, double price, {int qty = 1}) {
    final key = _clean(name);
    final existing = _items[key];
    if (existing != null) {
      existing.qty += qty;
    } else {
      _items[key] = Item(key, price, qty: qty);
    }
  }

  bool remove(String name) => _items.remove(_clean(name)) != null;

  int get count => _items.length;

  int get units {
    var sum = 0;
    for (final item in _items.values) {
      sum += item.qty;
    }
    return sum;
  }

  double get total {
    var sum = 0.0;
    for (final item in _items.values) {
      sum += item.total;
    }
    return sum;
  }

  List<String> get names => _items.keys.toList()..sort();

  List<String> cheaperThan(double limit) =>
      names.where((name) => _items[name]!.price < limit).toList();

  String receipt() {
    final lines = [
      for (final name in names)
        "$name x\${_items[name]!.qty} = \${_items[name]!.total.toStringAsFixed(2)}",
      "total = \${total.toStringAsFixed(2)}",
    ];
    return lines.join("\\n");
  }
}
`,
  tests: [
    {
      name: "Item يحسب total من السعر والكمية، والكمية الافتراضية 1",
      code: `void main() {
  final a = Item("milk", 4.5, qty: 2);
  final b = Item("bread", 3.0);
  print(a.total == 9.0 && b.qty == 1 && b.total == 3.0);
}`,
    },
    {
      name: "add يضيف منتجات مختلفة، و count يعدّها",
      code: `void main() {
  final list = ShoppingList();
  list.add("milk", 4.5);
  list.add("bread", 3.0);
  print(list.count == 2);
}`,
    },
    {
      name: "add للمنتج نفسه (بمسافات أو حروف كبيرة) يزيد الكمية ولا يكرره",
      code: `void main() {
  final list = ShoppingList();
  list.add("milk", 4.5);
  list.add(" Milk ", 4.5, qty: 2);
  print(list.count == 1 && list.units == 3);
}`,
    },
    {
      name: "total يجمع كل المنتجات بكمياتها",
      code: `void main() {
  final list = ShoppingList();
  list.add("milk", 4.5, qty: 2);
  list.add("bread", 3.0);
  print(list.total == 12.0);
}`,
    },
    {
      name: "remove يحذف المنتج ويرجع true، ويرجع false لمنتج غير موجود",
      code: `void main() {
  final list = ShoppingList();
  list.add("milk", 4.5);
  list.add("eggs", 6.0);
  final removed = list.remove("MILK");
  final missing = list.remove("tea");
  print(removed && !missing && list.count == 1 && list.names.first == "eggs");
}`,
    },
    {
      name: "names مرتبة أبجدياً ومنظّفة",
      code: `void main() {
  final list = ShoppingList();
  list.add("Tea", 5.0);
  list.add(" apples", 2.25);
  list.add("milk", 4.5);
  print(list.names.join(",") == "apples,milk,tea");
}`,
    },
    {
      name: "cheaperThan يرجع أسماء ما سعره أقل من الحد، مرتبة",
      code: `void main() {
  final list = ShoppingList();
  list.add("tea", 5.0);
  list.add("bread", 3.0);
  list.add("apples", 2.25);
  list.add("cheese", 12.0);
  print(list.cheaperThan(5.0).join(",") == "apples,bread" && list.cheaperThan(1.0).isEmpty);
}`,
    },
    {
      name: "receipt سطر لكل منتج بالترتيب، ثم المجموع بخانتين",
      code: `void main() {
  final list = ShoppingList();
  list.add("milk", 4.5, qty: 2);
  list.add("bread", 3.0);
  print(list.receipt() == "bread x1 = 3.00\\nmilk x2 = 9.00\\ntotal = 12.00");
}`,
    },
    {
      name: "قائمة فارغة: لا منتجات، والمجموع 0.00",
      code: `void main() {
  final list = ShoppingList();
  print(list.count == 0 && list.units == 0 && list.total == 0 && list.receipt() == "total = 0.00");
}`,
    },
  ],
};
