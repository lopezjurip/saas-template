import { Fingerprint, IdCard, Lock, Mail, Phone, User } from "lucide-react";
import type { OnboardingMethodId } from "../state";

type IconComponent = React.ComponentType<{ size?: number; className?: string }>;

export type MethodCatalogEntry = {
  id: OnboardingMethodId;
  label: string;
  short: string;
  desc: string;
  Icon: IconComponent;
};

export const METHOD_CATALOG: Record<OnboardingMethodId, MethodCatalogEntry> = {
  passkey: {
    id: "passkey",
    label: "Passkey",
    short: "Sin contraseña",
    desc: "Entra sin contraseña usando Face ID, Touch ID o una llave de seguridad.",
    Icon: Fingerprint,
  },
  password: {
    id: "password",
    label: "Contraseña",
    short: "Respaldo clásico",
    desc: "Útil si pierdes acceso a tu dispositivo principal.",
    Icon: Lock,
  },
  phone: {
    id: "phone",
    label: "Teléfono",
    short: "Códigos SMS / WhatsApp",
    desc: "Recibe códigos por SMS o WhatsApp cuando no tengas acceso al correo.",
    Icon: Phone,
  },
  email: {
    id: "email",
    label: "Correo",
    short: "Enlaces mágicos",
    desc: "Para enlaces mágicos, recuperación de cuenta y notificaciones críticas.",
    Icon: Mail,
  },
  document: {
    id: "document",
    label: "Documento",
    short: "Verificación de identidad",
    desc: "Requerido para contratos, firma electrónica y procesos KYC.",
    Icon: IdCard,
  },
  profile: {
    id: "profile",
    label: "Perfil",
    short: "Nombre y foto",
    desc: "Cómo te verán tus compañeros de organización. Lo prellenamos con lo que ya sabemos.",
    Icon: User,
  },
};
