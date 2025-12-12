import crypto from "crypto";

const BASE_URL = process.env.DOCUSIGN_BASE_URL || "https://demo.docusign.net/restapi";
const ACCOUNT_ID = process.env.DOCUSIGN_ACCOUNT_ID;
const USER_ID = process.env.DOCUSIGN_USER_ID;
const INTEGRATION_KEY = process.env.DOCUSIGN_INTEGRATION_KEY;
const PRIVATE_KEY = process.env.DOCUSIGN_PRIVATE_KEY;

function base64url(input: Buffer | string) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function resolveAudience() {
  const useDemo = BASE_URL.includes("demo");
  return useDemo ? "account-d.docusign.com" : "account.docusign.com";
}

export async function getJwtAccessToken(): Promise<string> {
  if (!INTEGRATION_KEY || !USER_ID || !PRIVATE_KEY) {
    throw new Error("DocuSign env vars missing (integration key, user id, or private key).");
  }

  const header = { alg: "RS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: INTEGRATION_KEY,
    sub: USER_ID,
    aud: resolveAudience(),
    iat: now,
    exp: now + 5 * 60,
    scope: "signature impersonation",
  };

  const signingInput = `${base64url(JSON.stringify(header))}.${base64url(JSON.stringify(payload))}`;

  const signer = crypto.createSign("RSA-SHA256");
  signer.update(signingInput);
  signer.end();

  // Private key may come with escaped newlines
  const key = PRIVATE_KEY.includes("\\n") ? PRIVATE_KEY.replace(/\\n/g, "\n") : PRIVATE_KEY;
  const signature = base64url(signer.sign(key));
  const jwt = `${signingInput}.${signature}`;

  const tokenHost = resolveAudience();
  const tokenUrl = `https://${tokenHost}/oauth/token`;

  const params = new URLSearchParams();
  params.set("grant_type", "urn:ietf:params:oauth:grant-type:jwt-bearer");
  params.set("assertion", jwt);

  const res = await fetch(tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`DocuSign token request failed (${res.status}): ${text}`);
  }
  const json = (await res.json()) as { access_token?: string };
  if (!json.access_token) {
    throw new Error("DocuSign token response missing access_token.");
  }
  return json.access_token;
}

export async function fetchEnvelopeCombinedPdf(envelopeId: string): Promise<{ buffer: Buffer; filename: string }> {
  if (!ACCOUNT_ID) {
    throw new Error("DOCUSIGN_ACCOUNT_ID is not set.");
  }
  const accessToken = await getJwtAccessToken();
  const url = `${BASE_URL}/v2.1/accounts/${ACCOUNT_ID}/envelopes/${envelopeId}/documents/combined`;
  const res = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/pdf",
      "Content-Transfer-Encoding": "base64",
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`DocuSign documents download failed (${res.status}): ${text}`);
  }
  const arrayBuffer = await res.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Try to extract filename from Content-Disposition if present
  const contentDisposition = res.headers.get("content-disposition") || "";
  const match = contentDisposition.match(/filename=\"?([^\";]+)\"?/i);
  const filename = match?.[1] || `docusign-${envelopeId}.pdf`;

  return { buffer, filename };
}
