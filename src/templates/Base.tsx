import type { Config } from "../types.js";
import Head from "./Head.js";

const Template = ({
  children,
  config,
}: {
  children: React.ReactNode;
  config: Config;
}) => {
  return (
    <html {...config.htmlAttrs}>
      <Head head={config.head} />
      <body {...config.bodyAttrs}>{children}</body>
    </html>
  );
};

export default Template;
