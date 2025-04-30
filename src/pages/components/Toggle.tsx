import classNames from "classnames";

/**
 * Toggle component that switches between List and JSON view modes.
 * Provides a segmented control with two options.
 * 
 * @component
 * @param {Object} props - Component props
 * @param {boolean} props.checked - Whether the toggle is in JSON mode (true) or List mode (false)
 * @param {Function} props.onChange - Callback function triggered when toggle state changes
 * @param {boolean} props.disabled - Whether the toggle is disabled
 * @returns {JSX.Element} Two-button toggle control
 */
export default function Toggle(props: {
  checked: boolean;
  onChange: () => void;
  disabled: boolean;
}) {
  return (
    <div className="flex items-center justify-end flex-1">
      <button
        disabled={props.disabled}
        onClick={props.onChange}
        className={classNames({
          "rounded-l-lg py-2 px-4 border-solid border border-gray-300 transition text-sm font-semibold":
            true,
          "bg-gray-100": !props.checked,
          "bg-gray-50 text-gray-500 cursor-not-allowed": props.disabled,
        })}
      >
        List
      </button>
      <button
        disabled={props.disabled}
        onClick={props.onChange}
        className={classNames({
          "rounded-r-lg py-2 px-4 border-solid border border-gray-300 -ml-[1px] transition text-sm font-semibold":
            true,
          "bg-gray-100": props.checked,
          "bg-gray-50 text-gray-500 cursor-not-allowed": props.disabled,
        })}
      >
        JSON
      </button>
    </div>
  );
}
