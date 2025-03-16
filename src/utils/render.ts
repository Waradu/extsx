import { renderToStaticMarkup } from "react-dom/server";
import { Readable } from "stream";

export const Render = (component: React.ReactNode) => {
  const html = "<!DOCTYPE html>" + renderToStaticMarkup(component);

  const encoder = new TextEncoder();
  const encoded = encoder.encode(html);

  return Readable.from(Buffer.from(encoded));
};
