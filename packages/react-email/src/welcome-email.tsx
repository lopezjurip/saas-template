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
	preview: "Bienvenido/a a {{empresaNombre}} — tu acceso a Humane está listo",
	heading: "Bienvenido/a, {{empleadoNombre}}",
	body: "{{empresaNombre}} está usando Humane para gestionar liquidaciones, vacaciones y documentos laborales. A partir de ahora, tienes acceso a toda esa información en un solo lugar.",
	cta: "Ingresar a Humane",
	support:
		"Si tienes dudas, puedes escribirle directamente a tu área de RRHH o contactarnos desde la plataforma.",
	footer:
		"Este correo fue enviado porque fuiste registrado/a en Humane por {{empresaNombre}}. Si crees que es un error, ignora este mensaje.",
};

const LOCALES = {
	es: LOCALE_ES,
	en: {
		preview: "Welcome to {{empresaNombre}} — your Humane access is ready",
		heading: "Welcome, {{empleadoNombre}}",
		body: "{{empresaNombre}} is using Humane to manage payslips, vacation, and employment documents. From now on, you can access all that information in one place.",
		cta: "Sign in to Humane",
		support: "If you have any questions, reach out to your HR team or contact us from the platform.",
		footer:
			"This email was sent because you were registered in Humane by {{empresaNombre}}. If you think this is a mistake, you can ignore this message.",
	} satisfies typeof LOCALE_ES,
	pt: {
		preview: "Bem-vindo/a à {{empresaNombre}} — seu acesso ao Humane está pronto",
		heading: "Bem-vindo/a, {{empleadoNombre}}",
		body: "{{empresaNombre}} usa o Humane para gerenciar contracheques, férias e documentos trabalhistas. A partir de agora, você tem acesso a todas essas informações em um só lugar.",
		cta: "Entrar no Humane",
		support: "Se tiver dúvidas, entre em contato com o seu RH ou fale conosco pela plataforma.",
		footer:
			"Este e-mail foi enviado porque você foi registrado/a no Humane por {{empresaNombre}}. Se achar que é um engano, ignore esta mensagem.",
	} satisfies typeof LOCALE_ES,
};

export function WelcomeEmail({ locale = "es-CL", ...props }: WelcomeEmailProps) {
	return (
		<LocaleProvider locale={locale}>
			<WelcomeEmailContent {...props} />
		</LocaleProvider>
	);
}

function WelcomeEmailContent({
	empleadoNombre,
	empresaNombre,
	loginUrl,
}: Omit<WelcomeEmailProps, "locale">) {
	const locale = useLocale();
	const r = useRosetta(LOCALES);

	return (
		<Tailwind>
			<Html lang={locale}>
				<Head />
				<Preview>{r.t("preview", { empresaNombre })}</Preview>
				<Body className="bg-gray-100 font-sans">
					<Container className="bg-white mx-auto my-10 px-10 py-10 rounded-lg max-w-lg">
						<Heading className="text-gray-900 text-2xl font-bold mt-0 mb-6">
							{r.t("heading", { empleadoNombre })}
						</Heading>
						<Text className="text-gray-700 text-base leading-relaxed mt-0 mb-5">
							{r.t("body", { empresaNombre })}
						</Text>
						<Section className="my-8">
							<Button
								className="bg-gray-900 text-white rounded-md text-sm font-semibold px-6 py-3 no-underline"
								href={loginUrl}
							>
								{r.t("cta")}
							</Button>
						</Section>
						<Text className="text-gray-700 text-base leading-relaxed mt-0 mb-5">
							{r.t("support")}
						</Text>
						<Hr className="border-gray-200 my-8" />
						<Text className="text-gray-400 text-xs leading-relaxed mt-0">
							{r.t("footer", { empresaNombre })}
						</Text>
					</Container>
				</Body>
			</Html>
		</Tailwind>
	);
}
