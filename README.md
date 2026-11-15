# japanese-style

AI エージェントが日本語の文章を書く・直すときに、文体、用語、句読点、文字の表記を整えるスキルです。会話、進捗報告、結論、要約、ドキュメント、日本語で書くコードコメントに使えます。

ソフトウェアの説明では「Node.js の版を確認した」より「Node.js のバージョンを確認した」のほうが伝わりやすく、書籍なら「第2版」が自然です。読み手が見慣れた呼び方を選び、画面のラベルやコマンドは実際の表記に合わせます。

## インストール

```sh
npx skills@latest add otnc/skills_japanese-style --skill japanese-style
```

クローンしたリポジトリから試す場合は、そのディレクトリで `npx skills@latest add . --skill japanese-style` を実行してください。

## 使い方

インストール後、日本語で文章を書いたりまとめたりする場面で使えます。スキルを指定して依頼することもできます。

> japanese-style を使って、この変更を日本語でまとめて。ソフトウェアの用語は開発者が普段使う表記にそろえて。

[SKILL.md](skills/japanese-style/SKILL.md) に文章のルール、[修正例](skills/japanese-style/references/writing-examples.md) に会話やドキュメントなどの書き換え例をまとめています。[技術用語の例](skills/japanese-style/references/terminology.md) にない言葉も、読み手に通じやすいカタカナ語ならそのまま使います。

## lint

リポジトリのルートから、Node.js で UTF-8 のファイルを検査できます。用語、康熙部首、文字化けは個別に検査できます。オプションを省略すると全項目を検査し、複数指定すると選んだ項目を検査します。標準入力から読む場合は、ファイル名の代わりに `-` を指定します。

```sh
node skills/japanese-style/scripts/lint.js --terminology README.md
node skills/japanese-style/scripts/lint.js --kangxi-radicals README.md
node skills/japanese-style/scripts/lint.js --encoding README.md
```

- `warn [terminology]` は言い換え候補です。文脈に合う和語や漢語はそのまま使えます。
- `error [kangxi-radical]` は漢字とよく似た部首記号の検出です。該当するコードポイントと対応先を1字ずつ表示します。[康熙部首214字の対応表](skills/japanese-style/references/kangxi-radicals.md)
- `error [encoding]` は不正な UTF-8 と、入力にすでに含まれる置換文字（U+FFFD）を区別して表示します。UTF-8 として有効な文字列の誤変換や、元の文字コードの判定には別途確認が必要です。

終了コードは、エラーなしが `0`（警告のみを含む）、検査でエラーを検出した場合が `1`、引数やファイル読み込みに問題があった場合が `2` です。

## 開発

```sh
npm ci
npm run check
```

## ライセンス

[MIT](LICENSE)
