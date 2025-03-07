import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { OrganizationSwitcher, SignedIn, UserButton } from "@clerk/nextjs";

// User type interface for TypeScript (optional, can remove if using .js)
interface User {
  _id: string;
  first_name: string;
}

export default function Login() {
  const router = useRouter();

  const [users, setUsers] = useState<User[]>([]);

  // Fetch users (first names) from MongoDB when page loads
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("/api/prompts");
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error("Failed to load users:", error);
      }
    };

    fetchUsers();
  }, []);

  const [userResponse, setUserResponse] = useState("");

  const handleGenerateResponse = () => {
    // Just a placeholder if you still want to keep the button for future use
    console.log("Response submitted (currently does nothing)");
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4 pt-12">

      {/* Header fixed at the very top */}
      <header className="fixed top-0 left-0 w-full py-4 bg-blue-600 text-white shadow-md flex items-center justify-between px-6">
        <h1 className="absolute left-1/2 transform -translate-x-1/2 text-2xl font-bold">
          CaseAsk
        </h1>
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
                    organizationSwitcherTrigger: `pr-0`
                  }
                }}
              />
            </div>
            <UserButton
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  userButtonTrigger: {
                    "&:focus": {
                      boxShadow: "#7857FF 0px 0px 0px 3px"
                    }
                  }
                }
              }}
            />
          </SignedIn>
        </div>
      </header>

      {/* Centered Prompts Section - now showing users */}
      <div className="w-full max-w-2xl bg-white shadow-xl rounded-xl p-6 flex flex-col items-center">
        <h2 className="text-xl font-semibold text-center text-gray-800 mb-2">Users</h2>

        <div className="h-60 overflow-y-auto border border-gray-300 rounded-lg p-4 bg-gray-50 w-full">
          {users.map((user) => (
            <div 
              key={user._id} 
              className="p-3 mb-2 bg-white rounded-lg shadow cursor-pointer hover:bg-gray-200 transition"
              onClick={() => router.push(`/frontpage/userdetails?id=${user._id}`)}
            >
              {user.first_name || "Unnamed User"}
            </div>
          ))}
        </div>
      </div>

      {/* User Response Section (Optional if needed in future) */}
      <div className="w-full max-w-2xl bg-white shadow-xl rounded-xl p-6 mt-6 flex flex-col items-center">
        <h2 className="text-xl font-semibold text-center text-gray-800 mb-2">Generate Your Response</h2>
        <textarea 
          className="w-full h-32 p-3 border border-gray-300 rounded-lg bg-gray-50 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Type your response here..."
          value={userResponse}
          onChange={(e) => setUserResponse(e.target.value)}
        />
        <button 
          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
          onClick={handleGenerateResponse}
        >
          Generate Response
        </button>
      </div>
    </main>
  );
}
