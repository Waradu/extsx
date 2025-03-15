import type { Config } from ".";

const Template = ({
  children: App,
  config,
}: {
  children: React.ReactNode;
  config: Config;
}) => {
  return (
    <html>
      {config.head ? (
        <head>
          <title>{config.head.title || "Default"}</title>

          {config.head.metas?.map((meta, index) => (
            <meta key={index} {...meta} />
          ))}

          {config.head.styles?.map((style, index) =>
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

          {config.head.scripts?.map((script, index) =>
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
      ) : null}
      <body>{App}</body>
    </html>
  );
};

export default Template;
