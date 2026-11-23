import type { Metadata } from "next";
import { LoginForm } from "@/components/login-form";

export const metadata: Metadata = { title: "Connexion · Roadmap" };

// Page de connexion : la seule accessible sans être connecté (voir proxy.ts).
export default function LoginPage() {
  return (
    <main className="relative flex flex-1 items-center justify-center overflow-hidden px-6 py-16">
      {/* Formes décoratives en « pâte à modeler », aux couleurs des modules */}
      <span aria-hidden="true" className="absolute -top-20 -left-24 size-85 rounded-full bg-module-lilas opacity-70 shadow-clay" />
      <span aria-hidden="true" className="absolute top-1/5 -right-10 size-55 rounded-full bg-module-menthe opacity-70 shadow-clay" />
      <span aria-hidden="true" className="absolute right-1/8 -bottom-30 size-70 rounded-full bg-module-peche opacity-70 shadow-clay" />
      <span aria-hidden="true" className="absolute bottom-1/8 left-1/7 size-30 rounded-full bg-module-beurre opacity-70 shadow-clay" />

      <div className="relative w-full max-w-md rounded-xl bg-surface px-8 py-10 shadow-clay">
        <div className="mb-8 flex flex-col items-center gap-4 text-center">
          <span aria-hidden="true" className="bille size-14 bg-aurora" />
          <div>
            <h1 className="font-title text-display">Roadmap</h1>
            <p className="text-body-lg text-ink-soft">Capturer, ranger, planifier. En équipe.</p>
          </div>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
