type Props = {
  name: string;
  upvotes: number;
  downvotes: number;
  privacy: string;
};

export default function Element({ name, upvotes, downvotes, privacy }: Props) {
  return (
    <article className="flex">
      <h2 className="w-1/2">{name}</h2>
      <div className="flex w-1/2 gap-6">
        <p>{upvotes}</p>
        <p>{downvotes}</p>
        <p>{privacy}</p>
      </div>
    </article>
  );
}
