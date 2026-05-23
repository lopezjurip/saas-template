import { LoginForm } from "./login-form";

type SearchParams = Promise<{ email?: string; has_passkey?: string }>;

export default async function EmailLoginPage({ searchParams }: { searchParams: SearchParams }) {
  const { email = "", has_passkey } = await searchParams;
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-center text-sm font-medium">Iniciar sesión</h2>
      <LoginForm defaultEmail={email} hasPasskey={has_passkey === "1"} />
    </div>
  );
}
