import type { Project } from "@/lib/types";

const LOG = `	lines := []string{
		"2026-11-21 09:59:58 INFO server started",
		"2026-11-21 10:00:01 ERROR disk full",
		"2026-11-21 10:00:05 WARN slow request /home",
		"garbage line",
		"2026-11-21 10:15:00 ERROR disk full",
		"2026-11-21 11:20:00 ERROR db timeout",
		"2026-11-21 11:21:00 error lowercase level",
		"2026-11-21 11:30:00 INFO user login",
	}`;

export const goLogAnalyzer: Project = {
  slug: "go-log-analyzer",
  stage: 0,
  track: "go",
  level: 1,
  title: "محلّل سجلات",
  brief:
    "كل خادم يكتب سجلاً: سطر لكل حدث، فيه التاريخ والوقت والمستوى (INFO أو WARN أو ERROR) ثم الرسالة. ستكتب بـ Go الدوال التي تقرأ هذه الأسطر وتلخّصها: كم خطأً وقع، وفي أي ساعة، وما أكثر خطأ تكرّر. ستستعمل كل ما في المستوى: strings لتقسيم السطر، و struct لكل سطر، و map للعدّ، و slices للأسطر، ومؤشراً لتحديث ملخّص في مكانه. لا تكتب main: الاختبارات تستدعي دوالك وتطبع true حين تنجح.",
  lang: "go",
  steps: [
    "اكتب parseLine(line string) (Entry, bool). قسّم السطر بـ strings.Fields. السطر صالح إذا كان فيه 4 أجزاء على الأقل، وطول الوقت 8 أحرف (مثل 10:00:01)، والمستوى واحد من INFO و WARN و ERROR بحروف كبيرة بالضبط. الرسالة هي كل الكلمات بعد المستوى مضمومة بمسافة واحدة (strings.Join). وللسطر غير الصالح أرجع Entry{} و false.",
    "اكتب countLevels(lines []string) map[string]int التي تعدّ الأسطر الصالحة حسب المستوى وتتجاهل غير الصالحة. أنشئ الجدول بـ make حتى يرجع جدولاً حقيقياً جاهزاً للكتابة حتى لو كانت القائمة فارغة.",
    "اكتب errorsByHour(lines []string) map[string]int: لكل سطر ERROR صالح زد العدّاد تحت الساعة، وهي أول حرفين من الوقت (e.Time[:2]).",
    "اكتب topError(lines []string) (string, int) التي ترجع أكثر رسالة ERROR تكراراً وعدد مرّاتها. عند التعادل اختر الرسالة الأصغر أبجدياً (ترتيب map عشوائي، فلا تعتمد عليه). وإن لم يوجد أي خطأ أرجع \"\" و 0.",
    "اكتب addLine(s *Summary, line string) التي تحدّث الملخّص الذي يشير إليه s: تزيد Total لكل سطر، و Skipped للسطر غير الصالح، و Levels[level] للصالح، وتحفظ في FirstError رسالة أول ERROR فقط. انتبه: Summary الفارغ فيه Levels تساوي nil، والكتابة في map قيمتها nil توقف البرنامج.",
    "اضغط «شغّل الاختبارات». لكل اختبار يفشل: انسخ أسطر السجل من الاختبار وتتبّع دالتك عليها سطراً سطراً، أو اطبع ما ترجعه parseLine لكل سطر.",
  ],
  starter: `package main

import (
	"fmt"
	"strings"
)

// Entry is one parsed log line.
type Entry struct {
	Date    string
	Time    string
	Level   string
	Message string
}

// Summary is updated in place, one line at a time, by addLine.
type Summary struct {
	Total      int
	Skipped    int
	Levels     map[string]int
	FirstError string
}

func parseLine(line string) (Entry, bool) {
	parts := strings.Fields(line)
	if len(parts) < 4 {
		return Entry{}, false
	}
	// check the time and the level, then fill every field
	// (Message is all the words after the level, joined by one space)
	return Entry{Date: parts[0]}, false
}

func countLevels(lines []string) map[string]int {
	// count valid lines per level
	return nil
}

func errorsByHour(lines []string) map[string]int {
	// ERROR lines per hour: the hour is e.Time[:2]
	return nil
}

func topError(lines []string) (string, int) {
	// the most frequent ERROR message; on a tie the alphabetically smaller one
	return "", 0
}

func addLine(s *Summary, line string) {
	// s points at the caller's Summary: update its fields through s
}

var _ = fmt.Sprint // the tests use fmt
`,
  solution: `package main

import (
	"fmt"
	"strings"
)

// Entry is one parsed log line.
type Entry struct {
	Date    string
	Time    string
	Level   string
	Message string
}

// Summary is updated in place, one line at a time, by addLine.
type Summary struct {
	Total      int
	Skipped    int
	Levels     map[string]int
	FirstError string
}

var validLevels = map[string]bool{"INFO": true, "WARN": true, "ERROR": true}

func parseLine(line string) (Entry, bool) {
	parts := strings.Fields(line)
	if len(parts) < 4 || len(parts[1]) != 8 || !validLevels[parts[2]] {
		return Entry{}, false
	}
	return Entry{
		Date:    parts[0],
		Time:    parts[1],
		Level:   parts[2],
		Message: strings.Join(parts[3:], " "),
	}, true
}

func countLevels(lines []string) map[string]int {
	counts := make(map[string]int)
	for _, line := range lines {
		if e, ok := parseLine(line); ok {
			counts[e.Level]++
		}
	}
	return counts
}

func errorsByHour(lines []string) map[string]int {
	hours := make(map[string]int)
	for _, line := range lines {
		if e, ok := parseLine(line); ok && e.Level == "ERROR" {
			hours[e.Time[:2]]++
		}
	}
	return hours
}

func topError(lines []string) (string, int) {
	counts := make(map[string]int)
	for _, line := range lines {
		if e, ok := parseLine(line); ok && e.Level == "ERROR" {
			counts[e.Message]++
		}
	}
	best, most := "", 0
	for msg, n := range counts {
		if n > most || (n == most && msg < best) {
			best, most = msg, n
		}
	}
	return best, most
}

func addLine(s *Summary, line string) {
	s.Total++
	e, ok := parseLine(line)
	if !ok {
		s.Skipped++
		return
	}
	if s.Levels == nil {
		s.Levels = make(map[string]int)
	}
	s.Levels[e.Level]++
	if e.Level == "ERROR" && s.FirstError == "" {
		s.FirstError = e.Message
	}
}

var _ = fmt.Sprint // the tests use fmt
`,
  tests: [
    {
      name: "parseLine يقرأ سطراً صالحاً إلى Entry كامل",
      code: `func main() {
	e, ok := parseLine("2026-11-21 10:00:01 ERROR disk full")
	fmt.Println(ok && e.Date == "2026-11-21" && e.Time == "10:00:01" && e.Level == "ERROR" && e.Message == "disk full")
}`,
    },
    {
      name: "parseLine يضم كلمات الرسالة بمسافة واحدة",
      code: `func main() {
	e, ok := parseLine("  2026-11-21 10:00:05   WARN  slow    request /home ")
	fmt.Println(ok && e.Level == "WARN" && e.Message == "slow request /home")
}`,
    },
    {
      name: "parseLine يرفض الأسطر غير الصالحة",
      code: `func main() {
	bad := []string{
		"garbage line",
		"",
		"2026-11-21 10:00:01 ERROR",
		"2026-11-21 10:00:01 DEBUG cache miss",
		"2026-11-21 10:00:01 error lowercase level",
		"2026-11-21 10:00 INFO short time",
	}
	all := true
	for _, line := range bad {
		if _, ok := parseLine(line); ok {
			all = false
		}
	}
	fmt.Println(all)
}`,
    },
    {
      name: "countLevels يعدّ كل مستوى ويتجاهل الأسطر غير الصالحة",
      code: `func main() {
${LOG}
	c := countLevels(lines)
	fmt.Println(c["INFO"] == 2 && c["WARN"] == 1 && c["ERROR"] == 3 && len(c) == 3)
}`,
    },
    {
      name: "countLevels لقائمة فارغة يرجع map فارغاً جاهزاً للكتابة",
      code: `func main() {
	c := countLevels(nil)
	empty := len(c) == 0
	c["INFO"]++
	fmt.Println(empty && c["INFO"] == 1)
}`,
    },
    {
      name: "errorsByHour يعدّ أخطاء كل ساعة",
      code: `func main() {
${LOG}
	h := errorsByHour(lines)
	fmt.Println(h["10"] == 2 && h["11"] == 1 && h["09"] == 0 && len(h) == 2)
}`,
    },
    {
      name: "topError يرجع أكثر خطأ تكراراً وعدده",
      code: `func main() {
${LOG}
	msg, n := topError(lines)
	fmt.Println(msg == "disk full" && n == 2)
}`,
    },
    {
      name: "topError عند التعادل يختار الأصغر أبجدياً، وبلا أخطاء يرجع \"\" و 0",
      code: `func main() {
	tie := []string{
		"2026-11-21 10:00:00 ERROR timeout",
		"2026-11-21 10:00:01 ERROR auth failed",
		"2026-11-21 10:00:02 ERROR timeout",
		"2026-11-21 10:00:03 ERROR auth failed",
		"2026-11-21 10:00:04 INFO ok",
	}
	msg, n := topError(tie)
	none, zero := topError([]string{"2026-11-21 10:00:04 INFO ok"})
	fmt.Println(msg == "auth failed" && n == 2 && none == "" && zero == 0)
}`,
    },
    {
      name: "addLine يحدّث الملخّص عبر المؤشر، بدءاً من Summary فارغ",
      code: `func main() {
${LOG}
	var s Summary
	for _, line := range lines {
		addLine(&s, line)
	}
	fmt.Println(s.Total == 8 && s.Skipped == 2 && s.Levels["ERROR"] == 3 && s.Levels["INFO"] == 2 && s.FirstError == "disk full")
}`,
    },
  ],
};
