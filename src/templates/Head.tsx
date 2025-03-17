import type { Head } from "../types";

const Template = ({ head }: { head?: Head }) => {
  return (
    <head>
      <title>{head?.title || "Default"}</title>

      {head?.metas?.map((meta, index) => (
        <meta key={index} {...meta} />
      ))}

      {head?.links?.map((link, index) => (
        <link
          key={index}
          rel={link.rel}
          href={link.href}
          type={link.type}
        />
      ))}

      {head?.scripts?.map((script, index) =>
        script.src ? (
          <script
            key={index}
            src={script.src}
            type={script.type || "text/javascript"}
            charSet={script.charset}
            async={script.async}
            defer={script.defer}
          />
        ) : script.srcContents ? (
          <script
            key={index}
            type={script.type || "text/javascript"}
            charSet={script.charset}
            async={script.async}
            defer={script.defer}
            dangerouslySetInnerHTML={{ __html: script.srcContents }}
          />
        ) : null
      )}
    </head>
  );
};

export default Template;
