export function MIME_CLEAN(mime: string): string {
  return mime.split(";")[0]!.trim().toLowerCase();
}

/**
 * Returns the common file extension for a given MIME type, or null if unknown.
 */
export function EXTENSION_FOR_MIME(mime: string): string | null {
  switch (MIME_CLEAN(mime)) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/gif":
      return "gif";
    case "application/pdf":
      return "pdf";
    case "text/plain":
      return "txt";
    case "application/msword":
      return "doc";
    case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      return "docx";
    case "application/vnd.ms-excel":
      return "xls";
    case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
      return "xlsx";
    case "application/vnd.ms-powerpoint":
      return "ppt";
    case "application/vnd.openxmlformats-officedocument.presentationml.presentation":
      return "pptx";
    default:
      return null;
  }
}

/**
 * Efficiently downloads a file from a URL to a local destination using streaming.
 */
export async function URL_TO_FILE_STREAMING_NODE(
  url: string | URL | Request,
  destination: string,
  { mkdirp = true }: { mkdirp?: boolean } = {},
): Promise<boolean> {
  const path = await import("node:path");
  const fs = await import("node:fs/promises");
  const { Writable } = await import("node:stream");

  if (mkdirp) {
    const folder = path.dirname(destination);
    await fs.mkdir(folder, { recursive: true });
  }
  const res = await fetch(url);
  if (res.ok && res.body) {
    const fileStream = await fs.open(destination, "w");
    await res.body.pipeTo(Writable.toWeb(fileStream.createWriteStream()));
    return true;
  }
  return false;
}
