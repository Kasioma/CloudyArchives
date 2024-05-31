"use client";
import Download from "./download";
import Link from "next/link";
import Trash from "./trash";
import { ChangeEvent, KeyboardEvent, useState } from "react";
import { api } from "@/trpc/react";
import { VisibilityEnum } from "@/lib/utils";
import { useRouter } from "next/navigation";

type Props = {
  userId: string;
  postId: string;
  title: string;
  extension: string;
  upvotes: number;
  downvotes: number;
  visibility: string;
};

export default function File({
  userId,
  postId,
  title,
  extension,
  upvotes,
  downvotes,
  visibility,
}: Props) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingVisibility, setIsEditingVisibility] = useState(false);
  const [currentTitle, setCurrentTitle] = useState(title);
  const [currentVisibility, setCurrentVisibility] = useState(visibility);
  const [isModified, setIsModified] = useState(false);

  const router = useRouter();

  const updateMutation = api.dashboard.updateFile.useMutation({
    onError(error: { message: string }) {
      console.log(error.message);
    },
    onSuccess() {
      console.log("success");
    },
  });

  const handleTitleClick = () => {
    setIsEditingTitle(true);
  };

  const handleTitleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setCurrentTitle(e.target.value);
    setIsModified(true);
  };

  const handleTitleBlur = () => {
    setIsEditingTitle(false);
  };

  const handleVisibilityBlur = () => {
    setIsEditingVisibility(false);
  };

  const handleVisibilityChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setCurrentVisibility(e.target.value);
    setIsEditingVisibility(false);
    setIsModified(true);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "enter") handleTitleBlur();
  };

  const handleSavedChanges = () => {
    if (currentTitle != "" && currentTitle.length < 20) {
      updateMutation.mutate({
        postId: postId,
        currentTitle: currentTitle,
        currentVisibility: currentVisibility as VisibilityEnum,
      });
    }
    setIsModified(false);
  };

  const handleDelete = async () => {
    await fetch("/api/delete", {
      method: "DELETE",
      headers: {
        userId: userId,
        postId: postId,
        extension: extension,
      },
    });
    router.refresh();
  };

  return (
    <article className="mx-auto my-2 flex border-b-2 border-primary-500 p-2">
      <div className="w-1/2">
        {isEditingTitle ? (
          <input
            type="text"
            value={currentTitle}
            onChange={handleTitleChange}
            onBlur={handleTitleBlur}
            onKeyDown={handleKeyDown}
            autoFocus
            className="w-full text-text-900"
          />
        ) : (
          <h2 onClick={handleTitleClick} className="cursor-pointer">
            {currentTitle}
          </h2>
        )}
      </div>
      <div className="flex w-1/2 justify-around text-xl">
        <div className="contents">
          <p>{upvotes}</p>
        </div>
        <div className="contents">
          <p>{downvotes}</p>
        </div>
        <div className="contents">
          {isEditingVisibility ? (
            <select
              value={currentVisibility}
              onChange={handleVisibilityChange}
              onBlur={handleVisibilityBlur}
              className="text-text-900"
            >
              <option value="public">public</option>
              <option value="private">private</option>
            </select>
          ) : (
            <p
              onClick={() => setIsEditingVisibility(true)}
              className="cursor-pointer"
            >
              {currentVisibility}
            </p>
          )}
        </div>
      </div>
      <div className="mx-auto flex gap-5">
        <Link
          href={`uploads/${userId}/${postId}.${extension}`}
          target="_blank"
          className="flex items-center justify-center text-xl text-primary-500"
        >
          <Download />
        </Link>
        <button className="text-xl text-primary-500" onClick={handleDelete}>
          <Trash />
        </button>
      </div>
      {isModified ? (
        <button onClick={handleSavedChanges} className="text-primary-500">
          Save
        </button>
      ) : null}
    </article>
  );
}
