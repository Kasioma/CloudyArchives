import { validateRequest } from "@/server/auth";
import Link from "next/link";
import { redirect } from "next/navigation";
type Props = {
  children: React.ReactNode;
};
export default async function layout({ children }: Props) {
  const { user } = await validateRequest();
  if (!user) return redirect("/login");
  return (
    <>
      <h1>Hi, {user.username}!</h1>
      <p>Your user ID is {user.id}.</p>
      <Link href="/api/auth/logout">logout</Link>
      {children}
    </>
  );
}
