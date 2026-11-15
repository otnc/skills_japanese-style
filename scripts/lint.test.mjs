import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const skill = new URL("../skills/japanese-style/", import.meta.url);
const linter = fileURLToPath(new URL("scripts/lint.js", skill));

function runLint(input, ...args) {
  return spawnSync(process.execPath, [linter, ...args, "-"], {
    input,
    encoding: "utf8",
  });
}

test("runs only the selected check for mixed input", () => {
  const input = "⾧野でプル要求を確認した。";
  const terminology = runLint(input, "--terminology");
  assert.equal(terminology.status, 0, terminology.stderr);
  assert.match(terminology.stdout, /warn \[terminology\]/);
  assert.doesNotMatch(terminology.stdout, /error \[kangxi-radical\]/);

  const radicals = runLint(input, "--kangxi-radicals");
  assert.equal(radicals.status, 1, radicals.stderr);
  assert.match(radicals.stdout, /error \[kangxi-radical\]/);
  assert.doesNotMatch(radicals.stdout, /warn \[terminology\]/);

  const both = runLint(input, "--terminology", "--kangxi-radicals");
  const byDefault = runLint(input);
  assert.equal(both.status, 1, both.stderr);
  assert.equal(byDefault.status, both.status, byDefault.stderr);
  assert.equal(byDefault.stdout, both.stdout);
  assert.match(both.stdout, /warn \[terminology\]/);
  assert.match(both.stdout, /error \[kangxi-radical\]/);
});

test("reports terminology suggestions without failing or flagging edition names", () => {
  const result = runLint("書籍の第2版と日本語版。Node.js の版番号と版を確認。\r\nプル要求と要求の見出し。");
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(result.stdout.trim().split(/\r?\n/).map((line) => line.split(" if it fits")[0]), [
    "<stdin>:1:22: warn [terminology] 「版番号」 → 「バージョン番号」",
    "<stdin>:1:26: warn [terminology] 「版」 → 「バージョン」",
    "<stdin>:2:1: warn [terminology] 「プル要求」 → 「プルリクエスト」",
    "<stdin>:2:6: warn [terminology] 「要求の見出し」 → 「リクエストヘッダー」",
  ]);
});

test("uses nearby technical cues without warning about ordinary meanings", () => {
  const result = runLint([
    "文脈に合う言葉を選ぶ。LLM に渡す文脈を短くした。",
    "この手順で画像を保存する。",
    "Docker の画像をビルドする。",
    "質問への応答を確認した。HTTP の応答を記録する。",
    "道の分岐を右に進む。Git の分岐を切り替える。",
  ].join("\n"), "--terminology");

  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(result.stdout.trim().split(/\r?\n/).map((line) => line.split(" if it fits")[0]), [
    "<stdin>:1:19: warn [terminology] 「文脈」 → 「コンテキスト」",
    "<stdin>:3:9: warn [terminology] 「画像」 → 「イメージ」",
    "<stdin>:4:19: warn [terminology] 「応答」 → 「レスポンス」",
    "<stdin>:5:16: warn [terminology] 「分岐」 → 「ブランチ」",
  ]);
});

test("distinguishes malformed bytes from replacement characters already in UTF-8", () => {
  const invalid = runLint(Buffer.from([0x82, 0xA0]), "--encoding");
  assert.equal(invalid.status, 1, invalid.stderr);
  assert.match(invalid.stdout, /error \[encoding\] Input is not valid UTF-8/);
  assert.doesNotMatch(invalid.stdout, /already present/);

  const replacement = runLint("プル要求\r\n𠮷\uFFFD⾧\uFFFD", "--encoding");
  assert.equal(replacement.status, 1, replacement.stderr);
  assert.deepEqual(replacement.stdout.trim().split(/\r?\n/), [
    "<stdin>:2:2: error [encoding] Unicode replacement character (U+FFFD) is already present in the input.",
    "<stdin>:2:4: error [encoding] Unicode replacement character (U+FFFD) is already present in the input.",
  ]);

  const defaults = runLint("日本語\uFFFD");
  assert.equal(defaults.status, 1, defaults.stderr);
  assert.match(defaults.stdout, /U\+FFFD/);

  const valid = runLint("\uFEFF日本語𠮷", "--encoding");
  assert.equal(valid.status, 0, valid.stderr);
  assert.equal(valid.stdout, "");
});

test("reports every Kangxi radical and agrees with all 214 reference entries", () => {
  const reference = readFileSync(new URL("references/kangxi-radicals.md", skill), "utf8");
  const rows = [...reference.matchAll(/^\| (\d+) \| (.) \| `(U\+[\dA-F]{4})` \| (.) \| `(U\+[\dA-F]{4})` \|\r?$/gmu)];
  const radicals = Array.from({ length: 214 }, (_, index) => String.fromCodePoint(0x2F00 + index));
  assert.deepEqual(rows.map(([, , radical]) => radical), radicals);

  const result = runLint(`𠮷${radicals.join("")}長`);
  assert.equal(result.status, 1, result.stderr);
  const diagnostics = result.stdout.trim().split(/\r?\n/);
  assert.equal(diagnostics.length, radicals.length);

  for (const [index, [, number, radical, source, ideograph, target]] of rows.entries()) {
    assert.equal(Number(number), index + 1);
    assert.equal(radical.normalize("NFKC"), ideograph);
    assert.match(diagnostics[index], /^<stdin>:1:\d+: error \[kangxi-radical\]/);
    assert.ok(diagnostics[index].startsWith(`<stdin>:1:${index + 2}:`));
    assert.ok(diagnostics[index].includes(`「${radical}」 (${source})`));
    assert.ok(diagnostics[index].includes(`「${ideograph}」 (${target})`));
  }
});

test("keeps file errors distinct and continues linting later inputs", () => {
  const result = runLint("⾧野", fileURLToPath(new URL("missing-file.txt", skill)));
  assert.equal(result.status, 2);
  assert.match(result.stderr, /ENOENT/);
  assert.match(result.stdout, /<stdin>:1:1: error \[kangxi-radical\].*U\+2FA7.*U\+9577/);
});
