import { HttpInterceptorFn } from '@angular/common/http';

declare global {
  interface Window {
    __SIGEA_API_URL__?: string;
  }
}

export const apiUrlInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith('/api')) return next(req);

  const baseUrl =
    window.__SIGEA_API_URL__ ||
    (typeof window !== 'undefined' && window.location.hostname === 'localhost'
      ? ''
      : 'https://sigea-gtt-backend.onrender.com');

  // Recupera token da sessão no localStorage
  let token: string | null = null;
  try {
    const dados = localStorage.getItem('sigea_sessao');
    if (dados) {
      const usuario = JSON.parse(dados);
      token = usuario?.token || null;
    }
  } catch {
    // Ignora erro de parse de JSON
  }

  const headers = token
    ? req.headers.set('Authorization', `Bearer ${token}`)
    : req.headers;

  return next(
    req.clone({
      url: `${baseUrl}${req.url}`,
      headers,
      withCredentials: true,
    }),
  );
};
