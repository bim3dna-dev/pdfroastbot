import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { NextResponse } from "next/server";
import { createMockRoastReport } from "@/lib/mock-roast";
import { isDocumentType } from "@/lib/types";
import type { RoastApiError, RoastApiResponse } from "@/lib/types";

export const runtime = "nodejs";

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const TEXT_PREVIEW_LENGTH = 2500;
const PYTHON_TIMEOUT_MS = 20_000;

type PythonExtractionResult =
  | {
      ok: true;
      pageCount: number;
      text: string;
      characterCount: number;
    }
  | {
      ok: false;
      error: string;
    };

function jsonError(message: string, status: number) {
  return NextResponse.json<RoastApiError>({ error: message }, { status });
}

export function GET() {
  return NextResponse.json({ ok: true, route: "/api/roast" });
}

export async function POST(request: Request) {
  console.log("[api/roast] received method", request.method);

  try {
    let formData: FormData;

    try {
      formData = await request.formData();
    } catch {
      return jsonError("Please upload a PDF using multipart form data.", 400);
    }

    const fileField = formData.get("file");
    const documentTypeField = formData.get("documentType");

    if (!(fileField instanceof File)) {
      return jsonError("Please choose a PDF file before analyzing.", 400);
    }

    console.log("[api/roast] file name", fileField.name);
    console.log("[api/roast] file size", fileField.size);
    console.log("[api/roast] document type", documentTypeField);

    if (!fileField.name.toLowerCase().endsWith(".pdf")) {
      return jsonError("Only PDF files can be analyzed in this MVP.", 400);
    }

    if (fileField.size === 0) {
      return jsonError("That PDF appears to be empty. Please choose another file.", 400);
    }

    if (fileField.size > MAX_FILE_SIZE_BYTES) {
      return jsonError(
        "PDF is too large for this MVP. Please upload a file under 10 MB.",
        400
      );
    }

    if (!isDocumentType(documentTypeField)) {
      return jsonError("Please choose a valid document type.", 400);
    }

    const tempDirectory = path.join(tmpdir(), "pdfroastbot");
    const tempPdfPath = path.join(tempDirectory, `${randomUUID()}.pdf`);

    try {
      const buffer = Buffer.from(await fileField.arrayBuffer());
      await mkdir(tempDirectory, { recursive: true });
      await writeFile(tempPdfPath, buffer);

      const extraction = await extractPdfText(tempPdfPath);

      if (!extraction.ok) {
        return jsonError(extraction.error, 422);
      }

      const extractedText = extraction.text.trim();

      const response: RoastApiResponse = {
        fileName: fileField.name,
        documentType: documentTypeField,
        pageCount: extraction.pageCount || undefined,
        extractedTextPreview: extractedText.slice(0, TEXT_PREVIEW_LENGTH),
        characterCount: extraction.characterCount,
        report: createMockRoastReport(documentTypeField)
      };

      return NextResponse.json(response);
    } catch (error) {
      console.error("[api/roast] PDF extraction failed", error);
      return jsonError(
        "We could not extract text from that PDF. It may be scanned, encrypted, or malformed.",
        422
      );
    } finally {
      await unlink(tempPdfPath).catch(() => undefined);
    }
  } catch (error) {
    console.error("[api/roast] unexpected failure", error);
    return jsonError("Unexpected roast engine failure.", 500);
  }
}

function getPythonExecutable() {
  const localPython = path.join(process.cwd(), ".venv", "Scripts", "python.exe");

  return existsSync(localPython) ? localPython : "python";
}

function extractPdfText(pdfPath: string) {
  const pythonExecutable = getPythonExecutable();
  const scriptPath = path.join(process.cwd(), "scripts", "extract_pdf_text.py");

  return new Promise<PythonExtractionResult>((resolve) => {
    const child = spawn(pythonExecutable, [scriptPath, pdfPath], {
      env: {
        ...process.env,
        PYTHONIOENCODING: "utf-8",
        PYTHONUTF8: "1"
      },
      windowsHide: true
    });

    let stdout = "";
    let stderr = "";
    let didTimeout = false;

    const timeout = setTimeout(() => {
      didTimeout = true;
      child.kill();
    }, PYTHON_TIMEOUT_MS);

    child.stdout.setEncoding("utf8");
    child.stdout.on("data", (chunk: string) => {
      stdout += chunk;
    });

    child.stderr.setEncoding("utf8");
    child.stderr.on("data", (chunk: string) => {
      stderr += chunk;
    });

    child.on("error", (error) => {
      clearTimeout(timeout);
      console.error("[api/roast] Python extractor failed to start", error);
      resolve({
        ok: false,
        error:
          "PDF extraction is not configured. Install Python dependencies and try again."
      });
    });

    child.on("close", (code) => {
      clearTimeout(timeout);

      if (stderr.trim()) {
        console.error("[api/roast] Python extractor stderr", stderr.trim());
      }

      if (didTimeout) {
        resolve({
          ok: false,
          error: "PDF extraction timed out. Try a smaller or simpler PDF."
        });
        return;
      }

      let parsed: PythonExtractionResult;

      try {
        parsed = JSON.parse(stdout) as PythonExtractionResult;
      } catch (error) {
        console.error("[api/roast] Invalid extractor JSON", { error, stdout });
        resolve({
          ok: false,
          error: "PDF extraction returned an invalid response."
        });
        return;
      }

      if (code !== 0 || !parsed.ok) {
        resolve({
          ok: false,
          error:
            "error" in parsed && parsed.error
              ? parsed.error
              : "We could not extract text from that PDF."
        });
        return;
      }

      resolve(parsed);
    });
  });
}
