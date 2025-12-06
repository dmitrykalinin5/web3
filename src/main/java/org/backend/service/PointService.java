package org.backend.service;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import org.backend.model.PointResult;
import org.backend.repository.PointResultRepository;
import java.util.Date;
import java.util.List;

@ApplicationScoped
public class PointService {

    @Inject
    private PointResultRepository repository;

    @Transactional
    public PointResult checkPoint(double x, double y, double r) {
        boolean hit = checkArea(x, y, r);
        PointResult result = new PointResult(x, y, r, hit, new Date());
        repository.save(result);
        return result;
    }

    private boolean checkArea(double x, double y, double r) {
        if (x >= 0 && y >= 0 && x <= r && y <= r) {
            return true;
        }
        if (x <= 0 && y <= 0 && y >= -x - r) {
            return true;
        }
        if (x >= 0 && y <= 0 && (x * x + y * y <= (r/2) * (r/2))) {
            return true;
        }
        return false;
    }

    // В PointService.java добавьте:
    @Transactional
    public void saveResult(PointResult result) {
        repository.save(result);
    }

    public List<PointResult> getAllResults() {
        return repository.findAll();
    }

    @Transactional
    public void clearResults() {
        repository.deleteAll();
    }
}