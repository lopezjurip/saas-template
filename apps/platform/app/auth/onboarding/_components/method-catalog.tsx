import { Fingerprint, IdCard, Lock, Mail, Phone, User } from "lucide-react";
import type { OnboardingMethodId } from "../state";

type IconComponent = React.ComponentType<{ size?: number; className?: string }>;

export type MethodCatalogEntry = {
  id: OnboardingMethodId;
  Icon: IconComponent;
};

export const METHOD_CATALOG: Record<OnboardingMethodId, MethodCatalogEntry> = {
  passkey: {
    id: "passkey",
    Icon: Fingerprint,
  },
  password: {
    id: "password",
    Icon: Lock,
  },
  phone: {
    id: "phone",
    Icon: Phone,
  },
  email: {
    id: "email",
    Icon: Mail,
  },
  document: {
    id: "document",
    Icon: IdCard,
  },
  profile: {
    id: "profile",
    Icon: User,
  },
};
