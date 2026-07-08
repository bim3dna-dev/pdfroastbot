import type { DocumentType, RoastReport } from "@/lib/types";

const documentTypeLabels: Record<DocumentType, string> = {
  general: "general document",
  cv: "CV / resume",
  proposal: "proposal",
  technical_report: "technical report",
  bim_aec_report: "BIM / AEC report"
};

export function getMockRoast(documentType: DocumentType): RoastReport {
  const label = documentTypeLabels[documentType];

  return {
    summary: `This ${label} has the bones of something useful, but it currently asks the reader to do too much detective work. Tighten the story, prove the important claims, and move the next action closer to the surface.`,
    scores: {
      clarity: 68,
      structure: 61,
      credibility: 72,
      actionability: 54
    },
    issues: [
      {
        title: "The opening takes too long to say why this matters",
        severity: "high",
        problem:
          "The first page gives context before it gives the reader a reason to care, which makes the document feel slower than it needs to be.",
        fix:
          "Lead with the key outcome, recommendation, or ask. Put supporting context after the reader understands the point."
      },
      {
        title: "Headings describe topics, not decisions",
        severity: "medium",
        problem:
          "Several sections are labeled generically, so a busy reader has to scan paragraphs to understand what each section is trying to prove.",
        fix:
          "Rewrite headings as useful claims. For example, replace broad labels with short statements that reveal the takeaway."
      },
      {
        title: "Evidence is present, but not framed",
        severity: "medium",
        problem:
          "Numbers and details appear without enough explanation of what they mean or why they should change the reader's mind.",
        fix:
          "Add one sentence after important data points explaining the implication, risk, or recommended response."
      },
      {
        title: "The next step is too polite to be useful",
        severity: "low",
        problem:
          "The close gestures toward follow-up, but does not clearly say what should happen next, who owns it, or when.",
        fix:
          "End with a concrete call to action: owner, action, date, and expected output."
      }
    ],
    suggestedNextStep:
      "Rewrite the first page as an executive skim: one sentence for the point, three bullets for evidence, and one unmistakable next action."
  };
}
