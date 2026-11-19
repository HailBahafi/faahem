import type { Project } from "@/lib/types";

export const problemSet: Project = {
  slug: "problem-set",
  stage: 2,
  title: "حل 30 مسألة",
  brief:
    "ست مسائل صغيرة في ملف واحد، كل واحدة دالة Python. قبل أن تكتب أي سطر: فكّك المسألة إلى خطوات، تتبّعها بيدك على مثال صغير، ثم اكتبها. وإذا فشل اختبار فاصطد الخطأ بطباعة القيم بدل التخمين. حين تنتهي من الست، جرّب أن تصنع 24 مسألة مثلها بنفسك.",
  lang: "py",
  steps: [
    "اكتب count_vowels(text) التي ترجع عدد حروف العلة الإنجليزية (a e i o u) في النص، كبيرة كانت أو صغيرة. فكّكها: مرّ على كل حرف، حوّله إلى صغير، واسأل: هل هو في \"aeiou\"؟",
    "اكتب reverse_words(sentence) التي تعكس ترتيب الكلمات لا الحروف: \"I love code\" تصبح \"code love I\". استعمل split() ثم اعكس القائمة ثم join بمسافة. والنص الفارغ يرجع نصاً فارغاً.",
    "اكتب fizzbuzz(n) التي ترجع قائمة من 1 إلى n: كل رقم يقبل القسمة على 3 و 5 يصبح \"FizzBuzz\"، وعلى 3 فقط \"Fizz\"، وعلى 5 فقط \"Buzz\"، والباقي يبقى رقماً (int). انتبه لترتيب الشروط: أيها تسأل أولاً؟",
    "اكتب second_largest(nums) التي ترجع ثاني أكبر قيمة مختلفة في القائمة: [5, 1, 5, 3] ترجع 3. وإذا لم توجد قيمتان مختلفتان (قائمة فارغة أو [7, 7]) أرجع None.",
    "اكتب is_palindrome(text) التي ترجع True إذا قُرئ النص من الجهتين بالشكل نفسه، بعد تجاهل المسافات وحالة الحروف: \"Never odd or even\" تعطي True.",
    "اكتب running_total(nums) التي ترجع قائمة المجموع التراكمي: [1, 2, 3, 4] تصبح [1, 3, 6, 10]. والقائمة الفارغة ترجع قائمة فارغة.",
    "اضغط «شغّل الاختبارات». لكل اختبار يفشل: تتبّع الدالة بيدك على مدخلات ذلك الاختبار، أو اطبع القيم داخل الحلقة، حتى تجد السطر المخطئ.",
  ],
  starter: `def count_vowels(text):
    # مرّ على كل حرف واسأل: هل هو في "aeiou"؟
    pass


def reverse_words(sentence):
    # split ثم اعكس ثم join
    pass


def fizzbuzz(n):
    # قائمة من 1 إلى n
    pass


def second_largest(nums):
    # ثاني أكبر قيمة مختلفة، أو None
    pass


def is_palindrome(text):
    # تجاهل المسافات وحالة الحروف
    pass


def running_total(nums):
    # [1, 2, 3] -> [1, 3, 6]
    pass


print(count_vowels("Hello World"))
print(fizzbuzz(5))
`,
  solution: `def count_vowels(text):
    count = 0
    for ch in text:
        if ch.lower() in "aeiou":
            count += 1
    return count


def reverse_words(sentence):
    words = sentence.split()
    words.reverse()
    return " ".join(words)


def fizzbuzz(n):
    result = []
    for i in range(1, n + 1):
        if i % 15 == 0:
            result.append("FizzBuzz")
        elif i % 3 == 0:
            result.append("Fizz")
        elif i % 5 == 0:
            result.append("Buzz")
        else:
            result.append(i)
    return result


def second_largest(nums):
    unique = sorted(set(nums))
    if len(unique) < 2:
        return None
    return unique[-2]


def is_palindrome(text):
    clean = text.replace(" ", "").lower()
    return clean == clean[::-1]


def running_total(nums):
    totals = []
    total = 0
    for x in nums:
        total += x
        totals.append(total)
    return totals
`,
  tests: [
    { name: "count_vowels يعدّ الحروف الكبيرة والصغيرة، و 0 لنص بلا حروف علة", code: `print(str(count_vowels("Hello World") == 3 and count_vowels("AEIOU xyz") == 5 and count_vowels("rhythm") == 0 and count_vowels("") == 0).lower())` },
    { name: "reverse_words يعكس ترتيب الكلمات، والنص الفارغ يبقى فارغاً", code: `print(str(reverse_words("I love code") == "code love I" and reverse_words("one") == "one" and reverse_words("") == "").lower())` },
    { name: "fizzbuzz(15) يعطي القائمة الصحيحة", code: `print(str(fizzbuzz(15) == [1, 2, "Fizz", 4, "Buzz", "Fizz", 7, 8, "Fizz", "Buzz", 11, "Fizz", 13, 14, "FizzBuzz"]).lower())` },
    { name: "fizzbuzz للحالات الحدية: n = 1 و n = 0", code: `print(str(fizzbuzz(1) == [1] and fizzbuzz(0) == []).lower())` },
    { name: "second_largest يتجاهل القيم المكررة والسالبة", code: `print(str(second_largest([5, 1, 5, 3]) == 3 and second_largest([10, 20]) == 10 and second_largest([-1, -5, -3]) == -3).lower())` },
    { name: "second_largest يرجع None إذا لم توجد قيمتان مختلفتان", code: `print(str(second_largest([]) is None and second_largest([7]) is None and second_largest([7, 7]) is None).lower())` },
    { name: "is_palindrome يتجاهل المسافات وحالة الحروف", code: `print(str(is_palindrome("racecar") == True and is_palindrome("Never odd or even") == True and is_palindrome("hello") == False).lower())` },
    { name: "is_palindrome: النص الفارغ والحرف الواحد متناظران", code: `print(str(is_palindrome("") == True and is_palindrome("a") == True).lower())` },
    { name: "running_total يجمع تراكمياً، والقائمة الفارغة ترجع فارغة", code: `print(str(running_total([1, 2, 3, 4]) == [1, 3, 6, 10] and running_total([5, -2]) == [5, 3] and running_total([]) == []).lower())` },
  ],
};
