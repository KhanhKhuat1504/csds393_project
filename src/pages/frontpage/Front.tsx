import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { OrganizationSwitcher, SignedIn, UserButton } from "@clerk/nextjs";

export default function Login() {
  const router = useRouter();

  // Prompts will be fetched from MongoDB via API
  const [prompts, setPrompts] = useState<string[]>([]);
  const [userResponse, setUserResponse] = useState("");

  // Fetch prompts from backend (API) when component loads
  useEffect(() => {
    const fetchPrompts = async () => {
      try {
        const response = await fetch("/api/prompts");
        const data = await response.json();
        setPrompts(data);
      } catch (error) {
        console.error("Failed to load prompts:", error);
      }
    };

    fetchPrompts();
  }, []);

  // Handle new prompt submission and save to MongoDB
  const handleGenerateResponse = async () => {
    if (!userResponse.trim()) return;

    try {
      const response = await fetch("/api/prompts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ text: userResponse })
      });

      if (response.ok) {
        // Update local state after successful save
        setPrompts((prevPrompts) => [...prevPrompts, userResponse]);
        setUserResponse("");
      } else {
        console.error("Failed to save prompt");
      }
    } catch (error) {
      console.error("Error submitting prompt:", error);
    }
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

      {/* Centered Prompts Section */}
      <div className="w-full max-w-2xl bg-white shadow-xl rounded-xl p-6 flex flex-col items-center">
        <h2 className="text-xl font-semibold text-center text-gray-800 mb-2">Prompts</h2>
        
        {/* Scrollable Prompt List */}
        <div className="h-60 overflow-y-auto border border-gray-300 rounded-lg p-4 bg-gray-50 w-full">
          {prompts.map((prompt, index) => (
            <div 
              key={index} 
              className="p-3 mb-2 bg-white rounded-lg shadow cursor-pointer hover:bg-gray-200 transition"
              onClick={() => router.push(`/frontpage/promptdetails?id=${index}`)}
            >
              {prompt}
            </div>
          ))}
        </div>
      </div>

      {/* User Response Section */}
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
