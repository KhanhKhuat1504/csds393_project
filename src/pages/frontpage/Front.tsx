// components/Front.tsx
import { SignedIn, UserButton, useAuth, useUser } from "@clerk/nextjs";
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

  useEffect(() => {
    const fetchPrompts = async () => {
      if (!isSignedIn) return; // Only fetch if the user is signed in
      setLoading(true);
      try {
        const token = await getToken();
        console.log("Fetched token:", token); // Debug: Check token value
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

  // Clear previous state when the user logs out
  useEffect(() => {
    if (!isSignedIn) {
      setPrompts([]);
      setError("");
    }
  }, [isSignedIn]);

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
        <h2 className="text-xl font-semibold text-center text-gray-800 mb-4">Prompts</h2>

        {loading && <p>Loading prompts...</p>}
        {error && <p className="text-red-600">{error}</p>}

        {!loading && !error && (
          <div className="w-full space-y-4">
            {prompts.length > 0 ? (
              prompts.map((prompt) => (
                <div key={prompt._id} className="p-4 bg-white rounded-lg shadow">
                  <h3 className="text-lg font-semibold">{prompt.promptQuestion}</h3>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-600">No prompts available</p>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
