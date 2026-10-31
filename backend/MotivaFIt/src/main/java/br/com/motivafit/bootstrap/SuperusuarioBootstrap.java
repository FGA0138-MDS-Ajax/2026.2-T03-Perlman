package br.com.motivafit.bootstrap;

import br.com.motivafit.entity.Usuario;
import br.com.motivafit.enums.Perfil;
import br.com.motivafit.repository.UsuarioRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class SuperusuarioBootstrap implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(SuperusuarioBootstrap.class);

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${admin.bootstrap.email}")
    private String adminEmail;

    @Value("${admin.bootstrap.senha-temporaria}")
    private String adminSenhaTemporaria;

    public SuperusuarioBootstrap(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (adminEmail == null || adminEmail.isBlank() || adminSenhaTemporaria == null || adminSenhaTemporaria.isBlank()) {
            log.warn("Credenciais de bootstrap do superusuário não configuradas nas variáveis de ambiente.");
            return;
        }

        usuarioRepository.findByEmail(adminEmail).ifPresentOrElse(
                usuario -> {
                    if (!usuario.getPerfil().equals(Perfil.SUPERUSUARIO)) {
                        log.error("O e-mail configurado para bootstrap já existe com outro perfil.");
                    } else {
                        log.info("Auditoria: Verificação de bootstrap concluída. O superusuário '{}' já se encontra provisionado.", adminEmail);
                    }
                },
                () -> {
                    Usuario superusuario = new Usuario();
                    superusuario.setEmail(adminEmail);
                    superusuario.setSenhaHash(passwordEncoder.encode(adminSenhaTemporaria));
                    superusuario.setPerfil(Perfil.SUPERUSUARIO);
                    superusuario.setAtivo(true);

                    usuarioRepository.save(superusuario);
                    log.info("Auditoria: Superusuário '{}' provisionado com sucesso na inicialização do sistema.", adminEmail);
                }
        );
    }
}