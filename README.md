# GAS iframe UI Template (React + Vercel)

GAS で作成した Web アプリを `iframe` で埋め込むためのテンプレートです。
この版は **Google ログイン必須** で、ログイン成功後のみ iframe を表示します。

## 1. セットアップ

```bash
npm install
cp .env.example .env.local
```

`.env.local` を設定:

```env
NEXT_PUBLIC_GAS_WEBAPP_URL=https://script.google.com/macros/s/xxxxx/exec
NEXT_PUBLIC_APP_TITLE=GAS Embedded App
NEXT_PUBLIC_GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
NEXT_PUBLIC_ALLOWED_EMAILS=alice@example.com,bob@example.com
NEXT_PUBLIC_ALLOWED_DOMAIN=example.com
```

- `NEXT_PUBLIC_ALLOWED_EMAILS`: 任意。カンマ区切り
- `NEXT_PUBLIC_ALLOWED_DOMAIN`: 任意。ドメイン単位で許可
- `ALLOWED_EMAILS` と `ALLOWED_DOMAIN` の両方未設定時は「Googleログイン済み全員」を許可

## 2. Google Cloud 側の準備

1. OAuth 同意画面を作成
2. OAuth クライアントID（Web）を作成
3. `Authorized JavaScript origins` に以下を追加
   - `http://localhost:3000`
   - `https://<your-vercel-domain>`

## 3. 開発起動

```bash
npm run dev
```

## 4. Vercel デプロイ

- このディレクトリを GitHub に push
- Vercel で Import Project
- Environment Variables に以下を設定
  - `NEXT_PUBLIC_GAS_WEBAPP_URL`
  - `NEXT_PUBLIC_APP_TITLE` (任意)
  - `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
  - `NEXT_PUBLIC_ALLOWED_EMAILS` (任意)
  - `NEXT_PUBLIC_ALLOWED_DOMAIN` (任意)
- 追加後に再デプロイ

## 5. GAS 側のポイント

`iframe` 埋め込みを許可する場合は以下を設定:

```javascript
return HtmlService.createHtmlOutputFromFile('index')
  .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
```

## 注意

- `NEXT_PUBLIC_*` はブラウザに公開される値です。秘密情報は入れないでください。
- このテンプレートのガードは UI 側の制御です。重要データは GAS/API 側でも必ず認可チェックしてください。