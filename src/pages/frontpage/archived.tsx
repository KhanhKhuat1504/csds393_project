import { SignedIn, UserButton, useAuth, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { useState, useEffect } from "react";
import PromptResponseStats from "../../components/PromptResponseStats";

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

interface UserResponseData {
  _id: string;
  userId: string;
  promptId: string;
  selectedResponse: string;
  responseDate: Date;
}

export default function Archived() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { getToken } = useAuth();
  const { isSignedIn, user } = useUser();
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [selectedResponse, setSelectedResponse] = useState<string | null>(null);
  const [isMod, setIsMod] = useState(false);
  const [userResponses, setUserResponses] = useState<{ [promptId: string]: string }>({});
  const [loadingResponses, setLoadingResponses] = useState(false);

  useEffect(() => {
    const checkModStatus = async () => {
      if (isSignedIn && user) {
        try {
          const token = await getToken();
          if (!token) return;
          
          const response = await fetch(`/api/users?id=${user.id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (response.ok) {
            const userData = await response.json();
            if (userData.success && userData.data) {
              setIsMod(userData.data.isMod === true);
            }
          }
        } catch (err) {
          console.error("Error checking moderator status:", err);
        }
      }
    };
    
    checkModStatus();
  }, [isSignedIn, user, getToken]);

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

  // Fetch all user responses when logged in
  useEffect(() => {
    const fetchUserResponses = async () => {
      if (!isSignedIn || !user) return;
      
      setLoadingResponses(true);
      try {
        const token = await getToken();
        if (!token) {
          setLoadingResponses(false);
          return;
        }
        
        const headers = { Authorization: `Bearer ${token}` };
        const res = await fetch(`/api/user-responses?userId=${user.id}`, { headers });
        
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.data)) {
            // Convert array of responses to a map of promptId -> selectedResponse
            const responsesMap: { [promptId: string]: string } = {};
            data.data.forEach((response: UserResponseData) => {
              responsesMap[response.promptId] = response.selectedResponse;
            });
            setUserResponses(responsesMap);
          }
        }
      } catch (err) {
        console.error("Error fetching user responses:", err);
      } finally {
        setLoadingResponses(false);
      }
    };

    fetchUserResponses();
  }, [isSignedIn, user, getToken]);

  useEffect(() => {
    if (!isSignedIn) {
      setPrompts([]);
      setError("");
      setUserResponses({});
    }
  }, [isSignedIn]);

  // When a prompt is selected, set selected response from user responses if available
  useEffect(() => {
    if (selectedPrompt && userResponses[selectedPrompt._id]) {
      setSelectedResponse(userResponses[selectedPrompt._id]);
    } else if (selectedPrompt) {
      setSelectedResponse(null);
    }
  }, [selectedPrompt, userResponses]);

  const handlePromptClick = (prompt: Prompt) => {
    setSelectedPrompt(prompt);
  };

  const handleBackClick = () => {
    setSelectedPrompt(null);
    setSelectedResponse(null);
  };

  const handleResponseClick = async (response: string) => {
    // If user has already responded to this prompt, don't allow changing the answer
    if (selectedPrompt && userResponses[selectedPrompt._id]) {
      return;
    }
    
    if (!isSignedIn || !user || !selectedPrompt) return;
    
    setSelectedResponse(response);
    
    try {
      const token = await getToken();
      if (!token) return;
      
      const headers = { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      
      // Save the user's response
      const res = await fetch("/api/user-responses", {
        method: 'POST',
        headers,
        body: JSON.stringify({
          userId: user.id,
          promptId: selectedPrompt._id,
          selectedResponse: response
        })
      });
      
      if (res.ok) {
        const data = await res.json();
        // Update the user responses map with the new response
        setUserResponses(prev => ({
          ...prev,
          [selectedPrompt._id]: response
        }));
      } else {
        // Even if there's an error (like user already responded), get the existing response
        const data = await res.json();
        if (data.data && data.data.selectedResponse) {
          setSelectedResponse(data.data.selectedResponse);
          setUserResponses(prev => ({
            ...prev,
            [selectedPrompt._id]: data.data.selectedResponse
          }));
        }
      }
    } catch (err) {
      console.error("Error saving response:", err);
    }
  };

  const handleUnarchivePrompt = async (promptId: string, e: React.MouseEvent) => {
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
          isArchived: false
        })
      });
      
      if (!res.ok) {
        const errMsg = await res.text();
        throw new Error(`Failed to unarchive prompt: ${res.status} ${errMsg}`);
      }
      
      // Update the local state
      setPrompts(prevPrompts => 
        prevPrompts.map(p => 
          p._id === promptId ? { ...p, isArchived: false } : p
        )
      );
      
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Helper function to determine if a response is disabled
  const isResponseDisabled = (promptId: string): boolean => {
    return !!userResponses[promptId];
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-green-50 px-4 pt-12">
      <header className="fixed top-0 left-0 w-full py-4 bg-green-600 text-white shadow-md flex items-center justify-between px-6 z-50">
        <Link href="/frontpage/Front">
          <button className="px-3 py-1 bg-white text-green-600 rounded-md hover:bg-gray-100">
            Main View
          </button>
        </Link>
        <h1 className="absolute left-1/2 transform -translate-x-1/2 text-2xl font-bold">
          CaseAsk - Archived Prompts
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
              className="mb-4 text-green-600 hover:underline"
              onClick={handleBackClick}
            >
              &larr; Back
            </button>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              {selectedPrompt.promptQuestion}
            </h2>
            <div className="grid grid-cols-1 gap-4">
              {[selectedPrompt.resp1, selectedPrompt.resp2, selectedPrompt.resp3, selectedPrompt.resp4].map((response, index) => {
                const isDisabled = isResponseDisabled(selectedPrompt._id) && selectedResponse !== response;
                const isSelected = selectedResponse === response;
                return (
                  <button
                    key={index}
                    className={`p-4 rounded-lg shadow w-full border-2 transition-colors ${
                      isSelected 
                        ? 'border-green-800 bg-green-200' 
                        : isDisabled
                        ? "border-transparent bg-gray-300 opacity-50 cursor-not-allowed"
                        : 'border-transparent bg-gray-200 hover:bg-gray-300'
                    }`}
                    onClick={() => handleResponseClick(response)}
                    disabled={isDisabled}
                  >
                    {response}
                    {isSelected && (
                      <div className="mt-2 text-sm font-medium text-green-800">
                        Your selection
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
            {selectedResponse && (
              <div className="mt-4 p-4 bg-green-100 border-l-4 border-green-500 text-green-700">
                Example result: <span className="font-bold">{Math.floor(Math.random() * 100)}%</span>
              </div>
            )}
            {isResponseDisabled(selectedPrompt._id) && (
              <div className="mt-4 p-3 bg-gray-100 text-gray-700 rounded text-center text-sm">
                You've already responded to this prompt. Your selection cannot be changed.
              </div>
            )}
            
            {/* Display demographics charts if user has responded */}
            {selectedResponse && (
              <PromptResponseStats 
                promptId={selectedPrompt._id} 
                selectedResponse={selectedResponse} 
              />
            )}
          </div>
        ) : (
          <>
            <h2 className="text-xl font-semibold text-center text-green-800 mb-4">Archived Prompts</h2>
            {loading && <p>Loading prompts...</p>}
            {error && <p className="text-red-600">{error}</p>}
            {!loading && !error && (
              <div className="w-full space-y-4">
                {prompts.filter(prompt => prompt.isArchived).length > 0 ? (
                  prompts.filter(prompt => prompt.isArchived).map((prompt) => (
                    <div
                      key={prompt._id}
                      className="cursor-pointer p-4 bg-white rounded-lg shadow border-2 border-green-200 hover:bg-green-50 relative"
                      onClick={() => handlePromptClick(prompt)}
                    >
                      <h3 className="text-lg font-semibold pr-24">
                        {prompt.promptQuestion}
                      </h3>
                      {userResponses[prompt._id] && (
                        <div className="text-sm text-green-600 mt-1">
                          ✓ You've responded to this prompt
                        </div>
                      )}
                      {isMod && (
                        <div className="absolute top-4 right-4 flex space-x-2">
                          <button
                            onClick={(e) => handleUnarchivePrompt(prompt._id, e)}
                            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                          >
                            Restore
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-600">No archived prompts available</p>
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