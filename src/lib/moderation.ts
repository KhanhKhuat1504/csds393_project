export const isInappropriate = async (text: string): Promise<boolean> => {
  const res = await fetch("https://api.openai.com/v1/moderations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({ input: text }),
  });

  const result = await res.json();
  return result.results[0]?.flagged || false;
};
