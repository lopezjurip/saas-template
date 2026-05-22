export function BUFFER_FROM_ARRAYBUFFER(ab: ArrayBuffer): Buffer {
  const buffer = Buffer.alloc(ab.byteLength);
  const view = new Uint8Array(ab);
  for (let i = 0; i < buffer.length; ++i) {
    // @ts-expect-error: ignore
    buffer[i] = view[i];
  }
  return buffer;
}
