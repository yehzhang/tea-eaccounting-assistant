import h from 'vhtml';
import Script from './Script';

interface Props {
  readonly title: string;
  readonly children: string[];
}

function WebPage({ title, children }: Props): string {
  const html = (
    <html lang="zh">
      <head>
        {/*Global site tag (gtag.js) - Google Analytics*/}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-YZJDWF81NM" />
        <Script>{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', 'G-YZJDWF81NM');
        `}</Script>

        {/*Required meta tags*/}
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />

        {/*Bootstrap CSS*/}
        <link
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.0-beta2/dist/css/bootstrap.min.css"
          rel="stylesheet"
          integrity="sha384-BmbxuPwQa2lc/FVzBcNJ7UAyJxM6wuqIj61tLrc4wSX0szH/Ev+nYRRuWlolflfl"
          crossorigin="anonymous"
        />

        {/*Favicons */}
        {/*<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">*/}
        {/*<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">*/}
        {/*<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">*/}
        {/*<link rel="manifest" href="/site.webmanifest">*/}
        {/*<link rel="mask-icon" href="/safari-pinned-tab.svg" color="#5bbad5">*/}
        {/*<meta name="msapplication-TileColor" content="#da532c">*/}
        {/*<meta name="theme-color" content="#ffffff">*/}

        <title>{title}</title>
      </head>
      <body>
        {children}

        {/*Bootstrap JS*/}
        <script
          src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.0-beta2/dist/js/bootstrap.bundle.min.js"
          integrity="sha384-b5kHyXgcpbZJO/tY9Ul7kGkf1S0CWuKcCD38l8YkeH8z8QjE0GmW1gYU5S9FOnJ0"
          crossorigin="anonymous"
        />
      </body>
    </html>
  );
  return `<!DOCTYPE html>${html}`;
}

export default WebPage;
