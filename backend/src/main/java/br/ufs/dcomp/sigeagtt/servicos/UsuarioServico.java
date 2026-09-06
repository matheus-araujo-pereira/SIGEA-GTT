package br.ufs.dcomp.sigeagtt.servicos;

import br.ufs.dcomp.sigeagtt.modelos.PerfilUsuario;
import br.ufs.dcomp.sigeagtt.modelos.Usuario;
import br.ufs.dcomp.sigeagtt.repositorios.UsuarioRepositorio;
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
        if (repositorio.findByCpf(dto.cpf()).isPresent()) {
            throw new IllegalArgumentException("Já existe um usuário cadastrado com o CPF informado.");
        }
        if (repositorio.findByEmail(dto.email()).isPresent()) {
            throw new IllegalArgumentException("Já existe um usuário cadastrado com este e-mail.");
        }
        if (dto.perfil() == PerfilUsuario.ALUNO) {
            if (dto.matriculaSigaa() == null || dto.matriculaSigaa().isBlank()) {
                throw new IllegalArgumentException("A Matrícula do SIGAA é obrigatória para o perfil ALUNO.");
            }
            if (repositorio.findByMatriculaSigaa(dto.matriculaSigaa()).isPresent()) {
                throw new IllegalArgumentException("Já existe um aluno cadastrado com esta Matrícula do SIGAA.");
            }
        }

        Usuario usuario = new Usuario();
        usuario.setNomeCompleto(dto.nomeCompleto());
        usuario.setCpf(dto.cpf());
        usuario.setEmail(dto.email());
        // Senha padrão de ativação cadastral: Sigea@123
        usuario.setSenha(passwordEncoder.encode("Sigea@123"));
        usuario.setPrimeiroAcesso(true);
        usuario.setCargo(dto.cargo());
        usuario.setMatriculaSigaa(dto.perfil() == PerfilUsuario.ALUNO ? dto.matriculaSigaa() : null);
        usuario.setPerfil(dto.perfil());
        usuario.setAtivo(true);

        return UsuarioRespostaDTO.deEntidade(repositorio.save(usuario));
    }

    @Transactional
    public UsuarioRespostaDTO inativar(Long id) {
        Usuario usuario = repositorio.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado: " + id));
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
