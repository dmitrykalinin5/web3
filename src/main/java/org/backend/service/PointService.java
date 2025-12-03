package org.backend.service;

import org.backend.model.PointResult;
import java.util.*;
import java.util.concurrent.CopyOnWriteArrayList;

public class PointService {
    private List<PointResult> results = new CopyOnWriteArrayList<>();

    public PointResult checkPoint(double x, double y, double r) {
        boolean hit = checkArea(x, y, r);
        PointResult result = new PointResult(x, y, r, hit, new Date());
        saveResult(result);
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

    public void saveResult(PointResult result) {
        results.add(0, result); // Добавляем в начало
    }

    public List<PointResult> getAllResults() {
        return new ArrayList<>(results);
    }

    public void clearResults() {
        results.clear();
    }
}