import { CopyIcon } from "@/icons";
import classNames from "classnames";
import { useEffect, useState } from "react";

/**
 * CopyButton component that provides copy-to-clipboard functionality.
 * Shows a temporary tooltip when content is copied.
 * 
 * @component
 * @param {Object} props - Component props
 * @param {string} props.text - The text to copy to clipboard when button is clicked
 * @returns {JSX.Element} Button with copy icon and tooltip
 */
export default function CopyButton(props: { text: string }) {
  const [tooltipShown, setTooltipShown] = useState(false);

  useEffect(() => {
    if (tooltipShown) {
      const timeout = setTimeout(() => setTooltipShown(false), 2000);
      return () => clearTimeout(timeout);
    }
  }, [tooltipShown]);

  return (
    <>
      <button
        onClick={() => {
          if (navigator.clipboard) navigator.clipboard.writeText(props.text);
          setTooltipShown(true);
        }}
      >
        <CopyIcon />
      </button>

      <div
        className={classNames({
          "absolute z-10 bg-gray-900 text-white rounded p-2 text-xs transition-all ease-in-out translate-x-60 shadow-sm shadow-gray-500":
            true,
          "translate-y-10 opacity-0": !tooltipShown,
          "translate-y-6": tooltipShown,
        })}
      >
        Copied!
      </div>
    </>
  );
}
