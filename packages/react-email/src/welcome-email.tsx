import { RosettaImpl } from "@packages/rosetta/rosetta";
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

const LOCALES = {
	es: {
		preview: (p: { empresaNombre: string }) =>
			`Bienvenido/a a ${p.empresaNombre} — tu acceso a Humane está listo`,
		heading: (p: { empleadoNombre: string }) => `Bienvenido/a, ${p.empleadoNombre}`,
		body: (p: { empresaNombre: string }) =>
			`{{empresaNombre}} está usando Humane para gestionar liquidaciones, vacaciones y documentos laborales. A partir de ahora, tienes acceso a toda esa información en un solo lugar.`,
		cta: "Ingresar a Humane",
		support: "Si tienes dudas, puedes escribirle directamente a tu área de RRHH o contactarnos desde la plataforma.",
		footer: (p: { empresaNombre: string }) =>
			`Este correo fue enviado porque fuiste registrado/a en Humane por ${p.empresaNombre}. Si crees que es un error, ignora este mensaje.`,
	},
	en: {
		preview: (p: { empresaNombre: string }) =>
			`Welcome to ${p.empresaNombre} — your Humane access is ready`,
		heading: (p: { empleadoNombre: string }) => `Welcome, ${p.empleadoNombre}`,
		body: (p: { empresaNombre: string }) =>
			`${p.empresaNombre} is using Humane to manage payslips, vacation, and employment documents. From now on, you can access all that information in one place.`,
		cta: "Sign in to Humane",
		support: "If you have any questions, reach out to your HR team or contact us from the platform.",
		footer: (p: { empresaNombre: string }) =>
			`This email was sent because you were registered in Humane by ${p.empresaNombre}. If you think this is a mistake, you can ignore this message.`,
	},
	pt: {
		preview: (p: { empresaNombre: string }) =>
			`Bem-vindo/a à ${p.empresaNombre} — seu acesso ao Humane está pronto`,
		heading: (p: { empleadoNombre: string }) => `Bem-vindo/a, ${p.empleadoNombre}`,
		body: (p: { empresaNombre: string }) =>
			`${p.empresaNombre} usa o Humane para gerenciar contracheques, férias e documentos trabalhistas. A partir de agora, você tem acesso a todas essas informações em um só lugar.`,
		cta: "Entrar no Humane",
		support: "Se tiver dúvidas, entre em contato com o seu RH ou fale conosco pela plataforma.",
		footer: (p: { empresaNombre: string }) =>
			`Este e-mail foi enviado porque você foi registrado/a no Humane por ${p.empresaNombre}. Se achar que é um engano, ignore esta mensagem.`,
	},
};

export function WelcomeEmail({
	empleadoNombre,
	empresaNombre,
	loginUrl,
	locale = "es-CL",
}: WelcomeEmailProps) {
	const r = RosettaImpl.fromDictionary(LOCALES, locale);

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
