package br.com.motivafit.dto.mapper;

import br.com.motivafit.dto.request.RegistroDiarioRequestDTO;
import br.com.motivafit.dto.response.RegistroDiarioResponseDTO;
import br.com.motivafit.entity.RegistroDiario;

import java.time.OffsetDateTime;

public final class RegistroDiarioMapper {

    private RegistroDiarioMapper() {
    }

    public static RegistroDiarioResponseDTO toDto(RegistroDiario registro) {
        return new RegistroDiarioResponseDTO(
                registro.getId(),
                registro.getCatalogoId(),
                registro.getTreinoId(),
                registro.getExercicioId(),
                registro.getTreinoNome(),
                registro.getExercicioNome(),
                registro.getCargaKg(),
                registro.getRepeticoes(),
                registro.getSeries(),
                registro.getTempoS(),
                registro.getDistanciaM(),
                registro.getExecutadoEm()
        );
    }

    public static RegistroDiario toEntity(RegistroDiarioRequestDTO dto, Long usuarioId) {
        RegistroDiario registro = new RegistroDiario();
        registro.setUsuarioId(usuarioId);
        registro.setCatalogoId(dto.catalogoId());
        registro.setTreinoId(dto.treinoId());
        registro.setExercicioId(dto.exercicioId());
        registro.setCargaKg(dto.cargaKg());
        registro.setRepeticoes(dto.repeticoes());
        registro.setSeries(dto.series());
        registro.setTempoS(dto.tempoS());
        registro.setDistanciaM(dto.distanciaM());
        registro.setExecutadoEm(dto.executadoEm() != null ? dto.executadoEm() : OffsetDateTime.now());
        return registro;
    }
}