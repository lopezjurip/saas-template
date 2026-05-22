import { loadOnboardingState, resolveStep } from "./state";
import { FinishStep } from "./steps/finish-step";
import { NameStep } from "./steps/name-step";
import { PasskeyStep } from "./steps/passkey-step";
import { PasswordStep } from "./steps/password-step";
import { PhoneStep } from "./steps/phone-step";

type SearchParams = Promise<{ step?: string }>;

export default async function OnboardingPage({ searchParams }: { searchParams: SearchParams }) {
  const { step } = await searchParams;
  const state = await loadOnboardingState();
  const resolved = resolveStep(state, step);

  switch (resolved) {
    case "name":
      return <NameStep defaultValue={state.fullName} />;
    case "phone":
      return <PhoneStep />;
    case "passkey":
      return <PasskeyStep />;
    case "password":
      return <PasswordStep />;
    case "finish":
      return <FinishStep />;
  }
}
