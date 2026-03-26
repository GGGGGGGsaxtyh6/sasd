import * as Y from "yjs";

export function createDocumentBinaryFromHtml(html: string) {
  const doc = new Y.Doc();
  const text = doc.getText("default");
  text.insert(0, html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());

  return Buffer.from(Y.encodeStateAsUpdate(doc));
}

export function decodeDocumentBinary(binary: Uint8Array) {
  const doc = new Y.Doc();
  Y.applyUpdate(doc, binary);
  return doc;
}
