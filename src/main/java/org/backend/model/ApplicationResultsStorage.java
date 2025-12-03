package org.backend.model;

import jakarta.servlet.ServletContext;

import java.util.*;
import java.util.concurrent.CopyOnWriteArrayList;

public class ApplicationResultsStorage {
    private static final String RESULTS_KEY = "globalResults";

    public static void addResult(ServletContext context, PointResult result) {
        List<PointResult> results = getResults(context);
        results.add(result);
        context.setAttribute(RESULTS_KEY, results);
    }

    @SuppressWarnings("unchecked")
    public static List<PointResult> getResults(ServletContext context) {
        List<PointResult> results = (List<PointResult>) context.getAttribute(RESULTS_KEY);
        if (results == null) {
            results = new CopyOnWriteArrayList<>();
            context.setAttribute(RESULTS_KEY, results);
        }
        return results;
    }

    public static void clearResults(ServletContext context) {
        List<PointResult> results = getResults(context);
        results.clear();
        context.setAttribute(RESULTS_KEY, results);
    }

    public static int getSize(ServletContext context) {
        return getResults(context).size();
    }
}