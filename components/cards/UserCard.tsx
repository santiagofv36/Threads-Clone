"use client";
import Image from "next/image";
import Link from "next/link";

interface UserCardProps {
  id: string;
  name: string;
  username: string;
  imgUrl: string;
  personType: "User" | "Community";
}

const UserCard = ({
  id,
  name,
  username,
  imgUrl,
  personType,
}: UserCardProps) => {
  return (
    <Link href={`/profile/${id}`} className="hover:bg-slate-900 rounded-xl p-3">
      <article className="user-card">
        <div className="user-card_avatar">
          <Image
            src={imgUrl}
            alt="logo"
            width={48}
            height={48}
            className="rounded-full"
          />
          <div className="flex-1 text-ellipsis">
            <h4 className="text-light-1 text-base-semibold">{name}</h4>
            <p className="text-small-medium text-gray-1">@{username}</p>
          </div>
        </div>
      </article>
    </Link>
  );
};

export default UserCard;
