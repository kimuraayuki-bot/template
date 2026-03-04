# GAS Web Embed Template

Google ログインで取得した `id_token` を Next.js 側で GAS に中継し、GAS 側で短期セッションを発行して iframe を起動するテンプレートです。

この版では、iframe セッションを URL クエリではなく `POST body` で渡します。

## Setup

```bash
npm install
cp .env.example .env.local
```

`.env.local`:

```env
NEXT_PUBLIC_GAS_WEBAPP_URL=https://script.google.com/macros/s/REPLACE_WITH_DEPLOYMENT_ID/exec
NEXT_PUBLIC_GOOGLE_CLIENT_ID=REPLACE_WITH_GOOGLE_OAUTH_CLIENT_ID.apps.googleusercontent.com
NEXT_PUBLIC_APP_TITLE=GAS Embed
```

## Google Cloud Console

OAuth クライアント ID (Web) の `Authorized JavaScript origins` に追加します。

- `http://localhost:3000`
- `https://<your-vercel-domain>`

## GAS Side Requirements

このテンプレートをコピーして別の GAS アプリを埋め込むときは、GAS 側に次の対応が必要です。

1. `doPost(e)` で `bootstrapSessionToken` を受け取れるようにする
2. その token をサーバー側で検証し、有効なら `HtmlOutput` を返す
3. `createSession` と `revokeSession` 用の API を用意する
4. 公開 GAS 関数はすべて `sessionToken` を受け取り、毎回サーバー側で検証する

実装の要点:

```javascript
function doGet(e) {
  const sessionToken = e && e.parameter ? String(e.parameter.st || "") : "";
  const session = sessionToken ? getSessionFromToken_(sessionToken, true) : null;
  if (!session) return createUnauthorizedHtml_();
  return buildAppHtml_(sessionToken);
}

function doPost(e) {
  const bootstrapSessionToken = e && e.parameter ? String(e.parameter.bootstrapSessionToken || "") : "";
  if (bootstrapSessionToken) {
    const session = getSessionFromToken_(bootstrapSessionToken, true);
    if (!session) return createUnauthorizedHtml_();
    return buildAppHtml_(bootstrapSessionToken);
  }

  // ここで id_token を受け取る API を処理
}

function someAction(payload, sessionToken) {
  requireSession_(sessionToken);
  // 実処理
}
```

必要な補助関数:

- `buildAppHtml_(sessionToken)`
- `createSession_(email)`
- `revokeSession_(token)`
- `getSessionFromToken_(token, touch)`
- `requireSession_(sessionToken)`
- `createUnauthorizedHtml_()`

Script Properties には少なくとも次を設定します。

- `GOOGLE_OAUTH_CLIENT_ID`: `NEXT_PUBLIC_GOOGLE_CLIENT_ID` と同じ値

## Run

```bash
npm run dev
```

Google ログイン後、親ページは hidden form で `bootstrapSessionToken` を iframe に `POST` 送信します。

## Deploy (Vercel)

1. リポジトリを Vercel Project として Import
2. 環境変数を設定
3. Deploy

## Security Notes

- `id_token` は URL や localStorage に保存しない
- iframe 起動用セッションは URL クエリではなく `POST body` で渡す
- GAS の公開関数は、初回表示後も毎回 `sessionToken` を検証する
- サインアウト時は `revokeSession` を呼んでサーバー側セッションも失効させる

## References

- Sample GAS bootstrap file: [gas-sample/WebApp.gs](/C:/Users/Ayuki/Documents/template/gas-sample/WebApp.gs)
- GAS build guide: [docs/GAS_BUILD_GUIDE.md](/C:/Users/Ayuki/Documents/template/docs/GAS_BUILD_GUIDE.md)
