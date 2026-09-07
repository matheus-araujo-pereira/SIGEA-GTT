package br.ufs.dcomp.sigeagtt.servicos;

import br.ufs.dcomp.sigeagtt.modelos.PerfilUsuario;
import br.ufs.dcomp.sigeagtt.modelos.Usuario;
import br.ufs.dcomp.sigeagtt.repositorios.UsuarioRepositorio;
import br.ufs.dcomp.sigeagtt.transferencia.UsuarioEdicaoDTO;
import br.ufs.dcomp.sigeagtt.transferencia.UsuarioRequisicaoDTO;
import br.ufs.dcomp.sigeagtt.transferencia.UsuarioRespostaDTO;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

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
        Usuario usuario = repositorio.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado com o ID: " + id));
        return UsuarioRespostaDTO.deEntidade(usuario);
    }

    @Transactional
    public UsuarioRespostaDTO cadastrar(UsuarioRequisicaoDTO dto) {
        String cpfLimpo = dto.cpf() != null ? dto.cpf().replaceAll("\\D", "") : "";
        String emailLimpo = dto.email() != null ? dto.email().trim().toLowerCase() : "";
        String matriculaLimpa = (dto.matriculaSigaa() != null && !dto.matriculaSigaa().isBlank())
                ? dto.matriculaSigaa().trim()
                : null;

        if (repositorio.findByCpf(cpfLimpo).isPresent()) {
            throw new IllegalArgumentException("Já existe um usuário cadastrado com o CPF informado.");
        }
        if (repositorio.findByEmail(emailLimpo).isPresent()) {
            throw new IllegalArgumentException("Já existe um usuário cadastrado com este e-mail.");
        }
        if (dto.perfil() == PerfilUsuario.ALUNO) {
            if (matriculaLimpa == null) {
                throw new IllegalArgumentException("A Matrícula do SIGAA é obrigatória para o perfil ALUNO.");
            }
            if (repositorio.findByMatriculaSigaa(matriculaLimpa).isPresent()) {
                throw new IllegalArgumentException("Já existe um aluno cadastrado com esta Matrícula do SIGAA.");
            }
        }

        Usuario usuario = new Usuario();
        usuario.setNomeCompleto(dto.nomeCompleto() != null ? dto.nomeCompleto().trim() : "");
        usuario.setCpf(cpfLimpo);
        usuario.setEmail(emailLimpo);
        usuario.setSenha(passwordEncoder.encode("Sigea@123"));
        usuario.setPrimeiroAcesso(true);
        usuario.setCargo(dto.cargo() != null ? dto.cargo().trim() : null);
        usuario.setMatriculaSigaa(dto.perfil() == PerfilUsuario.ALUNO ? matriculaLimpa : null);
        usuario.setPerfil(dto.perfil());
        usuario.setAtivo(true);

        return UsuarioRespostaDTO.deEntidade(repositorio.save(usuario));
    }

    @Transactional
    public UsuarioRespostaDTO editar(Long id, UsuarioEdicaoDTO dto) {
        Usuario usuario = repositorio.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado: " + id));

        String cpfLimpo = dto.cpf() != null ? dto.cpf().replaceAll("\\D", "") : "";
        String emailLimpo = dto.email() != null ? dto.email().trim().toLowerCase() : "";
        String matriculaLimpa = (dto.matriculaSigaa() != null && !dto.matriculaSigaa().isBlank())
                ? dto.matriculaSigaa().trim()
                : null;

        if (repositorio.findByCpfAndIdNot(cpfLimpo, id).isPresent()) {
            throw new IllegalArgumentException("O CPF informado já está em uso por outro usuário.");
        }
        if (repositorio.findByEmailAndIdNot(emailLimpo, id).isPresent()) {
            throw new IllegalArgumentException("O e-mail informado já está em uso por outro usuário.");
        }

        if (dto.perfil() == PerfilUsuario.ALUNO) {
            if (matriculaLimpa == null) {
                throw new IllegalArgumentException("A Matrícula do SIGAA é obrigatória para o perfil ALUNO.");
            }
            if (repositorio.findByMatriculaSigaaAndIdNot(matriculaLimpa, id).isPresent()) {
                throw new IllegalArgumentException("Esta Matrícula do SIGAA já pertence a outro aluno.");
            }
        }

        if (usuario.getPerfil() == PerfilUsuario.ADMINISTRADOR && dto.perfil() != PerfilUsuario.ADMINISTRADOR) {
            long totalAdmins = repositorio.countByPerfilAndAtivoTrue(PerfilUsuario.ADMINISTRADOR);
            if (totalAdmins <= 1) {
                throw new IllegalArgumentException("Operação cancelada: o sistema precisa manter ao menos um Administrador ativo.");
            }
        }

        usuario.setNomeCompleto(dto.nomeCompleto() != null ? dto.nomeCompleto().trim() : "");
        usuario.setCpf(cpfLimpo);
        usuario.setEmail(emailLimpo);
        usuario.setCargo(dto.cargo() != null ? dto.cargo().trim() : null);
        usuario.setPerfil(dto.perfil());
        usuario.setMatriculaSigaa(dto.perfil() == PerfilUsuario.ALUNO ? matriculaLimpa : null);

        return UsuarioRespostaDTO.deEntidade(repositorio.save(usuario));
    }

    @Transactional
    public UsuarioRespostaDTO resetarSenha(Long id) {
        Usuario usuario = repositorio.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado: " + id));

        usuario.setSenha(passwordEncoder.encode("Sigea@123"));
        usuario.setPrimeiroAcesso(true);
        return UsuarioRespostaDTO.deEntidade(repositorio.save(usuario));
    }

    @Transactional
    public UsuarioRespostaDTO inativar(Long id) {
        Usuario usuario = repositorio.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado: " + id));

        if (usuario.getPerfil() == PerfilUsuario.ADMINISTRADOR) {
            long totalAdmins = repositorio.countByPerfilAndAtivoTrue(PerfilUsuario.ADMINISTRADOR);
            if (totalAdmins <= 1) {
                throw new IllegalArgumentException("Não é permitido inativar o único Administrador ativo do sistema.");
            }
        }

        usuario.setAtivo(false);
        return UsuarioRespostaDTO.deEntidade(repositorio.save(usuario));
    }

    @Transactional
    public UsuarioRespostaDTO reativar(Long id) {
        Usuario usuario = repositorio.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado: " + id));
        usuario.setAtivo(true);
        return UsuarioRespostaDTO.deEntidade(repositorio.save(usuario));
    }
}
