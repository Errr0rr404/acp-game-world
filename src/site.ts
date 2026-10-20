export const SITE_URL = new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://games.agentcontrolpanel.dev").origin;
export const SITE_DESCRIPTION = "A little world of good games. Discover free browser games, save your favorites, and jump straight into play.";

export function publicUrl(path = "/"): string {
  return new URL(path, SITE_URL).toString();
}
