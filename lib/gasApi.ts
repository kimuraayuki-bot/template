export type GasApiSuccess<T = unknown> = {
  status: 200;
  ok: true;
  data: T;
  email?: string;
};

type GasApiEnvelope<T = unknown> = {
  status?: number;
  ok?: boolean;
  data?: T;
  message?: string;
  code?: string;
  email?: string;
};

export class GasApiError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "GasApiError";
    this.status = status;
    this.code = code;
  }
}

const gasWebAppUrl = process.env.NEXT_PUBLIC_GAS_WEBAPP_URL;

function normalizeStatus(rawStatus: number | undefined, fallback: number): number {
  if (typeof rawStatus !== "number") return fallback;
  return rawStatus;
}

function messageFromStatus(status: number): string {
  if (status === 401) return "認証に失敗しました。Googleで再ログインしてください。";
  if (status === 403) return "このアカウントにはアクセス権限がありません。";
  if (status === 0) return "ネットワークエラーが発生しました。接続を確認してください。";
  return "サーバーとの通信に失敗しました。";
}

export async function callGasApi<T = unknown>(
  idToken: string,
  action: string,
  payload?: Record<string, unknown>,
): Promise<GasApiSuccess<T>> {
  if (!gasWebAppUrl) {
    throw new GasApiError("NEXT_PUBLIC_GAS_WEBAPP_URL が未設定です。", 0, "missing_gas_url");
  }

  let response: Response;
  try {
    response = await fetch(gasWebAppUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken, action, payload: payload ?? {} }),
    });
  } catch {
    throw new GasApiError(messageFromStatus(0), 0, "network_error");
  }

  let body: GasApiEnvelope<T> = {};
  try {
    body = (await response.json()) as GasApiEnvelope<T>;
  } catch {
    body = {};
  }

  const status = normalizeStatus(body.status, response.status);
  const ok = status === 200 && body.ok === true;
  if (!ok) {
    const message = body.message || messageFromStatus(status);
    throw new GasApiError(message, status, body.code);
  }

  return {
    status: 200,
    ok: true,
    data: (body.data as T) ?? ({} as T),
    email: body.email,
  };
}
