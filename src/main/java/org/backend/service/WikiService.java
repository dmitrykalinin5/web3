package org.backend.service;

import jakarta.enterprise.context.ApplicationScoped;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import org.commonmark.node.Node;
import org.commonmark.parser.Parser;
import org.commonmark.renderer.html.HtmlRenderer;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

@ApplicationScoped
public class WikiService {

    private static final String WIKI_API_BASE = "http://localhost:3000/graphql";
    private static final String WIKI_GRAPHQL_URL = "http://localhost:3000/graphql";
    private static final String WIKI_BASE_URL = "http://localhost:3000";
    private static final String API_TOKEN = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGkiOjEsImdycCI6MSwiaWF0IjoxNzY2ODU4ODQyLCJleHAiOjE3OTg0MTY0NDIsImF1ZCI6InVybjp3aWtpLmpzIiwiaXNzIjoidXJuOndpa2kuanMifQ.UH7Q6XAAuJU_tsJqdIKkOffgTl2JFJevQ0ZpfxRivspnlfbQjfskvGuyU3BW-q3tAi2Or5188lN-b6rhyh8fHrH-DZL5tRcnORE6H-FNcjtDpUPajemiNbpDNNJ0xizIUNRyrzrtJceFITMFHU5VS-vFcmS72qPa36HO8NzPXZX3BADA0x_SltHH0lwX-E7z_1SPellA4QOtoblDyrC56pjnUk35ZhB_su1QDaGBS4gVpqkbnR3oqo3l3Ky22-oMF67Qzu3Dx_Juf_4SpyY5HuIB-9UAaY7oIdg-IpoWj8VgxEvPjleEIsHCGvqi_r6CFWBfsQOiMZIcC6VjfUeCYw";

    private final Map<Double, String> radiusArticles = new HashMap<>();
    private final Map<Double, String> radiusArticleTitles = new HashMap<>();

    public WikiService() {
        radiusArticles.put(1.0, "Coordinate_Plane_Fundamentals");
        radiusArticles.put(1.5, "Circle_Geometry");
        radiusArticles.put(2.0, "Circle_Properties");
        radiusArticles.put(2.5, "Advanced_Circle_Geometry");
        radiusArticles.put(3.0, "Practical_Applications_of_Circles");

        // Маппинг радиуса -> отображаемое название статьи
        radiusArticleTitles.put(1.0, "Coordinate Plane Fundamentals");
        radiusArticleTitles.put(1.5, "Circle Geometry");
        radiusArticleTitles.put(2.0, "Circle Properties");
        radiusArticleTitles.put(2.5, "Advanced Circle Geometry");
        radiusArticleTitles.put(3.0, "Practical Applications of Circles");
    }

    public String getArticleHtmlContent(double radius) {
        String slug = radiusArticles.getOrDefault(radius, "circle-applications");

        try {
            // ШАГ 1: Ищем ID страницы по её пути (slug)
            Integer pageId = findPageIdByPath(slug);
            if (pageId == null) {
                return "Ошибка: Страница с путем '" + slug + "' не найдена в Wiki.js.";
            }

            // ШАГ 2: Получаем контент по ID
            return fetchPageContentById(pageId);

        } catch (Exception e) {
            e.printStackTrace();
            return "Ошибка при загрузке: " + e.getMessage();
        }
    }

    private Integer findPageIdByPath(String slug) throws Exception {
        // Query для поиска ID по пути
        String query = "{\"query\": \"{ pages { search(query: \\\"" + slug + "\\\") { results { id, path } } } }\"}";
        JsonObject response = executeGraphql(query);

        JsonArray results = response.get("data").getAsJsonObject()
                .get("pages").getAsJsonObject()
                .get("search").getAsJsonObject()
                .get("results").getAsJsonArray();

        for (int i = 0; i < results.size(); i++) {
            JsonObject item = results.get(i).getAsJsonObject();
            // Точное совпадение пути
            if (item.get("path").getAsString().equalsIgnoreCase(slug)) {
                return item.get("id").getAsInt();
            }
        }
        return null;
    }

    private String fetchPageContentById(int id) throws Exception {
        // Query для получения контента (теперь используем обязательный аргумент id)
        String query = "{\"query\": \"{ pages { single(id: " + id + ") { content, contentType, title } } }\"}";
        JsonObject response = executeGraphql(query);

        JsonObject page = response.get("data").getAsJsonObject()
                .get("pages").getAsJsonObject()
                .get("single").getAsJsonObject();

        String content = page.get("content").getAsString();
        String type = page.get("contentType").getAsString();

        return "markdown".equalsIgnoreCase(type) ? convertMarkdownToHtml(content) : content;
    }

    private JsonObject executeGraphql(String jsonPayload) throws Exception {
        URL url = new URL(WIKI_GRAPHQL_URL);
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod("POST");
        conn.setRequestProperty("Content-Type", "application/json");
        conn.setRequestProperty("Authorization", "Bearer " + API_TOKEN);
        conn.setDoOutput(true);

        try (OutputStream os = conn.getOutputStream()) {
            os.write(jsonPayload.getBytes(StandardCharsets.UTF_8));
        }

        if (conn.getResponseCode() != 200) {
            throw new RuntimeException("HTTP Error " + conn.getResponseCode());
        }

        BufferedReader reader = new BufferedReader(new InputStreamReader(conn.getInputStream(), StandardCharsets.UTF_8));
        StringBuilder sb = new StringBuilder();
        String line;
        while ((line = reader.readLine()) != null) sb.append(line);

        return JsonParser.parseString(sb.toString()).getAsJsonObject();
    }

    private String convertMarkdownToHtml(String markdown) {
        Parser parser = Parser.builder().build();
        Node document = parser.parse(markdown);
        HtmlRenderer renderer = HtmlRenderer.builder().build();
        return renderer.render(document);
    }

    public String getArticleUrl(double radius) {
        String articleSlug = radiusArticles.get(radius);
        if (articleSlug != null) {
            return WIKI_BASE_URL + "/" + articleSlug;
        }
        return WIKI_BASE_URL + "/analytic-geometry-introduction";
    }

    public String getArticleTitle(double radius) {
        return radiusArticleTitles.getOrDefault(radius, "General Mathematics Article");
    }

    public String getArticleTitleForRadius(double radius) {
        return radiusArticleTitles.getOrDefault(radius, "General Mathematics Article");
    }

    public String getArticleSlugForRadius(double radius) {
        return radiusArticles.getOrDefault(radius, "analytic-geometry-introduction");
    }
}