import { useEffect, useState } from "react";

const COUNT = 14;

export function LanternBackground() {
  const [items, setItems] = useState<Array<{ left: string; dur: string; delay: string; size: string }>>([]);

  useEffect(() => {
    setItems(
      Array.from({ length: COUNT }).map(() => ({
        left: `${Math.random() * 100}%`,
        dur: `${18 + Math.random() * 18}s`,
        delay: `${-Math.random() * 24}s`,
        size: `${6 + Math.random() * 10}px`,
      })),
    );
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
      {items.map((p, i) => (
        <span
          key={i}
          className="lantern-particle"
          style={{
            left: p.left,
            width: p.size,
            height: p.size,
            animationDuration: p.dur,
            animationDelay: p.delay,
          }}
        />
      ))}
    </div>
  );
}
