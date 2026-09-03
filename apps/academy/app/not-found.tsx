import Link from "next/link";

export default function NotFound() { return <main className="academy-not-found"><div className="academy-kicker">404</div><h1>That programme is not here.</h1><p>Return to the Academy programme catalogue to explore the available training paths.</p><Link href="/programmes" className="academy-button academy-button-primary">View Programmes</Link></main>; }
