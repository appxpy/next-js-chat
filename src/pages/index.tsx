import { signIn } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <Head>
        <title>Create T3 App</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
          <Link
            href="/app"
            className="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]"
          >
            Войти в <span className="text-[hsl(280,100%,70%)]">чат</span>
          </Link>
        </div>
      </main>
    </>
  );
}
