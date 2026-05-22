import { Logo } from "@packages/ui-common/logo";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@packages/ui-common/shadcn/components/ui/card";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="bg-muted flex min-h-svh items-center justify-center p-6">
      <Card className="w-full max-w-sm">
        <CardHeader className="items-center text-center">
          <CardTitle>
            <Logo />
          </CardTitle>
          <CardDescription>HR y Nómina para empresas chilenas</CardDescription>
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
    </main>
  );
}
