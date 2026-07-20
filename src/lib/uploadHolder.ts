// File objects can't be JSON-serialized into localStorage, and don't need
// to survive a page reload — they only need to travel from /upload to
// /analyzing within the same client-side navigation. A plain module-level
// holder does that without an untyped `window` cast.
interface PendingUpload {
  cibilPdf: File;
  bankStatementPdf: File;
  password: string;
}

let pending: PendingUpload | null = null;

export function setPendingUpload(upload: PendingUpload) {
  pending = upload;
}

export function takePendingUpload(): PendingUpload | null {
  const value = pending;
  pending = null; // consume once — a stale reload should re-ask, not re-submit old files
  return value;
}
