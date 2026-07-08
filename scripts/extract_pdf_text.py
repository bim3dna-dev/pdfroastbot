import json
import sys

import fitz

try:
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")
except Exception:
    pass


def write_json(payload: dict, exit_code: int = 0) -> None:
    print(json.dumps(payload, ensure_ascii=False))
    raise SystemExit(exit_code)


def main():
    if len(sys.argv) != 2:
        write_json({"ok": False, "error": "Expected one PDF path argument."}, 1)

    pdf_path = sys.argv[1]

    try:
        with fitz.open(pdf_path) as document:
            page_text = [page.get_text() for page in document]
            text = "\n".join(page_text)

            write_json(
                {
                    "ok": True,
                    "pageCount": document.page_count,
                    "text": text,
                    "characterCount": len(text),
                }
            )
    except Exception as error:
        write_json({"ok": False, "error": f"PDF extraction failed: {error}"}, 1)


if __name__ == "__main__":
    main()
