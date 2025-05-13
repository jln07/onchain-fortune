import { useState } from "react";
import Head from "next/head";
import confetti from "canvas-confetti";


export default function Home() {
  const [loading, setLoading] = useState(false);
  const [fortune, setFortune] = useState<string | null>(null);
  const [explorerUrl, setExplorerUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function getFortune() {
    setLoading(true);
    setFortune(null);
    setExplorerUrl(null);
    setError(null);

    try {
      const res = await fetch("/api/fortune", { method: "POST" });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Request failed");

      setFortune(data.fortune);
setExplorerUrl(data.explorerUrl);

// 🎉 Fire confetti
confetti({
  particleCount: 150,
  spread: 80,
  origin: { y: 0.6 },
});

setTimeout(() => {
  confetti({
    particleCount: 75,
    spread: 60,
    origin: { y: 0.4 },
  });
}, 400);


    } catch (err: any) {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Head>
        <title>Onchain Fortune</title>
      </Head>
      <div className="stars" />
      <main className="container">
        <h1>🔮 Onchain Fortune Dispenser</h1>
        <p className="subtitle">Tap into the chain and reveal your destiny.</p>
        <button onClick={getFortune} disabled={loading}>
          {loading ? "Dispensing..." : "Get Your Fortune"}
        </button>

        {fortune && (
          <div className="fortune-box">
            <h2>✨ Your Fortune:</h2>
            <p>{fortune}</p>
            <a href={explorerUrl!} target="_blank" rel="noreferrer" className="tx-link">
  View Transaction ↗
</a>

          </div>
        )}

        {error && <p className="error">{error}</p>}
      </main>
    </>
  );
}
