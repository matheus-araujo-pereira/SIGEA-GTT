package br.ufs.dcomp.sigeagtt.excecoes;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.NoSuchElementException;

@RestControllerAdvice
public class ManipuladorExcecoesGlobal {

    private Map<String, Object> construirCorpo(HttpStatus status, String erro, String mensagem, Map<String, String> campos) {
        Map<String, Object> corpo = new HashMap<>();
        corpo.put("timestamp", LocalDateTime.now());
        corpo.put("status", status.value());
        corpo.put("erro", erro);
        corpo.put("mensagem", mensagem);
        if (campos != null && !campos.isEmpty()) {
            corpo.put("campos", campos);
        }
        return corpo;
    }

    @ExceptionHandler({IllegalArgumentException.class, IllegalStateException.class})
    public ResponseEntity<Map<String, Object>> tratarRegraDeNegocio(RuntimeException ex) {
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(construirCorpo(HttpStatus.BAD_REQUEST, "Regra de negócio violada", ex.getMessage(), null));
    }

    @ExceptionHandler(NoSuchElementException.class)
    public ResponseEntity<Map<String, Object>> tratarNaoEncontrado(NoSuchElementException ex) {
        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(construirCorpo(HttpStatus.NOT_FOUND, "Recurso não encontrado", ex.getMessage(), null));
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, Object>> tratarIntegridadeDados(DataIntegrityViolationException ex) {
        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(construirCorpo(HttpStatus.CONFLICT, "Conflito de integridade de dados",
                        "Registro duplicado ou operação viola integridade referencial.", null));
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<Map<String, Object>> tratarMensagemIlegivel(HttpMessageNotReadableException ex) {
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(construirCorpo(HttpStatus.BAD_REQUEST, "Requisição mal formatada",
                        "Corpo da requisição ausente ou dados com tipos/valores inválidos.", null));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> tratarValidacoesCampos(MethodArgumentNotValidException ex) {
        Map<String, String> camposInvalidos = new HashMap<>();
        for (FieldError erro : ex.getBindingResult().getFieldErrors()) {
            camposInvalidos.put(erro.getField(), erro.getDefaultMessage());
        }

        String mensagemConsolidada = String.join("; ", camposInvalidos.values());
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(construirCorpo(HttpStatus.BAD_REQUEST, "Falha de validação nos dados enviados",
                        mensagemConsolidada, camposInvalidos));
    }
}
