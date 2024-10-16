import { compressToBase64, decompressFromBase64 } from "lz-string";
import pako from "pako";

export const compressText = (text: string) => compressToBase64(text);
export const decompressText = (text: string) => decompressFromBase64(text);

export const compressTextWithPako = (text: string) => {
  const bytes = pako.deflate(text);

  return Buffer.from(bytes).toString("base64");
};

export const decompressTextWithPako = (compressedText: string) => {
  const bytes = Buffer.from(compressedText, "base64");

  return pako.inflate(bytes, { to: "string" });
};
