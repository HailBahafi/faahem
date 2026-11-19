import type { Cell, Lesson, Scene } from "@/lib/types";

const s = (name: string, value: string): Cell => ({ name, value: `"${value}"`, type: "string" });
/** The three drawers of the scene: where your commands run, the service, and the file it needs. */
const box = (host: string, shop: string, config: string): Cell[] => [s("host", host), s("shop", shop), s("config.json", config)];

const mini = (code: string, steps: Scene["steps"]): Scene => ({ code: { shell: code }, steps });

const O1 = ["Welcome to Ubuntu 24.04"];
const O2 = [...O1, "shop.service - failed"];
const O3 = [...O2, "Error: EACCES: permission denied, open '/srv/shop/config.json'"];
const O4 = [...O3, "-rw------- 1 root root config.json"];
const O5 = [...O4, "shop.service - active (running)"];

export const linux: Lesson = {
  slug: "linux",
  stage: 11,
  number: "11.1",
  title: "Linux",
  subtitle: "الخادم حاسوب بعيد بلا شاشة: تدخله بالطرفية، وتعرف من يقرأ كل ملف، ومن يُبقي برنامجك حيّاً",
  minutes: 16,
  singleLanguage: true,
  problem: {
    title: "الموقع متوقف... والخادم بعيد",
    body: "متجرك يعمل على خادم في مركز بيانات بعيد. ادخل إليه بـ ssh، وابحث في السجلات عن سبب توقف الخدمة، وأصلحه، ثم أعد تشغيلها. لا شاشة ولا فأرة: الطرفية فقط.",
    demo: "linux",
  },
  scene: {
    code: {
      shell: `$ ssh sara@203.0.113.10
Welcome to Ubuntu 24.04
$ systemctl status shop
shop.service - failed
$ journalctl -u shop -n 1
Error: EACCES: permission denied, open '/srv/shop/config.json'
$ ls -l /srv/shop/config.json
-rw------- 1 root root config.json
$ sudo chmod 644 /srv/shop/config.json
$ sudo systemctl restart shop
$ systemctl status shop
shop.service - active (running)`,
    },
    notes: {
      shell: "هذه أوامر Linux على الخادم نفسه. على حاسوبك يكفي أن تكتب ssh في Terminal أو PowerShell، وكل ما بعده يعمل هناك لا عندك.",
    },
    steps: [
      {
        line: null,
        say: "معظم خوادم الإنترنت حواسيب Linux في مراكز بيانات، بلا شاشة ولا لوحة مفاتيح. متجرك يعمل على واحد منها، وقد توقف. أنت الآن على حاسوبك: كل أمر تكتبه يعمل هنا.",
        memory: box("laptop", "(unknown)", "(unknown)"),
      },
      {
        line: 1,
        say: "ssh يفتح طرفية على حاسوب بعيد عبر الشبكة، باسم مستخدم sara. الطرفية هي نفسها التي تعرفها، لكن من الآن كل أمر يعمل على الخادم لا على حاسوبك.",
        memory: box("server", "(unknown)", "(unknown)"),
        changed: ["host"],
        output: O1,
      },
      {
        line: 3,
        say: "المتجر «خدمة»: برنامج يعمل طوال الوقت، يديره برنامج اسمه systemd. هو من يشغّله عند الإقلاع ويعيده إن انهار. systemctl status يسأله عن حالتها: فشلت، وتوقف systemd عن المحاولة.",
        memory: box("server", "failed", "(unknown)"),
        changed: ["shop"],
        read: ["shop"],
        output: O2,
      },
      {
        line: 5,
        say: "لماذا فشلت؟ كل ما تطبعه الخدمة يُحفظ في السجل. journalctl -u shop -n 1 يعرض آخر سطر منه: البرنامج حاول فتح الملف config.json فرُفض: لا صلاحية.",
        memory: box("server", "failed", "(unknown)"),
        read: ["shop"],
        output: O3,
      },
      {
        line: 7,
        say: "في Linux كل شيء ملف في شجرة واحدة تبدأ من الجذر /، تماماً كما رأيت في درس الطرفية. ls -l يعرض صاحب الملف وصلاحياته: صاحبه root، والمجموعة root.",
        memory: box("server", "failed", "rw------- root"),
        changed: ["config.json"],
        output: O4,
      },
      {
        line: 8,
        say: "الصلاحيات تسعة أحرف في ثلاث خانات: للمالك ثم للمجموعة ثم للبقية. r قراءة، w كتابة، x تشغيل، و - تعني لا. هنا rw- للمالك root فقط، و --- لكل أحد غيره.",
        memory: box("server", "failed", "rw------- root"),
        read: ["config.json"],
        output: O4,
      },
      {
        line: 8,
        say: "والمتجر يعمل كمستخدم اسمه www، لا كـ root. www ليس المالك وليس في المجموعة root، فهو من «البقية»، وخانتها --- . لهذا رُفض.",
        memory: box("server", "failed", "rw------- root"),
        read: ["config.json"],
        output: O4,
      },
      {
        line: 9,
        say: "chmod يغيّر الصلاحيات. كل خانة رقم: r=4 و w=2 و x=1. فـ 644 تعني rw- للمالك، و r-- للمجموعة وللبقية. لكن الملف ملك root، فلا يغيّره غيره: sudo يشغّل هذا الأمر الواحد بصلاحيات root.",
        memory: box("server", "failed", "rw-r--r-- root"),
        changed: ["config.json"],
        output: O4,
      },
      {
        line: 10,
        say: "الملف صار مقروءاً للجميع، ولم يكتب فيه أحد غير root. نطلب من systemd أن يعيد تشغيل الخدمة: يشغّل البرنامج من جديد، فيصير «عملية» حيّة لها رقم يميزها PID.",
        memory: box("server", "starting", "rw-r--r-- root"),
        changed: ["shop"],
        output: O4,
      },
      {
        line: 12,
        say: "تعمل. ولو انهارت غداً سيعيدها systemd وحده، ولو أُعيد تشغيل الخادم سيشغّلها عند الإقلاع. هذا الفرق بين خدمة وبين برنامج شغّلته بيدك في طرفية: الثاني يموت حين تغلقها.",
        memory: box("server", "active (running)", "rw-r--r-- root"),
        changed: ["shop"],
        read: ["shop"],
        output: O5,
      },
    ],
  },
  playground: {
    kind: "trace",
    intro: "هذا قلب فحص الصلاحيات في Linux بلغة تعرفها: النظام يختار خانة واحدة من الثلاث (المالك أو المجموعة أو البقية) حسب من يطلب، ثم ينظر إلى الحرف المطلوب فيها فقط.",
    starter: `let file = { owner: "root", group: "shop", mode: "rw-r-----" };
let pos = { r: 0, w: 1, x: 2 };
function can(user, group, action) {
  let start = 6;
  if (user === file.owner) {
    start = 0;
  } else if (group === file.group) {
    start = 3;
  }
  return file.mode[start + pos[action]] === action;
}
console.log(can("root", "root", "w"));
console.log(can("www", "shop", "r"));
console.log(can("www", "shop", "w"));
console.log(can("sara", "sara", "r"));`,
    challenges: [
      "قبل أن تشغّل: www في المجموعة shop. أي خانة ستُقرأ له؟ توقّع الأسطر الأربعة.",
      "غيّر mode إلى \"rw-r--r--\" (أي chmod 644). أي سطر تغيّر جوابه؟ ولماذا؟",
      "اجعل mode \"rwxrwxrwx\" (أي chmod 777). كل شيء صار مسموحاً لكل أحد، حتى الكتابة. لماذا هذا خطير على خادم؟",
      "الفحص يختار خانة واحدة فقط: اجعل owner \"sara\" و mode \"---rwxrwx\". هل تقرأ sara ملفها؟ المالك ممنوع رغم أن البقية مسموح لهم!",
    ],
  },
  predict: [
    {
      question: "الخدمة shop تعمل والعملية رقمها 4312. قتلتها بـ kill. ماذا يُظهر systemctl status بعد ثانيتين؟",
      code: `$ systemctl status shop
active (running)  PID 4312
$ kill 4312
$ systemctl status shop`,
      scene: mini(
        `$ systemctl status shop
active (running)  PID 4312
$ kill 4312
$ systemctl status shop
active (running)  PID 4377`,
        [
          { line: 1, say: "الخدمة تعمل، وعمليتها رقم 4312.", memory: box("server", "running PID 4312", "rw-r--r-- root"), read: ["shop"], output: ["active (running)  PID 4312"] },
          { line: 3, say: "kill ينهي العملية 4312. البرنامج مات فعلاً.", memory: box("server", "dead", "rw-r--r-- root"), changed: ["shop"], output: ["active (running)  PID 4312"] },
          { line: 3, say: "لكن systemd يراقب: خدمته ماتت، والإعداد يقول أعدها. فيشغّل البرنامج من جديد كعملية جديدة برقم جديد.", memory: box("server", "running PID 4377", "rw-r--r-- root"), changed: ["shop"], output: ["active (running)  PID 4312"] },
          { line: 5, say: "تعمل، لكن برقم آخر: 4377. لإيقافها فعلاً استعمل systemctl stop shop.", memory: box("server", "running PID 4377", "rw-r--r-- root"), read: ["shop"], output: ["active (running)  PID 4312", "active (running)  PID 4377"] },
        ],
      ),
      options: ["failed: قتلتها", "active (running) برقم PID جديد", "active (running) بالرقم نفسه 4312"],
      answer: 1,
      why: "kill ينهي عملية واحدة، والخدمة ليست عملية بل وعدٌ من systemd أن يبقيها حيّة. فيشغّل عملية جديدة، والعملية الجديدة تأخذ رقماً جديداً دائماً.",
    },
    {
      question: "الملف صاحبه root ومجموعته shop وصلاحياته rw-r-----. ماذا يطبع البرنامج؟",
      code: `let file = { owner: "root", group: "shop", mode: "rw-r-----" };
let pos = { r: 0, w: 1, x: 2 };
function can(user, group, action) {
  let start = 6;
  if (user === file.owner) {
    start = 0;
  } else if (group === file.group) {
    start = 3;
  }
  return file.mode[start + pos[action]] === action;
}
console.log(can("www", "shop", "w"));
console.log(can("ali", "dev", "r"));`,
      options: ["false ثم false", "true ثم false", "false ثم true"],
      answer: 0,
      why: "www في المجموعة shop فخانته الوسطى r-- : يقرأ ولا يكتب. و ali ليس المالك ولا في shop، فهو من البقية وخانتها --- : لا شيء.",
    },
    {
      question: "شغّلت الخدمة بـ systemctl start shop ولم تكتب enable. انقطعت الكهرباء وعاد الخادم. ماذا يحدث للمتجر؟",
      code: `$ sudo systemctl start shop
$ sudo reboot
$ systemctl status shop`,
      scene: mini(
        `$ sudo systemctl start shop
$ sudo reboot
$ systemctl status shop
inactive (dead)`,
        [
          { line: 1, say: "start يشغّل الخدمة الآن فقط.", memory: box("server", "active (running)", "rw-r--r-- root"), changed: ["shop"] },
          { line: 2, say: "الخادم يُطفأ: تموت كل العمليات في الذاكرة.", memory: box("server", "(off)", "rw-r--r-- root"), changed: ["shop"] },
          { line: 3, say: "عند الإقلاع يشغّل systemd الخدمات المفعّلة بـ enable فقط. shop لم تُفعَّل، فبقيت متوقفة.", memory: box("server", "inactive (dead)", "rw-r--r-- root"), changed: ["shop"], output: ["inactive (dead)"] },
        ],
      ),
      options: ["يعمل: systemd يعيده", "متوقف: start لا يعني «عند كل إقلاع»", "يعمل لأنه كان يعمل قبل الانقطاع"],
      answer: 1,
      why: "start للآن، و enable لكل إقلاع قادم. العمليات تعيش في الذاكرة وتموت مع الكهرباء، فما لم يُسجَّل في الإعداد لن يعود. عادةً تكتب الاثنين: systemctl enable --now shop.",
    },
  ],
  code: {
    intro: "لا شيء يُشغَّل هنا: Linux على خادم حقيقي. إن كان عندك ويندوز فثبّت WSL واكتب فيه: ps aux ثم ls -l /etc ثم systemctl status. وكثير من مزودي الخوادم يعطونك خادماً صغيراً تجربه بـ ssh.",
    runnerStarter: "",
    runnerLang: "text",
  },
  exercises: [
    {
      kind: "order",
      lang: "text",
      title: "تشخيص خدمة متوقفة",
      prompt: "الموقع متوقف. رتّب الأوامر: ادخل إلى الخادم، اسأل عن حالة الخدمة، اقرأ سجلها، ثم أعد تشغيلها بعد الإصلاح.",
      lines: ["ssh sara@203.0.113.10", "systemctl status shop", "journalctl -u shop -n 20", "sudo systemctl restart shop"],
      expected: "shop.service - active (running)",
    },
    {
      kind: "fill",
      lang: "text",
      title: "صلاحية تكفي ولا تزيد",
      prompt: "الملف صاحبه root ومجموعته root، وخادم الويب يعمل كمستخدم www. أي صلاحية تسمح لـ www بالقراءة فقط، ولا تسمح لأحد غير root بالكتابة؟",
      template: "$ sudo chmod ___ /srv/shop/config.json",
      options: ["600", "640", "644"],
      answer: "644",
      expected: "-rw-r--r-- 1 root root config.json",
    },
    {
      kind: "fix",
      title: "الخدمة لا تقرأ ملفها",
      prompt: "الخدمة تعمل كمستخدم www، والبرنامج يطبع true ثم false: root يقرأ و www لا. غيّر الصلاحيات فقط (كما يفعل chmod 644) حتى يطبع true ثم true.",
      code: `let file = { owner: "root", group: "root", mode: "rw-------" };
function canRead(user, group) {
  let start = 6;
  if (user === file.owner) {
    start = 0;
  } else if (group === file.group) {
    start = 3;
  }
  return file.mode[start] === "r";
}
console.log(canRead("root", "root"));
console.log(canRead("www", "www"));`,
      expected: "true\ntrue",
      hint: "www ليس المالك ولا في المجموعة root، فهو من البقية: الأحرف الثلاثة الأخيرة. ضع r في أولها.",
      solution: `let file = { owner: "root", group: "root", mode: "rw-r--r--" };
function canRead(user, group) {
  let start = 6;
  if (user === file.owner) {
    start = 0;
  } else if (group === file.group) {
    start = 3;
  }
  return file.mode[start] === "r";
}
console.log(canRead("root", "root"));
console.log(canRead("www", "www"));`,
    },
    {
      kind: "write",
      title: "systemd يعيد الخدمة",
      prompt: "المصفوفة runs تقول ماذا حدث في كل تشغيل. اكتب حلقة تحاكي systemd: كل تشغيل عملية جديدة برقم PID يزيد واحداً (يبدأ بعد 100). اطبع start ثم رقمها، ثم crash أو running.",
      starter: `let runs = ["crash", "crash", "ok"];
let pid = 100;
// for each run: a new process gets the next pid
`,
      expected: "start 101\ncrash\nstart 102\ncrash\nstart 103\nrunning",
      hint: "داخل for (let r of runs) زد pid أولاً واطبع \"start \" + pid، ثم if (r === \"crash\") اطبع crash وإلا اطبع running.",
      solution: `let runs = ["crash", "crash", "ok"];
let pid = 100;
for (let r of runs) {
  pid = pid + 1;
  console.log("start " + pid);
  if (r === "crash") {
    console.log("crash");
  } else {
    console.log("running");
  }
}`,
    },
  ],
  quiz: [
    {
      question: "ali في المجموعة dev. هل يستطيع تشغيل deploy.sh؟",
      code: "$ ls -l deploy.sh\n-rwxr-x--- 1 sara dev deploy.sh",
      options: ["نعم: خانة المجموعة r-x فيها x", "لا: x للمالك sara فقط", "لا: الملف لا يُشغَّل إلا بـ sudo"],
      answer: 0,
      why: "ali ليس المالك، لكنه في dev، فتُقرأ الخانة الوسطى r-x: يقرأ ويشغّل ولا يكتب. أي مستخدم خارج dev يقع في الخانة الأخيرة --- .",
    },
    {
      question: "بعد ssh sara@server كتبت ls. أين تعمل؟",
      code: "$ ssh sara@203.0.113.10\n$ ls",
      options: ["على حاسوبك", "على الخادم البعيد", "على الاثنين"],
      answer: 1,
      why: "ssh يفتح طرفية على الحاسوب البعيد، وكل ما تكتبه بعدها يُرسل إليه ويعمل هناك، والرد يعود إلى شاشتك. exit يعيدك إلى حاسوبك.",
    },
    {
      question: "أي أمر يوقف برنامج node المعلّق؟",
      code: "$ ps aux\nUSER   PID   COMMAND\nwww    812   nginx\nwww    4312  node server.js\npostgres 977 postgres",
      options: ["kill 4312", "kill node", "kill 812"],
      answer: 0,
      why: "كل برنامج يعمل هو عملية لها رقم PID، و kill يأخذ الرقم. 812 هو nginx، فقتله يوقف شيئاً آخر. (وإن كانت خدمة فسيعيدها systemd).",
    },
    {
      question: "الخدمة تنهار كل بضع دقائق. أين تجد السبب؟",
      options: ["systemctl restart shop", "journalctl -u shop", "chmod 777 على كل الملفات"],
      answer: 1,
      why: "السجل هو ذاكرة الخدمة: ما طبعته قبل أن تموت. إعادة التشغيل تخفي العَرَض فقط، و 777 تفتح كل ملف لكل أحد. و tail -f لملف سجل يعرض الأسطر الجديدة لحظة كتابتها.",
    },
    {
      question: "كتبت chmod 600 secret.txt دون sudo، والملف ملك root. ماذا يحدث؟",
      code: "$ ls -l secret.txt\n-rw-r--r-- 1 root root secret.txt\n$ chmod 600 secret.txt",
      options: ["تتغيّر الصلاحيات", "Operation not permitted: لست المالك", "يُحذف الملف"],
      answer: 1,
      why: "تغيير صلاحيات ملف حق لمالكه و root فقط. أنت sara، فيرفض النظام. sudo chmod يشغّل الأمر كـ root لمرة واحدة، ولهذا يطلب كلمة سرك.",
    },
  ],
  next: "docker",
};
