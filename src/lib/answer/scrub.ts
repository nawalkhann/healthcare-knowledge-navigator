// Removes obvious patient identifiers from a question before it is sent or logged.
const PATTERNS: [RegExp, string][] = [
  [/[\w.+-]+@[\w-]+\.[\w.-]+/g, "[email]"],
  [/\b(?:\+?\d{1,2}[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}\b/g, "[phone]"],
  [/\b\d{3}-\d{2}-\d{4}\b/g, "[id]"],
  [/\b(?:MRN|NHS|record|patient id)[\s#:no.]*\d{5,}\b/gi, "[id]"],
  [/\b\d{1,2}[/-]\d{1,2}[/-](?:19|20)\d{2}\b/g, "[date]"],
  [/\b(?:19|20)\d{2}-\d{2}-\d{2}\b/g, "[date]"],
  [/\b(?:Mr|Mrs|Ms|Miss|Dr)\.?\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?/g, "[name]"],
];

export function scrubIdentifiers(text: string): string {
  return PATTERNS.reduce((out, [pattern, label]) => out.replace(pattern, label), text);
}
