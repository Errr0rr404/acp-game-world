const DEFAULT_APPROVED = [
  "https://racing.worldofz.info",
  "https://flap-flap-fly.liveapps.dev",
  "https://scrapyard-fps.liveapps.dev",
  "https://sundial-dash.liveapps.dev",
  "https://voxel-rivals.liveapps.dev",
  "https://tetherfly.liveapps.dev",
  "https://stunt-ridge.liveapps.dev",
  "https://wicks-end.liveapps.dev",
  "https://wordwell.liveapps.dev",
];

export function approvedOrigins(): string[] {
  const configured = process.env.APPROVED_ORIGINS?.split(",").map((origin) => origin.trim()).filter(Boolean);
  return configured && configured.length > 0 ? configured : DEFAULT_APPROVED;
}

export function isOperator(email: string | null | undefined): boolean {
  if (!email) return false;
  const allowed = (process.env.OPERATOR_EMAILS ?? "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
  return allowed.includes(email.toLowerCase());
}

export function signInError(input: { email: string; over13: boolean }): string | null {
  const email = input.email.trim();
  if (!email) return "Enter an email.";
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "That email does not look right.";
  if (!input.over13) return "Confirm you are 13 or older.";
  return null;
}

export function accountsEnabled(): boolean {
  return Boolean(process.env.DATABASE_URL && process.env.BETTER_AUTH_SECRET);
}
