# GAS iframe UI Template (Next.js App Router)

Google Identity Services (`google.accounts.id`) の `response.credential` を `id_token` として使い、
Next.js サーバー経由で GAS に `POST` して認証・認可します。

## セットアップ

```bash
npm install
cp .env.example .env.local
```

`.env.local`:

```env
NEXT_PUBLIC_GAS_WEBAPP_URL=https://script.google.com/macros/s/REPLACE_WITH_DEPLOYMENT_ID/exec
NEXT_PUBLIC_GOOGLE_CLIENT_ID=REPLACE_WITH_GOOGLE_OAUTH_CLIENT_ID.apps.googleusercontent.com
NEXT_PUBLIC_APP_TITLE=GAS Embedded App
```

## Google Cloud Console 設定

1. OAuth 同意画面を設定
2. OAuth クライアント ID（ウェブアプリ）を作成
3. `Authorized JavaScript origins` を登録
   - `http://localhost:3000`
   - `https://<your-production-domain>`

## GAS 側設定

スクリプトプロパティ:

- `GOOGLE_OAUTH_CLIENT_ID` = `NEXT_PUBLIC_GOOGLE_CLIENT_ID` と同じ値

`コード.gs` 側:

- `ALLOWED_EMAILS` で許可メールを管理
- `doPost(e)` で `idToken` を `tokeninfo` 検証（`aud/iss/exp/email_verified`）
- `action: createSession` で短期セッションを払い出し
- `doGet(e)` は `st` セッションが有効な場合のみ画面表示

## セキュリティ方針

- `id_token` を URL クエリに載せない
- `id_token` を localStorage / sessionStorage に保存しない
- フロントだけで認可判定しない（GAS側で最終判定）
- ログにトークン全文を出力しない
- CORS 回避のため、ブラウザから GAS へ直接 POST しない（`/api/gas` を経由）

## 動作確認

### ローカル

```bash
npm run dev
```

1. `http://localhost:3000` を開く
2. Google ログイン
3. Next.js `POST /api/gas` -> GAS `doPost(createSession)` が成功することを確認
4. iframe が `?st=...` 付きで表示され、GAS `doGet` が通ることを確認
5. 許可外メールで 403 表示になることを確認

### 本番

1. 本番ドメインを Google Cloud Console の origin に追加
2. 環境変数を設定してデプロイ
3. ローカル同様の認証フローを確認
