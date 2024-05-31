"use client";
import Link from "next/link";
import { api } from "@/trpc/react";
import { FormEventHandler, useState } from "react";
import { UserRegisterSchema, userRegisterSchema } from "@/lib/utils";
import { useRouter } from "next/navigation";

type UserRegisterSchemaKey = keyof UserRegisterSchema;
type ErrorType = Partial<Record<UserRegisterSchemaKey, string>>;

export default function Page() {
  const [error, setError] = useState<ErrorType>({});
  const router = useRouter();
  const registerMutation = api.auth.signIn.useMutation({
    onError(error) {
      console.log(error);
    },
    onSuccess() {
      router.replace("/");
    },
  });

  const handleRegister: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    const data: Record<string, unknown> = {};
    new FormData(event.target as HTMLFormElement).forEach((value, key) => {
      data[key] = value;
    });
    const userData = userRegisterSchema.safeParse(data);
    if (!userData.success) {
      const error: ErrorType = {};
      userData.error.issues.forEach(({ message, path }) => {
        path.forEach((field) => {
          error[field as UserRegisterSchemaKey] = message;
        });
      });
      setError(error);
      return;
    }
	registerMutation.mutate(userData.data);
    setError({});
  };
  console.log(error);

  return (
    <>
      <h1>Create an account</h1>
      <form onSubmit={handleRegister}>
        <label htmlFor="username">Username</label>
        <input type="text" name="username" id="username" />
        <br />
        <label htmlFor="password">Password</label>
        <input type="password" name="password" id="password" />
        <br />
        <label htmlFor="confirmPassword">Password</label>
        <input
          type="confirmPassword"
          name="confirmPassword"
          id="confirmPassword"
        />
        <br />
        <button>Continue</button>
      </form>
      <Link href="/login">Sign in</Link>
    </>
  );
}
