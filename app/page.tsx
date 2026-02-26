const gasUrl = process.env.NEXT_PUBLIC_GAS_WEBAPP_URL;
const appTitle = process.env.NEXT_PUBLIC_APP_TITLE ?? "GAS Embedded App";

export default function Page() {
  return (
    <main className="page">
      <header className="header">
        <p className="badge">React + Vercel Template</p>
        <h1>{appTitle}</h1>
      </header>

      {!gasUrl ? (
        <section className="notice">
          <h2>GAS URL が未設定です</h2>
          <p>
            <code>NEXT_PUBLIC_GAS_WEBAPP_URL</code> にデプロイ済み Web アプリ URL を設定してください。
          </p>
        </section>
      ) : (
        <section className="frameWrap">
          <iframe
            src={gasUrl}
            title="GAS Web App"
            className="frame"
            loading="lazy"
            allow="clipboard-read; clipboard-write"
          />
        </section>
      )}

      <footer className="footer">
        <p>Tips: GAS 側で iframe 埋め込みを許可してください。</p>
      </footer>
    </main>
  );
}
