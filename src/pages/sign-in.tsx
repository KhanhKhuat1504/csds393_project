/**
 * Sign In page component
 * Renders the Clerk sign-in component with site header and footer
 * 
 * @module pages/sign-in
 */

import { SignIn } from "@clerk/nextjs";
import Header from "./components/Header";
import Footer from "./components/Footer";

/**
 * SignInPage component
 * Displays the Clerk authentication UI for user sign in
 * Includes the application header and footer components
 * 
 * @returns {JSX.Element} The sign in page with Clerk authentication UI
 */
export default function SignInPage() {
  return (
    <div>
      <Header />
      <div className="flex justify-center py-24">
        <SignIn />
      </div>
      <Footer />
    </div>
  );
}
