const BLOCKED_EMAIL_DOMAINS = new Set([
  "aol.com",
  "fastmail.com",
  "gmail.com",
  "googlemail.com",
  "gmx.com",
  "gmx.de",
  "hotmail.com",
  "hotmail.com.mx",
  "icloud.com",
  "live.com",
  "live.com.mx",
  "mac.com",
  "mail.com",
  "me.com",
  "msn.com",
  "outlook.com",
  "outlook.com.mx",
  "pm.me",
  "proton.me",
  "protonmail.com",
  "rocketmail.com",
  "yahoo.com",
  "yahoo.com.mx",
  "yahoo.es",
  "ymail.com",
  "zoho.com",
  "zohomail.com",
]);

const BLOCKED_EMAIL_DOMAIN_SUFFIXES = [
  ".yahoo.com",
  ".hotmail.com",
  ".outlook.com",
  ".live.com",
];

export const getEmailDomain = (email: string) => email.trim().toLowerCase().split("@")[1] ?? "";

export const isCorporateEmail = (email: string) => {
  const domain = getEmailDomain(email);
  if (!domain) return false;
  if (BLOCKED_EMAIL_DOMAINS.has(domain)) return false;
  return !BLOCKED_EMAIL_DOMAIN_SUFFIXES.some((suffix) => domain.endsWith(suffix));
};
