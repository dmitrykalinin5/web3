package org.backend.model;

import java.io.Serializable;
import java.util.Date;
import java.text.SimpleDateFormat;

public class PointResult implements Serializable {
    private double x;
    private double y;
    private double r;
    private boolean hit;
    private Date timestamp;
    private String formattedTime;

    public PointResult(double x, double y, double r, boolean hit, Date timestamp) {
        this.x = x;
        this.y = y;
        this.r = r;
        this.hit = hit;
        this.timestamp = timestamp;
        this.formattedTime = new SimpleDateFormat("HH:mm:ss").format(timestamp);
    }

    public double getX() { return x; }
    public double getY() { return y; }
    public double getR() { return r; }
    public boolean isHit() { return hit; }
    public Date getTimestamp() { return timestamp; }
    public String getFormattedTime() { return formattedTime; }

    public void setX(double x) { this.x = x; }
    public void setY(double y) { this.y = y; }
    public void setR(double r) { this.r = r; }
    public void setHit(boolean hit) { this.hit = hit; }
    public void setTimestamp(Date timestamp) {
        this.timestamp = timestamp;
        this.formattedTime = new SimpleDateFormat("HH:mm:ss").format(timestamp);
    }
    public void setFormattedTime(String formattedTime) { this.formattedTime = formattedTime; }

    public void ensureFormattedTime() {
        if (this.formattedTime == null && this.timestamp != null) {
            this.formattedTime = new SimpleDateFormat("HH:mm:ss").format(this.timestamp);
        }
    }
}