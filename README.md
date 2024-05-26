# isogac

isogac は Calendar の情報から各種ツールのステータスを busy 状態に変更する Google
Apps Script です。 現在は下記のツールに対応しています。

- [GitHub](https://github.com)

## セットアップ

### ツールのインストール

このプロジェクトでは bun を使っています。[bun](https://bun.sh)
がインストールされていない場合は下記のコマンドでインストールしてください。

```bash
brew install oven-sh/bun/bun
```

動作は未検証ですが、node.js でも実行できると思います。そちらで実行する場合は
`bun` を `npm` や `yarn` などに置き換えて以降の手順を実行してください。

次に、依存しているライブラリのインストールを行います。

```bash
bun install
```

### GitHub の PAT 作成

GitHub API にアクセスするための PAT(Personal Access Token) を作成します。

https://github.com/settings/tokens

- `user` スコープを付与して作成してください

デプロイ時に必要なので、作成した PAT を控えておいてください。

### Google Apps Script のプロジェクトの作成

clasp を使って Google Apps Script
のプロジェクトを作成するために、コマンドの認証を行います。

```bash
bun run clasp login
```

次に、Google Apps Script のプロジェクトを作成します。

```bash
bun run clasp create --title "isogac" --type standalone
```

### デプロイ

Google Apps Script に isogac をデプロイします。

```bash
bun run deploy
```

デプロイが完了したら、下記のコマンドで Google Apps Script
のコンソールを開きます。

```bash
bun run open
```

プロジェクトの設定から、スクリプトのプロパティを設定します。
プロパティ一覧を参考に、必要なプロパティを設定してください。

最後に、スクリプトを実行するトリガーを設定します。

トリガーの画面から、`トリガーを追加`
をクリックし、下記の設定でトリガーを追加してください。

| 項目                         | 設定値                 |
| ---------------------------- | ---------------------- |
| 実行する関数                 | `main`                 |
| 実行するデプロイ             | `Head`                 |
| イベントのソース             | `時間主導型`           |
| 時間ベースのトリガーのタイプ | `時間ベースのタイマー` |
| 時間の間隔                   | `1 時間おき`           |
| エラー通知設定               | `今すぐ通知を受け取る` |

必要に応じて、トリガーの設定を変更してください。

## プロパティ一覧

| プロパティ名     | デフォルト値    | 説明                                     | 必須 |
| ---------------- | --------------- | ---------------------------------------- | ---- |
| `CALENDAR_ID`    |                 | Google カレンダーのID                    | ☑️    |
| `GITHUB_TOKEN`   |                 | GitHub API にアクセスするためのトークン  | ☑️    |
| `MORNING_HOUR`   | 14              | 午前休,午後休の区切りの時間（14時）      |      |
| `MUST_WORDS`     |                 | 必須ワードのリスト                       |      |
| `ZENKYU_WORDS`   | 全休,休み       | 全休を表すワードのリスト(カンマ区切り)   |      |
| `GOZENKYU_WORDS` | 午前休,午前半休 | 午前休を表すワードのリスト(カンマ区切り) |      |
| `GOGO_KYU_WORDS` | 午後休,午後半休 | 午後休を表すワードのリスト(カンマ区切り) |      |
