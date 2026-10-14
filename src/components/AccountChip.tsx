import Link from "next/link";
import { getSession } from "@/auth";
import { isOperator } from "@/games/policy";

export async function AccountChip() {
  const session = await getSession();
  if (!session) {
    return (
      <Link href="/sign-in" className="font-display text-lg font-semibold underline">
        Sign in
      </Link>
    );
  }
  return (
    <div className="flex items-center gap-4">
      <Link href="/me" className="font-display text-lg font-semibold">
        {session.user.name}
      </Link>
      {isOperator(session.user.email) ? (
        <Link href="/operator" className="underline">
          Shelf
        </Link>
      ) : null}
      <form action="/api/sign-out" method="post">
        <button type="submit" className="font-display text-lg font-semibold underline">
          Sign out
        </button>
      </form>
    </div>
  );
}
