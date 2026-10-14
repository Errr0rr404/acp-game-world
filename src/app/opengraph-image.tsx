import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { SITE_URL } from "@/site";

export const alt = "Game World. A good day to play. Free browser games, no account needed.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const poster = await readFile(join(process.cwd(), "public/posters/velocity.jpg"), "base64");

export default function SocialImage() {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", background: "#101426", color: "#f4f6ff", padding: 48, position: "relative" }}>
      <div style={{ position: "absolute", right: 36, top: 36, width: 650, height: 558, display: "flex", borderRadius: 28, overflow: "hidden" }}>
        <img src={`data:image/jpeg;base64,${poster}`} width={650} height={558} alt="" style={{ objectFit: "cover", objectPosition: "45% center" }} />
        <div style={{ position: "absolute", inset: 0, display: "flex", background: "linear-gradient(90deg, #101426 0%, rgba(16,20,38,.6) 20%, rgba(16,20,38,0) 65%)" }} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", width: 580, position: "relative" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 30, fontWeight: 700 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 54, height: 54, background: "#b8a5ff", borderRadius: 16 }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#101426" strokeWidth="1.8"><path d="M7 7h10a4 4 0 0 1 3.9 3.2l1 5A3 3 0 0 1 17 18l-2-2H9l-2 2a3 3 0 0 1-4.9-2.8l1-5A4 4 0 0 1 7 7Z" /><path d="M7 10v4m-2-2h4m7-1h.01m3 2h.01" /></svg>
          </div>Game World
        </div>
        <div style={{ display: "flex", marginTop: 66, fontSize: 76, fontWeight: 700, letterSpacing: -4, lineHeight: 1.08, maxWidth: 520 }}>A good day to play.</div>
        <div style={{ display: "flex", marginTop: 22, fontSize: 27, color: "#c7cfe5", maxWidth: 390, lineHeight: 1.4 }}>Free browser games. No account needed.</div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginTop: 30, width: 200, height: 62, background: "#b8a5ff", color: "#101426", borderRadius: 13, fontSize: 24, fontWeight: 700 }}>Play free</div>
        <div style={{ display: "flex", marginTop: "auto", fontSize: 19, color: "#acb5d0" }}>{new URL(SITE_URL).host}</div>
      </div>
    </div>,
    size,
  );
}
