import { LocaleProvider, useLocale, useRosetta } from "@packages/rosetta/use-rosetta";
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

export interface WelcomeEmailProps {
  empleadoNombre: string;
  empresaNombre: string;
  loginUrl: string;
  /** BCP 47 locale tag. Defaults to "es-CL". */
  locale?: string;
}

const LOCALE_ES = {
  preview: "Bienvenido/a a {{empresaNombre}} — tu acceso a SaaS Template está listo",
  heading: "Bienvenido/a, {{empleadoNombre}}",
  body: "{{empresaNombre}} está usando SaaS Template. A partir de ahora, tienes acceso a toda tu información en un solo lugar.",
  cta: "Ingresar a SaaS Template",
  support: "Si tienes dudas, puedes escribirle directamente a tu equipo o contactarnos desde la plataforma.",
  footer:
    "Este correo fue enviado porque fuiste registrado/a en SaaS Template por {{empresaNombre}}. Si crees que es un error, ignora este mensaje.",
};

const LOCALES = {
  es: LOCALE_ES,
  en: {
    preview: "Welcome to {{empresaNombre}} — your SaaS Template access is ready",
    heading: "Welcome, {{empleadoNombre}}",
    body: "{{empresaNombre}} is using SaaS Template. From now on, you can access all your information in one place.",
    cta: "Sign in to SaaS Template",
    support: "If you have any questions, reach out to your team or contact us from the platform.",
    footer:
      "This email was sent because you were registered in SaaS Template by {{empresaNombre}}. If you think this is a mistake, you can ignore this message.",
  } satisfies typeof LOCALE_ES,
  pt: {
    preview: "Bem-vindo/a à {{empresaNombre}} — seu acesso ao SaaS Template está pronto",
    heading: "Bem-vindo/a, {{empleadoNombre}}",
    body: "{{empresaNombre}} usa o SaaS Template. A partir de agora, você tem acesso a todas as suas informações em um só lugar.",
    cta: "Entrar no SaaS Template",
    support: "Se tiver dúvidas, entre em contato com o seu time ou fale conosco pela plataforma.",
    footer:
      "Este e-mail foi enviado porque você foi registrado/a no SaaS Template por {{empresaNombre}}. Se achar que é um engano, ignore esta mensagem.",
  } satisfies typeof LOCALE_ES,
};

WelcomeEmail.PreviewProps = {
  empleadoNombre: "María González",
  empresaNombre: "Constructora Ejemplo SpA",
  loginUrl: "http://localhost:7003",
  locale: "es-CL",
} satisfies WelcomeEmailProps;

export function WelcomeEmail({ locale = "es-CL", ...props }: WelcomeEmailProps) {
  return (
    <LocaleProvider locale={locale}>
      <WelcomeEmailContent {...props} />
    </LocaleProvider>
  );
}

export default WelcomeEmail;

function WelcomeEmailContent({ empleadoNombre, empresaNombre, loginUrl }: Omit<WelcomeEmailProps, "locale">) {
  const locale = useLocale();
  const { t } = useRosetta(LOCALES);

  return (
    <Tailwind>
      <Html lang={locale}>
        <Head />
        <Preview>{t("preview", { empresaNombre })}</Preview>
        <Body className="bg-gray-100 font-sans">
          <Container className="bg-white mx-auto my-10 px-10 py-10 rounded-lg max-w-lg">
            <Heading className="text-gray-900 text-2xl font-bold mt-0 mb-6">{t("heading", { empleadoNombre })}</Heading>
            <Text className="text-gray-700 text-base leading-relaxed mt-0 mb-5">{t("body", { empresaNombre })}</Text>
            <Section className="my-8">
              <Button
                className="bg-gray-900 text-white rounded-md text-sm font-semibold px-6 py-3 no-underline"
                href={loginUrl}
              >
                {t("cta")}
              </Button>
            </Section>
            <Text className="text-gray-700 text-base leading-relaxed mt-0 mb-5">{t("support")}</Text>
            <Hr className="border-gray-200 my-8" />
            <Text className="text-gray-400 text-xs leading-relaxed mt-0">{t("footer", { empresaNombre })}</Text>
          </Container>
        </Body>
      </Html>
    </Tailwind>
  );
}
