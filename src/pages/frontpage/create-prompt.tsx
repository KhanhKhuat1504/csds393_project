import { useState } from "react";
import { useRouter } from "next/router";
import { OrganizationSwitcher, SignedIn, UserButton, useAuth, useUser } from "@clerk/nextjs";

export default function CreatePrompt() {
  const router = useRouter();
  const { getToken } = useAuth();
  const { user } = useUser();
  const [promptQuestion, setPromptQuestion] = useState("");
  const [responses, setResponses] = useState(["", "", "", ""]);
  const [loading, setLoading] = useState(false);

  // Handle response input changes
  const handleResponseChange = (index: number, value: string) => {
    const newResponses = [...responses];
    newResponses[index] = value;
    setResponses(newResponses);
  };

  // Submit prompt to backend
  const handleSubmit = async () => {
    if (!promptQuestion.trim() || responses.some(resp => !resp.trim())) {
      alert("All fields are required.");
      return;
    }

    setLoading(true);
    try {
      const token = await getToken();
      const response = await fetch("/api/prompt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          promptQuestion,
          resp1: responses[0],
          resp2: responses[1],
          resp3: responses[2],
          resp4: responses[3],
          // New required field in the updated model
          createdBy: user?.id,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        alert("Prompt submitted successfully!");
        router.push("/frontpage/Front");
      } else {
        alert(`Failed to create prompt: ${data.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error submitting prompt:", error);
      alert("An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4 pt-12">
      {/* Header */}
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

      {/* Create Prompt Section */}
      <div className="w-full max-w-md bg-white shadow-xl rounded-xl p-6 mt-16">
        <h1 className="text-xl font-bold text-gray-800 mb-6 text-center">
          Create a New Prompt
        </h1>

        {/* Prompt Question Input */}
        <label className="block text-gray-700 font-semibold mb-2">Prompt Question:</label>
        <input
          type="text"
          value={promptQuestion}
          onChange={(e) => setPromptQuestion(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400 mb-4"
          placeholder="Enter your question..."
        />

        {/* Response Inputs */}
        <label className="block text-gray-700 font-semibold mb-2">Responses:</label>
        {responses.map((response, index) => (
          <input
            key={index}
            type="text"
            value={response}
            onChange={(e) => handleResponseChange(index, e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400 mb-3"
            placeholder={`Response ${index + 1}`}
          />
        ))}

        {/* Submit & Cancel Buttons */}
        <div className="flex justify-between mt-4">
          <button
            className={`px-6 py-2 text-white rounded-lg shadow-md transition ${
              loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
            }`}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit Prompt"}
          </button>
          <button
            className="px-6 py-2 bg-gray-500 text-white rounded-lg shadow-md hover:bg-gray-600 transition"
            onClick={() => router.push("/frontpage/Front")}
          >
            Cancel
          </button>
        </div>
      </div>
    </main>
  );
}
