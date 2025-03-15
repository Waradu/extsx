import { renderToStaticMarkup } from "react-dom/server";

export default async (
  view: string,
  options: Record<string, any>,
  callback: (err?: Error | null, html?: string) => void
) => {
  const html =
    "<!DOCTYPE html>\n" +
    renderToStaticMarkup((await import(view)).default(options));
  return callback(null, html);
};
