"use client";

import { useState } from "react";
import { DocumentTypeSelect } from "@/components/document-type-select";
import { RoastReport } from "@/components/roast-report";
import type {
  DocumentType,
  RoastApiError,
  RoastApiResponse
} from "@/lib/types";

export function PdfUpload() {
  const [documentType, setDocumentType] = useState<DocumentType>("general");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<RoastApiResponse | null>(null);

  const hasValidPdf = Boolean(selectedFile) && !error;

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setAnalysis(null);

    if (!file) {
      setSelectedFile(null);
      setFileName("");
      setError("");
      return;
    }

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setSelectedFile(null);
      setFileName(file.name);
      setError("That file is not a PDF. Give me something with a .pdf extension.");
      return;
    }

    setSelectedFile(file);
    setFileName(file.name);
    setError("");
  }

  async function handleAnalyze() {
    if (!selectedFile || !hasValidPdf || isAnalyzing) {
      return;
    }

    setAnalysis(null);
    setError("");
    setIsAnalyzing(true);

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("documentType", documentType);

    try {
      const response = await fetch("/api/roast", {
        method: "POST",
        body: formData
      });

      const payload = await readRoastResponse(response);

      if (!response.ok) {
        setError(
          payload && "error" in payload
            ? payload.error
            : "Something went wrong analyzing that PDF."
        );
        return;
      }

      if (!payload || "error" in payload) {
        setError("The roast engine returned an unexpected response.");
        return;
      }

      setAnalysis(payload);
    } catch (error) {
      console.error("PDF Roast Bot request failed", error);
      setError(
        "Could not reach the roast engine. Check the dev server and terminal logs."
      );
    } finally {
      setIsAnalyzing(false);
    }
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
          Extracting PDF text and sharpening the red pen...
        </div>
      ) : null}

      {analysis ? (
        <>
          <ExtractionPreview analysis={analysis} />
          <RoastReport report={analysis.report} />
        </>
      ) : null}
    </div>
  );
}

type ExtractionPreviewProps = {
  analysis: RoastApiResponse;
};

function ExtractionPreview({ analysis }: ExtractionPreviewProps) {
  return (
    <details className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
      <summary className="cursor-pointer text-lg font-semibold text-stone-950">
        Extracted text preview
      </summary>
      <div className="mt-4 grid gap-4">
        <div className="flex flex-wrap gap-3 text-sm text-stone-700">
          <span className="rounded-full bg-stone-100 px-3 py-1">
            {analysis.characterCount.toLocaleString()} characters
          </span>
          {analysis.pageCount ? (
            <span className="rounded-full bg-stone-100 px-3 py-1">
              {analysis.pageCount.toLocaleString()} pages
            </span>
          ) : null}
          <span className="rounded-full bg-stone-100 px-3 py-1">
            {analysis.fileName}
          </span>
        </div>

        <pre className="max-h-80 overflow-auto whitespace-pre-wrap rounded-md border border-stone-200 bg-stone-50 p-4 text-sm leading-6 text-stone-800">
          {analysis.extractedTextPreview ||
            "No extractable text was found. This PDF may be scanned/image-only and would require OCR."}
        </pre>
      </div>
    </details>
  );
}

async function readRoastResponse(response: Response) {
  const contentType = response.headers.get("content-type");

  if (contentType?.includes("application/json")) {
    return (await response.json()) as RoastApiResponse | RoastApiError;
  }

  return null;
}
