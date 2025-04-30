/**
 * Sign Up page component
 * Renders the Clerk sign-up component with site header and footer
 * 
 * @module pages/sign-up
 */

import { SignUp } from "@clerk/nextjs";
import Header from "./components/Header";
import Footer from "./components/Footer";

/**
 * SignUpPage component
 * Displays the Clerk authentication UI for user registration
 * Includes the application header and footer components
 * 
 * @returns {JSX.Element} The sign up page with Clerk authentication UI
 */
export default function SignUpPage() {
  return (
    <div>
      <Header />
      <div className="flex justify-center py-24">
        <SignUp />
      </div>
      <Footer />
    </div>
  );
}
