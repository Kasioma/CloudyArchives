import Link from "next/link";
import Blocks from "./_components/blocks";
import Cloud from "./_components/cloud";
import Photos from "./_components/photos";
import Star from "./_components/star";
import { validateRequest } from "@/server/auth";
import Logout from "./_components/logout";
import Image from "next/image";
import Post from "./_components/post";
import { api } from "@/trpc/server";
import { redirect } from "next/navigation";

export default async function Home() {
  const { user } = await validateRequest();
  if (user && user.role === "moderator") return redirect("/moderator/requests");
  const posts = await api.dashboard.display();

  return (
    <div className="flex h-screen">
      <nav className="flex w-2/12 flex-col justify-between bg-secondary-900 p-4">
        <div>
          <span className="text-4xl text-primary-500">
            <Cloud />
          </span>
          <div className="my-2 h-[1px] w-full bg-primary-500" />
          <ul className="text-primary-500">
            <li>
              <Link
                className="align-center mb-5 flex justify-center gap-1 text-xl"
                href="/favorites"
              >
                <Star /> Favorites
              </Link>
            </li>
            <li>
              <Link
                href="/files"
                className="align-center mb-5 flex justify-center gap-1 text-xl"
              >
                <Blocks /> All Files
              </Link>
            </li>
            <li>
              <Link
                className="align-center mb-5 flex justify-center gap-1 text-xl"
                href="/"
              >
                <Photos /> Photos
              </Link>
            </li>
          </ul>
        </div>
        {user === null ? (
          <div className="flex flex-col">
            <Link
              className="rounded bg-primary-500 p-1 text-center text-text-100"
              href="/login"
            >
              Log In
            </Link>
            <Link
              className="my-1 rounded border border-primary-500 p-1 text-center text-primary-500"
              href="/register"
            >
              Sign Up
            </Link>
          </div>
        ) : (
          <div className="mx-auto flex max-w-max flex-col items-center gap-4 rounded-full bg-primary-600 p-2">
            <Image
              src={"/basic.png"}
              alt={"profile"}
              width="75"
              height="75"
              className="rounded-full"
            ></Image>
            <div className="my-2 h-[1px] w-full bg-primary-100" />
            <Link
              href="/api/auth/logout"
              className="block text-[35px] text-text-100"
            >
              <Logout />
            </Link>
          </div>
        )}
      </nav>
      <section className="w-8/12 overflow-scroll bg-primary-900 p-4">
        {posts.map((post) => (
          <Post key={post.postId} {...post} />
        ))}
      </section>
      <aside className="flex w-2/12 flex-col justify-center bg-secondary-900 p-4"></aside>
    </div>
  );
}
