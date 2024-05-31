import Link from "next/link";
import Blocks from "@/app/_components/blocks";
import Photos from "@/app/_components/photos";
import Star from "@/app/_components/star";
import { validateRequest } from "@/server/auth";
import Logout from "@/app/_components/logout";
import Image from "next/image";
import Cloud from "@/app/_components/cloud";
import FileUpload from "@/app/_components/fileUpload";
import File from "@/app/_components/file";
import { api } from "@/trpc/server";

export default async function Page() {
  const { user } = await validateRequest();
  const posts = await api.dashboard.getPostedFiles();
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
        <FileUpload />
        <article className="mx-auto mt-5 flex w-3/4 overflow-scroll p-4 text-text-100">
          <h2 className="w-1/2">Name</h2>
          <div className="flex w-1/2 gap-6">
            <p>Upvotes</p>
            <p>Downvotes</p>
            <p>Privacy</p>
          </div>
        </article>
        <div className=" mx-auto h-[1px]  w-3/4 bg-primary-100" />
        <section className="mx-auto my-5 w-3/4 overflow-scroll p-4 text-text-100">
          {posts
            ? posts.map((post) => <File key={post.postId} {...post} />)
            : null}
        </section>
      </section>
      <aside className="flex w-2/12 flex-col justify-center bg-secondary-900 p-4"></aside>
    </div>
  );
}
