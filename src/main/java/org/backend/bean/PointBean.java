package org.backend.bean;

import jakarta.enterprise.context.SessionScoped;
import jakarta.faces.event.AjaxBehaviorEvent;
import jakarta.inject.Inject;
import jakarta.inject.Named;
import org.backend.model.PointResult;
import org.backend.service.PointService;

import java.io.Serializable;
import java.util.Date;

@Named
@SessionScoped
public class PointBean implements Serializable {
    private Double x;
    private Double y;
    private Double r = 1.0;

    @Inject
    private PointService pointService;

    @Inject
    private ResultsBean resultsBean;

    public String checkPoint() {
        if (isValid()) {
            PointResult result = pointService.checkPoint(x, y, r);
            resultsBean.addResult(result);
        }
        return null; // Остаемся на той же странице
    }

    public void handleGraphClick(AjaxBehaviorEvent event) {
        // Метод для обработки клика на графике
        // Координаты будут установлены через параметры запроса или JavaScript
        // Здесь можно добавить логику обработки клика, если нужно
    }

    private boolean isValid() {
        return x != null && y != null && r != null &&
                y >= -3 && y <= 5;
    }

    // Getters and Setters
    public Double getX() { return x; }
    public void setX(Double x) { this.x = x; }

    public Double getY() { return y; }
    public void setY(Double y) { this.y = y; }

    public Double getR() { return r; }
    public void setR(Double r) { this.r = r; }
}