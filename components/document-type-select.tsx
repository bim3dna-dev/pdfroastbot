import type { DocumentType } from "@/lib/types";

type DocumentTypeSelectProps = {
  value: DocumentType;
  onChange: (value: DocumentType) => void;
};

const documentTypes: Array<{ value: DocumentType; label: string }> = [
  { value: "general", label: "General Document" },
  { value: "cv", label: "CV / Resume" },
  { value: "proposal", label: "Proposal" },
  { value: "technical_report", label: "Technical Report" },
  { value: "bim_aec_report", label: "BIM / AEC Report" }
];

export function DocumentTypeSelect({
  value,
  onChange
}: DocumentTypeSelectProps) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-semibold text-stone-800">Document type</span>
      <select
        className="h-12 rounded-md border border-stone-300 bg-white px-3 text-stone-950 shadow-sm outline-none transition focus:border-ember focus:ring-2 focus:ring-ember/20"
        value={value}
        onChange={(event) => onChange(event.target.value as DocumentType)}
      >
        {documentTypes.map((type) => (
          <option key={type.value} value={type.value}>
            {type.label}
          </option>
        ))}
      </select>
    </label>
  );
}
