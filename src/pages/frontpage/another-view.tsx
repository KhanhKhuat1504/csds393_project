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
  isArchived?: boolean;
  isReported?: boolean;
}

export default function AnotherView() {
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

  const handleClearReportedPrompt = async (promptId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering prompt selection
    
    if (!isSignedIn) return;
    
    try {
      const token = await getToken();
      if (!token) {
        setError("No valid token available");
        return;
      }
      
      const headers = { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      
      const res = await fetch("/api/prompt", {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          id: promptId,
          isReported: false
        })
      });
      
      if (!res.ok) {
        const errMsg = await res.text();
        throw new Error(`Failed to clear reported status: ${res.status} ${errMsg}`);
      }
      
      // Update the local state
      setPrompts(prevPrompts => 
        prevPrompts.map(p => 
          p._id === promptId ? { ...p, isReported: false } : p
        )
      );
      
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeletePrompt = async (promptId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering prompt selection
    
    if (!isSignedIn) return;
    
    if (!confirm("Are you sure you want to delete this prompt? This action cannot be undone.")) {
      return;
    }
    
    try {
      const token = await getToken();
      if (!token) {
        setError("No valid token available");
        return;
      }
      
      const headers = { 
        'Authorization': `Bearer ${token}`
      };
      
      const res = await fetch(`/api/prompt?id=${promptId}`, {
        method: 'DELETE',
        headers
      });
      
      if (!res.ok) {
        const errMsg = await res.text();
        throw new Error(`Failed to delete prompt: ${res.status} ${errMsg}`);
      }
      
      // Update the local state - remove the deleted prompt
      setPrompts(prevPrompts => 
        prevPrompts.filter(p => p._id !== promptId)
      );
      
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-red-50 px-4 pt-12">
      <header className="fixed top-0 left-0 w-full py-4 bg-red-700 text-white shadow-md flex items-center justify-between px-6 z-50">
        <Link href="/frontpage/Front">
          <button className="px-3 py-1 bg-white text-red-700 rounded-md hover:bg-gray-100">
            Main View
          </button>
        </Link>
        <h1 className="absolute left-1/2 transform -translate-x-1/2 text-2xl font-bold">
          CaseAsk - Reported Prompts
        </h1>
        <div className="ml-auto bg-black text-white px-4 py-2 rounded-lg shadow-md">
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>
      </header>

      <div className="container mx-auto max-w-3xl mt-16 p-6 bg-white rounded-xl shadow-lg">
        {selectedPrompt ? (
          <div className="w-full">
            <button
              className="mb-4 text-red-600 hover:underline"
              onClick={handleBackClick}
            >
              &larr; Back
            </button>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              {selectedPrompt.promptQuestion}
            </h2>
            <div className="grid grid-cols-1 gap-4">
              {[selectedPrompt.resp1, selectedPrompt.resp2, selectedPrompt.resp3, selectedPrompt.resp4].map((response, index) => (
                <button
                  key={index}
                  className={`p-4 rounded-lg shadow w-full border-2 transition-colors ${selectedResponse === response ? 'border-red-800 bg-red-200' : 'border-transparent bg-gray-200 hover:bg-gray-300'}`}
                  onClick={() => handleResponseClick(response)}
                >
                  {response}
                </button>
              ))}
            </div>
            {selectedResponse && (
              <div className="mt-4 p-4 bg-red-100 border-l-4 border-red-500 text-red-700">
                Example result: <span className="font-bold">{Math.floor(Math.random() * 100)}%</span>
              </div>
            )}
          </div>
        ) : (
          <>
            <h2 className="text-xl font-semibold text-center text-red-800 mb-4">Reported Prompts</h2>
            {loading && <p>Loading prompts...</p>}
            {error && <p className="text-red-600">{error}</p>}
            {!loading && !error && (
              <div className="w-full space-y-4">
                {prompts.filter(prompt => prompt.isReported).length > 0 ? (
                  prompts.filter(prompt => prompt.isReported).map((prompt) => (
                    <div
                      key={prompt._id}
                      className="cursor-pointer p-4 bg-white rounded-lg shadow border-2 border-red-200 hover:bg-red-50 relative"
                      onClick={() => handlePromptClick(prompt)}
                    >
                      <h3 className="text-lg font-semibold pr-24">
                        {prompt.promptQuestion}
                      </h3>
                      <div className="absolute top-4 right-4 flex space-x-2">
                        <button
                          onClick={(e) => handleDeletePrompt(prompt._id, e)}
                          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                        >
                          Delete
                        </button>
                        <button
                          onClick={(e) => handleClearReportedPrompt(prompt._id, e)}
                          className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                        >
                          Clear Report
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-600">No reported prompts available</p>
                )}
              </div>
            )}
            <div className="flex gap-4 mt-4">
              <Link href="/frontpage/Front">
                <button className="px-4 py-2 bg-gray-600 text-white rounded-md">
                  Return to Main View
                </button>
              </Link>
            </div>
          </>
        )}
      </div>
    </main>
  );
} 