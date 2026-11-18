package br.com.motivafit;

import org.springframework.boot.SpringApplication;

public class TestMotivaFItApplication {

    public static void main(String[] args) {
        SpringApplication.from(MotivaFItApplication::main).with(TestcontainersConfiguration.class).run(args);
    }

}
