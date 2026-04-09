export function SpiralBinding() {
  return (
    <svg width="520" height="36" viewBox="0 0 520 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-[92%] h-9">
      {Array.from({ length: 22 }, (_, index) => {
        const x = 24 + index * 22;

        return (
          <g key={`spiral-${index}`}>
            <path
              d={`M ${x} 8 C ${x - 9} 8 ${x - 9} 28 ${x} 28`}
              stroke="#334155"
              strokeWidth="2.2"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d={`M ${x + 1} 8 C ${x - 7} 8 ${x - 7} 26 ${x + 1} 26`}
              stroke="#94a3b8"
              strokeWidth="1.1"
              strokeLinecap="round"
              fill="none"
              opacity="0.9"
            />
          </g>
        );
      })}
    </svg>
  );
}
