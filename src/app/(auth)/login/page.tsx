import Link from "next/link";

export default async function Page() {
	return (
		<>
			<h1>Sign in</h1>
			<Link href="/api/auth/github">Sign in with GitHub</Link>
			<Link href="/api/auth/discord">Sign in with Discord</Link>
		</>
	);
}
