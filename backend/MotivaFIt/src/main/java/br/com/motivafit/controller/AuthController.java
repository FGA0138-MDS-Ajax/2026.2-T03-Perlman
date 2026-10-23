package br.com.motivafit.controller;

import br.com.motivafit.dto.request.LoginRequestDTO;
import br.com.motivafit.dto.request.UsuarioRequestDTO;
import br.com.motivafit.dto.response.LoginResponseDTO;
import br.com.motivafit.dto.response.UsuarioResponseDTO;
import br.com.motivafit.service.LoginService;
import br.com.motivafit.service.UsuarioService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final UsuarioService usuarioService;
    private final LoginService loginService;

    public AuthController(UsuarioService usuarioService, LoginService loginService) {
        this.usuarioService = usuarioService;
        this.loginService = loginService;
    }

    @PostMapping("/cadastro")
    public ResponseEntity<UsuarioResponseDTO> create(@RequestBody @Valid UsuarioRequestDTO body){
        UsuarioResponseDTO response = usuarioService.create(body);
        return ResponseEntity.status(HttpStatusCode.valueOf(201)).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login (@RequestBody @Valid LoginRequestDTO body){
        LoginResponseDTO response = loginService.login(body);
        return ResponseEntity.status(HttpStatusCode.valueOf(201)).body(response);
    }
}
