import { HttpInterceptorFn } from '@angular/common/http';

declare global {
  interface Window {
    __SIGEA_API_URL__?: string;
  }
}

export const apiUrlInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith('/api')) return next(req);

  let baseUrl = 'https://sigea-gtt-backend.onrender.com';

  if (typeof window !== 'undefined') {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      baseUrl = '';
    } else if (window.__SIGEA_API_URL__) {
      const urlConfigurada = window.__SIGEA_API_URL__.trim();
      // Se a URL contém apenas o nome interno (ex: https://sigea-gtt-backend), completa com .onrender.com
      if (urlConfigurada.includes('sigea-gtt-backend') && !urlConfigurada.includes('.onrender.com')) {
        baseUrl = 'https://sigea-gtt-backend.onrender.com';
      } else if (urlConfigurada.includes('.')) {
        baseUrl = urlConfigurada;
      }
    }
  }

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
