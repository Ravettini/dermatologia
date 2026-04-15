import Link from "next/link";

export default function PrivacidadPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-24">
      <Link href="/" className="text-sm text-secondary underline underline-offset-4">
        Volver al inicio
      </Link>
      <h1 className="mt-8 font-headline text-4xl">Política de privacidad</h1>
      <div className="mt-8 space-y-4 font-body text-on-surface-variant leading-relaxed">
        <p>
          Este sitio recopila datos de contacto únicamente para coordinar turnos, responder consultas y mejorar la
          experiencia de atención. No vendemos datos personales.
        </p>
        <p>
          Podés solicitar acceso, rectificación o eliminación de tus datos escribiendo al correo de contacto del centro.
        </p>
        <p>El tratamiento se basa en tu consentimiento y en la relación precontractual/contractual de servicios.</p>
      </div>
    </main>
  );
}
