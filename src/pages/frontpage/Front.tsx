import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { OrganizationSwitcher, SignedIn, UserButton, useAuth } from "@clerk/nextjs";

// MongoDB Prompt structure
interface Prompt {
  _id: string;
  promptQuestion: string;
}

export default function Front() {
  const router = useRouter();
  const { getToken } = useAuth();
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch prompts from MongoDB with Clerk authentication
  useEffect(() => {
    const fetchPrompts = async () => {
      setLoading(true);
      try {
        const token = await getToken();
        const response = await fetch("/api/prompt", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (data.success) {
          setPrompts(data.data);
        } else {
          console.error("Failed to load prompts:", data.error);
        }
      } catch (error) {
        console.error("Failed to fetch prompts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPrompts();
  }, [getToken]);

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4 pt-12">
      {/* Header */}
      <header className="fixed top-0 left-0 w-full py-4 bg-blue-600 text-white shadow-md flex items-center justify-between px-6">
        <h1 className="absolute left-1/2 transform -translate-x-1/2 text-2xl font-bold">
          CaseAsk
        </h1>
        <div className="ml-auto bg-black text-white px-4 py-2 rounded-lg shadow-md">
          <SignedIn>
            <div className="hidden sm:block">
              <OrganizationSwitcher afterCreateOrganizationUrl="/dashboard" />
            </div>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>
      </header>

      {/* Prompts Section */}
      <div className="w-full max-w-2xl bg-white shadow-xl rounded-xl p-6 flex flex-col items-center mt-8">
        <h2 className="text-xl font-semibold text-center text-gray-800 mb-4">
          Prompts
        </h2>
        <div className="w-full space-y-4">
          {loading ? (
            <p className="text-gray-500 text-center">Loading prompts...</p>
          ) : prompts.length > 0 ? (
            prompts.map((prompt) => (
              <div key={prompt._id} className="p-4 bg-white rounded-lg shadow">
                <h3 className="text-lg font-semibold">{prompt.promptQuestion}</h3>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center">No prompts available</p>
          )}
        </div>
      </div>

      {/* Create Prompt Button */}
      <button
        className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition"
        onClick={() => router.push("/frontpage/create-prompt")}
      >
        Create Prompt
      </button>
    </main>
  );
}
