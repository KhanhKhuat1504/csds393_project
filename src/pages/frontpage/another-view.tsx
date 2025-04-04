import { SignedIn, UserButton, useAuth, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
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

export default function AnotherView() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { getToken } = useAuth();
  const { isSignedIn, user } = useUser();
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [selectedResponse, setSelectedResponse] = useState<string | null>(null);
  const [previewResponse, setPreviewResponse] = useState<string | null>(null);
  const [hoveredResponse, setHoveredResponse] = useState<string | null>(null);
  const [userResponses, setUserResponses] = useState<{ [promptId: string]: string }>({});
  const [loadingResponses, setLoadingResponses] = useState(false);
  const [stats, setStats] = useState<any>(null);

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
      const userAnswer = userResponses[selectedPrompt._id];
      setSelectedResponse(userAnswer);
      setPreviewResponse(userAnswer);
      
      // Fetch stats immediately to display accurate data
      const fetchStats = async () => {
        try {
          const statsRes = await fetch(`/api/prompt-stats?promptId=${selectedPrompt._id}`);
          if (statsRes.ok) {
            const statsData = await statsRes.json();
            if (statsData.success) {
              setStats(statsData.data);
            }
          }
        } catch (err) {
          console.error("Error fetching stats:", err);
        }
      };
      
      fetchStats();
    } else if (selectedPrompt) {
      setSelectedResponse(null);
      setPreviewResponse(null);
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
      setPreviewResponse(response);
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
        
        // Automatically show stats for the selected response
        setPreviewResponse(response);
        
        // Fetch stats immediately to display accurate data
        try {
          const statsRes = await fetch(`/api/prompt-stats?promptId=${selectedPrompt._id}`);
          if (statsRes.ok) {
            const statsData = await statsRes.json();
            if (statsData.success) {
              setStats(statsData.data);
            }
          }
        } catch (err) {
          console.error("Error fetching stats:", err);
        }
      } else {
        // Even if there's an error (like user already responded), get the existing response
        const data = await res.json();
        if (data.data && data.data.selectedResponse) {
          setSelectedResponse(data.data.selectedResponse);
          setUserResponses(prev => ({
            ...prev,
            [selectedPrompt._id]: data.data.selectedResponse
          }));
          
          // Also show stats for the existing response
          setPreviewResponse(data.data.selectedResponse);
        }
      }
    } catch (err) {
      console.error("Error saving response:", err);
    }
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

  // Helper function to determine if a response is disabled
  const isResponseDisabled = (promptId: string): boolean => {
    return !!userResponses[promptId];
  };

  // Calculate percentage for an answer
  const calculatePercentage = (response: string): number => {
    if (!stats || !stats.answerStats || !stats.answerStats[response]) {
      return 0;
    }
    
    const totalResponses = stats.responseCount;
    const responseCount = stats.answerStats[response].count;
    
    if (totalResponses === 0) return 0;
    
    return Math.round((responseCount / totalResponses) * 100);
  };

  // Handle stats loaded from child component
  const handleStatsLoaded = useCallback((newStats: any) => {
    setStats(newStats);
  }, []);

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
        <div className="ml-auto bg-white px-2 py-1 rounded-lg">
          <SignedIn>
            <UserButton 
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  userButtonAvatarBox: "w-10 h-10",
                  userButtonBox: "hover:opacity-80"
                }
              }}
            />
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
              {[selectedPrompt.resp1, selectedPrompt.resp2, selectedPrompt.resp3, selectedPrompt.resp4].map((response, index) => {
                const isDisabled = isResponseDisabled(selectedPrompt._id) && selectedResponse !== response;
                const isSelected = selectedResponse === response;
                return (
                  <button
                    key={index}
                    className={`p-4 rounded-lg shadow w-full border-2 transition-colors ${
                      isSelected 
                        ? 'border-red-800 bg-red-200' 
                        : isDisabled
                        ? "border-transparent bg-gray-300 opacity-50 cursor-not-allowed"
                        : 'border-transparent bg-gray-200 hover:bg-gray-300'
                    }`}
                    onClick={() => handleResponseClick(response)}
                    disabled={isDisabled}
                  >
                    {response}
                    {isSelected && (
                      <div className="mt-2 text-sm font-medium text-red-800">
                        Your selection
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
            {selectedResponse && (
              <div className="mt-4 p-4 bg-red-100 border-l-4 border-red-500 text-red-700">
                Result: <span className="font-bold">{stats ? calculatePercentage(selectedResponse) : "Loading..."}%</span>
              </div>
            )}
            {isResponseDisabled(selectedPrompt._id) && (
              <div className="mt-4 p-3 bg-gray-100 text-gray-700 rounded text-center text-sm">
                You've already responded to this prompt. Your selection cannot be changed.
              </div>
            )}
            
            {selectedResponse && (
              <div className="mt-2 p-2 bg-red-50 text-red-600 rounded text-center text-sm">
                Click "View Stats" on other responses to see their demographic data
              </div>
            )}
            
            {/* Display demographics charts if user has responded */}
            {selectedResponse && (
              <PromptResponseStats 
                promptId={selectedPrompt._id} 
                selectedResponse={selectedResponse}
                hoveredResponse={hoveredResponse}
                previewResponse={previewResponse}
                onStatsLoaded={handleStatsLoaded}
              />
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
                      {userResponses[prompt._id] && (
                        <div className="text-sm text-green-600 mt-1">
                          ✓ You've responded to this prompt
                        </div>
                      )}
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