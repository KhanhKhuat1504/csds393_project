import { useEffect } from "react";

/**
 * JSONOutput component for displaying formatted JSON data with syntax highlighting.
 * Uses Prism.js for syntax highlighting JSON content.
 * 
 * @component
 * @param {Object} props - Component props
 * @param {any} props.json - JSON data to be displayed and formatted
 * @returns {JSX.Element} Pre-formatted code block with JSON content
 */
export default function JSONOutput(props: { json: any }) {
  useEffect(() => {
    if (window.Prism) {
      console.log(`highlighting`);
      window.Prism.highlightAll();
    }
  }, []);

  return (
    <pre className="px-8 sm:px-6 text-black text-sm">
      <code className="language-json">
        {JSON.stringify(props.json, null, 2)}
      </code>
    </pre>
  );
}
