import type { Project } from "@/lib/types";

export const firstRepo: Project = {
  slug: "first-repo",
  stage: 4,
  title: "أول مستودع على GitHub",
  brief:
    "تعمل هذه المرة على جهازك أنت، في الطرفية. تثبّت Git، تنشئ مشروعاً صغيراً، تحفظ تاريخه بـ commit، ترفعه إلى GitHub، ثم تعمل على فرع جديد وتدمجه بطلب دمج (pull request) كما يفعل المحترفون في كل فريق. علّم كل خطوة حين تنجزها.",
  lang: "text",
  steps: [
    "ثبّت Git: من git-scm.com على Windows، أو brew install git على Mac، أو sudo apt install git على Linux. ثم تأكد بالأمر git --version.",
    "عرّف Git بنفسك مرة واحدة: git config --global user.name \"اسمك\" و git config --global user.email \"بريدك\". استعمل البريد نفسه الذي ستسجل به في GitHub.",
    "أنشئ مجلداً وادخل إليه: mkdir my-first-repo ثم cd my-first-repo. أنشئ ملف README.md فيه سطر يعرّف بالمشروع.",
    "حوّل المجلد إلى مستودع واحفظ أول لقطة: git init، ثم git add README.md، ثم git commit -m \"First commit\". شاهد النتيجة بـ git log --oneline.",
    "أنشئ حساباً على github.com إن لم يكن لديك، ثم أنشئ مستودعاً جديداً فارغاً باسم my-first-repo (بلا README، فعندك واحد).",
    "اربط مستودعك المحلي به وارفع: git remote add origin https://github.com/USERNAME/my-first-repo.git، ثم git branch -M main، ثم git push -u origin main. حدّث صفحة المستودع وسترى ملفك.",
    "اعمل على فرع جديد: git switch -c add-about، أضف قسماً جديداً إلى README.md، ثم git add و git commit -m \"Add about section\"، ثم git push -u origin add-about.",
    "افتح في GitHub طلب دمج (Compare & pull request) من add-about إلى main، اقرأ الفرق، ثم اضغط Merge pull request. أخيراً في جهازك: git switch main ثم git pull لترى التغيير المدموج.",
  ],
  starter: `# 1. التثبيت والتعريف
git --version
git config --global user.name "Your Name"
git config --global user.email "you@example.com"

# 2. أول مستودع
mkdir my-first-repo
cd my-first-repo
# أنشئ README.md ثم:
# git init / git add / git commit

# 3. GitHub
# git remote add origin ...
# git push ...

# 4. فرع وطلب دمج
# git switch -c ...
`,
  solution: `# 1. التثبيت والتعريف
git --version
git config --global user.name "Your Name"
git config --global user.email "you@example.com"

# 2. أول مستودع
mkdir my-first-repo
cd my-first-repo
echo "# My first repo" > README.md
git init
git add README.md
git commit -m "First commit"
git log --oneline

# 3. GitHub (أنشئ المستودع الفارغ من الموقع أولاً)
git remote add origin https://github.com/USERNAME/my-first-repo.git
git branch -M main
git push -u origin main

# 4. فرع وطلب دمج
git switch -c add-about
echo "## About" >> README.md
echo "Learning Git with faahem." >> README.md
git add README.md
git commit -m "Add about section"
git push -u origin add-about
# افتح Pull Request على GitHub وادمجه، ثم:
git switch main
git pull
git log --oneline
`,
  tests: [],
};
