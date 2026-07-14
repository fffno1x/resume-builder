const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ACCEPTED_TYPES = new Set(["application/pdf", "image/png", "image/jpeg"]);

export function validateTemplateFile(file: File) {
  if (!ACCEPTED_TYPES.has(file.type)) throw new Error("请选择 PDF、PNG 或 JPG 文件。");
  if (file.size > MAX_FILE_SIZE) throw new Error("参考模板不能超过 10MB。");
}

export async function prepareTemplateReference(file: File): Promise<string> {
  validateTemplateFile(file);
  const source = file.type === "application/pdf" ? await renderPdfFirstPage(file) : await loadImage(await readAsDataUrl(file));
  return imageToCompressedDataUrl(source);
}

async function renderPdfFirstPage(file: File): Promise<HTMLCanvasElement> {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();
  const pdf = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
  const page = await pdf.getPage(1);
  const base = page.getViewport({ scale: 1 });
  const viewport = page.getViewport({ scale: Math.min(2048 / Math.max(base.width, base.height), 3) });
  const canvas = document.createElement("canvas");
  canvas.width = Math.ceil(viewport.width); canvas.height = Math.ceil(viewport.height);
  const context = canvas.getContext("2d");
  if (!context) throw new Error("浏览器无法读取 PDF 页面。");
  await page.render({ canvas, canvasContext: context, viewport }).promise;
  return canvas;
}

async function imageToCompressedDataUrl(source: HTMLImageElement | HTMLCanvasElement) {
  const width = source instanceof HTMLImageElement ? source.naturalWidth : source.width;
  const height = source instanceof HTMLImageElement ? source.naturalHeight : source.height;
  const scale = Math.min(1, 2048 / Math.max(width, height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(width * scale)); canvas.height = Math.max(1, Math.round(height * scale));
  const context = canvas.getContext("2d");
  if (!context) throw new Error("浏览器无法处理参考模板图片。");
  context.fillStyle = "#ffffff"; context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(source, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.86);
}
function readAsDataUrl(file: File) { return new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = () => reject(new Error("无法读取参考模板。")); reader.readAsDataURL(file); }); }
function loadImage(src: string) { return new Promise<HTMLImageElement>((resolve, reject) => { const image = new Image(); image.onload = () => resolve(image); image.onerror = () => reject(new Error("参考模板图片已损坏。")); image.src = src; }); }
