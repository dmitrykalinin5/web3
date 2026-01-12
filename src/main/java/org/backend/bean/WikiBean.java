package org.backend.bean;

import jakarta.annotation.PostConstruct;
import jakarta.enterprise.context.SessionScoped;
import jakarta.faces.context.FacesContext;
import jakarta.inject.Inject;
import jakarta.inject.Named;
import org.backend.service.WikiService;

import java.io.Serializable;
import java.util.Map;

@Named("wikiBean")
@SessionScoped
public class WikiBean implements Serializable {

    @Inject
    private WikiService wikiService;

    private Double currentRadius;
    private String currentArticleSlug;
    private String articleUrl;
    private String articleHtml;
    private String articleTitle;

    @PostConstruct
    public void init() {
        loadArticleForCurrentRadius();
    }

    public void loadArticleForCurrentRadius() {
        Map<String, String> params = FacesContext.getCurrentInstance()
                .getExternalContext()
                .getRequestParameterMap();

        String radiusParam = params.get("radius");
        if (radiusParam != null && !radiusParam.isEmpty()) {
            try {
                currentRadius = Double.parseDouble(radiusParam);
            } catch (NumberFormatException e) {
                currentRadius = 3.0;
            }
        } else if (currentRadius == null) {
            currentRadius = 3.0;
        }

        String articleParam = params.get("article");
        if (articleParam != null && !articleParam.isEmpty()) {
            currentArticleSlug = articleParam;
        } else {
            // Если slug не указан, получаем его на основе радиуса
            currentArticleSlug = wikiService.getArticleSlugForRadius(currentRadius);
        }

        articleUrl = wikiService.getArticleUrl(currentRadius);
        articleHtml = wikiService.getArticleHtmlContent(currentRadius);
        articleTitle = wikiService.getArticleTitle(currentRadius);
    }

    public Double getCurrentRadius() {
        return currentRadius;
    }

    public void setCurrentRadius(Double currentRadius) {
        this.currentRadius = currentRadius;
    }

    public String getArticleUrl() {
        if (articleUrl == null) {
            loadArticleForCurrentRadius();
        }
        return articleUrl;
    }

    public void setArticleUrl(String articleUrl) {
        this.articleUrl = articleUrl;
    }

    public String getArticleHtml() {
        if (articleHtml == null) {
            loadArticleForCurrentRadius();
        }
        return articleHtml;
    }

    public String getArticleTitle() {
        if (articleTitle == null) {
            loadArticleForCurrentRadius();
        }
        return articleTitle;
    }

    public String getCurrentArticleSlug() {
        return currentArticleSlug;
    }

    public void setCurrentArticleSlug(String currentArticleSlug) {
        this.currentArticleSlug = currentArticleSlug;
    }

    public boolean isArticleLoaded() {
        return articleHtml != null && !articleHtml.isEmpty();
    }

    public String getArticleEmbedUrl(Double radius) {
        return wikiService.getArticleUrl(radius != null ? radius : 3.0);
    }
}