import Link from "next/link";

export default function SmokeFilterPage() {
  return (
    <div style={{ padding: 24 }}>
      <h2>Smoke test (open modal via intercept)</h2>
      <ul style={{ marginTop: 12, display: "grid", gap: 8 }}>
        <li>
          <Link href="/notes/test-123" scroll={false}>
            Open note test-123 (should be a MODAL)
          </Link>
        </li>
        <li>
          <Link href="/notes/xyz-456" scroll={false}>
            Open note xyz-456 (should be a MODAL)
          </Link>
        </li>
      </ul>
    </div>
  );
}
