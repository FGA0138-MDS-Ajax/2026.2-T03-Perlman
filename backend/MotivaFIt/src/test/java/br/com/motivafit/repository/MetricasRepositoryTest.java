package br.com.motivafit.repository;

import org.junit.jupiter.api.Test;
import org.springframework.data.jpa.repository.Query;

import static org.junit.jupiter.api.Assertions.assertTrue;

class MetricasRepositoryTest {
    @Test
    void consultaDeEvolucaoFechaExpressaoDePaceAntesDaPrecisao() throws NoSuchMethodException {
        Query query = MetricasRepository.class
                .getMethod("evolucao", Long.class, java.time.Instant.class, java.time.Instant.class,
                        Long.class, String.class)
                .getAnnotation(Query.class);

        assertTrue(query.value().contains("else 0 end))),2)"));
    }
}
