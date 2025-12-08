import { useState, useEffect } from "react";

// Custom Hook to get the SSR-safe boundary dimensions
const SSR_SAFE_BOUNDARY = {
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
};
export type BoundaryType = typeof SSR_SAFE_BOUNDARY;
export function useBoundary() {
  const [boundary, setBoundary] = useState(SSR_SAFE_BOUNDARY);

  useEffect(() => {
    const calculateBoundary = () => {
      setBoundary({
        top: 0,
        left: 0,
        right: window.innerWidth,
        bottom: window.innerHeight,
      });
    };

    calculateBoundary();

    window.addEventListener("resize", calculateBoundary);

    return () => window.removeEventListener("resize", calculateBoundary);
  }, []);

  return boundary;
}
