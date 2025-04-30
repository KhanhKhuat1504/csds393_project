/**
 * Custom Document component for Next.js
 * Extends the default Document to customize the HTML structure
 * Sets up the application with proper HTML structure and language
 * 
 * @module pages/_document
 */

import { Html, Head, Main, NextScript } from 'next/document'

/**
 * Document component
 * Customizes the application's HTML document structure
 * Sets HTML language and inserts Next.js components
 * 
 * @returns {JSX.Element} The custom HTML document structure
 */
export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
