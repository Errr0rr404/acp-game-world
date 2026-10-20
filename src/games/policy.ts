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
  "https://sweet-snip.liveapps.dev",
  "https://lab-escape.liveapps.dev",
  "https://monster-haul.liveapps.dev",
  "https://balloon-bastion.liveapps.dev",
  "https://inkland.liveapps.dev",
  "https://corner-pocket.liveapps.dev",
  "https://patience-parlor.liveapps.dev",
  "https://glowtail.liveapps.dev",
  "https://twofold.liveapps.dev",
  "https://beatline.liveapps.dev",
  "https://rim-rivals.liveapps.dev",
  "https://bubble-reef.liveapps.dev",
  "https://hop-lanes.liveapps.dev",
  "https://orchard-drop.liveapps.dev",
  "https://crumb-tycoon.liveapps.dev",
  "https://lantern-horde.liveapps.dev",
  "https://sinkhole.liveapps.dev",
  "https://stackfall.liveapps.dev",
  "https://ember-and-tide.liveapps.dev",
  "https://ribbon.liveapps.dev",
  "https://kiln-break.liveapps.dev",
  "https://flag-camp.liveapps.dev",
  "https://lattice.liveapps.dev",
  "https://amber-drop.liveapps.dev",
  "https://disc-court.liveapps.dev",
  "https://crown-lane.liveapps.dev",
  "https://color-shed.liveapps.dev",
  "https://fog-grid.liveapps.dev",
  "https://tile-garden.liveapps.dev",
  "https://sugarlink.liveapps.dev",
  "https://mothlight.liveapps.dev",
  "https://night-barrage.liveapps.dev",
  "https://marble-hall.liveapps.dev",
  "https://flock-fling.liveapps.dev",
  "https://spring-roof.liveapps.dev",
  "https://glass-run.liveapps.dev",
  "https://ring-drop.liveapps.dev",
  "https://putt-yard.liveapps.dev",
  "https://keylane.liveapps.dev",
  "https://cinder-grid.liveapps.dev",
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
