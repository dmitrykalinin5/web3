package org.backend.bean;

import jakarta.enterprise.context.RequestScoped;
import jakarta.inject.Named;
import java.io.Serializable;
import java.time.LocalDateTime;

@Named
@RequestScoped
public class TimeBean implements Serializable {

    public LocalDateTime getCurrentTime() {
        return LocalDateTime.now();
    }
}