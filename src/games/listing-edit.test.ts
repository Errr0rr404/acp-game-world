import { expect, test } from "vitest";
import { listingError } from "@/app/api/operator/route";

test("a playable game must use an approved https origin", () => {
  const base = {
    slug: "velocity",
    title: "Velocity",
    tagline: "Race.",
    status: "playable",
    origin: "https://racing.worldofz.info",
    poster: "/posters/velocity.jpg",
    controls: "Keyboard or touch",
  };
  expect(listingError(base)).toBeNull();
  expect(listingError({ ...base, origin: "https://evil.example" })).toMatch(/approved/);
  expect(listingError({ ...base, status: "soon", origin: "" })).toBeNull();
  expect(listingError({ ...base, poster: "https://evil.example/a.jpg" })).toMatch(/poster/);
});
