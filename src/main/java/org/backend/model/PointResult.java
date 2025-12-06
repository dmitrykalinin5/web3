package org.backend.model;

import jakarta.persistence.*;
import java.io.Serializable;
import java.util.Date;

@Entity
@Table(name = "point_result") // Изменяю имя таблицы
public class PointResult implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Double x;

    @Column(nullable = false)
    private Double y;

    @Column(nullable = false)
    private Double r;

    @Column(nullable = false)
    private Boolean hit;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "timestamp_col") // timestamp может быть зарезервированным словом
    private Date timestamp;

    // Конструкторы
    public PointResult() {}

    public PointResult(Double x, Double y, Double r, Boolean hit, Date timestamp) {
        this.x = x;
        this.y = y;
        this.r = r;
        this.hit = hit;
        this.timestamp = timestamp;
    }

    // Геттеры и сеттеры
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Double getX() { return x; }
    public void setX(Double x) { this.x = x; }

    public Double getY() { return y; }
    public void setY(Double y) { this.y = y; }

    public Double getR() { return r; }
    public void setR(Double r) { this.r = r; }

    public Boolean getHit() { return hit; }
    public void setHit(Boolean hit) { this.hit = hit; }

    public Date getTimestamp() { return timestamp; }
    public void setTimestamp(Date timestamp) { this.timestamp = timestamp; }

    // Уберите formattedTime из JPA, сделайте transient
    @Transient
    public String getFormattedTime() {
        if (timestamp == null) return "";
        return new java.text.SimpleDateFormat("HH:mm:ss").format(timestamp);
    }
}