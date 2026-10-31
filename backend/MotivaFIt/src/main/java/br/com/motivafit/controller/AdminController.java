package br.com.motivafit.controller;

import br.com.motivafit.dto.request.ConviteAdminRequestDTO;
import br.com.motivafit.service.AdminService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@EnableMethodSecurity
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @PostMapping("/convites")
    public ResponseEntity<?> create(@RequestBody @Valid ConviteAdminRequestDTO body){
        adminService.create(body);
        return  ResponseEntity.ok().build();
    }
}
