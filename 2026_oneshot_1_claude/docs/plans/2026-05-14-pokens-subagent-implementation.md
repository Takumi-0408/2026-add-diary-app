# ぽけNS 実装計画（サブエージェント駆動）

> **実装エージェント向け:** これは OneShot 実装セッションのオーケストレーション計画です。`docs/spec/spec.md` を正本仕様、`docs/spec/prompt.md` を実装指示、本ファイルを **タスク分解 / 並列実行戦略 / 検証フロー** の指針として読んでください。各タスクは独立した成果物（コードスニペット）を返すよう設計されているため、Task / Agent ツールで **並列にサブエージェントへ委譲** することで、コンテキスト消費を最小化し、品質を上げられます。

**ゴール:** `docs/spec/spec.md` Section 13「完成判定」10 項目をすべて満たす単一 `index.html` を生成する。

**アーキテクチャ:**

- 単一ファイル SPA。`<style>` 内包 CSS、`<script>` 内包 Vanilla JS、ハッシュベースルーター
- サブエージェントは **コード断片（CSS ルール群 / JS 関数 / データリテラル）を文字列として返す**。オーケストレータがそれらを所定のスロットに差し込んで `index.html` を組み立てる
- 全タスクは spec.md の参照セクションのみを根拠に作業し、他タスクの出力に依存しない（並列実行可能）

**技術スタック:** HTML5 / Vanilla JS (ES2020+) / Pure CSS / Google Fonts / PokeAPI / localStorage。フレームワーク・ビルド・パッケージ依存はゼロ。

**CSS クラス命名規約（Phase 1 並列のための事前合意）:** Task 1-A / 1-B / 2-A〜2-D は並列で書くため、命名を本計画で先に確定する。サブエージェントは下表を共通前提として読む。

| 接頭辞 | 用途 | 例 |
|---|---|---|
| `c-` | 共通コンポーネント | `c-frame`, `c-chromebar`, `c-appbar`, `c-tabbar`, `c-postcard`, `c-pill`, `c-pill--grass`, `c-avatar`, `c-avatar--lg`, `c-button`, `c-button--primary`, `c-button--block`, `c-segment`, `c-grasstile`, `c-note` |
| `s-` | 画面コンテナ | `s-onboarding-title`, `s-onboarding-grass`, `s-onboarding-encounter`, `s-onboarding-naming`, `s-timeline`, `s-compose`, `s-detail`, `s-profile`, `s-zukan` |
| `is-` | 状態修飾子 | `is-active`, `is-disabled`, `is-selected`, `is-seen`, `is-unseen` |
| `u-` | ユーティリティ（最小限） | `u-hidden`, `u-flex1` |

タイプバッジは `c-pill c-pill--{type}` バリアントクラスでタイプ色を切替（`grass`, `fire`, `water`, `electric`, `bug`, `normal`, `flying`, `poison`, `ground`, `rock`, `fighting`, `psychic`, `ghost`, `ice`, `dragon`, `dark`, `steel`, `fairy`）。

---

## 0. オーケストレータの責務

実装エージェント（このセッションを駆動するメインエージェント）は以下のみを行う:

1. spec.md と本ファイルを精読
2. Phase 1 のサブエージェントを **同時並列ディスパッチ**
3. Phase 1 完了後、Phase 2 のサブエージェントを **同時並列ディスパッチ**
4. Phase 3 で全成果物を `index.html` の **スケルトン**（後述）に差し込み
5. Phase 4 で検証サブエージェントを並列ディスパッチし、指摘があれば追加修正サブエージェントで対応

オーケストレータ自身が大量のコードを書くことは避ける。サブエージェントの出力を **組み立てる** のが本体の仕事。

---

## 1. ファイル構成（最終形）

```
index.html  ← 単一成果物。すべての CSS / JS を内包
```

スケルトンの順序（オーケストレータが組み立てる際の差し込み位置）:

1. `<!doctype html>` + meta + Google Fonts link
2. `<style>` 開始
   - スロット A1: `:root` CSS 変数（カラートークン / フォント）
   - スロット A2: グローバル / フレーム / Chrome バー / TabBar / AppBar CSS
   - スロット A3: 共通コンポーネント CSS（PostCard / Pill / Avatar / Button / Segment / GrassTile / Note）
   - スロット A4: 画面固有 CSS（オンボーディング / タイムライン / 投稿作成 / 詳細 / プロフィール / 図鑑）
3. `</style>`
4. `<body>` + フレームのマウントポイント（`#app` 等）
5. `<script>`
   - スロット B1: 定数（type 日本語マップ / NPC データ / 文言テンプレ）
   - スロット B2: localStorage ヘルパ
   - スロット B3: PokeAPI ヘルパ + キャッシュ
   - スロット B4: ルーター + 初期化 + 共通 UI（AppBar / TabBar / Pill / Avatar / Button のレンダ関数）
   - スロット B5: 画面レンダ関数群（6 画面）
6. `</script>` + `</body>`

サブエージェントは上記スロットに対応する成果物を返す。

---

## 2. Phase 1: 基盤の並列構築（4 サブエージェント同時）

### Task 1-A: デザインシステム CSS

- **担当スロット:** A1, A2, A3
- **参照する spec セクション:** 4.1 / 4.2 / 4.3 / 4.5
- **成果物:** 単一の CSS テキスト
  - `:root` に Section 4.1 の 13 個のカラートークンと 4 種フォントの font-family 宣言を持つ CSS 変数
  - フレーム（360×720、border 1.5px、角丸 14px、Paper 2）/ Chrome バー（22px）/ TabBar（44px）/ AppBar の共通スタイル
  - PostCard / Pill（くさ・ほのお・みず・でんき＋他タイプ）/ Avatar（small/medium/large）/ Button（primary/secondary、`block` 修飾子）/ Segment / GrassTile（45deg/135deg repeating-linear-gradient）/ Note の各クラス
- **モード:** `body[data-fi="mid"]` 固定で OK（spec 11 章）。`lo` モードは無視
- **制約:**
  - Tailwind や CSS-in-JS 等の構文禁止。素の CSS のみ
  - クラス命名は `kebab-case`。他タスクと衝突しないよう `c-` 接頭辞（コンポーネント）/ `s-` 接頭辞（画面）を推奨
- **検証観点:** Section 4.1 の hex 値が **すべて** `:root` に含まれること。Press Start 2P / DotGothic16 / Yomogi / Kaisei Decol の 4 フォントが宣言されていること

### Task 1-B: 画面固有 CSS

- **担当スロット:** A4
- **参照する spec セクション:** 5.1〜5.6 すべて
- **成果物:** 6 画面分のレイアウト CSS テキスト
  - オンボーディング A〜D（タイトル / 草むら / 5 匹 / 命名）
  - タイムライン（セグメント、ストリーム scrollable flex:1）
  - 投稿作成（テキストエリア、写真 ph、タグ、気分、文字数カウンタ）
  - 投稿詳細（リアクションバー上下ダッシュ枠、コメントセクション）
  - プロフィール（ヘッダー、数値行、セグメント、3 列グリッド）
  - 図鑑（進捗バー、タイプフィルター、3 列グリッド、未発見セルの opacity 0.55）
- **制約:** Task 1-A のクラス（`c-postcard` 等）を **再利用前提**。同じスタイルを重複定義しない
- **検証観点:** 6 画面ぶんのコンテナクラス（`s-onboarding-title` 等）が揃っていること

### Task 1-C: コアユーティリティ JS

- **担当スロット:** B2, B3, B4（router・init・共通レンダのみ）
- **参照する spec セクション:** 6 / 7 / 8
- **成果物:** 以下を含む JS テキスト
  - `storage` モジュール: `getPartner / setPartner / getPosts / addPost / getSeen / addSeen / getPokeCache / setPokeCache`
  - `pokeApi` モジュール: `fetchPokemon(id)` — `pokemon` + `pokemon-species` を `Promise.all` し、`{ id, jaName, types: ['くさ', ...], spriteUrl }` の正規化オブジェクトを返す。キャッシュ優先、TTL なし
  - `pickFiveRandom()`: 1〜151 から重複なし 5 個抽選し、並列フェッチ
  - `router` モジュール: `#/onboarding`, `#/timeline`, `#/post/new`, `#/post/:id`, `#/profile`, `#/zukan` のハッシュ変化監視 + ビュー切替
  - `init()`: DOMContentLoaded で localStorage を確認、`pokens:partner` 無ければオンボーディングへ、あればタイムラインへ
  - 共通レンダ補助関数: `renderAppBar(opts)`, `renderTabBar(activeIndex)`, `renderPill(type)`, `renderAvatar(spriteUrl, size)`, `renderButton(label, variant, onClick)`
  - **TabBar の押下ハンドラ責務（spec 4.4）:** `[HOME]` → `#/timeline`、`[ + ]` → `#/post/new`、`[ ME ]` → `#/profile`、`[SRCH]` / `[ DM ]` → 押下時に **無反応** または短時間トースト「準備中」表示（無反応で OK）
- **制約:**
  - フレームワーク禁止。`document.createElement` / `innerHTML` のどちらかで一貫
  - 例外は `console.warn` のみ。例外を握り潰してフォールバック画像表示は **しない**（spec 7.6 のリトライ UI に従う）
- **検証観点:** `fetchPokemon` がキャッシュヒット時にネットワークアクセスしないこと。`router` が未知ハッシュでデフォルト画面に落ちること

### Task 1-D: NPC データ + 静的辞書

- **担当スロット:** B1
- **参照する spec セクション:** 7.3 / 9.1 / 9.2 / 9.3
- **成果物:** 以下のリテラル JS テキスト
  - `TYPE_JA_MAP`: 18 タイプ（grass〜fairy）の `{ ja: '...', colorVar: '--color-grass' }` マップ（Section 7.3 全行）
  - `NPC_LIST`: spec 9.1 から 10 体（フシギダネ / ヒトカゲ / ゼニガメ / ピカチュウ / プリン / コダック / ケーシィ / ゴース / ラッキー / イーブイ）。各エントリは `{ pokemonId, nickname, username, vibe }`
  - `NPC_POSTS`: 18〜22 件。各エントリ `{ postId, authorNpcId, body, tags: [], mood, hasPhoto, likes, commentsCount, retweets, relativeTime }`
  - `NPC_COMMENTS`: `{ [postId]: [{ authorNpcId, body }, ...] }` 各投稿 2〜4 件
- **制約:**
  - 著作物保護: ポケモンの商標を本文中で誇張しない。投稿本文は **モンスター視点の素朴な短文**（spec 9.2 のテンプレに沿う）
  - すべて純粋データ。関数や副作用なし
- **検証観点:** タイプが極端に偏らない（くさ / ほのお / みず / でんき / その他がバランス）こと

---

## 3. Phase 2: 画面実装の並列構築（4 サブエージェント同時）

各サブエージェントは Phase 1 の成果物（CSS クラス命名規約 + 共通レンダ関数のシグネチャ）を **インターフェース仕様として渡される** だけで、Phase 1 の実装本体は読まない。

### Task 2-A: オンボーディング 4 ステップ

- **担当スロット:** B5（部分）
- **参照する spec セクション:** 5.1 / 7.5 / 10
- **成果物:** `renderOnboarding(step, state)` と内部ヘルパ群。step は `'title' | 'grass' | 'encounter' | 'naming'`
- **要件:**
  - `grass` ステップ: GrassTile タップで揺れアニメ、3 回タップ or ボタンで `encounter` へ遷移
  - `encounter` ステップ: マウント時に `pickFiveRandom()` 実行、5 匹をグリッド表示。種族名は初期 `???` 表示で、選択時に PokeAPI 日本語名を出す（仕様任意。シンプルには最初から表示でも可）
  - `naming` ステップ: テキスト入力 → 「はじめる」で `setPartner` → `#/timeline` 遷移。同時に `addSeen(pokemonId)` も実行
- **検証観点:** localStorage `pokens:partner` が空のとき本画面に到達し、保存後 `#/timeline` に移ること

### Task 2-B: タイムライン + 投稿詳細

- **担当スロット:** B5（部分）
- **参照する spec セクション:** 5.2 / 5.4 / 9
- **成果物:** `renderTimeline()` と `renderPostDetail(postId)`
- **要件:**
  - タイムライン: NPC_POSTS + 自分の投稿 を `created_at` 降順マージ。セグメント「フォロー中 / おすすめ / 同じタイプ」は **「おすすめ」のみ機能**
  - 各 PostCard はクリックで `#/post/:id` 遷移
  - 投稿詳細: 投稿本体 + リアクションバー + コメント一覧（`NPC_COMMENTS[postId]`）+ 下部固定入力 UI（送信は装飾のみ可）
  - 著者の表示は `pokeApi.fetchPokemon(authorNpcId)` で取得したスプライト・タイプを使用
  - **図鑑連携の責務:** タイムライン初回マウント時に `NPC_LIST` の全 `pokemonId` を `storage.addSeen()` で `pokens:zukan_seen` に登録する（重複追加防止）。これにより NPC として登場したポケモンが図鑑に発見済みで現れる
- **検証観点:** 投稿カードのレイアウトが Section 4.5「PostCard」仕様通り。リアクションバーが上下ダッシュ枠で囲まれていること

### Task 2-C: 投稿作成

- **担当スロット:** B5（部分）
- **参照する spec セクション:** 5.3
- **成果物:** `renderPostCompose()`
- **要件:**
  - テキストエリア（140 字上限、カウンタ表示）/ タグピル / 気分ラジオ / 写真 ph（実機能不要）
  - `[POST]` 押下時: body 空でなければ `storage.addPost({ body, tags, mood, photos: [], createdAt, author: 'self' })` → `#/timeline` 遷移
  - body 空のときボタン disabled スタイル
- **検証観点:** POST 後にタイムライン先頭に新規投稿が現れること

### Task 2-D: プロフィール + 図鑑

- **担当スロット:** B5（部分）
- **参照する spec セクション:** 5.5 / 5.6
- **成果物:** `renderProfile()` と `renderZukan()`
- **要件:**
  - プロフィール: `getPartner()` の情報を大アバター + 名前 + `@username` + タイプバッジ + Lv（固定値）で表示。bio、数値行（投稿数だけ動的、他は固定）、`プロフ編集`（装飾のみ）/ `図鑑を見る`（`#/zukan` へ）、自分の投稿 3 列グリッド
  - 図鑑: 表示対象 ID は **`NPC_LIST` の pokemonId + あいぼうの pokemonId** の和集合。`pokens:zukan_seen` に含まれていれば発見済み、それ以外はシルエット + `?`。タイプフィルターセグメント実装
  - 進捗バー: `seen / total * 100%` を Grass 塗りで表示
- **検証観点:** あいぼうとなった種が図鑑で発見済み扱いになっていること

---

## 4. Phase 3: 組み立て

オーケストレータ自身が実施（サブエージェント不要）:

1. `index.html` スケルトンを作成（Section 1 の順序）
2. Phase 1 の 4 成果物を A1〜A3 / B1〜B4 スロットに挿入
3. Phase 2 の 4 成果物を B5 スロットに挿入
4. `<script>` 末尾に `init();` を呼ぶ
5. ブラウザで開いたとき syntax error が出ない最低限の sanity check（オーケストレータが目視）

---

## 5. Phase 4: 並列検証（2 サブエージェント同時）

### Task 4-A: 仕様適合レビュー

- **入力:** 完成した `index.html` + `docs/spec/spec.md`
- **観点:** Section 13「完成判定」の 10 項目を **コード上の根拠とともに** ○/× で報告
- **追加観点:**
  - Section 4.1 の 13 カラートークンがすべて `:root` にあるか
  - Section 4.2 の 4 フォント（Press Start 2P / DotGothic16 / Yomogi / Kaisei Decol）が `<link>` でロードされ、各仕様用途で `font-family` 指定に現れるか
  - Section 4.4 の 5 タブが正しく並んでいるか（HOME / SRCH / + / DM / ME）+ 各タブの押下挙動が Task 1-C 仕様通りか
  - Section 5.4 の投稿詳細でコメント一覧（`NPC_COMMENTS[postId]`）が表示され、各コメントにアバター・`@username`・タイプバッジ・本文が揃っているか
  - Section 7.5 の 1〜151 範囲抽選になっているか

### Task 4-B: 機能フロー検査

- **入力:** 完成した `index.html`
- **観点:**
  - 初回ロード時、`localStorage` 空でオンボーディングに到達するか
  - 命名後にタイムラインへ遷移するか
  - 投稿作成 → タイムライン反映 → 詳細表示 → プロフィール 投稿カウント増加 がつながっているか
  - リロード後にあいぼう・自分の投稿が維持されるか
  - PokeAPI が CORS 越しに正常呼び出される形になっているか

両レビュー結果に未解決の指摘があれば、該当領域に限定したパッチ用サブエージェントをディスパッチ → 再検証。検証ループは 2 周まで。それを超える場合はオーケストレータ判断で品質劣化を許容。

---

## 6. 仕上げ（任意・時間が余ったとき）

優先度の高い順に:

1. 草むら左右揺れアニメ（spec 10）
2. 投稿カードのフェードイン
3. `lo` モードトグル（spec 11）
4. SE 的なテンポ感を出す軽い transition

ここはサブエージェント不要。オーケストレータが直接差し込む。

---

## 7. 反パターン（やってはいけないこと）

- **オーケストレータが大量にコードを書く** → サブエージェントの意味がない。組み立てに徹する
- **タスク間で実装の中身を共有する** → Phase 1 と Phase 2 はインターフェース（クラス名 / 関数シグネチャ）でしか繋がらない。中身を見せると結合度が上がり、並列性が落ちる
- **PokeAPI を真っ先にフェッチして全件キャッシュする** → spec 7.4 の通り、起動時フェッチは最小化。必要になったときだけ取得
- **見栄えのために spec.md にない画面を足す** → CLAUDE.md「依頼スコープ外の改善禁止」に反する
- **`async/await` でフェッチ失敗を握り潰してダミー表示** → spec 7.6 のリトライ UI 仕様に従う
- **`<script type="module">` で外部 import を試みる** → `file://` で開けないため禁止。すべて単一 `<script>` 内

---

## 8. サブエージェント運用のコツ

- 各サブエージェントに渡すプロンプトには **本ファイルの該当タスクセクションだけ** を抜粋して渡す。spec.md の参照範囲を明示する
- サブエージェントには **自分の成果物以外を読ませない**。結合は最後にオーケストレータが担当
- 出力フォーマットを指定する: 「CSS テキストのみ」「JS テキストのみ」「説明文を出力しない」など。コードフェンスの外にコメントを書かせない
- 返答が長すぎる場合は再ディスパッチで分割（例: Task 1-B を 3 画面 × 2 に分割）
