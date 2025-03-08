package com.example.besrc;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class BeSrcApplication {

	public static void main(String[] args) {
		SpringApplication.run(BeSrcApplication.class, args);
	}

}
