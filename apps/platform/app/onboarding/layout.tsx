import { Logo } from "@packages/ui-common/logo";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@packages/ui-common/shadcn/components/ui/card";

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="bg-muted flex min-h-svh items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="items-center text-center">
          <CardTitle>
            <Logo />
          </CardTitle>
          <CardDescription>Completa tu cuenta</CardDescription>
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
    </main>
  );
}
