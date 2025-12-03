package org.backend.controller;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import jakarta.servlet.*;
import jakarta.servlet.annotation.MultipartConfig;
import jakarta.servlet.http.*;
import java.io.IOException;
import java.util.*;
import org.backend.model.ApplicationResultsStorage;
import org.backend.model.PointResult;
import org.backend.service.AreaCheckService;
import org.backend.validation.PointValidator;

@MultipartConfig
public class AreaCheckServlet extends HttpServlet {
    private AreaCheckService areaCheckService = new AreaCheckService();
    private Gson gson = new GsonBuilder().setPrettyPrinting().create();

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        System.out.println("AreaCheckServlet: Processing POST request");
        String action = request.getParameter("action");
        System.out.println("Action parameter: " + action);

        if ("getHistory".equals(action)) {
            System.out.println("Handling getHistory request");
            handleGetHistory(request, response);
        } else if ("clearHistory".equals(action)) {
            System.out.println("Handling clearHistory request");
            handleClearHistory(request, response);
        } else {
            System.out.println("Handling point check request");
            handlePointCheck(request, response);
        }
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        System.out.println("AreaCheckServlet: Processing GET request");
        String action = request.getParameter("action");

        if ("getHistory".equals(action)) {
            handleGetHistory(request, response);
        } else if ("clearHistory".equals(action)) {
            handleClearHistory(request, response);
        } else {
            response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Неверный запрос");
        }
    }

    private void handlePointCheck(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        long startTime = System.nanoTime();
        String requestedWith = request.getHeader("X-Requested-With");
        String acceptHeader = request.getHeader("Accept");
        boolean isAjax = "XMLHttpRequest".equals(requestedWith) ||
                (acceptHeader != null && acceptHeader.contains("application/json"));

        try {
            double x = Double.parseDouble(request.getParameter("x"));
            double y = Double.parseDouble(request.getParameter("y"));
            double r = Double.parseDouble(request.getParameter("r"));

            if (!PointValidator.isValid(x, y, r)) {
                if (isAjax) {
                    sendJsonError(response, "Неверные параметры");
                } else {
                    request.setAttribute("error", "Неверные параметры");
                    request.getRequestDispatcher("/WEB-INF/jsp/result.jsp").forward(request, response);
                }
                return;
            }

            boolean hit = areaCheckService.checkHit(x, y, r);
            PointResult result = new PointResult(x, y, r, hit, new Date());

            long executionTime = System.nanoTime() - startTime;

            // Сохраняем результат напрямую
            ServletContext context = getServletContext();
            synchronized (context) {
                ApplicationResultsStorage.addResult(context, result);
            }

            if (isAjax) {
                sendJsonResponse(request, response, result, ApplicationResultsStorage.getResults(context), executionTime);
            } else {
                request.setAttribute("result", result);
                request.setAttribute("results", ApplicationResultsStorage.getResults(context));
                request.setAttribute("executionTime", executionTime + " ns");
                request.getRequestDispatcher("/WEB-INF/jsp/result.jsp").forward(request, response);
            }

        } catch (NumberFormatException e) {
            if (isAjax) {
                sendJsonError(response, "Неверный формат чисел");
            } else {
                request.setAttribute("error", "Неверный формат чисел");
                request.getRequestDispatcher("/WEB-INF/jsp/result.jsp").forward(request, response);
            }
        } catch (Exception e) {
            if (isAjax) {
                sendJsonError(response, "Внутренняя ошибка сервера: " + e.getMessage());
            } else {
                request.setAttribute("error", "Внутренняя ошибка сервера: " + e.getMessage());
                request.getRequestDispatcher("/WEB-INF/jsp/result.jsp").forward(request, response);
            }
        }
    }

    private void handleGetHistory(HttpServletRequest request, HttpServletResponse response)
            throws IOException {
        try {
            ServletContext context = getServletContext();
            List<PointResult> results;

            synchronized (context) {
                results = new ArrayList<>(ApplicationResultsStorage.getResults(context));
            }

            List<Map<String, Object>> jsonResults = new ArrayList<>();
            for (PointResult result : results) {
                Map<String, Object> jsonResult = new HashMap<>();
                jsonResult.put("x", result.getX());
                jsonResult.put("y", result.getY());
                jsonResult.put("r", result.getR());
                jsonResult.put("hit", result.isHit());
                jsonResult.put("currentTime", result.getFormattedTime());
                jsonResult.put("executionTime", "0 ns");
                jsonResults.add(jsonResult);
            }

            Map<String, Object> responseData = new HashMap<>();
            responseData.put("success", true);
            responseData.put("results", jsonResults);
            responseData.put("totalCount", results.size());

            response.setContentType("application/json; charset=UTF-8");
            response.setCharacterEncoding("UTF-8");

            String jsonResponse = gson.toJson(responseData);
            response.getWriter().write(jsonResponse);

        } catch (Exception e) {
            System.err.println("Error in getHistory: " + e.getMessage());
            e.printStackTrace();
            sendJsonError(response, "Ошибка при получении истории: " + e.getMessage());
        }
    }

    private void handleClearHistory(HttpServletRequest request, HttpServletResponse response)
            throws IOException {
        try {
            ServletContext context = getServletContext();

            synchronized (context) {
                ApplicationResultsStorage.clearResults(context);
            }

            Map<String, Object> responseData = new HashMap<>();
            responseData.put("success", true);
            responseData.put("message", "История очищена");

            response.setContentType("application/json; charset=UTF-8");
            response.setCharacterEncoding("UTF-8");
            response.getWriter().write(gson.toJson(responseData));

        } catch (Exception e) {
            System.err.println("Error in clearHistory: " + e.getMessage());
            sendJsonError(response, "Ошибка при очистке истории: " + e.getMessage());
        }
    }

    private void sendJsonResponse(HttpServletRequest request, HttpServletResponse response,
                                  PointResult result, List<PointResult> results, long executionTimeNs) throws IOException {

        Map<String, Object> responseData = new HashMap<>();
        responseData.put("success", true);

        Map<String, Object> resultData = new HashMap<>();
        resultData.put("x", result.getX());
        resultData.put("y", result.getY());
        resultData.put("r", result.getR());
        resultData.put("hit", result.isHit());
        resultData.put("currentTime", result.getFormattedTime());
        resultData.put("executionTime", executionTimeNs + " ns");

        responseData.put("result", resultData);
        responseData.put("globalCount", results.size());

        response.setContentType("application/json; charset=UTF-8");
        response.setCharacterEncoding("UTF-8");
        response.getWriter().write(gson.toJson(responseData));
    }

    private void sendJsonError(HttpServletResponse response, String errorMessage) throws IOException {
        Map<String, Object> errorResponse = new HashMap<>();
        errorResponse.put("success", false);
        errorResponse.put("error", errorMessage);

        response.setContentType("application/json; charset=UTF-8");
        response.setCharacterEncoding("UTF-8");
        response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
        response.getWriter().write(gson.toJson(errorResponse));
    }
}