import { LoginForm } from "./login-form";

type SearchParams = Promise<{ email?: string }>;

export default async function EmailLoginPage({ searchParams }: { searchParams: SearchParams }) {
  const { email = "" } = await searchParams;
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-center text-sm font-medium">Iniciar sesión</h2>
      <LoginForm defaultEmail={email} />
    </div>
  );
}
