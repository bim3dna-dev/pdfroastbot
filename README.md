# PDF Roast Bot

Get your PDF roasted before your client does.

## Local Development

```bash
npm install
npm run dev
```

Open http://localhost:3000 to use the MVP.

## PDF Text Extraction Setup

PDF extraction uses a local Python script with PyMuPDF.

Windows Git Bash:

```bash
python -m venv .venv
./.venv/Scripts/python.exe -m pip install pymupdf
```

Then run the app:

```bash
npm run dev
```

Health check:

```text
http://localhost:3000/api/roast
```

## OpenAI Setup

AI roast analysis is optional. Without an API key, the app falls back to mock
analysis.

Create `.env.local`:

```bash
OPENAI_API_KEY=your_key_here
```
