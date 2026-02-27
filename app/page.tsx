"use client";

import Script from "next/script";
import { useCallback, useEffect, useRef, useState } from "react";

type AuthState = "checking" | "signed_out" | "signed_in" | "denied" | "error";

type JwtPayload = {
  email?: string;
  name?: string;
  picture?: string;
  email_verified?: boolean;
};

type UserInfo = {
  email: string;
  name: string;
  picture?: string;
};

type GoogleCredentialResponse = {
  credential?: string;
};

type GoogleIdentity = {
  accounts: {
    id: {
      initialize: (options: {
        client_id: string;
        callback: (response: GoogleCredentialResponse) => void;
      }) => void;
      renderButton: (
        parent: HTMLElement,
        options: Record<string, string | number | boolean>,
      ) => void;
      prompt: () => void;
      cancel: () => void;
      revoke: (hint: string, callback: () => void) => void;
      disableAutoSelect: () => void;
    };
  };
};

const gasUrl = process.env.NEXT_PUBLIC_GAS_WEBAPP_URL;
const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
const allowedEmails = (process.env.NEXT_PUBLIC_ALLOWED_EMAILS ?? "")
  .split(",")
  .map((item) => item.trim().toLowerCase())
  .filter(Boolean);
const allowedDomain = (process.env.NEXT_PUBLIC_ALLOWED_DOMAIN ?? "")
  .trim()
  .toLowerCase();

function base64UrlDecode(value: string): string {
  const padded = value + "=".repeat((4 - (value.length % 4)) % 4);
  const base64 = padded.replace(/-/g, "+").replace(/_/g, "/");
  return atob(base64);
}

function parseJwt(credential: string): JwtPayload | null {
  const sections = credential.split(".");
  if (sections.length < 2) return null;

  try {
    const payload = JSON.parse(base64UrlDecode(sections[1])) as JwtPayload;
    return payload;
  } catch {
    return null;
  }
}

function isEmailAllowed(email: string): boolean {
  const normalized = email.toLowerCase();
  if (allowedEmails.length > 0 && allowedEmails.includes(normalized)) return true;
  if (allowedDomain && normalized.endsWith(`@${allowedDomain}`)) return true;
  return allowedEmails.length === 0 && !allowedDomain;
}

export default function Page() {
  const [authState, setAuthState] = useState<AuthState>("checking");
  const [user, setUser] = useState<UserInfo | null>(null);
  const [scriptReady, setScriptReady] = useState(false);
  const buttonRef = useRef<HTMLDivElement | null>(null);

  const handleCredential = useCallback((response: GoogleCredentialResponse) => {
    if (!response.credential) {
      setAuthState("error");
      return;
    }

    const payload = parseJwt(response.credential);
    if (!payload?.email || !payload.email_verified) {
      setAuthState("denied");
      return;
    }

    if (!isEmailAllowed(payload.email)) {
      setAuthState("denied");
      return;
    }

    setUser({
      email: payload.email,
      name: payload.name ?? payload.email,
      picture: payload.picture,
    });
    setAuthState("signed_in");
  }, []);

  useEffect(() => {
    if (!googleClientId) {
      setAuthState("error");
      return;
    }

    if (!scriptReady || authState === "signed_in" || !buttonRef.current) return;

    const google = (window as Window & { google?: GoogleIdentity }).google;
    if (!google) return;

    google.accounts.id.initialize({
      client_id: googleClientId,
      callback: handleCredential,
    });
    google.accounts.id.renderButton(buttonRef.current, {
      theme: "outline",
      size: "large",
      shape: "pill",
      width: 280,
      text: "signin_with",
    });
    google.accounts.id.prompt();
    setAuthState("signed_out");

    return () => {
      google.accounts.id.cancel();
    };
  }, [authState, handleCredential, scriptReady]);

  const handleSignOut = () => {
    const google = (window as Window & { google?: GoogleIdentity }).google;
    if (google && user?.email) google.accounts.id.revoke(user.email, () => {});
    if (google) google.accounts.id.disableAutoSelect();
    setUser(null);
    setAuthState("signed_out");
  };

  return (
    <main className="page">
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={() => setScriptReady(true)}
      />

      {!gasUrl ? (
        <section className="notice">
          <h2>GAS URL が未設定です</h2>
          <p>
            <code>NEXT_PUBLIC_GAS_WEBAPP_URL</code> にデプロイ済み Web アプリ URL を設定してください。
          </p>
        </section>
      ) : !googleClientId ? (
        <section className="notice">
          <h2>Google Client ID が未設定です</h2>
          <p>
            <code>NEXT_PUBLIC_GOOGLE_CLIENT_ID</code> を設定してください。
          </p>
        </section>
      ) : authState !== "signed_in" ? (
        <section className="notice">
          <h2>Google ログインが必要です</h2>
          <p className="noticeText">ログイン成功後に埋め込み UI を表示します。</p>
          <div ref={buttonRef} className="googleButton" />
          {authState === "denied" ? (
            <p className="noticeError">
              この Google アカウントではアクセスできません。許可メール/ドメインを確認してください。
            </p>
          ) : null}
          {authState === "error" ? (
            <p className="noticeError">認証初期化に失敗しました。環境変数を確認してください。</p>
          ) : null}
        </section>
      ) : (
        <section className="frameWrap">
          <div className="userBar">
            <div className="userMeta">
              {user?.picture ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.picture} alt={user.name} className="avatar" />
              ) : null}
              <div>
                <strong>{user?.name}</strong>
                <p>{user?.email}</p>
              </div>
            </div>
            <button type="button" onClick={handleSignOut} className="signOutButton">
              Sign out
            </button>
          </div>
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
        <p>Tips: このUIガードに加えて、GAS側でも認可チェックを入れてください。</p>
      </footer>
    </main>
  );
}
