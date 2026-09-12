package br.ufs.dcomp.sigeagtt.modulos.usuario.servico;

import br.ufs.dcomp.sigeagtt.modulos.usuario.dto.AlterarSenhaDTO;
import br.ufs.dcomp.sigeagtt.modulos.usuario.dto.UsuarioEdicaoDTO;
import br.ufs.dcomp.sigeagtt.modulos.usuario.dto.UsuarioRequisicaoDTO;
import br.ufs.dcomp.sigeagtt.modulos.usuario.dto.UsuarioRespostaDTO;
import br.ufs.dcomp.sigeagtt.modulos.usuario.modelo.PerfilUsuario;
import br.ufs.dcomp.sigeagtt.modulos.usuario.modelo.Usuario;
import br.ufs.dcomp.sigeagtt.modulos.usuario.repositorio.UsuarioRepositorio;
import java.util.List;
import java.util.NoSuchElementException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UsuarioServico {

    private final UsuarioRepositorio repositorio;
    private final PasswordEncoder passwordEncoder;

    public UsuarioServico(UsuarioRepositorio repositorio, PasswordEncoder passwordEncoder) {
        this.repositorio = repositorio;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public List<UsuarioRespostaDTO> listarTodos() {
        return repositorio.findAll().stream().map(UsuarioRespostaDTO::deEntidade).toList();
    }

    @Transactional(readOnly = true)
    public UsuarioRespostaDTO buscarPorId(Long id) {
        Usuario usuario =
                repositorio
                        .findById(id)
                        .orElseThrow(
                                () ->
                                        new NoSuchElementException(
                                                "Usuário não encontrado com o ID: " + id));
        return UsuarioRespostaDTO.deEntidade(usuario);
    }

    @Transactional
    public UsuarioRespostaDTO cadastrar(UsuarioRequisicaoDTO dto) {
        String emailLimpo = dto.email() != null ? dto.email().trim().toLowerCase() : "";
        validarDominioEmail(emailLimpo);

        if (repositorio.findByEmail(emailLimpo).isPresent()) {
            throw new IllegalArgumentException(
                    "Já existe um usuário cadastrado com este e-mail institucional.");
        }

        String matriculaLimpa = null;
        if (dto.perfil() == PerfilUsuario.ALUNO) {
            matriculaLimpa =
                    (dto.matriculaSigaa() != null && !dto.matriculaSigaa().isBlank())
                            ? dto.matriculaSigaa().trim()
                            : null;
            if (matriculaLimpa == null || !matriculaLimpa.matches("^\\d{12}$")) {
                throw new IllegalArgumentException(
                        "A Matrícula do SIGAA é obrigatória para discentes e deve conter exatamente 12 dígitos numéricos.");
            }
            if (repositorio.findByMatriculaSigaa(matriculaLimpa).isPresent()) {
                throw new IllegalArgumentException(
                        "Já existe um aluno cadastrado com esta Matrícula do SIGAA.");
            }
        }

        Usuario usuario = new Usuario();
        usuario.setNomeCompleto(dto.nomeCompleto() != null ? dto.nomeCompleto().trim() : "");
        usuario.setEmail(emailLimpo);
        usuario.setSenha(passwordEncoder.encode("Sigea@123"));
        usuario.setPrimeiroAcesso(true);
        usuario.setMatriculaSigaa(matriculaLimpa);
        usuario.setPerfil(dto.perfil());
        usuario.setAtivo(true);

        return UsuarioRespostaDTO.deEntidade(repositorio.save(usuario));
    }

    @Transactional
    public UsuarioRespostaDTO editar(Long id, UsuarioEdicaoDTO dto) {
        Usuario usuario =
                repositorio
                        .findById(id)
                        .orElseThrow(
                                () -> new NoSuchElementException("Usuário não encontrado: " + id));

        String emailLimpo = dto.email() != null ? dto.email().trim().toLowerCase() : "";
        validarDominioEmail(emailLimpo);

        if (repositorio.findByEmailAndIdNot(emailLimpo, id).isPresent()) {
            throw new IllegalArgumentException(
                    "O e-mail informado já está em uso por outro usuário.");
        }

        String matriculaLimpa = null;
        if (dto.perfil() == PerfilUsuario.ALUNO) {
            matriculaLimpa =
                    (dto.matriculaSigaa() != null && !dto.matriculaSigaa().isBlank())
                            ? dto.matriculaSigaa().trim()
                            : null;
            if (matriculaLimpa == null || !matriculaLimpa.matches("^\\d{12}$")) {
                throw new IllegalArgumentException(
                        "A Matrícula do SIGAA é obrigatória para discentes e deve conter exatamente 12 dígitos numéricos.");
            }
            if (repositorio.findByMatriculaSigaaAndIdNot(matriculaLimpa, id).isPresent()) {
                throw new IllegalArgumentException(
                        "Esta Matrícula do SIGAA já pertence a outro discente.");
            }
        }

        if (usuario.getPerfil() == PerfilUsuario.ADMINISTRADOR
                && dto.perfil() != PerfilUsuario.ADMINISTRADOR) {
            long totalAdmins = repositorio.countByPerfilAndAtivoTrue(PerfilUsuario.ADMINISTRADOR);
            if (totalAdmins <= 1) {
                throw new IllegalArgumentException(
                        "Operação cancelada: o sistema precisa manter ao menos um Administrador ativo.");
            }
        }

        usuario.setNomeCompleto(dto.nomeCompleto() != null ? dto.nomeCompleto().trim() : "");
        usuario.setEmail(emailLimpo);
        usuario.setPerfil(dto.perfil());
        usuario.setMatriculaSigaa(matriculaLimpa);

        return UsuarioRespostaDTO.deEntidade(repositorio.save(usuario));
    }

    @Transactional
    public UsuarioRespostaDTO resetarSenha(Long id) {
        Usuario usuario =
                repositorio
                        .findById(id)
                        .orElseThrow(
                                () -> new NoSuchElementException("Usuário não encontrado: " + id));

        usuario.setSenha(passwordEncoder.encode("Sigea@123"));
        usuario.setPrimeiroAcesso(true);
        return UsuarioRespostaDTO.deEntidade(repositorio.save(usuario));
    }

    @Transactional
    public UsuarioRespostaDTO inativar(Long id) {
        Usuario usuario =
                repositorio
                        .findById(id)
                        .orElseThrow(
                                () -> new NoSuchElementException("Usuário não encontrado: " + id));

        if (usuario.getPerfil() == PerfilUsuario.ADMINISTRADOR) {
            long totalAdmins = repositorio.countByPerfilAndAtivoTrue(PerfilUsuario.ADMINISTRADOR);
            if (totalAdmins <= 1) {
                throw new IllegalArgumentException(
                        "Não é permitido inativar o único Administrador ativo do sistema.");
            }
        }

        usuario.setAtivo(false);
        return UsuarioRespostaDTO.deEntidade(repositorio.save(usuario));
    }

    @Transactional
    public UsuarioRespostaDTO reativar(Long id) {
        Usuario usuario =
                repositorio
                        .findById(id)
                        .orElseThrow(
                                () -> new NoSuchElementException("Usuário não encontrado: " + id));
        usuario.setAtivo(true);
        return UsuarioRespostaDTO.deEntidade(repositorio.save(usuario));
    }

    @Transactional
    public UsuarioRespostaDTO alterarSenha(Long id, AlterarSenhaDTO dto) {
        Usuario usuario =
                repositorio
                        .findById(id)
                        .orElseThrow(
                                () -> new NoSuchElementException("Usuário não encontrado: " + id));

        if (!passwordEncoder.matches(dto.senhaAtual(), usuario.getSenha())) {
            throw new IllegalArgumentException("A senha atual informada está incorreta.");
        }

        if (!dto.novaSenha().equals(dto.confirmacaoNovaSenha())) {
            throw new IllegalArgumentException("A confirmação da nova senha não confere.");
        }

        if (passwordEncoder.matches(dto.novaSenha(), usuario.getSenha())) {
            throw new IllegalArgumentException("A nova senha deve ser diferente da senha atual.");
        }

        usuario.setSenha(passwordEncoder.encode(dto.novaSenha()));
        usuario.setPrimeiroAcesso(false);
        return UsuarioRespostaDTO.deEntidade(repositorio.save(usuario));
    }

    private void validarDominioEmail(String email) {
        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("O e-mail institucional é obrigatório.");
        }
        String emailLower = email.trim().toLowerCase();
        if (!emailLower.matches("^[a-z0-9._%+-]+@academico\\.ufs\\.br$")) {
            throw new IllegalArgumentException(
                    "O e-mail deve pertencer obrigatoriamente ao domínio @academico.ufs.br");
        }
    }
}
