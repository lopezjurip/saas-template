import { SignupForm } from "./signup-form";

type SearchParams = Promise<{ phone?: string }>;

export default async function PhoneSignupPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-center text-sm font-medium">Crear cuenta</h2>
      <SignupForm defaultPhone={params["phone"] ?? ""} />
    </div>
  );
}
