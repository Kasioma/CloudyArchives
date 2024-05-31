"use client";
import {
  UserRole,
  cn,
  userRoles as appUserRoles,
  changeCredentials,
} from "@/lib/utils";
import { userTable } from "@/server/db/schema";
import { api } from "@/trpc/react";
import { InferSelectModel } from "drizzle-orm";
import { useRouter } from "next/navigation";
import { FormEventHandler, useEffect, useRef, useState } from "react";

type User = InferSelectModel<typeof userTable>;

export default function Table() {
  const {
    isLoading,
    isFetching,
    isError,
    error,
    data: users,
  } = api.moderator.fetchUsers.useQuery();

  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  if (isLoading || isFetching) return <div>Loading...</div>;
  if (isError)
    return (
      <div>
        <h1>Error</h1>
        {error.message}
      </div>
    );
  return (
    <div className="flex flex-col gap-4">
      <main className="contents">
        <h1 className="text-3xl text-primary-500">User data</h1>
        <div className="grid w-fit grid-cols-2 border border-gray-200">
          <div className="bg-gray-200 px-2 py-1.5 text-center">Username</div>
          <div className="bg-gray-200 px-2 py-1.5 text-center">Role</div>

          {users?.map((user, idx) => {
            const className = cn("px-2 py-1.5 bg-gray-50", {
              "bg-gray-200": idx % 2 == 1,
              "bg-gray-400 cursor-pointer relative after:absolute after:inset-0 after:bg-gray-300 after:opacity-0 group-hover:after:opacity-25":
                user.role != "moderator",
            });

            return (
              <div
                key={`user-data-${user.username}`}
                className="group contents"
                onClick={
                  user.role == "moderator"
                    ? undefined
                    : () => {
                        setSelectedUser(user);
                      }
                }
              >
                <div className={className}>{user.username}</div>
                <div className={className}>{user.role}</div>
              </div>
            );
          })}
        </div>
      </main>
      {selectedUser && (
        <UpdateUserInfo user={selectedUser} setUser={setSelectedUser} />
      )}
    </div>
  );
}

type Props = {
  user: User;
  setUser: (user: null) => void;
};

function UpdateUserInfo({ user, setUser }: Props) {
  const usernameRef = useRef<HTMLInputElement | null>(null);

  const router = useRouter();

  const mutationOptions = {
    onError(error: { message: string }) {
      console.log(error.message);
    },
    onSuccess() {
      setUser(null);
      router.refresh();
    },
  };
  const updateMutation = api.moderator.modify.useMutation(mutationOptions);

  useEffect(() => {
    usernameRef.current!.value = user.username;
  }, [user.username]);

  const userRoles = Object.values<UserRole>(appUserRoles).filter(
    (role) => role != user.role,
  );
  userRoles.unshift(user.role);

  const handleChange: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    const data: Record<string, unknown> = {};
    new FormData(event.target as HTMLFormElement).forEach((value, key) => {
      data[key] = value;
    });
    const userData = changeCredentials.safeParse(data);
    if (!userData.success) {
      userData.error.issues.forEach(({ message, path }) => {
        path.forEach(() => {
          console.log(message);
        });
      });
      return;
    }
    updateMutation.mutate({ ...userData.data, currentUsername: user.username });
  };

  return (
    <>
      <h2 className="mt-8 text-2xl text-primary-500">
        Change account information
      </h2>
      <form onSubmit={handleChange} className="grid w-fit grid-cols-2 gap-2">
        <div className="contents">
          <label htmlFor="name" className="text-primary-500">
            Username
          </label>
          <input
            ref={usernameRef}
            type="text"
            name="username"
            id="username"
            className="rounded border-4 border-slate-500"
          />
        </div>
        <div className="contents">
          <label htmlFor="role" className="text-primary-500">
            Role
          </label>
          <select className="p-1" name="role" id="role" key={user.role}>
            {userRoles.map((role) => (
              <option key={role} value={role} className="capitalize">
                {role}
              </option>
            ))}
          </select>
        </div>
        <button className="text-primary-500">Change</button>
      </form>
    </>
  );
}
