/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import React, { useState } from "react";
import { prisma } from "~/server/db";
import { signOut, useSession } from "next-auth/react";
import type { InferGetServerSidePropsType } from "next/types";
import type { User, Message } from "@prisma/client";

interface UserName2Id {
  id: string;
  name: string;
}
export default function Chat({
  users,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const { data: session } = useSession();
  const [currentUser, setCurrentUser] = useState<UserName2Id>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");

  const fetchMessages = async (user: User) => {
    try {
      const response = await fetch(`/api/messages?receiverId=${user.id}`);
      const data = await response.json();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      setMessages(data.messages);
      setCurrentUser(user);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const handleSendMessage = async () => {
    if (!currentUser) {
      return alert("Выберите пользователя!");
    }
    try {
      const response = await fetch("/api/addmessages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: newMessage,
          receiverId: currentUser.id,
        }),
      });
      const data = await response.json();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      setMessages([...messages, data.message]);
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <main
      className="flex min-h-screen flex-col items-center justify-center"
      onKeyPress={(event) => {
        if (event.key === "Enter") {
          void handleSendMessage();
        }
      }}
    >
      <div className="flex h-full w-full flex-1 flex-col bg-slate-800 p-5 text-white">
        <nav className="relative flex h-20 w-full flex-row items-center justify-between">
          Вы авторизованы как {session?.user?.name}
          {/* Map for all users and display their names as clickable icons */}
          <div className="flex flex-row gap-5">
            {users.map((user) =>
              user.name !== session?.user?.name ? (
                <button
                  key={user.id}
                  onClick={() => {
                    void fetchMessages(user);
                  }}
                  className="flex flex-col items-center justify-center"
                >
                  <p>{user.name}</p>
                </button>
              ) : null
            )}
          </div>
          <button
            className="rounded-xl bg-white px-3 py-2 text-black"
            onClick={() => {
              void signOut({ callbackUrl: "/" });
            }}
          >
            Выйти
          </button>
        </nav>
        <div className="relative flex h-full w-full flex-1 flex-col rounded-xl border border-gray-500 p-3">
          <div className="flex h-10 w-full">
            Вы переписываетесь с {currentUser?.name}
          </div>
          <div className="flex w-full flex-auto flex-col">
            {messages.map((message) => (
              <span key={message.id}>
                <b>{users.find((u) => u.id == message.senderId)?.name}</b> -{" "}
                {message.text}
              </span>
            ))}
          </div>
          <div className="flex h-8 w-full gap-5">
            <input
              type="text"
              className="w-full rounded-xl px-2 text-black"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
            />
            <button
              className="rounded-xl bg-white px-4 text-black"
              onClick={() => {
                void handleSendMessage();
              }}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

export const getServerSideProps = async () => {
  const users = await prisma.user.findMany();
  try {
    return {
      props: { users },
    };
  } catch (error) {
    console.log(error);
  }
};
