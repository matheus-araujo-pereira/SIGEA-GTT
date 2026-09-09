package br.ufs.dcomp.sigeagtt.configuracoes;

import br.ufs.dcomp.sigeagtt.servicos.TokenServico;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class FiltroAutenticacaoToken extends OncePerRequestFilter {

    private final TokenServico tokenServico;

    public FiltroAutenticacaoToken(TokenServico tokenServico) {
        this.tokenServico = tokenServico;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {

        String cabecalhoAuth = request.getHeader("Authorization");

        if (cabecalhoAuth != null && cabecalhoAuth.startsWith("Bearer ")) {
            String token = cabecalhoAuth.substring(7).trim();
            TokenServico.DadosToken dados = tokenServico.validarToken(token);

            if (dados != null) {
                UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                        dados.email(),
                        null,
                        List.of(new SimpleGrantedAuthority("ROLE_" + dados.perfil())));
                SecurityContext context = SecurityContextHolder.createEmptyContext();
                context.setAuthentication(auth);
                SecurityContextHolder.setContext(context);
            }
        }

        filterChain.doFilter(request, response);
    }
}
