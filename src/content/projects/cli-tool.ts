import type { Project } from "@/lib/types";

export const cliTool: Project = {
  slug: "cli-tool",
  stage: 10,
  title: "أداة سطر أوامر",
  brief:
    "تكتب بـ Rust نسخة مصغّرة من الأداة الشهيرة wc: تقرأ ملفاً نصياً من سطر الأوامر وتعدّ أسطره وكلماته، وتتعامل مع الأخطاء دون أن تنهار، وتُختبر بـ cargo test، وتخرج ملفاً تنفيذياً سريعاً تشغّله من أي مكان. Rust لا يعمل داخل المتصفح هنا، فكل الخطوات على جهازك.",
  lang: "text",
  steps: [
    "ثبّت Rust بـ rustup (من rustup.rs؛ على ويندوز ثبّت أيضاً أدوات البناء التي يطلبها)، ثم تأكد: rustc --version و cargo --version يطبعان رقمي الإصدار.",
    "أنشئ المشروع: cargo new minwc ثم cd minwc و cargo run. يجب أن ترى Hello, world! وتلاحظ أن cargo بنى البرنامج في مجلد target.",
    "اقرأ وسائط سطر الأوامر بـ std::env::args() واجمعها في Vec<String>. أول عنصر هو اسم البرنامج، فاسم الملف هو العنصر الأخير. إذا لم يُعطَ ملف، اطبع طريقة الاستعمال على stderr بـ eprintln! واخرج بـ std::process::exit(2). جرّب: cargo run -- notes.txt.",
    "اكتب دالة نقية count(text: &str) -> Counts ترجع struct فيه lines و words: الأسطر بـ text.lines().count() والكلمات بـ text.split_whitespace().count(). لاحظ أن الدالة تستعير النص (&str) ولا تملكه.",
    "اقرأ الملف بـ std::fs::read_to_string. هذه الدالة ترجع Result لأن القراءة قد تفشل. انقل المنطق إلى دالة run(args: &[String]) -> Result<String, String> واستعمل ? مع map_err لتحويل الخطأ إلى رسالة واضحة فيها اسم الملف.",
    "في main استدعِ run: عند Ok اطبع النتيجة، وعند Err اطبع الرسالة على stderr واخرج بالرمز 1. جرّب ملفاً غير موجود وتأكد أن البرنامج يطبع رسالة مفهومة ولا ينهار بـ panic.",
    "أضف خيارين: ‎-l يطبع عدد الأسطر فقط، و ‎-w يطبع عدد الكلمات فقط، ودونهما يطبع الاثنين مع اسم الملف (مثل: 3 12 notes.txt). خيار غير معروف خطأ برسالة واضحة.",
    "اكتب اختبارات وحدة في أسفل main.rs داخل #[cfg(test)] mod tests: نص فارغ يعطي 0 و 0، ونص من سطرين وخمس كلمات، ومسافات متكررة لا تُحسب كلمات، وخيار غير معروف يرجع Err. شغّلها بـ cargo test حتى تنجح كلها.",
    "ابنِ نسخة الإصدار: cargo build --release، ثم شغّل الملف الناتج مباشرة: ‎./target/release/minwc -w notes.txt (وعلى ويندوز ‎target\\release\\minwc.exe). قارن حجمه وسرعته بنسخة debug على ملف كبير.",
  ],
  starter: `// src/main.rs
use std::env;

fn main() {
    let args: Vec<String> = env::args().collect();
    println!("{:?}", args);
    // 1) اقرأ اسم الملف والخيار من args
    // 2) اقرأ الملف بـ std::fs::read_to_string
    // 3) عدّ الأسطر والكلمات واطبع النتيجة
}
`,
  solution: `// src/main.rs
use std::env;
use std::fs;
use std::process;

#[derive(Debug, PartialEq)]
struct Counts {
    lines: usize,
    words: usize,
}

fn count(text: &str) -> Counts {
    Counts {
        lines: text.lines().count(),
        words: text.split_whitespace().count(),
    }
}

enum Mode {
    Both,
    Lines,
    Words,
}

fn run(args: &[String]) -> Result<String, String> {
    let mut mode = Mode::Both;
    let mut path: Option<&String> = None;

    for arg in &args[1..] {
        match arg.as_str() {
            "-l" => mode = Mode::Lines,
            "-w" => mode = Mode::Words,
            flag if flag.starts_with('-') => return Err(format!("خيار غير معروف: {flag}")),
            _ => path = Some(arg),
        }
    }

    let path = path.ok_or("الاستعمال: minwc [-l | -w] FILE")?;
    let text = fs::read_to_string(path).map_err(|e| format!("تعذّرت قراءة {path}: {e}"))?;
    let c = count(&text);

    Ok(match mode {
        Mode::Lines => c.lines.to_string(),
        Mode::Words => c.words.to_string(),
        Mode::Both => format!("{} {} {}", c.lines, c.words, path),
    })
}

fn main() {
    let args: Vec<String> = env::args().collect();
    match run(&args) {
        Ok(out) => println!("{out}"),
        Err(msg) => {
            eprintln!("{msg}");
            process::exit(1);
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn args(list: &[&str]) -> Vec<String> {
        list.iter().map(|s| s.to_string()).collect()
    }

    #[test]
    fn empty_text() {
        assert_eq!(count(""), Counts { lines: 0, words: 0 });
    }

    #[test]
    fn two_lines_five_words() {
        assert_eq!(count("hello rust world\nbye now\n"), Counts { lines: 2, words: 5 });
    }

    #[test]
    fn repeated_spaces_are_not_words() {
        assert_eq!(count("  a   b  \n\n  c "), Counts { lines: 3, words: 3 });
    }

    #[test]
    fn unknown_flag_is_an_error() {
        assert!(run(&args(&["minwc", "-z", "notes.txt"])).is_err());
    }

    #[test]
    fn missing_file_is_an_error() {
        assert!(run(&args(&["minwc", "no-such-file.txt"])).is_err());
    }
}
`,
  tests: [],
};
