import type { Head } from "../types";

const Template = ({ head }: { head?: Head }) => {
  return (
    <head>
      <title>{head?.title || "Default"}</title>

      {head?.metas?.map((meta, index) => (
        <meta key={index} {...meta} />
      ))}

      {head?.styles?.map((style, index) =>
        style.src ? (
          <link
            key={index}
            rel="stylesheet"
            href={style.src}
            type={style.type || "text/css"}
          />
        ) : style.style ? (
          <style key={index} type={style.type || "text/css"}>
            {style.style}
          </style>
        ) : null
      )}

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
