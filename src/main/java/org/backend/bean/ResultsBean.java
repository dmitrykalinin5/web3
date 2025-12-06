package org.backend.bean;

import jakarta.annotation.PostConstruct;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.inject.Named;
import org.backend.model.PointResult;
import org.backend.service.PointService;
import java.io.Serializable;
import java.util.List;

@Named
@ApplicationScoped
public class ResultsBean implements Serializable {

    @Inject
    private PointService pointService;

    private List<PointResult> allResults;

    @PostConstruct
    public void init() {
        loadAllResults();
    }

    public void addResult(PointResult result) {
        // Метод saveResult больше не существует в PointService
        // Вместо этого, если нужно сохранить существующий результат,
        // нужно пересоздать его или изменить логику
        loadAllResults();
    }

    public void loadAllResults() {
        allResults = pointService.getAllResults();
    }

    public List<PointResult> getAllResults() {
        return allResults;
    }

    public void clearResults() {
        pointService.clearResults();
        loadAllResults();
    }
}