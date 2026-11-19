import type { Project } from "@/lib/types";

export const storeApp: Project = {
  slug: "store-app",
  stage: 9,
  title: "تطبيق للمتجر",
  brief:
    "تبني تطبيق جوال حقيقياً للمتجر بـ Flutter، يعمل على أندرويد و iOS من كود واحد: شاشة منتجات تُجلب من الـ API الذي بنيته في المرحلة 7، وسلة مشتريات تتشاركها الشاشات، وحالات تحميل وخطأ واضحة. Flutter لا يعمل داخل المتصفح هنا، فكل الخطوات على جهازك، وتعلّم كل خطوة بنفسك عند إنجازها.",
  lang: "text",
  steps: [
    "ثبّت Flutter من flutter.dev حسب نظامك، ثم شغّل flutter doctor في الطرفية وأصلح كل ما يعلّم عليه بـ ✗ (Android Studio و Android SDK، أو Xcode على الماك). تنتهي الخطوة حين لا يبقى إلا علامات ✓ لما تحتاجه.",
    "أنشئ المشروع: flutter create store_app ثم cd store_app، وأضف الحزمتين: flutter pub add http provider. شغّل التطبيق الافتراضي مرة (flutter run) لتتأكد أن كل شيء يعمل قبل أن تغيّر شيئاً.",
    "اكتب نموذج المنتج في lib/models/product.dart: صنف Product فيه id و name و price، ودالة بناء Product.fromJson(Map<String, dynamic> json) تقرأ الحقول من رد الـ API.",
    "ابنِ شاشة المنتجات بـ Widgets: Scaffold فيه AppBar بعنوان المتجر، وجسمه ListView.builder يعرض كل منتج في ListTile (الاسم، والسعر، وزر «أضف للسلة»). جرّبها أولاً بقائمة منتجات ثابتة مكتوبة في الكود.",
    "أضف السلة كحالة مشتركة: صنف CartModel يرث ChangeNotifier ويحفظ المنتجات المضافة، فيه add و remove و total، ويستدعي notifyListeners() بعد كل تغيير. لفّ التطبيق بـ ChangeNotifierProvider، واجعل زر الإضافة يستدعي context.read<CartModel>().add(product).",
    "أضف في AppBar أيقونة سلة تعرض عدد العناصر (context.watch<CartModel>())، وتفتح عند الضغط شاشة السلة: قائمة بما أضفته، وزر حذف لكل عنصر، والمجموع في الأسفل. لاحظ أن العدد يتحدث في الشاشتين دون أن تمرّر شيئاً بينهما.",
    "اجلب المنتجات من الـ API الذي بنيته في المرحلة 7: شغّل الخادم على جهازك، واكتب fetchProducts() التي تستدعي http.get على ‎/products وتحوّل الرد بـ jsonDecode إلى List<Product>. من محاكي أندرويد عنوان جهازك هو 10.0.2.2 وليس localhost.",
    "اعرض النتيجة بـ FutureBuilder وعالج الحالات الثلاث: أثناء التحميل CircularProgressIndicator في المنتصف، وعند الخطأ رسالة واضحة بالعربية وزر «أعد المحاولة»، وعند النجاح القائمة. جرّب حالة الخطأ بإيقاف الخادم.",
    "شغّل التطبيق على محاكي (flutter emulators --launch ثم flutter run) أو على هاتفك الحقيقي بعد تفعيل وضع المطوّر وتصحيح USB. أضف منتجات للسلة، واحذف منها، وتأكد أن المجموع صحيح.",
    "خطوة إضافية: اضغط r في الطرفية أثناء التشغيل (Hot Reload) بعد تغيير لون أو نص، ولاحظ أن السلة لم تُفرَّغ: الحالة بقيت والواجهة وحدها أعيد بناؤها.",
  ],
  starter: `// lib/main.dart: نقطة البداية
import 'package:flutter/material.dart';

void main() {
  runApp(const StoreApp());
}

class StoreApp extends StatelessWidget {
  const StoreApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'المتجر',
      home: Scaffold(
        appBar: AppBar(title: const Text('المتجر')),
        body: const Center(child: Text('قائمة المنتجات هنا')),
      ),
    );
  }
}
`,
  solution: `// lib/main.dart: حل كامل في ملف واحد (يمكنك تقسيمه إلى ملفات)
import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:provider/provider.dart';

const apiBase = 'http://10.0.2.2:3000'; // محاكي أندرويد؛ على الهاتف ضع عنوان جهازك في الشبكة

class Product {
  final int id;
  final String name;
  final double price;

  Product({required this.id, required this.name, required this.price});

  factory Product.fromJson(Map<String, dynamic> json) => Product(
        id: json['id'] as int,
        name: json['name'] as String,
        price: (json['price'] as num).toDouble(),
      );
}

Future<List<Product>> fetchProducts() async {
  final res = await http.get(Uri.parse('$apiBase/products'));
  if (res.statusCode != 200) {
    throw Exception('الخادم رد بالرمز \${res.statusCode}');
  }
  final list = jsonDecode(res.body) as List<dynamic>;
  return list.map((e) => Product.fromJson(e as Map<String, dynamic>)).toList();
}

class CartModel extends ChangeNotifier {
  final List<Product> _items = [];

  List<Product> get items => List.unmodifiable(_items);
  int get count => _items.length;
  double get total => _items.fold(0, (sum, p) => sum + p.price);

  void add(Product p) {
    _items.add(p);
    notifyListeners();
  }

  void remove(Product p) {
    _items.remove(p);
    notifyListeners();
  }
}

void main() {
  runApp(
    ChangeNotifierProvider(
      create: (_) => CartModel(),
      child: const StoreApp(),
    ),
  );
}

class StoreApp extends StatelessWidget {
  const StoreApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'المتجر',
      theme: ThemeData(colorSchemeSeed: Colors.teal, useMaterial3: true),
      builder: (context, child) => Directionality(textDirection: TextDirection.rtl, child: child!),
      home: const ProductsScreen(),
    );
  }
}

class ProductsScreen extends StatefulWidget {
  const ProductsScreen({super.key});

  @override
  State<ProductsScreen> createState() => _ProductsScreenState();
}

class _ProductsScreenState extends State<ProductsScreen> {
  late Future<List<Product>> _future = fetchProducts();

  void _retry() => setState(() => _future = fetchProducts());

  @override
  Widget build(BuildContext context) {
    final count = context.watch<CartModel>().count;
    return Scaffold(
      appBar: AppBar(
        title: const Text('المتجر'),
        actions: [
          IconButton(
            icon: Badge(label: Text('$count'), child: const Icon(Icons.shopping_cart)),
            onPressed: () => Navigator.push(
              context,
              MaterialPageRoute(builder: (_) => const CartScreen()),
            ),
          ),
        ],
      ),
      body: FutureBuilder<List<Product>>(
        future: _future,
        builder: (context, snap) {
          if (snap.connectionState != ConnectionState.done) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snap.hasError) {
            return Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Text('تعذّر تحميل المنتجات. تأكد أن الخادم يعمل.'),
                  const SizedBox(height: 12),
                  FilledButton(onPressed: _retry, child: const Text('أعد المحاولة')),
                ],
              ),
            );
          }
          final products = snap.data!;
          return ListView.builder(
            itemCount: products.length,
            itemBuilder: (context, i) {
              final p = products[i];
              return ListTile(
                title: Text(p.name),
                subtitle: Text('\${p.price.toStringAsFixed(2)} ر.س'),
                trailing: IconButton(
                  icon: const Icon(Icons.add_shopping_cart),
                  onPressed: () => context.read<CartModel>().add(p),
                ),
              );
            },
          );
        },
      ),
    );
  }
}

class CartScreen extends StatelessWidget {
  const CartScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final cart = context.watch<CartModel>();
    return Scaffold(
      appBar: AppBar(title: const Text('السلة')),
      body: cart.items.isEmpty
          ? const Center(child: Text('السلة فارغة'))
          : ListView(
              children: [
                for (final p in cart.items)
                  ListTile(
                    title: Text(p.name),
                    subtitle: Text('\${p.price.toStringAsFixed(2)} ر.س'),
                    trailing: IconButton(
                      icon: const Icon(Icons.delete_outline),
                      onPressed: () => cart.remove(p),
                    ),
                  ),
              ],
            ),
      bottomNavigationBar: Padding(
        padding: const EdgeInsets.all(16),
        child: Text(
          'المجموع: \${cart.total.toStringAsFixed(2)} ر.س',
          style: Theme.of(context).textTheme.titleLarge,
        ),
      ),
    );
  }
}
`,
  tests: [],
};
