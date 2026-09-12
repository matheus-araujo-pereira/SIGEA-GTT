package br.ufs.dcomp.sigeagtt.servicos;

import br.ufs.dcomp.sigeagtt.modelos.Usuario;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.node.ObjectNode;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Base64;

@Service
public class TokenServico {

    private final String segredo;
    private final ObjectMapper objectMapper;
    private static final long TEMPO_EXPIRACAO_SEGUNDOS = 86400L * 7L; // 7 dias
    private static final String HEADER_JSON = "{\"alg\":\"HS256\",\"typ\":\"JWT\"}";
    private static final String HEADER_BASE64 = Base64.getUrlEncoder().withoutPadding()
            .encodeToString(HEADER_JSON.getBytes(StandardCharsets.UTF_8));

    public TokenServico(
            @Value("${app.jwt-secret:sigea-gtt-super-secret-key-change-in-production-2026!#*}") String segredo,
            ObjectMapper objectMapper) {
        this.segredo = segredo;
        this.objectMapper = objectMapper;
    }

    public String gerarToken(Usuario usuario) {
        try {
            long agora = System.currentTimeMillis() / 1000L;
            long expiraEm = agora + TEMPO_EXPIRACAO_SEGUNDOS;

            ObjectNode payload = objectMapper.createObjectNode();
            payload.put("sub", usuario.getEmail());
            payload.put("id", usuario.getId());
            payload.put("perfil", usuario.getPerfil().name());
            payload.put("iat", agora);
            payload.put("exp", expiraEm);

            byte[] payloadBytes = objectMapper.writeValueAsBytes(payload);
            String payloadBase64 = base64UrlEncode(payloadBytes);
            String conteudo = HEADER_BASE64 + "." + payloadBase64;
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

            // Verificação em tempo constante contra timing attacks
            if (!MessageDigest.isEqual(
                    assinaturaEsperada.getBytes(StandardCharsets.UTF_8),
                    partes[2].getBytes(StandardCharsets.UTF_8))) {
                return null;
            }

            byte[] payloadBytes = Base64.getUrlDecoder().decode(partes[1]);
            JsonNode payload = objectMapper.readTree(payloadBytes);

            if (!payload.hasNonNull("exp")) {
                return null;
            }
            long exp = payload.get("exp").asLong();
            long agora = System.currentTimeMillis() / 1000L;
            if (agora > exp) {
                return null; // Token expirado
            }

            String email = payload.hasNonNull("sub") ? payload.get("sub").asString() : null;
            String perfil = payload.hasNonNull("perfil") ? payload.get("perfil").asString() : null;
            Long id = payload.hasNonNull("id") ? payload.get("id").asLong() : null;

            if (email == null || perfil == null) {
                return null;
            }

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

    public record DadosToken(Long id, String email, String perfil) {
    }
}
