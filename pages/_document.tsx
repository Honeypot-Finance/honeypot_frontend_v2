import { Html, Head, Main, NextScript } from "next/document";
import Script from "next/script";

export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <body className="dark md:text-[16px] sm:text-[14px] text-[12px] [font-family:MEMEP]">
        <Main />

        <Script
          src="/charting_library/charting_library.standalone.js"
          strategy="beforeInteractive"
        />
        <Script
          src="/datafeeds/udf/dist/bundle.js"
          strategy="beforeInteractive"
        />
        <NextScript>
          {`;(function (c, l, a, r, i, t, y) {
            c[a] =
              c[a] ||
              function () {
                ;(c[a].q = c[a].q || []).push(arguments)
              }
            t = l.createElement(r)
            t.async = 1
            t.src = 'https://www.clarity.ms/tag/' + i
            y = l.getElementsByTagName(r)[0]
            y.parentNode.insertBefore(t, y)
          })(window, document, 'clarity', 'script', 'pt32ubi53o')
          `}
        </NextScript>
      </body>
    </Html>
  );
}
