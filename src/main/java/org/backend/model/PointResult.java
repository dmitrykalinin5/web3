package org.backend.model;

import jakarta.persistence.*;
import java.io.Serializable;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.TimeZone;

@Entity
@Table(name = "point_result")
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
    @Column(name = "timestamp_col")
    private Date timestamp;

    public PointResult() {}

    public PointResult(Double x, Double y, Double r, Boolean hit, Date timestamp) {
        this.x = x;
        this.y = y;
        this.r = r;
        this.hit = hit;
        this.timestamp = timestamp;
    }

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

    public boolean isHit() {
        return hit != null && hit;
    }

    public Date getTimestamp() { return timestamp; }
    public void setTimestamp(Date timestamp) { this.timestamp = timestamp; }

    @Transient
    public String getFormattedTime() {
        if (timestamp == null) return "";
        SimpleDateFormat sdf = new SimpleDateFormat("HH:mm:ss");
        sdf.setTimeZone(TimeZone.getTimeZone("Europe/Moscow"));
        return sdf.format(timestamp);
    }

    @Transient
    public String getArticleTitle() {
        if (r == null) return "General Mathematics";

        if (r.equals(1.0)) {
            return "Coordinate Plane Fundamentals";
        } else if (r.equals(1.5)) {
            return "Circle Geometry";
        } else if (r.equals(2.0)) {
            return "Circle Properties";
        } else if (r.equals(2.5)) {
            return "Advanced Circle Geometry";
        } else if (r.equals(3.0)) {
            return "Practical Applications of Circles";
        } else {
            return "General Mathematics Article";
        }
    }

    @Transient
    public String getArticleSlug() {
        if (r == null) return "analytic-geometry-introduction";

        if (r.equals(1.0)) {
            return "Coordinate_Plane_Fundamentals";
        } else if (r.equals(1.5)) {
            return "Circle_Geometry";
        } else if (r.equals(2.0)) {
            return "Circle_Properties";
        } else if (r.equals(2.5)) {
            return "Advanced_Circle_Geometry";
        } else if (r.equals(3.0)) {
            return "Practical_Applications_of_Circles";
        } else {
            return "analytic-geometry-introduction";
        }
    }
}