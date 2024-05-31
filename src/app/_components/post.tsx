import Download from "./download";
import Upvote from "./upvote";
import Downvote from "./downvote";
import Star from "./star";
import Link from "next/link";

type Props = {
  userId: string;
  postId: string;
  title: string;
  extension: string;
  upvotes: number;
  downvotes: number;
};

export default function Post({
  userId,
  postId,
  title,
  extension,
  upvotes,
  downvotes,
}: Props) {
  return (
    <article className="mx-auto my-5 flex w-10/12 rounded border border-primary-500 p-2">
      <Link
        href={`uploads/${userId}/${postId}.${extension}`}
        target="_blank"
        className="flex w-2/12 items-center justify-center text-7xl text-primary-500"
      >
        <Download />
      </Link>
      <div className="flex flex-col gap-4 p-4 text-text-100">
        <h2>{title}</h2>
        <div className="flex gap-4 align-top text-xl">
          <button>
            <Star />
          </button>
          <div className="contents">
            <button>
              <Upvote />
            </button>
            <p>{upvotes}</p>
          </div>
          <div className="contents">
            <button>
              <Downvote />
            </button>
            <p>{downvotes}</p>
          </div>
        </div>
      </div>
    </article>
  );
}
