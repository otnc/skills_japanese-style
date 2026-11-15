# japanese-style

AI エージェントが日本語で回答やドキュメントを書くときに、読み手が普段使う用語を選ぶためのスキルです。会話、進捗報告、結論、要約、日本語で書くコードコメントにも使えます。

ソフトウェアの説明では「Node.js の版を確認した」より「Node.js のバージョンを確認した」のほうが伝わりやすく、書籍なら「第2版」が自然です。読み手が見慣れた呼び方を選び、画面のラベルやコマンドは実際の表記に合わせます。

## インストール

```sh
npx skills@latest add otnc/skills_japanese-style --skill japanese-style
```

クローンしたリポジトリから試す場合は、そのディレクトリで `npx skills@latest add . --skill japanese-style` を実行してください。

## 使い方

インストール後、日本語で文章を書いたりまとめたりする場面で使えます。スキルを指定して依頼することもできます。

> japanese-style を使って、この変更を日本語でまとめて。ソフトウェアの用語は開発者が普段使う表記にそろえて。

詳しいルールは [SKILL.md](skills/japanese-style/SKILL.md)、開発でよく使う表記は [技術用語の例](skills/japanese-style/references/terminology.md) にまとめています。一覧にない言葉も、読み手に通じやすいカタカナ語ならそのまま使います。

## 開発

```sh
npm ci
npm run check
```

## ライセンス

[MIT](LICENSE)
