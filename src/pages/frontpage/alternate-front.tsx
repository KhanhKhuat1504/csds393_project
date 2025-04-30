/**
 * Alternate Front component
 * Provides an alternative UI layout for the CaseAsk application
 * Displays prompts and allows users to select responses with a different design
 * 
 * @module pages/frontpage/alternate-front
 */

// components/AlternateFront.tsx
import { SignedIn, UserButton, useAuth, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import PromptResponseStats from "../../components/PromptResponseStats";

/**
 * Represents a prompt/question with multiple response options
 * 
 * @interface Prompt
 * @property {string} _id - Unique identifier for the prompt
 * @property {string} promptQuestion - The main question text
 * @property {string} resp1 - First response option
 * @property {string} resp2 - Second response option
 * @property {string} resp3 - Third response option
 * @property {string} resp4 - Fourth response option
 */
interface Prompt {
  _id: string;
  promptQuestion: string;
  resp1: string;
  resp2: string;
  resp3: string;
  resp4: string;
}

/**
 * AlternateFront component
 * Provides an alternative UI layout for viewing and responding to prompts
 * Shows demographic statistics for responses when a user has answered
 * 
 * @returns {JSX.Element} The alternate front page component
 */
export default function AlternateFront() {
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

  useEffect(() => {
    if (!isSignedIn) {
      setPrompts([]);
      setError("");
    }
  }, [isSignedIn]);

  const handlePromptClick = (prompt: Prompt) => {
    setSelectedPrompt(prompt);
    
    // Set the selected response if user has already responded to this prompt
    if (userResponses[prompt._id]) {
      const userAnswer = userResponses[prompt._id];
      setSelectedResponse(userAnswer);
      setPreviewResponse(userAnswer);
      
      // Fetch stats immediately
      const fetchStats = async () => {
        try {
          const statsRes = await fetch(`/api/prompt-stats?promptId=${prompt._id}`);
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
    } else {
      setSelectedResponse(null);
      setPreviewResponse(null);
    }
  };

  const handleBackClick = () => {
    setSelectedPrompt(null);
    setSelectedResponse(null);
  };

  const handleResponseClick = async (response: string) => {
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
      }
    } catch (err) {
      console.error("Error saving response:", err);
    }
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
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-200 px-4 pt-12">
      <header className="fixed top-0 left-0 w-full py-4 bg-indigo-700 text-white shadow-md flex items-center justify-between px-6">
        <Link href="/frontpage/Front">
          <button className="px-3 py-1 bg-white text-indigo-700 rounded-md hover:bg-gray-100">
            Main View
          </button>
        </Link>
        <h1 className="absolute left-1/2 transform -translate-x-1/2 text-2xl font-bold">
          CaseAsk - Alternate View
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

      <div className="w-full max-w-2xl bg-white shadow-xl rounded-xl p-6 flex flex-col items-center mt-8 border-2 border-indigo-300">
        {selectedPrompt ? (
          <div className="w-full">
            <button
              className="mb-4 text-indigo-600 hover:underline"
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
                  className={`p-4 rounded-lg shadow w-full border-2 transition-colors ${selectedResponse === response ? 'border-indigo-800 bg-indigo-200' : 'border-transparent bg-gray-200 hover:bg-gray-300'}`}
                  onClick={() => handleResponseClick(response)}
                >
                  {response}
                </button>
              ))}
            </div>
            {selectedResponse && (
              <div className="mt-4 p-4 bg-indigo-100 border-l-4 border-indigo-500 text-indigo-700">
                Result: <span className="font-bold">{stats ? calculatePercentage(selectedResponse) : "Loading..."}%</span>
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
            <h2 className="text-xl font-semibold text-center text-indigo-800 mb-4">Alternative Prompts View</h2>
            {loading && <p>Loading prompts...</p>}
            {error && <p className="text-red-600">{error}</p>}
            {!loading && !error && (
              <div className="w-full space-y-4">
                {prompts.length > 0 ? (
                  prompts.map((prompt) => (
                    <div
                      key={prompt._id}
                      className="cursor-pointer p-4 bg-white rounded-lg shadow border-2 border-indigo-200 hover:bg-indigo-50"
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
            <div className="flex gap-4 mt-4">
              <Link href="/frontpage/create-prompt">
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-md">
                  Create
                </button>
              </Link>
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