import { PdfUpload } from "@/components/pdf-upload";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-5 py-10 md:px-8 md:py-16">
      <section className="mb-8 max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-ember">
          PDF Roast Bot
        </p>
        <h1 className="mt-3 text-4xl font-bold text-stone-950 md:text-6xl">
          PDF Roast Bot
        </h1>
        <p className="mt-4 text-xl font-semibold text-stone-800">
          Get your PDF roasted before your client does.
        </p>
        <p className="mt-4 max-w-2xl text-base leading-7 text-stone-700">
          Upload a PDF, choose what kind of document it is, and get a structured
          critique that shows what is unclear, weak, or missing, plus practical
          ways to improve it.
        </p>
      </section>

      <PdfUpload />
    </main>
  );
}
