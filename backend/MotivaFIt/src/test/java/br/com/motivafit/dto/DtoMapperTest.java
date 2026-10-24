package br.com.motivafit.dto;

import br.com.motivafit.dto.mapper.UsuarioMapper;
import br.com.motivafit.dto.request.LoginRequestDTO;
import br.com.motivafit.dto.request.UsuarioRequestDTO;
import br.com.motivafit.dto.response.LoginResponseDTO;
import br.com.motivafit.dto.response.UsuarioResponseDTO;
import br.com.motivafit.entity.Usuario;
import br.com.motivafit.enums.Perfil;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Date;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class DtoMapperTest {
    @Test
    void converteCadastroParaEntidadeEResposta() {
        PasswordEncoder encoder = mock(PasswordEncoder.class);
        when(encoder.encode("senha-plana")).thenReturn("hash-senha");
        new UsuarioMapper(encoder);

        Usuario entity = UsuarioMapper.toEntity(new UsuarioRequestDTO("user@test.com", "senha-plana"));
        UsuarioResponseDTO dto = UsuarioMapper.toDto(entity);

        assertEquals("user@test.com", entity.getEmail());
        assertEquals("hash-senha", entity.getSenhaHash());
        assertTrue(entity.getAtivo());
        assertEquals(Perfil.USUARIO, entity.getPerfil());
        assertNull(dto.id());
        assertEquals("user@test.com", dto.email());
        assertEquals(Perfil.USUARIO, dto.perfil());
        assertTrue(dto.ativo());
        verify(encoder).encode("senha-plana");
    }

    @Test
    void requestResponseDtosExpondoValores() {
        LoginRequestDTO loginRequest = new LoginRequestDTO("a@b.com", "pw");
        LoginResponseDTO loginResponse = new LoginResponseDTO("jwt", new Date(1000));
        UsuarioRequestDTO usuarioRequest = new UsuarioRequestDTO("a@b.com", "pw");
        UsuarioResponseDTO usuarioResponse = new UsuarioResponseDTO(2L, "a@b.com", Perfil.SUPERUSUARIO, false);

        assertEquals("a@b.com", loginRequest.email());
        assertEquals("pw", loginRequest.senha());
        assertEquals("jwt", loginResponse.token());
        assertEquals(new Date(1000), loginResponse.expirationAt());
        assertEquals("a@b.com", usuarioRequest.email());
        assertEquals("pw", usuarioRequest.senha());
        assertEquals(2L, usuarioResponse.id());
        assertEquals(Perfil.SUPERUSUARIO, usuarioResponse.perfil());
        assertFalse(usuarioResponse.ativo());
    }
}
