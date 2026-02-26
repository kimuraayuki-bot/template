# GAS iframe UI Template (React + Vercel)

GAS で作成した Web アプリを `iframe` で埋め込むための最小テンプレートです。

## 1. セットアップ

```bash
npm install
cp .env.example .env.local
```

`.env.local` を開いて URL を設定:

```env
NEXT_PUBLIC_GAS_WEBAPP_URL=https://script.google.com/macros/s/xxxxx/exec
NEXT_PUBLIC_APP_TITLE=GAS Embedded App
```

## 2. 開発起動

```bash
npm run dev
```

## 3. Vercel デプロイ

- このディレクトリを GitHub に push
- Vercel で Import Project
- Environment Variables に以下を設定
  - `NEXT_PUBLIC_GAS_WEBAPP_URL`
  - `NEXT_PUBLIC_APP_TITLE` (任意)

## 4. GAS 側のポイント

`iframe` 埋め込みを許可するため、GAS で HTML を返している場合は以下を設定:

```javascript
return HtmlService.createHtmlOutputFromFile('index')
  .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
```

## メモ

- `iframe` 内の高さ自動調整は同一オリジン制約で直接は難しいため、まずは固定/最小高さで運用しています。
- 認証が必要な GAS 画面は埋め込み先でログイン状態が影響します。
