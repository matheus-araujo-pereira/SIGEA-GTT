package br.ufs.dcomp.sigeagtt.transferencia;

import jakarta.validation.constraints.NotNull;
import java.util.List;

public record SubmeterConsensoDTO(
    @NotNull(message = "A lista de itens de consenso é obrigatória")
    List<ItemConsensoDTO> itens,

    Boolean submeterFinal
) {}
