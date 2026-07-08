"use client";

import { useRef, useState } from "react";
import { DocumentTypeSelect } from "@/components/document-type-select";
import { RoastReport } from "@/components/roast-report";
import { getMockRoast } from "@/lib/mock-roast";
import type { DocumentType, RoastReport as RoastReportType } from "@/lib/types";

export function PdfUpload() {
  const [documentType, setDocumentType] = useState<DocumentType>("general");
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [report, setReport] = useState<RoastReportType | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hasValidPdf = Boolean(fileName) && !error;

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setReport(null);

    if (!file) {
      setFileName("");
      setError("");
      return;
    }

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setFileName(file.name);
      setError("That file is not a PDF. Give me something with a .pdf extension.");
      return;
    }

    setFileName(file.name);
    setError("");
  }

  function handleAnalyze() {
    if (!hasValidPdf || isAnalyzing) {
      return;
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setReport(null);
    setIsAnalyzing(true);
    timeoutRef.current = setTimeout(() => {
      setReport(getMockRoast(documentType));
      setIsAnalyzing(false);
    }, 700);
  }

  return (
    <div className="grid gap-6">
      <div className="grid gap-5 rounded-lg border border-stone-200 bg-white p-5 shadow-sm md:p-6">
        <label className="grid min-h-44 cursor-pointer place-items-center rounded-md border-2 border-dashed border-stone-300 bg-stone-50 px-4 py-8 text-center transition hover:border-ember/70 hover:bg-orange-50">
          <input
            type="file"
            accept="application/pdf,.pdf"
            className="sr-only"
            onChange={handleFileChange}
          />
          <span className="grid gap-2">
            <span className="text-lg font-semibold text-stone-950">
              Upload a PDF for roasting
            </span>
            <span className="text-sm text-stone-600">
              Drop in the document you want critiqued. For now, the roast is mock data.
            </span>
            {fileName ? (
              <span className="mt-2 rounded-full bg-white px-3 py-1 text-sm font-medium text-stone-800 shadow-sm">
                Selected: {fileName}
              </span>
            ) : null}
          </span>
        </label>

        {error ? (
          <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
          <DocumentTypeSelect value={documentType} onChange={setDocumentType} />
          <button
            type="button"
            className="h-12 rounded-md bg-ember px-6 font-semibold text-white shadow-sm transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:bg-stone-300 disabled:text-stone-600"
            disabled={!hasValidPdf || isAnalyzing}
            onClick={handleAnalyze}
          >
            {isAnalyzing ? "Roasting..." : "Analyze"}
          </button>
        </div>
      </div>

      {isAnalyzing ? (
        <div className="rounded-lg border border-stone-200 bg-white p-5 text-stone-700 shadow-sm">
          Sharpening the red pen...
        </div>
      ) : null}

      {report ? <RoastReport report={report} /> : null}
    </div>
  );
}
