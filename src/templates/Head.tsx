import type { Head } from "../types.js";

const Template = ({ head }: { head?: Head }) => {
  return (
    <head>
      <title>{head?.title || "Default"}</title>

      {head?.metas?.map((meta, index) => (
        <meta key={index} {...meta} />
      ))}

      {head?.links?.map((link, index) => (
        <link key={index} rel={link.rel} href={link.href} type={link.type} />
      ))}

      {head?.scripts?.map((script, index) => (
        <script
          key={index}
          src={script.src}
          type={script.type || "text/javascript"}
          charSet={script.charset}
          async={script.async}
          defer={script.defer}
        />
      ))}
    </head>
  );
};

export default Template;
