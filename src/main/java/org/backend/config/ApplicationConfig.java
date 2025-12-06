package org.backend.config;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.faces.annotation.FacesConfig;

/**
 * Конфигурационный класс для активации полной поддержки CDI в JSF 4.0
 * Это необходимо для корректной работы JSF с CDI в WildFly 30.0.0 Final
 * В JSF 4.0 параметр version устарел, используется просто @FacesConfig
 */
@FacesConfig
@ApplicationScoped
public class ApplicationConfig {
    // Класс нужен только для активации CDI в JSF
}

