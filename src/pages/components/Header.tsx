import { OrganizationSwitcher, SignedIn, UserButton } from "@clerk/nextjs";

/**
 * Header component for the CaseAsk application.
 * Displays the application title and user authentication controls.
 * Shows the user button when signed in for account management.
 * 
 * @component
 * @returns {JSX.Element} Application header with title and user controls
 */
export default function Header() {
  return (
    <header className="w-full bg-blue-600 py-3 flex justify-center items-center">
      <h1 className="text-white text-xl font-semibold">CaseAsk</h1>

      <div className="absolute right-4 flex items-center gap-4">
        <SignedIn>
          <div className="bg-white px-2 py-1 rounded-lg">
            <UserButton
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  userButtonAvatarBox: "w-10 h-10",
                  userButtonBox: "hover:opacity-80"
                }
              }}
            />
          </div>
        </SignedIn>
      </div>
    </header>
  );
}
