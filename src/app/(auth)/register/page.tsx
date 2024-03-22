import { signup } from "@/server/actions/auth";
import Link from "next/link";

export default async function Page() {
	return (
		<>
			<h1>Create an account</h1>
			<form action={signup}>
				<label htmlFor="username">Username</label>
				<input type="text" name="username" id="username" />
				<br />
				<label htmlFor="password">Password</label>
				<input type="password" name="password" id="password" />
                <br />
				<label htmlFor="confirmPassword">Password</label>
				<input type="confirmPassword" name="confirmPassword" id="confirmPassword" />
				<br />
				<button>Continue</button>
			</form>
			<Link href="/login">Sign in</Link>
		</>
	);
}