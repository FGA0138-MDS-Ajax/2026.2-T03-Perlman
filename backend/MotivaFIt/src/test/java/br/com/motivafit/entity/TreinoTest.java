package br.com.motivafit.entity;

import br.com.motivafit.enums.TipoTreino;
import br.com.motivafit.enums.Visibilidade;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.OffsetDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class TreinoTest {

    @Test
    void treinoNovoNaoTemIdNemDatas() {
        Treino treino = new Treino();

        assertNull(treino.getId());
        assertNull(treino.getUsuarioId());
        assertNull(treino.getNome());
        assertNull(treino.getTipo());
        assertNull(treino.getVisibilidade());
        assertNull(treino.getExcluidoEm());
        assertNull(treino.getCreatedAt());
        assertNull(treino.getUpdatedAt());
    }

    @Test
    void gettersESettersGuardamOsValores() {
        Treino treino = new Treino();
        OffsetDateTime agora = OffsetDateTime.now();

        treino.setUsuarioId(7L);
        treino.setNome("Treino A");
        treino.setTipo(TipoTreino.AEROBICO);
        treino.setVisibilidade(Visibilidade.PUBLICO);
        treino.setExcluidoEm(agora);
        ReflectionTestUtils.setField(treino, "id", 10L);
        ReflectionTestUtils.setField(treino, "createdAt", agora);
        ReflectionTestUtils.setField(treino, "updatedAt", agora);

        assertEquals(10L, treino.getId());
        assertEquals(7L, treino.getUsuarioId());
        assertEquals("Treino A", treino.getNome());
        assertEquals(TipoTreino.AEROBICO, treino.getTipo());
        assertEquals(Visibilidade.PUBLICO, treino.getVisibilidade());
        assertSame(agora, treino.getExcluidoEm());
        assertSame(agora, treino.getCreatedAt());
        assertSame(agora, treino.getUpdatedAt());
    }

    @Test
    void enumsTemExatamenteOsValoresPermitidosPelaMigration() {
        assertEquals(List.of("MUSCULACAO", "AEROBICO"),
                List.of(TipoTreino.values()).stream().map(Enum::name).toList());
        assertEquals(List.of("PRIVADO", "PUBLICO"),
                List.of(Visibilidade.values()).stream().map(Enum::name).toList());
    }
}