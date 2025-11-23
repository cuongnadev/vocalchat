function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}

export function isLoggedIn() {
  const token =
    localStorage.getItem('token') ||
    sessionStorage.getItem('token') ||
    getCookie('token');

  if (!token) return false;

  const expiry =
    localStorage.getItem('token_expiry') ||
    sessionStorage.getItem('token_expiry');

  if (expiry && Date.now() > Number(expiry)) {
    logout();
    return false;
  }

  return true;
}

export function saveAuth(
  token: string,
  remember: boolean = true,
  expiresInHours = 24
): void {
  const expiry = Date.now() + expiresInHours * 60 * 60 * 1000;

  if (remember) {
    localStorage.setItem('token', token);
    localStorage.setItem('token_expiry', expiry.toString());
  } else {
    sessionStorage.setItem('token', token);
    sessionStorage.setItem('token_expiry', expiry.toString());
  }

  document.cookie = `token=${encodeURIComponent(token)}; path=/; max-age=${expiresInHours * 3600
    }; secure; samesite=strict`;
}

export function logout(): void {
  localStorage.removeItem('token');
  localStorage.removeItem('token_expiry');
  sessionStorage.removeItem('token');
  sessionStorage.removeItem('token_expiry');

  document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
}

export function getToken(): string | null {
  const localToken = localStorage.getItem("token");
  const sessionToken = sessionStorage.getItem("token");

  if (localToken) return localToken;
  if (sessionToken) return sessionToken;

  const match = document.cookie.match(/(^| )token=([^;]+)/);
  return match ? decodeURIComponent(match[2]) : null;
}