package org.backend.service;

import jakarta.annotation.PostConstruct;
import jakarta.enterprise.context.ApplicationScoped;
import com.google.gson.Gson;
import com.google.gson.JsonObject;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.HashMap;
import java.util.Map;

@ApplicationScoped
public class WikiService {

    private static final String WIKI_API_BASE = "http://localhost:3000/api"; // Адрес Wiki.js
    private static final String API_TOKEN = "your-wiki-api-token";

    private final Map<Double, String> radiusArticles = new HashMap<>();

    @PostConstruct
    public void init() {
        radiusArticles.put(1.0, "circle-radius-1");
        radiusArticles.put(1.5, "circle-geometry-basics");
        radiusArticles.put(2.0, "circle-properties");
        radiusArticles.put(2.5, "advanced-circle-math");
        radiusArticles.put(3.0, "circle-applications");
    }

    public String getArticleLinkForRadius(double radius) {
        String articleSlug = radiusArticles.get(radius);
        if (articleSlug != null) {
            return WIKI_API_BASE + "/page/" + articleSlug + "/embed";
        }
        return WIKI_API_BASE + "/page/mathematics-intro/embed";
    }

    public JsonObject getArticleContent(String articleSlug) {
        try {
            URL url = new URL(WIKI_API_BASE + "/page/" + articleSlug + "?token=" + API_TOKEN);
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("GET");
            conn.setRequestProperty("Accept", "application/json");

            if (conn.getResponseCode() == 200) {
                BufferedReader reader = new BufferedReader(
                        new InputStreamReader(conn.getInputStream())
                );
                StringBuilder response = new StringBuilder();
                String line;
                while ((line = reader.readLine()) != null) {
                    response.append(line);
                }
                reader.close();

                return new Gson().fromJson(response.toString(), JsonObject.class);
            }
            conn.disconnect();
        } catch (Exception e) {
            System.err.println("Error fetching Wiki article: " + e.getMessage());
        }
        return null;
    }

    public String getArticleEmbedUrl(double radius) {
        String articleSlug = radiusArticles.get(radius);
        if (articleSlug != null) {
            return WIKI_API_BASE + "/page/" + articleSlug + "/embed";
        }
        return WIKI_API_BASE + "/page/mathematics-intro/embed";
    }

    public String getLocalArticleEmbedUrl(double radius) {
        String articleSlug = radiusArticles.get(radius);
        if (articleSlug != null) {
            return "/wiki/embed/" + articleSlug;
        }
        return "/wiki/embed/mathematics-intro";
    }
}