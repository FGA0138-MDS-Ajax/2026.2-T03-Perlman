package br.com.motivafit.entity;

import br.com.motivafit.enums.Estado;
import br.com.motivafit.exception.ConflitoException;
import br.com.motivafit.exception.RequisicaoInvalidaException;
import org.junit.jupiter.api.Test;

import java.time.Instant;

import static org.junit.jupiter.api.Assertions.*;

class ConviteAdminTest {
    @Test
    void aceitaConvitePendenteDentroDoPrazoComEmailIgnorandoCaixa() {
        ConviteAdmin convite = convite(Instant.now().plusSeconds(300));

        convite.aceitar("USUARIO@EXEMPLO.COM", Instant.now());

        assertEquals(Estado.ACEITO, convite.getEstado());
    }

    @Test
    void expiraConviteQuandoPrazoTerminou() {
        ConviteAdmin convite = convite(Instant.now().minusSeconds(1));

        ConflitoException erro = assertThrows(ConflitoException.class,
                () -> convite.aceitar("usuario@exemplo.com", Instant.now()));

        assertEquals("CONVITE_EXPIRADO", erro.getCodigo());
        assertEquals(Estado.EXPIRADO, convite.getEstado());
    }

    @Test
    void rejeitaEmailDiferenteSemAceitar() {
        ConviteAdmin convite = convite(Instant.now().plusSeconds(300));

        assertThrows(RequisicaoInvalidaException.class,
                () -> convite.aceitar("outro@exemplo.com", Instant.now()));

        assertEquals(Estado.PENDENTE, convite.getEstado());
    }

    @Test
    void naoAceitaConviteEmEstadoFinal() {
        ConviteAdmin convite = convite(Instant.now().plusSeconds(300));
        convite.setEstado(Estado.REVOGADO);

        ConflitoException erro = assertThrows(ConflitoException.class,
                () -> convite.aceitar("usuario@exemplo.com", Instant.now()));

        assertEquals("CONVITE_NAO_PENDENTE", erro.getCodigo());
    }

    @Test
    void expirarSoMudaConvitesPendentes() {
        ConviteAdmin convite = convite(Instant.now().plusSeconds(300));
        convite.expirar();
        assertEquals(Estado.EXPIRADO, convite.getEstado());

        convite.setEstado(Estado.ACEITO);
        convite.expirar();
        assertEquals(Estado.ACEITO, convite.getEstado());
    }

    @Test
    void informaSePrazoJaPassou() {
        ConviteAdmin convite = convite(Instant.now().minusSeconds(1));

        assertTrue(convite.expirou(Instant.now()));
    }

    private ConviteAdmin convite(Instant expiraEm) {
        ConviteAdmin convite = new ConviteAdmin();
        convite.setEmail("usuario@exemplo.com");
        convite.setExpiraEm(expiraEm);
        convite.setEstado(Estado.PENDENTE);
        return convite;
    }
}
