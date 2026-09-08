import { HttpInterceptorFn } from '@angular/common/http';

declare global {
  interface Window {
    __SIGEA_API_URL__?: string;
  }
}

export const apiUrlInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith('/api')) return next(req);

  const baseUrl = window.__SIGEA_API_URL__ || '';
  return next(
    req.clone({
      url: `${baseUrl}${req.url}`,
      withCredentials: true,
    }),
  );
};
