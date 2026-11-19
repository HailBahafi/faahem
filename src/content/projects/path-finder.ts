import type { Project } from "@/lib/types";

export const pathFinder: Project = {
  slug: "path-finder",
  stage: 3,
  title: "مستكشف المسارات",
  brief:
    "متاهة على شكل شبكة: كل صف نص، و \"#\" جدار و \".\" خانة فارغة. تكتب برنامجاً يجد أقصر طريق من البداية إلى الهدف بالبحث بالعرض (BFS): الشبكة رسم بياني، والطابور يقرر من نزور أولاً، ومجموعة visited تمنعنا من الدوران في حلقة. هنا تجتمع هياكل المرحلة كلها في خوارزمية واحدة.",
  lang: "js",
  steps: [
    "اكتب inside(grid, r, c) التي ترجع true إذا كانت الخانة داخل الشبكة: r بين 0 و grid.length - 1، و c بين 0 و grid[0].length - 1.",
    "اكتب neighbours(grid, r, c) التي ترجع مصفوفة الجيران الذين يمكن المشي إليهم، كل جار [صف، عمود]، بهذا الترتيب: أعلى، أسفل، يسار، يمين. تخطَّ ما هو خارج الشبكة وما هو جدار \"#\".",
    "ابدأ shortestPath(grid, start, goal): إذا كانت البداية أو الهدف جداراً أرجع -1، وإذا كانت البداية هي الهدف أرجع 0. الموقعان مصفوفتان [r, c].",
    "أنشئ طابوراً (مصفوفة) فيه البداية مع عدد خطواتها: { r, c, steps: 0 }، ومجموعة visited (Set) فيها المفتاح \"r,c\" للبداية.",
    "ما دام الطابور غير فارغ: أخرج أول عنصر بـ shift، ومرّ على جيرانه. كل جار لم تزره بعد: أضفه إلى visited وإلى آخر الطابور بخطوات + 1. وإذا كان الجار هو الهدف فأرجع عدد خطواته فوراً.",
    "إذا فرغ الطابور ولم تصل إلى الهدف، فلا طريق: أرجع -1.",
    "اضغط «شغّل الاختبارات». لماذا يضمن BFS أن أول وصول إلى الهدف هو الأقصر؟ لأنه يزور كل الخانات على بعد 1 قبل أي خانة على بعد 2.",
  ],
  starter: `function inside(grid, r, c) {
  // داخل حدود الشبكة؟
}

function neighbours(grid, r, c) {
  // أعلى، أسفل، يسار، يمين: بلا جدران وبلا خروج من الشبكة
  return [];
}

function shortestPath(grid, start, goal) {
  // BFS: طابور + visited
  // أرجع عدد الخطوات أو -1
}

const maze = [
  "..#",
  ".##",
  "...",
];
console.log(neighbours(maze, 0, 0));
console.log(shortestPath(maze, [0, 0], [2, 2]));
`,
  solution: `function inside(grid, r, c) {
  return r >= 0 && r < grid.length && c >= 0 && c < grid[0].length;
}

function neighbours(grid, r, c) {
  const moves = [[-1, 0], [1, 0], [0, -1], [0, 1]];
  const result = [];
  for (const [dr, dc] of moves) {
    const nr = r + dr;
    const nc = c + dc;
    if (inside(grid, nr, nc) && grid[nr][nc] !== "#") {
      result.push([nr, nc]);
    }
  }
  return result;
}

function shortestPath(grid, start, goal) {
  const [sr, sc] = start;
  const [gr, gc] = goal;
  if (grid[sr][sc] === "#" || grid[gr][gc] === "#") {
    return -1;
  }
  if (sr === gr && sc === gc) {
    return 0;
  }
  const queue = [{ r: sr, c: sc, steps: 0 }];
  const visited = new Set([sr + "," + sc]);
  while (queue.length > 0) {
    const cur = queue.shift();
    for (const [nr, nc] of neighbours(grid, cur.r, cur.c)) {
      const key = nr + "," + nc;
      if (visited.has(key)) {
        continue;
      }
      if (nr === gr && nc === gc) {
        return cur.steps + 1;
      }
      visited.add(key);
      queue.push({ r: nr, c: nc, steps: cur.steps + 1 });
    }
  }
  return -1;
}
`,
  tests: [
    { name: "inside يميّز الخانات داخل الشبكة وخارجها", code: `const g = ["...", "..."];
console.log(inside(g, 0, 0) === true && inside(g, 1, 2) === true && inside(g, 2, 0) === false && inside(g, 0, -1) === false && inside(g, 0, 3) === false);` },
    { name: "neighbours في وسط شبكة مفتوحة: أربعة جيران بالترتيب أعلى، أسفل، يسار، يمين", code: `const g = ["...", "...", "..."];
console.log(JSON.stringify(neighbours(g, 1, 1)) === "[[0,1],[2,1],[1,0],[1,2]]");` },
    { name: "neighbours يتخطى الجدران وحواف الشبكة", code: `const g = [".#.", "...", "#.."];
console.log(JSON.stringify(neighbours(g, 0, 0)) === "[[1,0]]" && JSON.stringify(neighbours(g, 1, 0)) === "[[0,0],[1,1]]");` },
    { name: "shortestPath في ممر مستقيم بلا جدران", code: `console.log(shortestPath(["....."], [0, 0], [0, 4]) === 4);` },
    { name: "shortestPath يلتف حول الجدران ويجد الأقصر", code: `const g = [
  "..#...",
  ".##.#.",
  "......",
  ".#.##.",
];
console.log(shortestPath(g, [0, 0], [0, 5]) === 9 && shortestPath(g, [3, 0], [3, 5]) === 7);` },
    { name: "shortestPath يرجع -1 عندما يحيط الجدار بالهدف", code: `const g = [
  "...#.",
  "...#.",
  "...#.",
];
console.log(shortestPath(g, [0, 0], [2, 4]) === -1);` },
    { name: "shortestPath يرجع 0 عندما تكون البداية هي الهدف", code: `console.log(shortestPath(["...", "..."], [1, 1], [1, 1]) === 0);` },
    { name: "shortestPath يرجع -1 إذا كانت البداية أو الهدف جداراً", code: `const g = ["#..", "..#"];
console.log(shortestPath(g, [0, 0], [1, 1]) === -1 && shortestPath(g, [1, 0], [1, 2]) === -1);` },
    { name: "shortestPath يعمل على شبكة كبيرة (20 × 20) دون أن يدور في حلقة", code: `const g = [];
for (let i = 0; i < 20; i++) g.push(".".repeat(20));
console.log(shortestPath(g, [0, 0], [19, 19]) === 38);` },
  ],
};
