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

export interface ConversationNotificationEmailProps {
  /** Notification subject / headline. */
  subject: string;
  /** Plain-text body content. */
  body: string;
  /** Optional CTA URL that opens the in-app conversation thread. */
  threadUrl?: string;
  /** BCP 47 locale tag. Defaults to "en". */
  locale?: string;
}

const LOCALE_ES = {
  preview: "{{subject}}",
  heading: "{{subject}}",
  viewThread: "Ver conversación",
  footer: "Este mensaje fue enviado por SaaS Template.",
};

function ConversationNotificationEmailContent({
  subject,
  body,
  threadUrl,
}: Omit<ConversationNotificationEmailProps, "locale">) {
  const locale = useLocale();
  const { t } = useRosetta(LOCALES);

  return (
    <Tailwind>
      <Html lang={locale}>
        <Head />
        <Preview>{t("preview", { subject })}</Preview>
        <Body className="bg-gray-100 font-sans">
          <Container className="bg-white mx-auto my-10 px-10 py-10 rounded-lg max-w-lg">
            <Heading className="text-gray-900 text-2xl font-bold mt-0 mb-6">{t("heading", { subject })}</Heading>
            <Text className="text-gray-700 text-base leading-relaxed mt-0 mb-5 whitespace-pre-wrap">{body}</Text>
            {threadUrl ? (
              <Section className="my-8">
                <Button
                  className="bg-gray-900 text-white rounded-md text-sm font-semibold px-6 py-3 no-underline"
                  href={threadUrl}
                >
                  {t("viewThread")}
                </Button>
              </Section>
            ) : null}
            <Hr className="border-gray-200 my-8" />
            <Text className="text-gray-400 text-xs leading-relaxed mt-0">{t("footer")}</Text>
          </Container>
        </Body>
      </Html>
    </Tailwind>
  );
}

export function ConversationNotificationEmail({ locale = "en", ...props }: ConversationNotificationEmailProps) {
  return (
    <LocaleProvider locale={locale}>
      <ConversationNotificationEmailContent {...props} />
    </LocaleProvider>
  );
}

export default ConversationNotificationEmail;

ConversationNotificationEmail.PreviewProps = {
  subject: "Your invoice is ready",
  body: "Hello! Your invoice #INV-2025-001 for $250.00 is now available. Click below to view and download it.",
  threadUrl: "https://lvh.me:7003",
  locale: "en",
} satisfies ConversationNotificationEmailProps;

const LOCALES = {
  es: LOCALE_ES,
  en: {
    preview: "{{subject}}",
    heading: "{{subject}}",
    viewThread: "View conversation",
    footer: "This message was sent by SaaS Template.",
  } satisfies typeof LOCALE_ES,
  pt: {
    preview: "{{subject}}",
    heading: "{{subject}}",
    viewThread: "Ver conversa",
    footer: "Esta mensagem foi enviada pelo SaaS Template.",
  } satisfies typeof LOCALE_ES,
};
