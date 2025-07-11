export function Loading({}) {
  return (
    <div className="flex justify-center items-center h-screen w-full">
      <div className="flex flex-col items-center gap-2">
        <div
          className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin"
          style={{
            animation: "spin 1s linear infinite, colorCycle 2s linear infinite",
          }}
        />
        <span className="text-sm text-gray-600">Waiting...</span>
      </div>

      <style>
        {`
      @keyframes colorCycle {
        0%   { border-color: var(--fallback-p, #570df8); }
        25%  { border-color: var(--fallback-s, #f000b8); }
        50%  { border-color: var(--fallback-a, #37cdbe); }
        75%  { border-color: var(--fallback-n, #3d4451); }
        100% { border-color: var(--fallback-p, #570df8); }
      }
    `}
      </style>
    </div>
  );
}
