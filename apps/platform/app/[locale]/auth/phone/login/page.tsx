import { BackToAuthLink } from "~/app/[locale]/auth/_components/back-to-auth-link";
import { LoginForm } from "./login-form";

type SearchParams = Promise<{ phone?: string }>;
type Params = Promise<{ locale: string }>;

export default async function PhoneLoginPage({ searchParams, params }: { searchParams: SearchParams; params: Params }) {
  const sp = await searchParams;
  const { locale } = await params;
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-center text-sm font-medium">Iniciar sesión</h2>
      <LoginForm defaultPhone={sp["phone"] ?? ""} />
      <BackToAuthLink locale={locale} />
    </div>
  );
}
