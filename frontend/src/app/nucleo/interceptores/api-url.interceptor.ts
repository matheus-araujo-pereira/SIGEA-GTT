import { HttpInterceptorFn } from '@angular/common/http';

export const apiUrlInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith('/api')) return next(req);

  // A Opção Nuclear: Chumbando a URL direto no Typescript para forçar um novo Hash de build
  const baseUrl = 'https://sigea-gtt-backend.onrender.com';

  return next(
    req.clone({
      url: `${baseUrl}${req.url}`,
      withCredentials: true,
    }),
  );
};
