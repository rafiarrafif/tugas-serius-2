const authCookieName = "auth_token";
const authCookieMaxAge = 60 * 60 * 24;

export function getAuthToken(request: Request): string | undefined {
  const cookieHeader = request.headers.get("Cookie");

  for (const cookie of cookieHeader?.split(";") ?? []) {
    const [name, ...valueParts] = cookie.trim().split("=");
    if (name === authCookieName) {
      return valueParts.join("=") || undefined;
    }
  }

  return undefined;
}

export function commitAuthToken(token: string): string {
  if (!/^[\x21\x23-\x2B\x2D-\x3A\x3C-\x5B\x5D-\x7E]+$/.test(token)) {
    throw new Error("The server returned an invalid auth token.");
  }

  const secureAttribute = import.meta.env.PROD ? "; Secure" : "";
  return `${authCookieName}=${token}; Path=/; Max-Age=${authCookieMaxAge}; HttpOnly; SameSite=Lax${secureAttribute}`;
}
