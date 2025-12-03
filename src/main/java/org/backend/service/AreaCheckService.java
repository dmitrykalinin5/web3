package org.backend.service;

public class AreaCheckService {

    public boolean checkHit(double x, double y, double r) {
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
}