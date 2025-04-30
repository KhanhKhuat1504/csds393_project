/**
 * Custom App component for Next.js
 * Wraps all pages with Clerk authentication provider
 * Applies global styles and scripts
 * 
 * @module pages/_app
 */

import "@/styles/globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Metadata } from "next";
import { AppProps } from "next/app";
import Script from "next/script";

/**
 * Metadata for the application
 * Defines title, description, and OpenGraph image
 */
export const metadata: Metadata = {
  title: "Next.js Clerk Template",
  description:
    "A simple and powerful Next.js template featuring authentication and user management powered by Clerk.",
  openGraph: { images: ["/og.png"] },
};

/**
 * MyApp component
 * Custom Next.js App component that wraps all pages
 * Provides Clerk authentication context and styling
 * Loads PrismJS for code syntax highlighting
 * 
 * @param {AppProps} props - Next.js app props including Component and pageProps
 * @returns {JSX.Element} The app with authentication provider and scripts
 */
function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <ClerkProvider
        appearance={{
          variables: { colorPrimary: "#000000" },
          elements: {
            formButtonPrimary:
              "bg-black border border-black border-solid hover:bg-white hover:text-black",
            socialButtonsBlockButton:
              "bg-white border-gray-200 hover:bg-transparent hover:border-black text-gray-600 hover:text-black",
            socialButtonsBlockButtonText: "font-semibold",
            formButtonReset:
              "bg-white border border-solid border-gray-200 hover:bg-transparent hover:border-black text-gray-500 hover:text-black",
            membersPageInviteButton:
              "bg-black border border-black border-solid hover:bg-white hover:text-black",
            card: "bg-[#fafafa]",
          },
        }}
      >
        <Component {...pageProps} />
      </ClerkProvider>

      <Script src="https://cdn.jsdelivr.net/npm/prismjs@1/components/prism-core.min.js" />
      <Script src="https://cdn.jsdelivr.net/npm/prismjs@1/plugins/autoloader/prism-autoloader.min.js" />
    </>
  );
}

export default MyApp;
