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

const blockedPathPatterns: RegExp[] = [
  /^\/xmlrpc\.php$/i,
  /^\/wp(?:$|[\/\-])/i,
  /^\/wp-admin(?:\/|$)/i,
  /^\/wp-content(?:\/|$)/i,
  /^\/wp-includes(?:\/|$)/i,
  /^\/wp-json(?:\/|$)/i,
  /^\/wordpress(?:\/|$)/i,
  /^\/wordpress\//i,
  /^\/\.git(?:\/|$)/i,
  /^\/\.aws(?:\/|$)/i,
  /^\/\.vscode(?:\/|$)/i,
  /^\/\.svn(?:\/|$)/i,
  /^\/\.DS_Store$/i,
  /^\/cgi-bin(?:\/|$)/i,
  /^\/_profiler(?:\/|$)/i,
  /^\/actuator(?:\/|$)/i,
  /^\/magento_version$/i,
  /^\/sftp-config\.json$/i,
  /^\/application\.yml$/i,
  /^\/application\.properties$/i,
  /^\/appsettings\.json$/i,
  /^\/settings\.py$/i,
  /^\/phpinfo(?:$|\.)/i,
  /^\/install\.php$/i,
  /^\/config\./i,
  /(?:^|\/)\.env(?:$|\.|\/)/i,
  /\.php$/i,
];

const blockedUserAgentPatterns: RegExp[] = [
  /mozlila\/5\.0/i,
  /zgrab/i,
  /masscan/i,
  /sqlmap/i,
  /nikto/i,
  /nmap/i,
  /acunetix/i,
  /dirbuster/i,
  /gobuster/i,
  /wpscan/i,
  /whatweb/i,
  /python-requests/i,
  /curl\//i,
  /wget\//i,
];

export default async (request: Request, context: GeoContext) => {
  const url = new URL(request.url);
  const pathname = url.pathname || "/";
  const userAgent = request.headers.get("user-agent") || "";

  if (!userAgent.trim() || blockedUserAgentPatterns.some((pattern) => pattern.test(userAgent))) {
    return new Response(null, { status: 403 });
  }

  if (blockedPathPatterns.some((pattern) => pattern.test(pathname))) {
    return new Response(null, { status: 410 });
  }

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
