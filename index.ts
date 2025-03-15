import { renderToStaticMarkup } from "react-dom/server";

export default (
  view: string,
  options: any,
  callback: (err: any, html?: string) => void
) => {
  try {
    const Component = require(view).default;
    const html = "<!DOCTYPE html>\n" + renderToStaticMarkup(Component(options));
    return callback(null, html);
  } catch (err) {
    return callback(err);
  }
};
