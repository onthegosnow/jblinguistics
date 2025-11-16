declare module "pdf-parse/lib/pdf-parse.js" {
  interface PDFParseResult {
    text?: string;
  }
  function pdfParse(data: Buffer): Promise<PDFParseResult>;
  export default pdfParse;
}

declare module "mammoth" {
  interface MammothExtractResult {
    value?: string;
  }
  export function extractRawText(options: { buffer: Buffer }): Promise<MammothExtractResult>;
  const Mammoth: {
    extractRawText: typeof extractRawText;
  };
  export default Mammoth;
}
