package br.ufs.dcomp.sigeagtt.servicos;

import br.ufs.dcomp.sigeagtt.modelos.Usuario;
import br.ufs.dcomp.sigeagtt.repositorios.UsuarioRepositorio;
import br.ufs.dcomp.sigeagtt.transferencia.LoginRequisicaoDTO;
import br.ufs.dcomp.sigeagtt.transferencia.LoginRespostaDTO;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AutenticacaoServico {

    private final UsuarioRepositorio usuarioRepositorio;

    public AutenticacaoServico(UsuarioRepositorio usuarioRepositorio) {
        this.usuarioRepositorio = usuarioRepositorio;
    }

    @Transactional(readOnly = true)
    public LoginRespostaDTO autenticar(LoginRequisicaoDTO dto) {
        // Consulta o usuário cadastrado no banco relacional
        Usuario usuario = usuarioRepositorio.findByCpf(dto.identificador())
                .orElseThrow(() -> new IllegalArgumentException("Usuário institucional não cadastrado no sistema."));

        if (!Boolean.TRUE.equals(usuario.getAtivo())) {
            throw new IllegalArgumentException("O acesso deste usuário está inativo no SIGEA-GTT.");
        }

        // Simulação/Validação do bind LDAP corporativo
        if (dto.senha().isBlank()) {
            throw new IllegalArgumentException("Credencial institucional inválida.");
        }

        return LoginRespostaDTO.deEntidade(usuario);
    }
}
