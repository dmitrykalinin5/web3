package org.backend.bean;

import jakarta.enterprise.context.SessionScoped;
import jakarta.faces.application.FacesMessage;
import jakarta.faces.context.FacesContext;
import jakarta.inject.Inject;
import jakarta.inject.Named;
import org.backend.model.PointResult;
import org.backend.service.PointService;
import java.io.Serializable;
import java.util.Arrays;
import java.util.List;

@Named
@SessionScoped
public class PointBean implements Serializable {
    private Double x;
    private Double y;
    private Double r = 3.0;

    private Double graphX;
    private Double graphY;

    @Inject
    private PointService pointService;

    @Inject
    private ResultsBean resultsBean;

    public String checkPoint() {
        System.out.println("=== Checking point ===");
        System.out.println("x: " + x);
        System.out.println("y: " + y);
        System.out.println("r: " + r);

        if (isValid()) {
            PointResult result = pointService.checkPoint(x, y, r);
            System.out.println("Result saved: " + result);
            System.out.println("Hit: " + result.isHit());

            // Загружаем обновленные результаты
            resultsBean.loadAllResults();
            System.out.println("Total results in DB: " + resultsBean.getAllResults().size());
        }
        return null;
    }

    public String checkPointFromGraph() {
        System.out.println("Checking point from graph: graphX=" + graphX + ", graphY=" + graphY + ", r=" + r);

        if (graphX != null && graphY != null && r != null) {
            Double roundedX = roundXToValidValue(graphX);

            if (roundedX != null) {
                this.x = roundedX;
                this.y = graphY;

                if (graphY >= -3 && graphY <= 5) {
                    PointResult result = pointService.checkPoint(x, y, r);
                    System.out.println("Result from graph: " + (result.isHit() ? "Hit" : "Miss"));

                    resultsBean.loadAllResults();

                    // Сбрасываем графические координаты
                    graphX = null;
                    graphY = null;

                    return null;
                } else {
                    FacesContext.getCurrentInstance().addMessage(null,
                            new FacesMessage(FacesMessage.SEVERITY_ERROR,
                                    "Ошибка",
                                    "Y должен быть в диапазоне от -3 до 5"));
                }
            }
        }
        return null;
    }

    private Double roundXToValidValue(Double x) {
        List<Double> validValues = Arrays.asList(-4.0, -3.0, -2.0, -1.0, 0.0, 1.0, 2.0, 3.0, 4.0);

        Double closest = null;
        double minDiff = Double.MAX_VALUE;

        for (Double valid : validValues) {
            double diff = Math.abs(x - valid);
            if (diff < minDiff) {
                minDiff = diff;
                closest = valid;
            }
        }

        return closest;
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
    public void setR(Double r) {
        this.r = r;
        System.out.println("R set to: " + r);
    }

    public Double getGraphX() { return graphX; }
    public void setGraphX(Double graphX) { this.graphX = graphX; }

    public Double getGraphY() { return graphY; }
    public void setGraphY(Double graphY) { this.graphY = graphY; }
}