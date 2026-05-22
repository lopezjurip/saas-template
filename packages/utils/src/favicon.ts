export function FAVICON_SVG(content: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><text x="0" y="14">${content}</text></svg>`;
}

/**
 * @example
 * const dataURL = FAVICON_SVG_DATAURL(FAVICON_SVG("🦄"));
 * <link rel="icon" type="image/svg+xml" href={dataURL} />
 */
export function FAVICON_SVG_DATAURL(svg: string): string {
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}
