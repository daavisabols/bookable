type GeoContext = {
  geo?: {
    country?: {
      code?: string;
    };
  };
  next: () => Promise<Response>;
};

const pickCurrencyForCountry = (countryCode?: string) => {
  const code = (countryCode || "").toUpperCase();

  // Keep this intentionally small & explicit. Expand as needed.
  if (code === "US") return "USD";
  if (code === "GB") return "GBP";

  // Default
  return "EUR";
};

const hasCookie = (cookieHeader: string | null, name: string) => {
  if (!cookieHeader) return false;
  return cookieHeader.split(";").some((part) => part.trim().startsWith(`${name}=`));
};

export default async (request: Request, context: GeoContext) => {
  const cookieHeader = request.headers.get("cookie");

  // Don’t overwrite a user’s choice if you later add a selector.
  if (hasCookie(cookieHeader, "currency")) {
    return context.next();
  }

  const countryCode = context.geo?.country?.code;
  const currency = pickCurrencyForCountry(countryCode);

  const response = await context.next();

  // Don't try to mutate redirects or error responses — headers are immutable on those
  if (response.status >= 300 && response.status < 400) {
    return response;
  }

  // 1 year
  try {
    response.headers.append(
      "Set-Cookie",
      `currency=${currency}; Path=/; Max-Age=31536000; SameSite=Lax`
    );
  } catch {
    // Headers immutable on this response type — return as-is
    return response;
  }

  return response;
};
