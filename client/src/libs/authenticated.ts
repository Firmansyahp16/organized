export function isAuthenticated() {
  const token = localStorage.getItem("token");
  const expiredAt = localStorage.getItem("expiredAt");
  const now = new Date().getTime();
  return !!token && expiredAt && Number(expiredAt) > now;
}
