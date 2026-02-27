# GAS iframe UI Template (Next.js App Router)

Google Identity Services (`google.accounts.id`) の `response.credential` を `id_token` として GAS に `POST` し、
GAS 側で認証・認可してから iframe を表示するテンプレートです。

## セットアップ

```bash
npm install
cp .env.example .env.local
```

`.env.local` を設定:

```env
NEXT_PUBLIC_GAS_WEBAPP_URL=https://script.google.com/macros/s/REPLACE_WITH_DEPLOYMENT_ID/exec
NEXT_PUBLIC_GOOGLE_CLIENT_ID=REPLACE_WITH_GOOGLE_OAUTH_CLIENT_ID.apps.googleusercontent.com
NEXT_PUBLIC_APP_TITLE=GAS Embedded App
```

- `NEXT_PUBLIC_GAS_WEBAPP_URL`: GAS Web アプリの `exec` URL
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID`: Google Cloud Console で作成した OAuth 2.0 Client ID

## Google Cloud Console 設定

1. `OAuth 同意画面` を設定
2. `認証情報` で `OAuth クライアント ID` を作成（種類: `ウェブアプリ`）
3. `Authorized JavaScript origins` に以下を登録
   - `http://localhost:3000`
   - `https://<your-production-domain>`

## GAS 側設定

`スクリプト プロパティ` に `GOOGLE_OAUTH_CLIENT_ID` を設定し、
値は `NEXT_PUBLIC_GOOGLE_CLIENT_ID` と同じにします。

`コード.gs` 側で以下を管理します。

- `ALLOWED_EMAILS`: 許可するメールアドレス配列
- `doPost(e)`: JSON body 受信、`idToken` 検証、`action` 分岐
- `ping` アクション: `{ ok: true, now: ... }` を返却

## セキュリティ方針

- `id_token` は URL に含めない（クエリに載せない）
- `id_token` は `localStorage` に保存しない
- フロントでのメール判定に依存しない（最終判定は GAS）
- ログ出力時にトークン全文を出さない

## 動作確認手順

### ローカル

```bash
npm run dev
```

1. `http://localhost:3000` を開く
2. Google ログインを実行
3. ログイン直後に `callGasApi(idToken, "ping", {})` が呼ばれる
4. 認証・認可成功時に結果表示と iframe 表示を確認
5. 未許可メールで `403` メッセージを確認
6. 無効トークンや設定ミスで `401` メッセージを確認

### 本番

1. 本番ドメインを Google Cloud Console の `Authorized JavaScript origins` に追加
2. `.env` の本番値を設定してデプロイ
3. ローカル同様にログイン後の `ping` 結果と iframe 表示を確認

## 補足

GAS Web アプリは HTTP ステータスコードを任意に返す制御が限定的なため、
この実装では JSON の `status` フィールド（`200/401/403`）をフロントで判定しています。
