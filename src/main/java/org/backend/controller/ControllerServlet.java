package org.backend.controller;

import jakarta.servlet.*;
import jakarta.servlet.annotation.MultipartConfig;
import jakarta.servlet.http.*;
import java.io.IOException;

@MultipartConfig
public class ControllerServlet extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        System.out.println("ControllerServlet: Processing POST request");
        String action = request.getParameter("action");
        String x = request.getParameter("x");
        String y = request.getParameter("y");
        String r = request.getParameter("r");

        System.out.println("Parameters - action: " + action + ", x: " + x + ", y: " + y + ", r: " + r);

        if (x != null && y != null && r != null &&
                !x.isEmpty() && !y.isEmpty() && !r.isEmpty()) {
            System.out.println("Forwarding to area-check for point check");
            request.getRequestDispatcher("/area-check").forward(request, response);
        }
        else if ("getHistory".equals(action)) {
            System.out.println("Forwarding to area-check for getHistory");
            request.getRequestDispatcher("/area-check").forward(request, response);
        }
        else if ("clearHistory".equals(action)) {
            System.out.println("Forwarding to area-check for clearHistory");
            request.getRequestDispatcher("/area-check").forward(request, response);
        }
        else {
            System.out.println("Forwarding to form.jsp");
            request.getRequestDispatcher("/WEB-INF/jsp/form.jsp").forward(request, response);
        }
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        System.out.println("ControllerServlet: Processing GET request");
        String action = request.getParameter("action");
        String x = request.getParameter("x");
        String y = request.getParameter("y");
        String r = request.getParameter("r");

        if (x != null && y != null && r != null &&
                !x.isEmpty() && !y.isEmpty() && !r.isEmpty()) {
            request.getRequestDispatcher("/area-check").forward(request, response);
        }
        else if ("getHistory".equals(action)) {
            request.getRequestDispatcher("/area-check").forward(request, response);
        }
        else if ("clearHistory".equals(action)) {
            request.getRequestDispatcher("/area-check").forward(request, response);
        }
        else {
            request.getRequestDispatcher("/WEB-INF/jsp/form.jsp").forward(request, response);
        }
    }
}