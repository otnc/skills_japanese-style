# japanese-style

AI エージェントが日本語の文章を書く・直すときに、構成、文体、用語、表記を整えるスキルです。会話での回答や進捗報告、手順書、要約、コードコメント、コミットメッセージや PR の説明に使えます。

ソフトウェアの説明では「Node.js の版を確認した」より「Node.js のバージョンを確認した」のほうが伝わりやすく、書籍なら「第2版」が自然です。読み手が見慣れた呼び方を選び、画面のラベルやコマンドは実際の表記に合わせます。

## インストール

```sh
npx skills@latest add otnc/skills_japanese-style --skill japanese-style
```

クローンしたリポジトリから試す場合は、そのディレクトリで `npx skills@latest add . --skill japanese-style` を実行してください。

## 使い方

インストール後、日本語で文章を書いたりまとめたりする場面で使えます。スキルを指定して依頼することもできます。

> japanese-style を使って、この変更を日本語でまとめて。ソフトウェアの用語は開発者が普段使う表記にそろえて。

[SKILL.md](skills/japanese-style/SKILL.md) に文章の基本ルール、[文章ガイド](skills/japanese-style/references/writing-guide.md) に情報の並べ方や図表の書き方、[修正例](skills/japanese-style/references/writing-examples.md) に媒体ごとの書き換え例をまとめています。[技術用語の例](skills/japanese-style/references/terminology.md) にない言葉も、読み手に通じやすいカタカナ語ならそのまま使います。

[読点の使い方](skills/japanese-style/references/commas.md) には読み誤りを防ぐ位置にだけ読点を打つ方針と、読点を打つ文と外す文の例があります。

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

## 参考プロンプトの更新確認

GitHub Actions の **check upstream prompt** が毎週月曜の20時（日本時間）に AoTofu さんの公開プロンプトのリポジトリを確認します。前回の報告から更新があれば、その日の Issue を1件作ります。Issue に付く `upstream-prompt` ラベルと差分リンクから、スキルに反映する内容を確認できます。

このワークフローが作成した Issue のうち、開いているものは新しい順に5件残します。閉じた Issue も、報告済みの更新を判別するために参照します。

## リリース

1. リリースする変更をデフォルトブランチにプッシュします。
2. GitHub の **Actions** で **release** を開き、**Run workflow** からデフォルトブランチを選びます。`version` には `0.2.0` のように `v` を付けずに入力します。
3. ワークフローが `npm version` で `package.json` と `package-lock.json` を更新し、CI と同じチェックを実行します。チェックが通ると、バージョンの変更をデフォルトブランチにコミットし、`v0.2.0` のタグを付けて GitHub Release を作成します。すでに同じバージョンなら、バージョン更新のコミットは省略します。

## 参考資料

### 日本語の文章と評価

- [AoTofu さんの公開プロンプト](https://github.com/AoTofu/my-claude-system-prompt)
- [日本翻訳連盟の日本語標準スタイルガイド](https://www.jtf.jp/tips/styleguide)
- [ChatGPT の日本語生成能力の評価](https://www.jstage.jst.go.jp/article/jnlp/31/2/31_349/_article/-char/ja)
- [日本語での丁寧さの調整を調べた研究](https://aclanthology.org/2026.gebnlp-1.7/)
- [日中同形異義語の理解を評価した研究](https://aclanthology.org/2025.ijcnlp-long.96/)

### 読点の使い方

- [国立国語研究所の読点の解説](https://kotoba.ninjal.ac.jp/qa/yokuaru/qa-53/)
- [文化庁の公用文作成の考え方](https://www.bunka.go.jp/seisaku/bunkashingikai/kokugo/hokoku/93657201.html)
- [意味的バイアスを持つ日本語両義文の処理に及ぼすカンマの影響](https://www.jstage.jst.go.jp/article/jjpsy/85/2/85_85.13311/_article/-char/ja/)
- [人文系論文における「は」直後の読点使用の研究](https://www.jstage.jst.go.jp/article/jtje/26/0/26_27/_article/-char/ja/)
- [読点が接続詞の直後に打たれる要因](https://www.jstage.jst.go.jp/article/mathling/31/6/31_426/_article/-char/ja/)
- [岩崎拓也『現代日本語における句読点の研究』](https://cocopb.com/books/978-4-86676-062-9/)
- [本多勝一『〈新版〉日本語の作文技術』](https://publications.asahi.com/product/17593.html)
- [AI 生成文からみた「自然な日本語」についての研究](https://home.hiroshima-u.ac.jp/jshira/papers/AI%E7%94%9F%E6%88%90%E6%96%87%E3%81%8B%E3%82%89%E3%81%BF%E3%81%9F%E3%80%8C%E8%87%AA%E7%84%B6%E3%81%AA%E6%97%A5%E6%9C%AC%E8%AA%9E%E3%80%8D%E3%81%AB%E3%81%A4%E3%81%84%E3%81%A6%E3%81%AE%E7%A0%94%E7%A9%B6%EF%BC%88%E5%A4%A7%E8%A5%BF%E5%A4%A2%EF%BC%89.pdf)
- [Zenn の推敲前後の比較](https://zenn.dev/kakushigoto/articles/slop-banlist-vs-yomiyasu)
- [Zenn の業務報告の推敲例](https://zenn.dev/koji4/articles/42b8c6d5901323)
- [Zenn の AI 生成文の校正実験](https://zenn.dev/numarn/articles/japanese-doc-lint-handson)
- [Qiita の語順の修正例](https://qiita.com/Gaakuu/items/36a70ab00d8a3347c750)
- [Qiita の技術記事の書き方の実例](https://qiita.com/Yametaro/items/21b8772e6c0d1d77e176)
- [Qiita の textlint 設定例](https://qiita.com/k8uwall/items/3c29ef2dce153e13bd1d)

### 技術用語の表記

- [Node.js のリリース](https://nodejs.org/ja/about/previous-releases)
- [Node.js のダウンロード](https://nodejs.org/ja/download)
- [GitHub のリリースノート](https://docs.github.com/ja/contributing/style-guide-and-content-model/release-note-content-type)
- [GitHub のプルリクエスト](https://docs.github.com/ja/pull-requests/get-started/about-pull-requests)
- [GitHub の Hello World](https://docs.github.com/ja/get-started/using-github/hello-world)
- [GitHub Actions のワークフロー例](https://docs.github.com/ja/actions/tutorials/create-an-example-workflow)
- [GitHub Actions のアーティファクト](https://docs.github.com/ja/actions/concepts/workflows-and-actions/workflow-artifacts)
- [MDN の HTTP ヘッダー](https://developer.mozilla.org/ja/docs/Web/HTTP/Reference/Headers)
- [MDN のセッション管理](https://developer.mozilla.org/ja/docs/Web/Security/Authentication/Session_management)
- [Microsoft Learn の Web API ガイド](https://learn.microsoft.com/ja-jp/azure/architecture/best-practices/api-implementation)
- [AWS SDK for Java のリトライ設定](https://docs.aws.amazon.com/ja_jp/sdk-for-java/latest/developer-guide/retry-strategy.html)
- [Kubernetes の Deployment](https://kubernetes.io/ja/docs/concepts/workloads/controllers/deployment/)
- [Kubernetes のワークロード管理](https://kubernetes.io/ja/docs/concepts/workloads/management/)
- [Azure Container Instance の FAQ](https://learn.microsoft.com/ja-jp/azure/container-instances/container-instances-faq)
- [Azure Container Registry](https://learn.microsoft.com/ja-jp/azure/container-registry/)
- [GitHub Copilot のコンテキスト管理](https://docs.github.com/ja/copilot/concepts/prompting-and-context/context-management)
- [GitHub Copilot のプロンプト](https://docs.github.com/ja/copilot/concepts/prompting-and-context/prompt-engineering)
- [GitHub Copilot SDK のカスタムエージェント](https://docs.github.com/ja/copilot/how-tos/copilot-sdk/features/custom-agents)

### Unicode と文字化け

- [Unicode の部首の仕様](https://www.unicode.org/versions/Unicode18.0.0/core-spec/chapter-18/)
- [Unicode の康熙部首一覧](https://www.unicode.org/Public/18.0.0/charts/nameslist/2f00/)
- [Unicode 正規化の仕様](https://www.unicode.org/reports/tr15/)
- [Unicode の漢字 FAQ](https://unicode.org/faq/han_cjk.html)
- [PDF からの文字抽出で部首記号が混入する事例](https://zenn.dev/retrieva_tech/articles/a4a5a5f97bb4ec)
- [PDF を経由すると「長」が部首記号になる事例](https://note.com/sbskgng/n/nd0caafe541fa)
- [convjp の文字化け変換・復元ライブラリ](https://github.com/otnc/convjp)

### AI エージェントの日本語に関する事例

- [Claude Code の長い作業で英語に切り替わる報告](https://github.com/anthropics/claude-code/issues/32181)
- [Claude Code が英語のツール出力を読んだあとに英語で答える報告](https://github.com/anthropics/claude-code/issues/96326)
- [Claude Code の日本語セッションで途中の要約が簡体字中国語になる報告](https://github.com/anthropics/claude-code/issues/106525)
- [Codex のレビューが日本語指定を反映しない報告](https://github.com/openai/codex/issues/5113)
- [Claude Code が全角の括弧を半角で指定して置換に失敗する報告](https://github.com/anthropics/claude-code/issues/52482)
- [Claude Code のファイルやターミナル出力に置換文字が混ざる報告](https://github.com/anthropics/claude-code/issues/44463)
- [Codex が PowerShell で UTF-8 の文書を読み違える報告](https://github.com/openai/codex/issues/23044)
- [ChatGPT 由来と報告された「視覴」の調査](https://okumuralab.org/~okumura/misc/230611.html)
- [Claude が文脈に合わない漢字を出した事例](https://note.com/tank_ai/n/n6fc0af2437e6)

### スキルの仕様と配布

- [Agent Skills の仕様](https://agentskills.io/specification)
- [oto-lab のスキルテンプレート](https://github.com/oto-lab/skills-template)

## ライセンス

[MIT](LICENSE)
