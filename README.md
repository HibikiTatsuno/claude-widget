# Claude Code Usage Widget

[Übersicht](https://tracesof.net/uebersicht/)用のmacOSデスクトップウィジェットです。Claude Codeの使用統計とGitHub PR情報をApple Liquid Glassデザインで表示します。

## 機能

### Claude Code使用状況
- 30日間の使用量をバーチャートで可視化
- コスト追跡（30日合計、7日合計、今日）
- 総トークン数の表示
- アクティブセッションのトラッキング（クリック可能なセッションID）
- 最近完了したセッションの表示
- 入力待ちセッションのベル通知

### GitHub Pull Requests
- 全リポジトリのオープンPR一覧
- **レビューステータス** - Approved / Changes Requested / Review Required
- **CIステータス** - Pass / Fail / Running / N/A
- **コメント数** - 各PRのコメント数
- クリックでPRまたはリポジトリをブラウザで開く

### UI機能
- Apple Liquid Glass透明デザイン
- 表示/非表示トグル（最小化ボタン）
- 10秒ごとの自動更新
- セッションIDクリックでGhosttyターミナルを開く

## スクリーンショット

```
+----------------------------------+
| Claude Dashboard            [x]  |
+----------------------------------+
|         $535.74                  |
|       30 Day Total               |
|  [||||||||||||||||||||||||]      |
+----------------------------------+
| 30 Day Total      $535.74       |
| 7 Day Total       $127.04       |
| Today             $127.04       |
| Total Tokens      637.9M        |
+----------------------------------+
| Active (1)                       |
|  ● claude-widget     [d423eeca] |
+----------------------------------+
| GitHub PRs (6)                   |
|  welself/jobmatching-web         |
|  feat: SEO optimization... #1971 |
|  [Review] [CI Pass] [💬 2]       |
+----------------------------------+
```

## 必要なもの

- macOS
- [Übersicht](https://tracesof.net/uebersicht/)
- [ccusage](https://github.com/ryoppippi/ccusage) - Claude Code使用量トラッカー
- [jq](https://jqlang.github.io/jq/) - JSONプロセッサ
- [GitHub CLI](https://cli.github.com/) - PR情報の取得用

## インストール

### 1. 依存関係のインストール

```bash
# Übersichtのインストール
brew install --cask ubersicht

# jqのインストール
brew install jq

# GitHub CLIのインストールと認証
brew install gh
gh auth login

# ccusageのインストール
pnpm add -g ccusage  # または npm install -g ccusage
```

### 2. リポジトリのクローン

```bash
git clone https://github.com/HibikiTatsuno/claude-widget.git
cd claude-widget
```

### 3. ウィジェットファイルをÜbersichtにコピー

```bash
cp claude-sessions.jsx ~/Library/Application\ Support/Übersicht/widgets/
```

開発用にシンボリックリンクを作成する場合：

```bash
ln -s "$(pwd)/claude-sessions.jsx" ~/Library/Application\ Support/Übersicht/widgets/
```

### 4. キャッシュディレクトリと更新スクリプトのセットアップ

```bash
mkdir -p ~/.claude/cache
cp update-usage-cache.sh ~/.claude/cache/
chmod +x ~/.claude/cache/update-usage-cache.sh
```

### 5. launchdの設定（自動更新用）

```bash
# 必要に応じてplist内のパスを編集
cp com.claude.usage-cache.plist ~/Library/LaunchAgents/
launchctl load ~/Library/LaunchAgents/com.claude.usage-cache.plist
```

### 6. 初回キャッシュ生成

```bash
~/.claude/cache/update-usage-cache.sh
```

### 7. Übersichtの起動

```bash
open -a "Übersicht"
```

## 設定

### ウィジェットの位置

`claude-sessions.jsx`の`className`を編集：

```javascript
bottom: 20px;  // 下からの距離
left: 20px;    // 左からの距離
width: 320px;  // ウィジェットの幅
height: 70%;   // ウィジェットの高さ
```

### キャッシュ更新間隔

`com.claude.usage-cache.plist`を編集：

```xml
<key>StartInterval</key>
<integer>60</integer>  <!-- 60秒 = 1分 -->
```

変更後に再読み込み：

```bash
launchctl unload ~/Library/LaunchAgents/com.claude.usage-cache.plist
launchctl load ~/Library/LaunchAgents/com.claude.usage-cache.plist
```

## ファイル構成

```
claude-widget/
├── claude-sessions.jsx          # Übersichtウィジェットのソース
├── update-usage-cache.sh        # キャッシュ更新スクリプト
├── com.claude.usage-cache.plist # launchd設定ファイル
├── CLAUDE.md                    # 開発用ドキュメント
├── llms.txt                     # AI用ドキュメント
└── README.md                    # このファイル
```

## 使い方

### セッションの再開

セッションIDボタン（例：`d423eeca`）をクリックすると、新しいGhosttyターミナルが開き、自動的にセッションが再開されます。

手動で再開する場合：

```bash
claude --resume <session-id>
```

### セッションステータスアイコン

| アイコン | ステータス |
|----------|-----------|
| ● (緑) | アクティブセッション |
| ○ (グレー) | 最近完了したセッション |
| 🔔 | 入力待ちセッション |

### PRステータスバッジ

| バッジ | 意味 |
|--------|------|
| `Approved` (緑) | PRが承認済み |
| `Changes` (赤) | 変更が要求されている |
| `Review` (オレンジ) | レビュー待ち |
| `CI Pass` (シアン) | CIチェック成功 |
| `CI Fail` (ピンク) | CIチェック失敗 |
| `CI Running` (紫) | CIチェック実行中 |
| `💬 N` (青) | コメント数 |

### ウィジェットの表示/非表示

- `x`ボタンをクリックでウィジェットを最小化
- `C`ボタンをクリックでウィジェットを復元

## 開発

### デプロイスクリプト

`claude-sessions.jsx`を変更した後、以下を実行：

```bash
~/.claude/scripts/deploy-widget.sh
```

### 自動デプロイ（監視モード）

ファイル変更時に自動的にデプロイする場合：

```bash
~/.claude/scripts/watch-widget.sh
```

`fswatch`が必要です：

```bash
brew install fswatch
```

## アンインストール

```bash
# launchdサービスの停止
launchctl unload ~/Library/LaunchAgents/com.claude.usage-cache.plist
rm ~/Library/LaunchAgents/com.claude.usage-cache.plist

# ウィジェットの削除
rm ~/Library/Application\ Support/Übersicht/widgets/claude-sessions.jsx

# キャッシュの削除（任意）
rm -rf ~/.claude/cache
```

## ライセンス

MIT
