"use client";

import { useEffect } from "react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // лог у консоль/аналітику
    console.error(error);
  }, [error]);

  return (
    <div
      style={{
        padding: 16,
        background: "#ffe6e9",
        border: "1px solid #f3bcc4",
        borderRadius: 8,
        color: "#c1121f",
      }}
    >
      <h3 style={{ marginTop: 0 }}>Something went wrong</h3>
      <p>{error.message}</p>
      <button
        onClick={() => reset()}
        style={{
          padding: "6px 12px",
          borderRadius: 4,
          border: "1px solid #ced4da",
          background: "#f8f9fa",
          cursor: "pointer",
        }}
      >
        Try again
      </button>
    </div>
  );
}
