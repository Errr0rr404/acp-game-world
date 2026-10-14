import Link from "next/link";
import { connection } from "next/server";
import { getSession } from "@/auth";
import { isOperator } from "@/games/policy";
import { Icon } from "./Icon";

export async function AccountChip() {
  await connection();
  const session = await getSession();
  if (!session) return <div className="account-chip"><Link href="/sign-in" className="account-link"><Icon name="user" />Sign in</Link></div>;
  return <div className="account-chip">
    <Link href="/me" className="account-link" title="Your play history"><Icon name="user" /><span className="account-name">{session.user.name}</span></Link>
    {isOperator(session.user.email) ? <Link href="/operator" className="text-button">Manage games</Link> : null}
    <form action="/api/sign-out" method="post"><button type="submit" className="text-button">Sign out</button></form>
  </div>;
}
