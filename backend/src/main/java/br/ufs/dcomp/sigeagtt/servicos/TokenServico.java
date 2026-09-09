package br.ufs.dcomp.sigeagtt.servicos;

import br.ufs.dcomp.sigeagtt.modelos.Usuario;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Base64;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class TokenServico {

    private final String segredo;
    private static final long TEMPO_EXPIRACAO_SEGUNDOS = 86400L * 7L; // 7 dias

    private static final Pattern PATTERN_SUB = Pattern.compile("\"sub\"\\s*:\\s*\"([^\"]+)\"");
    private static final Pattern PATTERN_ID = Pattern.compile("\"id\"\\s*:\\s*(\\d+)");
    private static final Pattern PATTERN_PERFIL = Pattern.compile("\"perfil\"\\s*:\\s*\"([^\"]+)\"");
    private static final Pattern PATTERN_EXP = Pattern.compile("\"exp\"\\s*:\\s*(\\d+)");

    public TokenServico(
            @Value("${app.jwt-secret:sigea-gtt-super-secret-key-change-in-production-2026!#*}") String segredo) {
        this.segredo = segredo;
    }

    public String gerarToken(Usuario usuario) {
        try {
            long agora = System.currentTimeMillis() / 1000L;
            long expiraEm = agora + TEMPO_EXPIRACAO_SEGUNDOS;

            String headerJson = "{\"alg\":\"HS256\",\"typ\":\"JWT\"}";
            String payloadJson = String.format(
                    "{\"sub\":\"%s\",\"id\":%d,\"perfil\":\"%s\",\"iat\":%d,\"exp\":%d}",
                    escapeJson(usuario.getEmail()),
                    usuario.getId(),
                    usuario.getPerfil().name(),
                    agora,
                    expiraEm);

            String headerBase64 = base64UrlEncode(headerJson.getBytes(StandardCharsets.UTF_8));
            String payloadBase64 = base64UrlEncode(payloadJson.getBytes(StandardCharsets.UTF_8));
            String conteudo = headerBase64 + "." + payloadBase64;
            String assinatura = assinarHmacSha256(conteudo);

            return conteudo + "." + assinatura;
        } catch (Exception e) {
            throw new RuntimeException("Erro ao gerar token de autenticação.", e);
        }
    }

    public DadosToken validarToken(String token) {
        try {
            if (token == null || token.isBlank()) {
                return null;
            }
            String[] partes = token.split("\\.");
            if (partes.length != 3) {
                return null;
            }

            String conteudo = partes[0] + "." + partes[1];
            String assinaturaEsperada = assinarHmacSha256(conteudo);

            if (!MessageDigest.isEqual(
                    assinaturaEsperada.getBytes(StandardCharsets.UTF_8),
                    partes[2].getBytes(StandardCharsets.UTF_8))) {
                return null;
            }

            byte[] payloadBytes = Base64.getUrlDecoder().decode(partes[1]);
            String payloadJson = new String(payloadBytes, StandardCharsets.UTF_8);

            Matcher matcherExp = PATTERN_EXP.matcher(payloadJson);
            if (!matcherExp.find()) {
                return null;
            }
            long exp = Long.parseLong(matcherExp.group(1));
            long agora = System.currentTimeMillis() / 1000L;
            if (agora > exp) {
                return null; // Token expirado
            }

            Matcher matcherSub = PATTERN_SUB.matcher(payloadJson);
            if (!matcherSub.find()) {
                return null;
            }
            String email = matcherSub.group(1);

            Matcher matcherPerfil = PATTERN_PERFIL.matcher(payloadJson);
            if (!matcherPerfil.find()) {
                return null;
            }
            String perfil = matcherPerfil.group(1);

            Matcher matcherId = PATTERN_ID.matcher(payloadJson);
            Long id = matcherId.find() ? Long.parseLong(matcherId.group(1)) : null;

            return new DadosToken(id, email, perfil);
        } catch (Exception e) {
            return null;
        }
    }

    private String assinarHmacSha256(String conteudo) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        SecretKeySpec secretKey = new SecretKeySpec(segredo.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
        mac.init(secretKey);
        byte[] hmacBytes = mac.doFinal(conteudo.getBytes(StandardCharsets.UTF_8));
        return base64UrlEncode(hmacBytes);
    }

    private String base64UrlEncode(byte[] bytes) {
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private String escapeJson(String texto) {
        if (texto == null)
            return "";
        return texto.replace("\\", "\\\\").replace("\"", "\\\"");
    }

    public record DadosToken(Long id, String email, String perfil) {
    }
}
