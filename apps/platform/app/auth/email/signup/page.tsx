import { SignupForm } from "./signup-form";

type SearchParams = Promise<{ email?: string }>;

export default async function EmailSignupPage({ searchParams }: { searchParams: SearchParams }) {
  const { email = "" } = await searchParams;
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-center text-sm font-medium">Crear cuenta</h2>
      <SignupForm defaultEmail={email} />
    </div>
  );
}
