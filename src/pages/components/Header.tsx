import { OrganizationSwitcher, SignedIn, UserButton } from "@clerk/nextjs";

export default function Header() {
  return (
    <header className="w-full bg-blue-600 py-3 flex justify-center items-center">
      <h1 className="text-white text-xl font-semibold">CaseAsk</h1>

      <div className="absolute right-4 flex items-center gap-4">
        <SignedIn>
          <div className="hidden sm:block">
            <OrganizationSwitcher afterCreateOrganizationUrl="/dashboard" />
          </div>
          <div className="block sm:hidden">
            <OrganizationSwitcher
              afterCreateOrganizationUrl="/dashboard"
              appearance={{
                elements: {
                  organizationSwitcherTrigger: `pr-0`,
                },
              }}
            />
          </div>
          <UserButton
            afterSignOutUrl="/"
            appearance={{
              elements: {
                userButtonBox: "focus:ring-4 focus:ring-indigo-500"
              }
            }}
          />
        </SignedIn>
      </div>
    </header>
  );
}
