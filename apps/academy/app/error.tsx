"use client";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) { return <main className="academy-not-found"><div className="academy-kicker">Something went wrong</div><h1>The Academy page could not load.</h1><button className="academy-button academy-button-primary" onClick={() => reset()}>Try again</button></main>; }
