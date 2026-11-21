import type { Project } from "@/lib/types";

const starter = `#[derive(Debug, PartialEq, Clone, Copy)]
enum Token {
    Num(i64),
    Plus,
    Minus,
    Star,
    Slash,
}

/// "12 + 3" -> Ok([Num(12), Plus, Num(3)]); an unknown character -> Err("unexpected character '$'")
fn tokenize(input: &str) -> Result<Vec<Token>, String> {
    todo!()
}

/// Applies one operator; dividing by zero -> Err("division by zero")
fn apply(left: i64, op: Token, right: i64) -> Result<i64, String> {
    todo!()
}

/// Evaluates the line with * and / before + and -
fn eval(input: &str) -> Result<i64, String> {
    todo!()
}

/// What the calculator prints for one line: "= 42" or "error: ..."
fn run_line(line: &str) -> String {
    todo!()
}
`;

const solution = `#[derive(Debug, PartialEq, Clone, Copy)]
enum Token {
    Num(i64),
    Plus,
    Minus,
    Star,
    Slash,
}

fn tokenize(input: &str) -> Result<Vec<Token>, String> {
    let mut tokens = Vec::new();
    let mut number: Option<i64> = None;
    for c in input.chars() {
        if let Some(d) = c.to_digit(10) {
            number = Some(number.unwrap_or(0) * 10 + d as i64);
            continue;
        }
        if let Some(n) = number.take() {
            tokens.push(Token::Num(n));
        }
        match c {
            ' ' => {}
            '+' => tokens.push(Token::Plus),
            '-' => tokens.push(Token::Minus),
            '*' => tokens.push(Token::Star),
            '/' => tokens.push(Token::Slash),
            other => return Err(format!("unexpected character '{}'", other)),
        }
    }
    if let Some(n) = number {
        tokens.push(Token::Num(n));
    }
    Ok(tokens)
}

fn apply(left: i64, op: Token, right: i64) -> Result<i64, String> {
    match op {
        Token::Plus => Ok(left + right),
        Token::Minus => Ok(left - right),
        Token::Star => Ok(left * right),
        Token::Slash if right == 0 => Err(String::from("division by zero")),
        Token::Slash => Ok(left / right),
        Token::Num(n) => Err(format!("expected an operator, found {}", n)),
    }
}

fn number_at(tokens: &[Token], i: usize) -> Result<i64, String> {
    match tokens.get(i) {
        Some(Token::Num(n)) => Ok(*n),
        Some(t) => Err(format!("expected a number, found {:?}", t)),
        None => Err(String::from("expected a number at the end")),
    }
}

fn eval(input: &str) -> Result<i64, String> {
    let tokens = tokenize(input)?;
    if tokens.is_empty() {
        return Err(String::from("empty expression"));
    }
    let mut total = 0;
    let mut sign = Token::Plus;
    let mut term = number_at(&tokens, 0)?;
    let mut i = 1;
    while i < tokens.len() {
        let op = tokens[i];
        let next = number_at(&tokens, i + 1)?;
        match op {
            Token::Star | Token::Slash => term = apply(term, op, next)?,
            Token::Plus | Token::Minus => {
                total = apply(total, sign, term)?;
                sign = op;
                term = next;
            }
            Token::Num(n) => return Err(format!("expected an operator, found {}", n)),
        }
        i += 2;
    }
    apply(total, sign, term)
}

fn run_line(line: &str) -> String {
    match eval(line) {
        Ok(value) => format!("= {}", value),
        Err(e) => format!("error: {}", e),
    }
}
`;

export const rsCalculator: Project = {
  slug: "rs-calculator",
  stage: 0,
  track: "rust",
  level: 1,
  title: "حاسبة سطر أوامر",
  brief:
    "تبني قلب حاسبة سطر أوامر: تقرأ سطراً مثل \"2 + 3 * 4\" وتطبع = 14، أو رسالة خطأ واضحة. القطع من دروس المستوى: enum Token لأنواع الرموز، و match لفتحها، و Result لكل خطوة قد تفشل، و ? لتمرير الخطأ دون انهيار. لا unwrap في الكود: كل مدخل خاطئ يصير Err يصل إلى المستخدم. لا تكتب fn main: الاختبارات تستدعي دوالك.",
  lang: "rust",
  steps: [
    "اقرأ enum Token في البداية: Num(i64) يحمل رقماً، والباقي عمليات بلا بيانات. derive(PartialEq) يسمح للاختبارات بمقارنة القوائم بـ ==.",
    "اكتب tokenize: مرّ على input.chars(). الرقم قد يكون عدة خانات، فاحفظ الرقم الجاري في Option<i64> (c.to_digit(10) تعطيك Some(خانة) أو None)، وادفعه إلى القائمة حين ينتهي. تجاهل المسافات، وأرجع Err(\"unexpected character 'x'\") لأي حرف آخر.",
    "اكتب apply بـ match على op: أربع عمليات، و Slash مع right == 0 ترجع Err(\"division by zero\"). (فرع بشرط: Token::Slash if right == 0 => ...)",
    "اكتب eval: tokenize(input)? أولاً، وسطر فارغ خطأ. الرموز تتناوب: رقم، عملية، رقم... احفظ total للمجموع، و sign للعملية + أو - المعلّقة، و term للحد الحالي. * و / تُطبَّق فوراً على term، أما + و - فتضيف term إلى total وتبدأ حداً جديداً. ولا تنسَ أن العملية في آخر السطر (\"3 +\") خطأ.",
    "دالة مساعدة number_at(&tokens, i) -> Result<i64, String> تختصر الكثير: ترجع الرقم في الموضع i أو خطأً إن لم يكن رقماً أو لم يوجد (tokens.get(i)).",
    "اكتب run_line: match على eval(line)، فتُرجع \"= 42\" أو \"error: ...\".",
    "اضغط «شغّل الاختبارات». إن فشل اختبار، اكتب fn main صغيرة مؤقتة تطبع {:?} لنتيجة tokenize أو eval على مدخل ذلك الاختبار، ثم احذفها.",
  ],
  starter,
  solution,
  tests: [
    {
      name: "tokenize يقرأ الأرقام متعددة الخانات والعمليات",
      code: `fn main() {
    let ok = tokenize("12+3") == Ok(vec![Token::Num(12), Token::Plus, Token::Num(3)]);
    println!("{}", ok);
}`,
    },
    {
      name: "tokenize يتجاهل المسافات ويعرف العمليات الأربع",
      code: `fn main() {
    let want = vec![Token::Num(7), Token::Star, Token::Num(2), Token::Minus, Token::Num(10), Token::Slash, Token::Num(5)];
    println!("{}", tokenize(" 7 * 2 - 10 / 5 ") == Ok(want) && tokenize("") == Ok(vec![]));
}`,
    },
    {
      name: "tokenize يرجع Err لحرف غير معروف",
      code: `fn main() {
    println!("{}", tokenize("2 $ 3") == Err(String::from("unexpected character '$'")));
}`,
    },
    {
      name: "apply تحسب العمليات وترفض القسمة على صفر",
      code: `fn main() {
    let ok = apply(7, Token::Minus, 10) == Ok(-3)
        && apply(6, Token::Star, 7) == Ok(42)
        && apply(9, Token::Slash, 2) == Ok(4)
        && apply(1, Token::Slash, 0) == Err(String::from("division by zero"));
    println!("{}", ok);
}`,
    },
    {
      name: "eval يحسب من اليسار إلى اليمين",
      code: `fn main() {
    println!("{}", eval("42") == Ok(42) && eval("1 + 2 - 4") == Ok(-1) && eval("10 - 3 - 2") == Ok(5));
}`,
    },
    {
      name: "eval يقدّم * و / على + و -",
      code: `fn main() {
    println!("{}", eval("2 + 3 * 4") == Ok(14) && eval("20 - 6 / 2 * 3") == Ok(11) && eval("2 * 3 + 4 * 5") == Ok(26));
}`,
    },
    {
      name: "eval يرجع Err لسطر فارغ أو ناقص أو مقلوب",
      code: `fn main() {
    let ok = eval("").is_err() && eval("3 +").is_err() && eval("* 2").is_err() && eval("4 4").is_err();
    println!("{}", ok);
}`,
    },
    {
      name: "eval يمرّر الأخطاء من tokenize و apply كما هي",
      code: `fn main() {
    let ok = eval("8 / (2)") == Err(String::from("unexpected character '('"))
        && eval("5 + 4 / 0") == Err(String::from("division by zero"));
    println!("{}", ok);
}`,
    },
    {
      name: "run_line يطبع النتيجة أو الخطأ",
      code: `fn main() {
    let ok = run_line("6 * 7") == "= 42" && run_line("1 / 0") == "error: division by zero";
    println!("{}", ok);
}`,
    },
  ],
};
