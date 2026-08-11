export function getRequestActor(request: Request) {
  const email = request.headers.get("x-user-email")?.trim();
  const name = request.headers.get("x-user-name")?.trim();
  if (name) return name;
  if (email) return email.toLowerCase();

  const hostname = new URL(request.url).hostname;
  const demoEnabled = process.env.DEMO_MODE === "true" || hostname === "localhost" || hostname === "127.0.0.1";
  if (demoEnabled) return "Usuário de demonstração";
  return null;
}
