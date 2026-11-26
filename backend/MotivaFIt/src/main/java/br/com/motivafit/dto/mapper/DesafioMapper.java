package br.com.motivafit.dto.mapper;

import br.com.motivafit.dto.request.DesafioItemRequestDTO;
import br.com.motivafit.dto.response.DesafioItemResponseDTO;
import br.com.motivafit.dto.response.DesafioResponseDTO;
import br.com.motivafit.entity.CatalogoExercicio;
import br.com.motivafit.entity.Desafio;
import br.com.motivafit.entity.DesafioItem;

import java.util.List;
import java.util.Map;

public final class DesafioMapper {

    private DesafioMapper() {
    }

    public static DesafioResponseDTO toResponse(Desafio desafio, List<DesafioItem> itens,
                                                Map<Long, CatalogoExercicio> catalogos, Long usuarioId) {
        return new DesafioResponseDTO(
                desafio.getId(),
                desafio.getTitulo(),
                desafio.getPrazo(),
                desafio.getDescricao(),
                desafio.getVisibilidade(),
                desafio.getEstado(),
                usuarioId.equals(desafio.getCriadorId()),
                itens.stream().map(item -> toItemResponse(item, catalogos.get(item.getCatalogoId()))).toList()
        );
    }

    public static DesafioItem toItemEntity(Long desafioId, DesafioItemRequestDTO dto) {
        DesafioItem item = new DesafioItem();
        item.setDesafioId(desafioId);
        item.setCatalogoId(dto.catalogoId());
        item.setMetaCargaKg(dto.metaCargaKg());
        item.setMetaRepeticoes(dto.metaRepeticoes());
        item.setMetaSeries(dto.metaSeries());
        item.setMetaTempoS(dto.metaTempoS());
        item.setMetaDistanciaM(dto.metaDistanciaM());
        return item;
    }

    private static DesafioItemResponseDTO toItemResponse(DesafioItem item, CatalogoExercicio catalogo) {
        return new DesafioItemResponseDTO(
                item.getId(),
                item.getCatalogoId(),
                catalogo != null ? catalogo.getNome() : null,
                catalogo != null ? catalogo.getModalidade() : null,
                item.getMetaCargaKg(),
                item.getMetaRepeticoes(),
                item.getMetaSeries(),
                item.getMetaTempoS(),
                item.getMetaDistanciaM()
        );
    }
}
