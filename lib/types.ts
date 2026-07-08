export const documentTypes = [
  "general",
  "cv",
  "proposal",
  "technical_report",
  "bim_aec_report"
] as const;

export type DocumentType = (typeof documentTypes)[number];

export type RoastScore = {
  clarity: number;
  structure: number;
  credibility: number;
  actionability: number;
};

export type RoastIssue = {
  title: string;
  severity: "low" | "medium" | "high";
  problem: string;
  fix: string;
};

export type RoastReport = {
  summary: string;
  scores: RoastScore;
  issues: RoastIssue[];
  suggestedNextStep: string;
};

export type AnalysisMode = "ai" | "mock";

export type RoastApiResponse = {
  fileName: string;
  documentType: DocumentType;
  pageCount?: number;
  extractedTextPreview: string;
  characterCount: number;
  report: RoastReport;
  analysisMode: AnalysisMode;
};

export type RoastApiError = {
  error: string;
};

export function isDocumentType(value: unknown): value is DocumentType {
  return (
    typeof value === "string" &&
    documentTypes.includes(value as DocumentType)
  );
}
