package org.backend.service;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import org.backend.model.PointResult;
import org.backend.repository.PointResultRepository;

import java.util.Calendar;
import java.util.Date;
import java.util.List;
import java.util.TimeZone;

@ApplicationScoped
public class PointService {

    @Inject
    private PointResultRepository repository;

    @Transactional
    public PointResult checkPoint(double x, double y, double r) {
        boolean hit = checkArea(x, y, r);
        Calendar calendar = Calendar.getInstance(TimeZone.getTimeZone("Europe/Moscow"));
        Date moscowTime = calendar.getTime();
        PointResult result = new PointResult(x, y, r, hit, new Date());
        repository.save(result);
        return result;
    }

    private boolean checkArea(double x, double y, double r) {
        // Проверка согласно варианту 411:
        // 1. Первая четверть (x >= 0, y >= 0): четверть круга радиусом R/2
        if (x >= 0 && y >= 0) {
            return (x * x + y * y) <= (r/2 * r/2);
        }
        // 2. Вторая четверть (x <= 0, y >= 0): треугольник
        else if (x <= 0 && y >= 0) {
            return (y <= (r/2 + (r/2) * x / (-r/2)));
        }
        // 3. Третья четверть (x <= 0, y <= 0): прямоугольник R/2 x R
        else if (x <= 0 && y <= 0) {
            return (x >= -r/2 && y >= -r);
        }
        // 4. Четвертая четверть (x >= 0, y <= 0): нет области
        else {
            return false;
        }
    }

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