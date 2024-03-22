import { logout } from "@/server/actions/auth";
import { validateRequest } from "@/server/auth";
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
      <form action={logout}>
        <button>Sign out</button>
      </form>
      {children}
    </>
  );
}
