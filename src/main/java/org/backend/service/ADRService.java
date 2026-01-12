package org.backend.service;

import jakarta.annotation.PostConstruct;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.servlet.ServletContext;
import org.backend.adr.ADR;
import org.commonmark.node.Node;
import org.commonmark.parser.Parser;
import org.commonmark.renderer.html.HtmlRenderer;

import java.io.*;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.time.LocalDateTime;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@ApplicationScoped
public class ADRService {

    @Inject
    private ServletContext servletContext;

    private static final Pattern TITLE_PATTERN = Pattern.compile("^#\\s*(\\d+)\\.?\\s*(.+)$", Pattern.MULTILINE);
    private static final Pattern STATUS_PATTERN = Pattern.compile("(?i)##\\s*Статус\\s*\\n+\\s*(.+?)(?=\\n##|$)", Pattern.DOTALL);
    private static final Pattern CONTEXT_PATTERN = Pattern.compile("(?i)##\\s*Контекст\\s*\\n+\\s*(.+?)(?=\\n##|$)", Pattern.DOTALL);
    private static final Pattern DECISION_PATTERN = Pattern.compile("(?i)##\\s*Решение\\s*\\n+\\s*(.+?)(?=\\n##|$)", Pattern.DOTALL);
    private static final Pattern CONSEQUENCES_PATTERN = Pattern.compile("(?i)##\\s*Последствия\\s*\\n+\\s*(.+?)(?=$)", Pattern.DOTALL);

    private final Map<String, ADR> adrCache = new LinkedHashMap<>();

    @PostConstruct
    public void init() {
        loadADRFiles();
    }

    public List<ADR> getAllADRsSorted() {
        return adrCache.values()
                .stream()
                .sorted((a1, a2) -> {
                    try {
                        int id1 = Integer.parseInt(a1.getId());
                        int id2 = Integer.parseInt(a2.getId());
                        return Integer.compare(id1, id2);
                    } catch (NumberFormatException e) {
                        return a1.getId().compareTo(a2.getId());
                    }
                })
                .collect(Collectors.toList());
    }

    public void loadADRFiles() {
        adrCache.clear();
        try {
            // Путь относительно корня веб-архива (теперь вне classes)
            String path = "/adr/";
            Set<String> resourcePaths = servletContext.getResourcePaths(path);

            if (resourcePaths != null) {
                for (String resPath : resourcePaths) {
                    if (resPath.endsWith(".md")) {
                        // Используем getResourceAsStream для чтения содержимого
                        try (InputStream is = servletContext.getResourceAsStream(resPath)) {
                            if (is != null) {
                                String content = new String(is.readAllBytes(), StandardCharsets.UTF_8);
                                String filename = resPath.substring(resPath.lastIndexOf('/') + 1);
                                ADR adr = parseADRContent(content, filename);
                                if (adr != null) {
                                    adrCache.put(adr.getId(), adr);
                                }
                            }
                        }
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("Ошибка при чтении ADR: " + e.getMessage());
        }
    }

    private ADR parseADRContent(String text, String filename) {
        ADR adr = new ADR();
        adr.setFilename(filename);

        // Парсинг ID и заголовка
        Matcher titleMatcher = TITLE_PATTERN.matcher(text);
        if (titleMatcher.find()) {
            adr.setId(titleMatcher.group(1).trim());
            adr.setTitle(titleMatcher.group(2).trim());
        }

        // Парсинг статуса
        Matcher statusMatcher = STATUS_PATTERN.matcher(text);
        if (statusMatcher.find()) {
            adr.setStatus(statusMatcher.group(1).trim());
        }

        // Парсинг секций (Контекст, Решение, Последствия)
        adr.setContext(extractSection(text, CONTEXT_PATTERN, "Контекст не указан"));
        adr.setDecision(extractSection(text, DECISION_PATTERN, "Решение не указано"));
        adr.setConsequences(extractSection(text, CONSEQUENCES_PATTERN, "Последствия не указаны"));

        adr.setCreatedAt(LocalDateTime.now());
        adr.setUpdatedAt(LocalDateTime.now());

        return adr.getId() != null ? adr : null;
    }

    private String extractSection(String text, Pattern pattern, String defaultValue) {
        Matcher matcher = pattern.matcher(text);
        if (matcher.find()) {
            return convertMarkdownToHtml(matcher.group(1).trim());
        }
        return defaultValue;
    }

    private String convertMarkdownToHtml(String markdown) {
        Parser parser = Parser.builder().build();
        Node document = parser.parse(markdown);
        HtmlRenderer renderer = HtmlRenderer.builder().build();
        return renderer.render(document);
    }

    public List<ADR> getAllADRs() {
        return new ArrayList<>(adrCache.values());
    }
}