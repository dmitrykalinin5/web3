package org.backend.service;

import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.servlet.ServletContext;
import org.backend.adr.ADR;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.file.*;
import java.time.LocalDateTime;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@ApplicationScoped
public class ADRService {

    @Inject
    private ServletContext servletContext;

    private static final Pattern TITLE_PATTERN = Pattern.compile("#\\s*(\\d+)\\.\\s*(.+)", Pattern.DOTALL);
    private static final Pattern STATUS_PATTERN = Pattern.compile("##\\s*Статус\\s*\\n(.+)", Pattern.DOTALL);
    private static final Pattern CONTEXT_PATTERN = Pattern.compile("##\\s*Контекст\\s*\\n(.+?)(?=\\n##|$)", Pattern.DOTALL);
    private static final Pattern DECISION_PATTERN = Pattern.compile("##\\s*Решение\\s*\\n(.+?)(?=\\n##|$)", Pattern.DOTALL);
    private static final Pattern CONSEQUENCES_PATTERN = Pattern.compile("##\\s*Последствия\\s*\\n(.+)", Pattern.DOTALL);

    private final Map<String, ADR> adrCache = new LinkedHashMap<>();
    private WatchService watchService;
    private Thread watchThread;

    @PostConstruct
    public void init() {
        loadADRFiles();
        startFileWatcher();
    }

    @PreDestroy
    public void cleanup() {
        stopFileWatcher();
    }

    private void loadADRFiles() {
        adrCache.clear();
        try {
            String adrResourcePath = "/adr/";

            Set<String> resourcePaths = getResourceFiles(adrResourcePath);
            List<String> sortedFiles = new ArrayList<>(resourcePaths);
            sortedFiles.sort(String::compareTo);

            for (String resource : sortedFiles) {
                if (resource.endsWith(".md")) {
                    ADR adr = parseADRFile(adrResourcePath + resource);
                    if (adr != null) {
                        adrCache.put(adr.getId(), adr);
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("Error loading ADR files: " + e.getMessage());
        }
    }

    private Set<String> getResourceFiles(String path) throws IOException {
        Set<String> filenames = new HashSet<>();

        try (InputStream in = getClass().getResourceAsStream(path);
             BufferedReader br = new BufferedReader(new InputStreamReader(in))) {
            String resource;
            while ((resource = br.readLine()) != null) {
                filenames.add(resource);
            }
        } catch (NullPointerException e) {
            Set<String> resources = servletContext.getResourcePaths(path);
            if (resources != null) {
                for (String resource : resources) {
                    String name = resource.substring(resource.lastIndexOf('/') + 1);
                    filenames.add(name);
                }
            }
        }
        return filenames;
    }

    private ADR parseADRFile(String resourcePath) {
        try (InputStream is = servletContext.getResourceAsStream(resourcePath);
             BufferedReader reader = new BufferedReader(new InputStreamReader(is, "UTF-8"))) {

            StringBuilder content = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                content.append(line).append("\n");
            }

            String text = content.toString();
            ADR adr = new ADR();

            Matcher titleMatcher = TITLE_PATTERN.matcher(text);
            if (titleMatcher.find()) {
                adr.setId(titleMatcher.group(1).trim());
                adr.setTitle(titleMatcher.group(2).trim());
            }

            Matcher statusMatcher = STATUS_PATTERN.matcher(text);
            if (statusMatcher.find()) {
                adr.setStatus(statusMatcher.group(1).trim());
            }

            Matcher contextMatcher = CONTEXT_PATTERN.matcher(text);
            if (contextMatcher.find()) {
                adr.setContext(contextMatcher.group(1).trim());
            }

            Matcher decisionMatcher = DECISION_PATTERN.matcher(text);
            if (decisionMatcher.find()) {
                adr.setDecision(decisionMatcher.group(1).trim());
            }

            Matcher consequencesMatcher = CONSEQUENCES_PATTERN.matcher(text);
            if (consequencesMatcher.find()) {
                adr.setConsequences(consequencesMatcher.group(1).trim());
            }

            adr.setCreatedAt(LocalDateTime.now());
            adr.setUpdatedAt(LocalDateTime.now());

            String filename = resourcePath.substring(resourcePath.lastIndexOf('/') + 1);
            adr.setFilename(filename);

            return adr;

        } catch (Exception e) {
            System.err.println("Error parsing ADR file: " + resourcePath + " - " + e.getMessage());
            return null;
        }
    }

    private void startFileWatcher() {
        try {
            String realPath = servletContext.getRealPath("/WEB-INF/classes/adr");
            if (realPath == null) {
                realPath = servletContext.getRealPath("/adr");
            }

            if (realPath != null) {
                Path adrDir = Paths.get(realPath);

                if (Files.exists(adrDir) && Files.isDirectory(adrDir)) {
                    watchService = FileSystems.getDefault().newWatchService();
                    adrDir.register(watchService,
                            StandardWatchEventKinds.ENTRY_CREATE,
                            StandardWatchEventKinds.ENTRY_MODIFY,
                            StandardWatchEventKinds.ENTRY_DELETE);

                    watchThread = new Thread(this::watchDirectory);
                    watchThread.setDaemon(true);
                    watchThread.start();
                    System.out.println("ADR file watcher started for: " + adrDir);
                }
            }
        } catch (Exception e) {
            System.err.println("Cannot start ADR file watcher: " + e.getMessage());
        }
    }

    private void watchDirectory() {
        try {
            while (!Thread.currentThread().isInterrupted()) {
                WatchKey key = watchService.take();

                for (WatchEvent<?> event : key.pollEvents()) {
                    WatchEvent.Kind<?> kind = event.kind();

                    if (kind == StandardWatchEventKinds.OVERFLOW) {
                        continue;
                    }

                    loadADRFiles();
                    System.out.println("ADR files reloaded due to: " + kind.name());
                }

                if (!key.reset()) {
                    break;
                }
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        } catch (ClosedWatchServiceException e) {
            //
        }
    }

    private void stopFileWatcher() {
        if (watchThread != null) {
            watchThread.interrupt();
        }
        if (watchService != null) {
            try {
                watchService.close();
            } catch (IOException e) {
                //
            }
        }
    }

    public List<ADR> getAllADRs() {
        return new ArrayList<>(adrCache.values());
    }

    public Optional<ADR> getADR(String id) {
        return Optional.ofNullable(adrCache.get(id));
    }
}