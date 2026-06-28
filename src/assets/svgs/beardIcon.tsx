export function HaircutIcon({
  className,
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="6" cy="7" r="2" />
      <circle cx="6" cy="17" r="2" />

      <path d="M8 8.5L19 4" />
      <path d="M8 15.5L19 20" />

      <path d="M8 8.5L13 12" />
      <path d="M8 15.5L13 12" />
    </svg>
  );
}