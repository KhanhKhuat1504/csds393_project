import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function PromptDetails() {
  const router = useRouter();
  const { id } = router.query;

  // Sample prompts and responses (Replace with actual DB data)
  const prompts: string[] = ["1", "2", "3", "4", "5", "6"];

  const responses: Record<number, string[]> = {
    0: ["a"],
    1: ["B"],
    2: ["C"],
    3: ["D"],
    4: ["E"],
    5: ["F"],
  };

  // Convert `id` to a number safely
  const promptId = typeof id === "string" ? parseInt(id, 10) : -1;
  const promptQuestion = prompts[promptId] ?? "Prompt Not Found";
  const promptResponses = responses[promptId] ?? ["No responses yet."];

  // State to handle new user response
  const [newResponse, setNewResponse] = useState("");
  const [allResponses, setAllResponses] = useState<string[]>(promptResponses);

  // Handle submission of new response
  const handleResponseSubmit = () => {
    if (newResponse.trim() === "") return; // Prevent empty submissions
    setAllResponses([...allResponses, newResponse]);
    setNewResponse(""); // Clear input field after submission
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4 pt-12">
      
      {/* Back Button to Front.tsx */}
      <button
        onClick={() => router.push("/frontpage/Front")}
        className="absolute top-5 left-5 px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700"
      >
        ← Back
      </button>

      {/* Prompt Question */}
      <div className="w-full max-w-2xl bg-white shadow-xl rounded-xl p-6">
        <h2 className="text-2xl font-bold text-center text-gray-800">{promptQuestion}</h2>

        {/* Responses Section */}
        <div className="mt-4 p-4 border border-gray-300 rounded-lg bg-gray-50 w-full">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Responses:</h3>
          {allResponses.map((response, index) => (
            <div key={index} className="p-3 mb-2 bg-white rounded-lg shadow">
              {response}
            </div>
          ))}
        </div>

        {/* New Response Input Area */}
        <div className="mt-4 p-4 border border-gray-300 rounded-lg bg-white w-full">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Your Response:</h3>
          <textarea
            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={4}
            placeholder="Type your response here..."
            value={newResponse}
            onChange={(e) => setNewResponse(e.target.value)}
          />
          <button
            onClick={handleResponseSubmit}
            className="mt-2 w-full bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-700"
          >
            Submit Response
          </button>
        </div>
      </div>
    </main>
  );
}
