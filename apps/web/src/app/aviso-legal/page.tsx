import Link from "next/link";

export default function AvisoLegalPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-24">
      <Link href="/" className="text-sm text-secondary underline underline-offset-4">
        Volver al inicio
      </Link>
      <h1 className="mt-8 font-headline text-4xl">Aviso legal</h1>
      <div className="mt-8 space-y-4 font-body text-on-surface-variant leading-relaxed">
        <p>
          La información publicada es de carácter general y educativo. No constituye consejo médico personalizado ni
          sustituye la consulta presencial.
        </p>
        <p>Los contenidos pueden actualizarse sin previo aviso. El centro no se responsabiliza por el uso indebido del sitio.</p>
        <p>Marca y logotipos son propiedad del centro salvo indicación contraria.</p>
      </div>
    </main>
  );
}
