// components/Front.tsx
import { SignedIn, UserButton, useAuth, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { useState, useEffect } from "react";

interface Prompt {
  _id: string;
  promptQuestion: string;
  resp1: string;
  resp2: string;
  resp3: string;
  resp4: string;
}

export default function Front() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { getToken } = useAuth();
  const { isSignedIn } = useUser();
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [selectedResponse, setSelectedResponse] = useState<string | null>(null);

  useEffect(() => {
    const fetchPrompts = async () => {
      if (!isSignedIn) return;
      setLoading(true);
      try {
        const token = await getToken();
        if (!token) {
          setError("No valid token available");
          setLoading(false);
          return;
        }
        const headers = { Authorization: `Bearer ${token}` };
        const res = await fetch("/api/prompt", { headers });
        if (!res.ok) {
          const errMsg = await res.text();
          throw new Error(`Failed to fetch prompts: ${res.status} ${errMsg}`);
        }
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setPrompts(data.data);
        } else {
          setError("Invalid data format received from API");
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPrompts();
  }, [getToken, isSignedIn]);

  useEffect(() => {
    if (!isSignedIn) {
      setPrompts([]);
      setError("");
    }
  }, [isSignedIn]);

  const handlePromptClick = (prompt: Prompt) => {
    setSelectedPrompt(prompt);
    setSelectedResponse(null);
  };

  const handleBackClick = () => {
    setSelectedPrompt(null);
    setSelectedResponse(null);
  };

  const handleResponseClick = (response: string) => {
    setSelectedResponse(response);
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4 pt-12">
      <header className="fixed top-0 left-0 w-full py-4 bg-blue-600 text-white shadow-md flex items-center justify-between px-6">
        <h1 className="absolute left-1/2 transform -translate-x-1/2 text-2xl font-bold">
          CaseAsk
        </h1>
        <div className="ml-auto bg-black text-white px-4 py-2 rounded-lg shadow-md">
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>
      </header>

      <div className="w-full max-w-2xl bg-white shadow-xl rounded-xl p-6 flex flex-col items-center mt-8">
        {selectedPrompt ? (
          <div className="w-full">
            <button
              className="mb-4 text-blue-600 hover:underline"
              onClick={handleBackClick}
            >
              &larr; Back
            </button>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              {selectedPrompt.promptQuestion}
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {[selectedPrompt.resp1, selectedPrompt.resp2, selectedPrompt.resp3, selectedPrompt.resp4].map((response, index) => (
                <button
                  key={index}
                  className={`p-4 rounded-lg shadow w-full border-2 transition-colors ${selectedResponse === response ? 'border-blue-800 bg-blue-300' : 'border-transparent bg-gray-200 hover:bg-gray-300'}`}
                  onClick={() => handleResponseClick(response)}
                >
                  {response}
                </button>
              ))}
            </div>
            {selectedResponse && (
              <div className="mt-4 p-4 bg-blue-100 border-l-4 border-blue-500 text-blue-700">
                Example result: <span className="font-bold">{Math.floor(Math.random() * 100)}%</span>
              </div>
            )}
          </div>
        ) : (
          <>
            <h2 className="text-xl font-semibold text-center text-gray-800 mb-4">Prompts</h2>
            {loading && <p>Loading prompts...</p>}
            {error && <p className="text-red-600">{error}</p>}
            {!loading && !error && (
              <div className="w-full space-y-4">
                {prompts.length > 0 ? (
                  prompts.map((prompt) => (
                    <div
                      key={prompt._id}
                      className="cursor-pointer p-4 bg-white rounded-lg shadow border hover:bg-gray-50"
                      onClick={() => handlePromptClick(prompt)}
                    >
                      <h3 className="text-lg font-semibold">
                        {prompt.promptQuestion}
                      </h3>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-600">No prompts available</p>
                )}
              </div>
            )}
            <Link href="/frontpage/create-prompt">
              <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md">
                Create
              </button>
            </Link>
          </>
        )}
      </div>
    </main>
  );
}
