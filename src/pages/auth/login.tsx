import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from "next";
import { getCsrfToken } from "next-auth/react";

export default function SignIn({
  csrfToken,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <form
      method="post"
      action="/api/auth/callback/credentials"
      className="mx-auto my-auto flex h-screen w-screen flex-col items-center justify-center"
    >
      <div className="flex flex-col gap-10 rounded-xl border border-gray-400 p-8 text-black shadow-md">
        <input name="csrfToken" type="hidden" defaultValue={csrfToken} />
        <label className="flex gap-3">
          Имя пользователя
          <input
            name="name"
            type="text"
            className="border border-gray-600 bg-gray-100"
          />
        </label>
        <button type="submit" className="rounded-md bg-black py-2 text-white">
          Войти
        </button>
      </div>
    </form>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  return {
    props: {
      csrfToken: await getCsrfToken(context),
    },
  };
}
