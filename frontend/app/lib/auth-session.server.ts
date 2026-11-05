const authCookieName = "auth_token";
const accountCookieName = "auth_account";
const authCookieMaxAge = 60 * 60 * 24;

export type AccountProfile = {
  name: string;
  email: string;
  role: "admin" | "owner" | "customer";
};

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

export function getAccountProfile(
  request: Request,
): AccountProfile | undefined {
  const cookieHeader = request.headers.get("Cookie");

  for (const cookie of cookieHeader?.split(";") ?? []) {
    const [name, ...valueParts] = cookie.trim().split("=");
    if (name !== accountCookieName) {
      continue;
    }

    try {
      const profile = JSON.parse(
        decodeURIComponent(valueParts.join("=")),
      ) as Partial<AccountProfile>;
      if (
        typeof profile.name === "string" &&
        typeof profile.email === "string" &&
        (profile.role === "admin" ||
          profile.role === "owner" ||
          profile.role === "customer")
      ) {
        return {
          name: profile.name,
          email: profile.email,
          role: profile.role,
        };
      }
    } catch {
      return undefined;
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

export function commitAccountProfile(profile: AccountProfile): string {
  const secureAttribute = import.meta.env.PROD ? "; Secure" : "";
  const value = encodeURIComponent(JSON.stringify(profile));
  return `${accountCookieName}=${value}; Path=/; Max-Age=${authCookieMaxAge}; HttpOnly; SameSite=Lax${secureAttribute}`;
}

export function clearAuthToken(): string {
  const secureAttribute = import.meta.env.PROD ? "; Secure" : "";
  return `${authCookieName}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax${secureAttribute}`;
}

export function clearAccountProfile(): string {
  const secureAttribute = import.meta.env.PROD ? "; Secure" : "";
  return `${accountCookieName}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax${secureAttribute}`;
}
