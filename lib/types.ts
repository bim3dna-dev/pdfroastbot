export type DocumentType =
  | "general"
  | "cv"
  | "proposal"
  | "technical_report"
  | "bim_aec_report";

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
