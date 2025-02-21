import { SignIn } from "@clerk/nextjs";
import { useState } from "react";
import { OrganizationSwitcher, SignedIn, UserButton } from "@clerk/nextjs";

export default function Login() {
  // Sample prompts for now (to be replaced with real data from MongoDB)
  const [prompts, setPrompts] = useState([
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    
  ]);

  return (
    <main className="flex flex-col items-center justify-start min-h-screen bg-gray-100 px-4 pt-12">
      
      {/* Header fixed at the very top */}
      <header className="fixed top-0 left-0 w-full py-4 bg-blue-600 text-white shadow-md flex items-center justify-between px-6">
        
        {/* Centered CaseAsk title */}
        <h1 className="absolute left-1/2 transform -translate-x-1/2 text-2xl font-bold">
          CaseAsk
        </h1>
        
        {/* User Box - Now Black */}
        <div className="ml-auto bg-black text-white px-4 py-2 rounded-lg shadow-md">
        <SignedIn>
        <div className="hidden sm:block">
          <OrganizationSwitcher afterCreateOrganizationUrl="/dashboard" />
        </div>
        <div className="block sm:hidden">
          <OrganizationSwitcher
            afterCreateOrganizationUrl="/dashboard"
            appearance={{
              elements: {
                organizationSwitcherTriggerIcon: `hidden`,
                organizationPreviewTextContainer: `hidden`,
                organizationSwitcherTrigger: `pr-0`,
              },
            }}
          />
        </div>
        <UserButton
          afterSignOutUrl="/"
          appearance={{
            elements: {
              userButtonTrigger: {
                "&:focus": {
                  boxShadow: "#7857FF 0px 0px 0px 3px",
                },
              },
            },
          }}
        />
      </SignedIn>
        </div>
      </header>

      {/* Prompts Section */}
      <div className="w-full max-w-2xl bg-white shadow-xl rounded-xl mt-0 p-6">
        <h2 className="text-xl font-semibold text-center text-gray-800 mb-2">Prompts</h2>
        
        {/* Scrollable Prompt List */}
        <div className="h-60 overflow-y-auto border border-gray-300 rounded-lg p-4 bg-gray-50">
          {prompts.map((prompt, index) => (
            <div key={index} className="p-3 mb-2 bg-white rounded-lg shadow">
              {prompt}
            </div>
          ))}
        </div>
      </div>

      {/*<div className="w-full max-w-md p-10 bg-white shadow-xl rounded-xl mt-4">
        <h1 className="text-3xl font-semibold text-center text-gray-800">CaseAsk Login</h1>
        
        {/* Clerk Sign-In Component with Social Sign-In 
        <SignIn path="/sign-in" routing="path" redirectUrl="/dashboard" />
        
        <div className="mt-6 text-center">
          <a href="/sign-up" className="text-blue-600 hover:underline">
            Don't have an account? Sign up here.
          </a>
        </div>
      </div>
      */}
    </main>
  );
}
