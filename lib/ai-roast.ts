import OpenAI from "openai";
import { z } from "zod";
import type { DocumentType, RoastReport } from "@/lib/types";

const MAX_AI_INPUT_CHARS = 12_000;
const DEFAULT_MODEL = "gpt-4.1-mini";

const scoreSchema = z.coerce
  .number()
  .finite()
  .transform((score) => Math.max(0, Math.min(100, Math.round(score))));

const roastReportSchema = z
  .object({
    summary: z.string().min(20).max(900),
    scores: z
      .object({
        clarity: scoreSchema,
        structure: scoreSchema,
        credibility: scoreSchema,
        actionability: scoreSchema
      })
      .strict(),
    issues: z
      .array(
        z
          .object({
            title: z.string().min(5).max(160),
            severity: z.enum(["low", "medium", "high"]),
            problem: z.string().min(20).max(900),
            fix: z.string().min(20).max(900)
          })
          .strict()
      )
      .min(4)
      .max(6),
    suggestedNextStep: z.string().min(20).max(700)
  })
  .strict();

const roastReportJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["summary", "scores", "issues", "suggestedNextStep"],
  properties: {
    summary: { type: "string" },
    scores: {
      type: "object",
      additionalProperties: false,
      required: ["clarity", "structure", "credibility", "actionability"],
      properties: {
        clarity: { type: "number", minimum: 0, maximum: 100 },
        structure: { type: "number", minimum: 0, maximum: 100 },
        credibility: { type: "number", minimum: 0, maximum: 100 },
        actionability: { type: "number", minimum: 0, maximum: 100 }
      }
    },
    issues: {
      type: "array",
      minItems: 4,
      maxItems: 6,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["title", "severity", "problem", "fix"],
        properties: {
          title: { type: "string" },
          severity: { type: "string", enum: ["low", "medium", "high"] },
          problem: { type: "string" },
          fix: { type: "string" }
        }
      }
    },
    suggestedNextStep: { type: "string" }
  }
} as const;

const documentGuidance: Record<DocumentType, string> = {
  general:
    "Evaluate clarity, structure, credibility, and actionability. Focus on what a busy reader would misunderstand, distrust, or fail to act on.",
  cv:
    "Evaluate positioning, clarity, proof, relevance, seniority signal, ATS readability, and whether achievements are specific enough.",
  proposal:
    "Evaluate offer clarity, client relevance, risk reversal, proof, pricing or scope clarity, and whether the next action is unmistakable.",
  technical_report:
    "Evaluate structure, assumptions, evidence, terminology, traceability, decision usefulness, and whether conclusions are supported by the body.",
  bim_aec_report:
    "Evaluate revision context, assumptions, model and drawing references, discipline coordination, issue priority, technical terminology, and action ownership."
};

export async function createAiRoastReport(params: {
  documentType: DocumentType;
  fileName: string;
  extractedText: string;
}): Promise<RoastReport> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured.");
  }

  const inputText = params.extractedText.trim().slice(0, MAX_AI_INPUT_CHARS);

  if (!inputText) {
    throw new Error("No extractable text available for AI analysis.");
  }

  const client = new OpenAI({ apiKey });
  const response = await client.chat.completions.create({
    model: process.env.OPENAI_MODEL ?? DEFAULT_MODEL,
    temperature: 0.3,
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "pdf_roast_report",
        strict: true,
        schema: roastReportJsonSchema
      }
    },
    messages: [
      {
        role: "system",
        content:
          "You are PDF Roast Bot, a direct but useful document reviewer. Return only the requested JSON. Be specific, practical, and grounded in the provided text. Do not invent facts that are not supported by the document."
      },
      {
        role: "user",
        content: [
          `File name: ${params.fileName}`,
          `Document type: ${params.documentType}`,
          `Review focus: ${documentGuidance[params.documentType]}`,
          "Create a structured roast report with 4 to 6 issues. Scores must be 0-100.",
          "PDF text:",
          inputText
        ].join("\n\n")
      }
    ]
  });

  const content = response.choices[0]?.message.content;

  if (!content) {
    throw new Error("OpenAI returned an empty report.");
  }

  return roastReportSchema.parse(JSON.parse(content));
}
