import type { Project } from "@/lib/types";

export const deploy: Project = {
  slug: "deploy",
  stage: 11,
  title: "نشر المشروع",
  brief:
    "تضع الـ API الذي بنيته في المرحلة 7 (أو المتجر كاملاً) على الإنترنت ليعمل دائماً: صورة Docker، وقاعدة بيانات بجانبه في docker compose، واختبارات تعمل تلقائياً مع كل push، ونشر على خادم أو منصة، و HTTPS، ونقطة فحص صحة ومراقبة تنبّهك إذا توقف. الخطوات على جهازك وعلى الخادم، وتعلّم كل خطوة بنفسك عند إنجازها.",
  lang: "text",
  steps: [
    "أضف إلى الـ API نقطة فحص صحة: GET /health ترجع 200 و {\"status\":\"ok\"} حين يكون الخادم وقاعدة البيانات بخير (نفّذ SELECT 1)، و 503 إذا تعذّر الوصول للقاعدة. اجعل المنفذ ورابط القاعدة يُقرآن من متغيرات البيئة PORT و DATABASE_URL لا من الكود.",
    "اكتب Dockerfile: صورة node:22-alpine، انسخ package.json و package-lock.json أولاً ثم npm ci --omit=dev (لتستفيد من طبقات الذاكرة المؤقتة)، ثم بقية الكود، وشغّل البرنامج بمستخدم غير root. أضف ‎.dockerignore يستثني node_modules و ‎.env و ‎.git. ابنِ وشغّل: docker build -t store-api . ثم docker run -p 3000:3000 store-api.",
    "اكتب compose.yaml فيه خدمتان: api و db (postgres:17) مع volume يحفظ بيانات القاعدة، و healthcheck للقاعدة، و depends_on حتى لا يبدأ الـ API قبلها. ضع كلمة سر القاعدة في ملف ‎.env لا يُرفع إلى Git. شغّل docker compose up -d وافتح http://localhost:3000/health.",
    "أنشئ ‎.github/workflows/ci.yml: مع كل push و pull request يثبّت Node ويشغّل npm ci و npm test، ثم يبني صورة Docker ليتأكد أنها تُبنى. ارفع التغيير وتأكد أن العلامة الخضراء ظهرت في تبويب Actions، ثم اكسر اختباراً عمداً وشاهده يفشل.",
    "انشر: إما على خادم VPS (Ubuntu) أو على منصة تشغّل الحاويات. على VPS: أنشئ مستخدماً غير root، وادخل بمفتاح SSH، وفعّل الجدار الناري ufw للمنافذ 22 و 80 و 443 فقط، وثبّت Docker، ثم انسخ المشروع وشغّل docker compose up -d. على منصة: اربط المستودع وأضف DATABASE_URL في إعداداتها.",
    "فعّل HTTPS: اربط نطاقاً (أو نطاقاً فرعياً) بعنوان الخادم بسجل A، وضع أمام الـ API خادماً عكسياً يصدر الشهادة تلقائياً من Let's Encrypt (Caddy بسطرين أسهل بداية). تأكد أن https://نطاقك/health يعمل وأن http يحوّل إلى https.",
    "أضف مراقبة: سجّل الرابط https://نطاقك/health في خدمة مراقبة مجانية تفحصه كل دقيقة وترسل لك بريداً أو إشعاراً إذا فشل. أوقف الـ API عمداً (docker compose stop api) وتأكد أن التنبيه وصلك، ثم أعده.",
    "اقرأ السجلات: docker compose logs -f api لمتابعة الطلبات لحظة بلحظة، و docker compose ps لحالة الخدمات. اجعل الـ API يكتب سطراً لكل طلب (الطريقة والمسار والرمز والزمن)، وابحث فيها عن خطأ تسببه بنفسك.",
    "انشر تحديثاً كاملاً من البداية للنهاية: غيّر شيئاً صغيراً، ادفعه، انتظر نجاح الـ CI، ثم على الخادم git pull و docker compose up -d --build. تنتهي المرحلة حين يصل التغيير إلى الإنترنت وفحص الصحة أخضر.",
  ],
  starter: `# Dockerfile: املأ الخطوات
FROM node:22-alpine
WORKDIR /app
# 1) انسخ ملفات الحزم وثبّت الاعتماديات
# 2) انسخ الكود
# 3) شغّل بمستخدم غير root
# 4) CMD لتشغيل الخادم
`,
  solution: `# ===== src/health.js (نقطة فحص الصحة) =====
app.get("/health", async (req, res) => {
  try {
    await db.query("SELECT 1");
    res.json({ status: "ok" });
  } catch {
    res.status(503).json({ status: "db-down" });
  }
});

# ===== Dockerfile =====
FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY . .
USER node
EXPOSE 3000
CMD ["node", "src/server.js"]

# ===== .dockerignore =====
node_modules
.env
.git

# ===== compose.yaml =====
services:
  db:
    image: postgres:17
    environment:
      POSTGRES_DB: store
      POSTGRES_USER: store
      POSTGRES_PASSWORD: \${DB_PASSWORD}
    volumes:
      - db-data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U store"]
      interval: 5s
      retries: 10
    restart: unless-stopped

  api:
    build: .
    environment:
      PORT: 3000
      DATABASE_URL: postgres://store:\${DB_PASSWORD}@db:5432/store
    ports:
      - "127.0.0.1:3000:3000"
    depends_on:
      db:
        condition: service_healthy
    restart: unless-stopped

volumes:
  db-data:

# ===== .github/workflows/ci.yml =====
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm test
      - run: docker build -t store-api .

# ===== Caddyfile (HTTPS تلقائياً) =====
api.example.com {
  reverse_proxy 127.0.0.1:3000
}

# ===== على الخادم =====
sudo ufw allow 22 && sudo ufw allow 80 && sudo ufw allow 443 && sudo ufw enable
git clone https://github.com/you/store-api.git && cd store-api
echo "DB_PASSWORD=$(openssl rand -hex 16)" > .env
docker compose up -d --build
docker compose ps
docker compose logs -f api
curl https://api.example.com/health
`,
  tests: [],
};
