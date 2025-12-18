package org.backend.adr;

import java.io.Serializable;
import java.time.LocalDateTime;

public class ADR implements Serializable {
    private String id;
    private String title;
    private String status;
    private String context;
    private String decision;
    private String consequences;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String filename; // Добавлено поле

    // Конструкторы
    public ADR() {
    }

    public ADR(String id, String title, String status, String context,
               String decision, String consequences, String filename) {
        this.id = id;
        this.title = title;
        this.status = status;
        this.context = context;
        this.decision = decision;
        this.consequences = consequences;
        this.filename = filename;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    // Геттеры и сеттеры
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getContext() { return context; }
    public void setContext(String context) { this.context = context; }

    public String getDecision() { return decision; }
    public void setDecision(String decision) { this.decision = decision; }

    public String getConsequences() { return consequences; }
    public void setConsequences(String consequences) { this.consequences = consequences; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public String getFilename() { return filename; }
    public void setFilename(String filename) { this.filename = filename; }
}