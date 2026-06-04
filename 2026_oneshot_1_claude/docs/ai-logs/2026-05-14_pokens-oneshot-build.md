# 2026-05-14 ぽけNS OneShot 実装

## 概要

`docs/spec/spec.md` を正本仕様、`docs/plans/2026-05-14-pokens-subagent-implementation.md` をオーケストレーション計画として、ポケモンになりきり SNS「ぽけNS」を `index.html` 単一ファイルで実装した。

## 実行フロー（計画どおり 4 フェーズ）

| Phase | タスク | 並列度 | 結果 |
|---|---|---|---|
| 1 | 1-A 設計システム CSS / 1-B 画面 CSS / 1-C コア JS / 1-D NPC データ | 4 並列 | 全完了 |
| 2 | 2-A オンボーディング / 2-B タイムライン+詳細 / 2-C 投稿作成 / 2-D プロフィール+図鑑 | 4 並列 | 全完了 |
| 3 | スケルトン組み立て | オーケストレータ | 完了 |
| 4 | 4-A 仕様適合 / 4-B 機能フロー | 2 並列 | 全 ○、修正サブエージェント不要 |

## 結合時の調整

- Phase 1-C の `clearMain()` が `l-frame` クラスを使っていたため `c-frame` 系に統一、`mountScreen` も `replaceWith` ベースに修正
- Phase 1-C の `init()` で `hashchange` リスナーを redirect 前に登録するよう順序修正
- Phase 2-D の `c-appbar` 自前構築（`__title` 等）を `appBar:{left,center,right}` 標準形に正規化、`onclick` 文字列属性を `on:{click}` に修正

## 検証結果サマリ

- spec.md Section 13「完成判定」10 項目: 10/10 ○
- カラートークン 12（spec 4.1）: 全 hex 一致で `:root` 定義
- フォント 4 種（spec 4.2）: Google Fonts 経由で読み込み + 用途別に適用
- TabBar 5 タブ + 押下挙動（spec 4.4）: 仕様通り
- PokeAPI 1〜151 抽選（spec 7.5）: 重複なし `Set` で実装
- 機能フロー 9 項目: 全 ○

LOW 推奨（UX 微調整）が 4-A / 4-B から各 4 件出たが、いずれも仕様許容範囲のため修正見送り。

## 成果物

- `index.html`（85 KB / 2745 行、Vanilla JS、外部依存は Google Fonts と PokeAPI のみ）
- `docs/spec/spec.md` の MVP 6 画面すべて実装

## ツール使用

- Skills: なし（OneShot のため `wf-*` ワークフロー適用外、計画書に従って Agent ツールで直接サブエージェント駆動）
- MCP: なし
- Agent: 8 体（Phase 1×4 + Phase 2×4）+ Phase 4 検証 2 体 = 計 10 体
