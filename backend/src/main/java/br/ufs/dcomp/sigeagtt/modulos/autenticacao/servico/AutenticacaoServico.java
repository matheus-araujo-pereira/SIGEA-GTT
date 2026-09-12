package br.ufs.dcomp.sigeagtt.modulos.autenticacao.servico;

import br.ufs.dcomp.sigeagtt.modulos.autenticacao.dto.LoginRequisicaoDTO;
import br.ufs.dcomp.sigeagtt.modulos.autenticacao.dto.LoginRespostaDTO;
import br.ufs.dcomp.sigeagtt.modulos.autenticacao.dto.PrimeiroAcessoRequisicaoDTO;
import br.ufs.dcomp.sigeagtt.modulos.usuario.modelo.Usuario;
import br.ufs.dcomp.sigeagtt.modulos.usuario.repositorio.UsuarioRepositorio;
import br.ufs.dcomp.sigeagtt.nucleo.seguranca.TokenServico;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.NoSuchElementException;

@Service
public class AutenticacaoServico {

    private final UsuarioRepositorio usuarioRepositorio;
    private final PasswordEncoder passwordEncoder;
    private final TokenServico tokenServico;

    public AutenticacaoServico(
            UsuarioRepositorio usuarioRepositorio,
            PasswordEncoder passwordEncoder,
            TokenServico tokenServico) {
        this.usuarioRepositorio = usuarioRepositorio;
        this.passwordEncoder = passwordEncoder;
        this.tokenServico = tokenServico;
    }

    @Transactional(readOnly = true)
    public LoginRespostaDTO autenticar(LoginRequisicaoDTO dto) {
        String emailLimpo = dto.email() != null ? dto.email().trim().toLowerCase() : "";

        Usuario usuario = usuarioRepositorio.findByEmail(emailLimpo)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Credenciais inválidas: e-mail institucional não localizado."));

        if (!Boolean.TRUE.equals(usuario.getAtivo())) {
            throw new IllegalStateException("A conta deste usuário está inativa no sistema.");
        }

        if (!passwordEncoder.matches(dto.senha(), usuario.getSenha())) {
            throw new IllegalArgumentException("Credenciais inválidas: senha incorreta.");
        }

        String token = tokenServico.gerarToken(usuario);
        return LoginRespostaDTO.deEntidade(usuario, token);
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
        Usuario salvo = usuarioRepositorio.save(usuario);
        String token = tokenServico.gerarToken(salvo);
        return LoginRespostaDTO.deEntidade(salvo, token);
    }
}
