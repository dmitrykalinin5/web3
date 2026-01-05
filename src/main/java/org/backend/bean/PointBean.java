package org.backend.bean;

import jakarta.enterprise.context.SessionScoped;
import jakarta.faces.application.FacesMessage;
import jakarta.faces.context.FacesContext;
import jakarta.inject.Inject;
import jakarta.inject.Named;
import org.backend.model.PointResult;
import org.backend.service.PointService;
import java.io.Serializable;

@Named
@SessionScoped
public class PointBean implements Serializable {
    private Double x = 0.0;
    private Double y;
    private Double r = 3.0;

    private Double graphX;
    private Double graphY;

    @Inject
    private PointService pointService;

    @Inject
    private ResultsBean resultsBean;

    public String checkPoint() {
        if (isValid()) {
            PointResult result = pointService.checkPoint(x, y, r);
            resultsBean.loadAllResults();
        }
        return null;
    }

    public String checkPointFromGraph() {
        if (graphX != null && graphY != null && r != null) {
            this.x = graphX;
            this.y = graphY;

            if (graphY >= -3 && graphY <= 5 && graphX >= -4 && graphX <= 4) {
                PointResult result = pointService.checkPoint(x, y, r);
                resultsBean.loadAllResults();

                graphX = null;
                graphY = null;
                return null;
            } else {
                FacesContext.getCurrentInstance().addMessage(null,
                        new FacesMessage(FacesMessage.SEVERITY_ERROR,
                                "Ошибка",
                                "Координаты выходят за допустимые пределы"));
            }
        }
        return null;
    }

    private boolean isValid() {
        return x != null && y != null && r != null &&
                y >= -3 && y <= 5;
    }

    public Double getX() { return x; }
    public void setX(Double x) {
        if (x != null) {
            if (x < -4) x = -4.0;
            if (x > 4) x = 4.0;

            this.x = Math.round(x * 10) / 10.0;
        } else {
            this.x = 0.0;
        }
    }
    public Double getY() { return y; }
    public void setY(Double y) { this.y = y; }
    public Double getR() { return r; }
    public void setR(Double r) { this.r = r; }
    public Double getGraphX() { return graphX; }
    public void setGraphX(Double graphX) { this.graphX = graphX; }
    public Double getGraphY() { return graphY; }
    public void setGraphY(Double graphY) { this.graphY = graphY; }
}