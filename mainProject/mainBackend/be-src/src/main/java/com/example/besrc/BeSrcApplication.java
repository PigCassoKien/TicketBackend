package com.example.besrc;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
@EnableJpaRepositories(basePackages = "com.example.besrc.Repository")
public class BeSrcApplication {

	public static void main(String[] args) {
		SpringApplication.run(BeSrcApplication.class, args);
	}

}
