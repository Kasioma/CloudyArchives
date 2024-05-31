"use client";
import { api } from "@/trpc/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Props = {
  userId: string;
  postId: string;
  extension: string;
  username: string;
  title: string;
};

export default function Request({
  userId,
  postId,
  extension,
  username,
  title,
}: Props) {
  const router = useRouter();
  const setMutation = api.moderator.handleRequest.useMutation({
    onError(error: { message: string }) {
      console.log(error.message);
    },
    onSuccess() {
      console.log("success");
      router.refresh();
    },
  });

  const handleSet = (status: boolean) => {
    setMutation.mutate({ postId, status });
  };
  return (
    <article className="mx-auto mt-5 flex w-3/4 justify-around gap-4 overflow-scroll p-4 text-text-100">
      <h2>{username}</h2>
      <Link
        href={`uploads/${userId}/${postId}.${extension}`}
        target="_blank"
        className="text-primary-500"
      >
        {title}
      </Link>
      <button onClick={() => handleSet(true)}>Accept</button>
      <button onClick={() => handleSet(false)}>Reject</button>
    </article>
  );
}
