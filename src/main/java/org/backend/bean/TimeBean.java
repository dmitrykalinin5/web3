package org.backend.bean;

import jakarta.enterprise.context.RequestScoped;
import jakarta.inject.Named;
import java.io.Serializable;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Date;

@Named
@RequestScoped
public class TimeBean implements Serializable {

    /**
     * Возвращает текущее время как Date для использования с JSF DateTimeConverter
     */
    public Date getCurrentTime() {
        // Конвертируем LocalDateTime в Date через ZonedDateTime
        ZonedDateTime zonedDateTime = LocalDateTime.now()
                .atZone(ZoneId.of("Europe/Moscow"));
        return Date.from(zonedDateTime.toInstant());
    }
    
    /**
     * Альтернативный метод, возвращающий уже отформатированную строку
     */
    public String getFormattedTime() {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd.MM.yyyy HH:mm:ss");
        return LocalDateTime.now().format(formatter);
    }
}