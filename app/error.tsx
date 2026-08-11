"use client";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return <main className="route-state"><div><h1>Não foi possível abrir o Prioris</h1><p>Os dados continuam protegidos. Tente carregar o painel novamente.</p><button className="primary" onClick={reset}>Tentar novamente</button></div></main>;
}
