const Template = ({ App, title }: { App: React.ReactNode; title?: string }) => {
  return (
    <html>
      <head>
        <title>{title ? title : "Default"}</title>
      </head>
      <body>{App}</body>
    </html>
  );
};

export default Template;
