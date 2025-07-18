export default async function fetchWithAuth(
  input: RequestInfo,
  init?: RequestInit
) {
  const res = await fetch(input, init);
  if (res.status === 401) {
    window.dispatchEvent(new Event("session-expired"));
    throw new Error("Session expired");
  }
  return res;
}
