package org.backend.bean;

import jakarta.enterprise.context.SessionScoped;
import jakarta.faces.application.FacesMessage;
import jakarta.faces.context.FacesContext;
import jakarta.faces.event.AjaxBehaviorEvent;
import jakarta.inject.Inject;
import jakarta.inject.Named;
import org.backend.model.PointResult;
import org.backend.service.PointService;
import java.io.Serializable;

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
            // checkPoint() уже сохраняет результат в базу
            PointResult result = pointService.checkPoint(x, y, r);
            // Обновляем список результатов в ApplicationScoped бине
            resultsBean.loadAllResults();
        } else {
            FacesContext.getCurrentInstance().addMessage(null, 
                new FacesMessage(FacesMessage.SEVERITY_ERROR, 
                    "Ошибка валидации", 
                    "Проверьте правильность введенных данных. Y должен быть от -3 до 5."));
        }
        return null; // Остаемся на той же странице
    }

    public void handleGraphClick(AjaxBehaviorEvent event) {
        // Метод для обработки клика на графике
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