package org.backend.validation;

public final class PointValidator {
    private static final double[] VALID_X = {-3, -2, -1, 0, 1, 2, 3, 4, 5};
    private static final double[] VALID_R = {1, 2, 3, 4, 5};

    private PointValidator() {
    }

    public static boolean isValid(double x, double y, double r) {
        return isValidX(x) && isValidY(y) && isValidR(r);
    }

    private static boolean isValidX(double x) {
        for (double valid : VALID_X) {
            if (Math.abs(x - valid) < 0.0001) {
                return true;
            }
        }
        return false;
    }

    private static boolean isValidR(double r) {
        for (double valid : VALID_R) {
            if (Math.abs(r - valid) < 0.0001) {
                return true;
            }
        }
        return false;
    }

    private static boolean isValidY(double y) {
        return y >= -3 && y <= 5;
    }
}

