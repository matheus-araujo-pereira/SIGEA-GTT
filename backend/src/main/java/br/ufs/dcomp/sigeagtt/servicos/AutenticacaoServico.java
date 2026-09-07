package br.ufs.dcomp.sigeagtt.servicos;

import br.ufs.dcomp.sigeagtt.modelos.Usuario;
import br.ufs.dcomp.sigeagtt.repositorios.UsuarioRepositorio;
import br.ufs.dcomp.sigeagtt.transferencia.LoginRequisicaoDTO;
import br.ufs.dcomp.sigeagtt.transferencia.LoginRespostaDTO;
import br.ufs.dcomp.sigeagtt.transferencia.PrimeiroAcessoRequisicaoDTO;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.NoSuchElementException;

@Service
public class AutenticacaoServico {

    private final UsuarioRepositorio usuarioRepositorio;
    private final PasswordEncoder passwordEncoder;

    public AutenticacaoServico(UsuarioRepositorio usuarioRepositorio, PasswordEncoder passwordEncoder) {
        this.usuarioRepositorio = usuarioRepositorio;
        this.passwordEncoder = passwordEncoder;
    }

    @Bean
    public CommandLineRunner inicializarSenhaPadrao() {
        return args -> {
            usuarioRepositorio.findAll().forEach(u -> {
                if (u.getSenha() == null || u.getSenha().length() < 30 || u.getSenha().contains("Sigea.")) {
                    u.setSenha(passwordEncoder.encode("Sigea@123"));
                    u.setPrimeiroAcesso(true);
                    usuarioRepositorio.save(u);
                }
            });
        };
    }

    @Transactional(readOnly = true)
    public LoginRespostaDTO autenticar(LoginRequisicaoDTO dto) {
        String loginLimpo = dto.identificador() != null ? dto.identificador().trim() : "";

        Usuario usuario = (loginLimpo.contains("@")
                ? usuarioRepositorio.findByEmail(loginLimpo.toLowerCase())
                : usuarioRepositorio.findByCpf(loginLimpo.replaceAll("\\D", "")))
                .orElseThrow(() -> new IllegalArgumentException("Credenciais inválidas: usuário não encontrado."));

        if (!Boolean.TRUE.equals(usuario.getAtivo())) {
            throw new IllegalStateException("A conta deste usuário está inativa no sistema.");
        }

        if (!passwordEncoder.matches(dto.senha(), usuario.getSenha())) {
            throw new IllegalArgumentException("Credenciais inválidas: senha incorreta.");
        }

        return LoginRespostaDTO.deEntidade(usuario);
    }

    @Transactional
    public LoginRespostaDTO redefinirSenhaPrimeiroAcesso(PrimeiroAcessoRequisicaoDTO dto) {
        Usuario usuario = usuarioRepositorio.findById(dto.usuarioId())
                .orElseThrow(() -> new NoSuchElementException("Usuário não encontrado: " + dto.usuarioId()));

        if (!passwordEncoder.matches(dto.senhaAtual(), usuario.getSenha())) {
            throw new IllegalArgumentException("A senha temporária atual informada está incorreta.");
        }

        if (!dto.novaSenha().equals(dto.confirmacaoNovaSenha())) {
            throw new IllegalArgumentException("A nova senha e a confirmação não coincidem.");
        }

        if (passwordEncoder.matches(dto.novaSenha(), usuario.getSenha())) {
            throw new IllegalArgumentException("A nova senha não pode ser idêntica à senha temporária.");
        }

        usuario.setSenha(passwordEncoder.encode(dto.novaSenha()));
        usuario.setPrimeiroAcesso(false);
        return LoginRespostaDTO.deEntidade(usuarioRepositorio.save(usuario));
    }
}
