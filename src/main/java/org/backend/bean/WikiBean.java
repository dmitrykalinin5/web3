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
    private String articleUrl;

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
                articleUrl = wikiService.getArticleEmbedUrl(currentRadius);
            } catch (NumberFormatException e) {
                currentRadius = 3.0;
                articleUrl = wikiService.getArticleEmbedUrl(currentRadius);
            }
        } else if (currentRadius == null) {
            currentRadius = 3.0;
            articleUrl = wikiService.getArticleEmbedUrl(currentRadius);
        }
    }

    public Double getCurrentRadius() {
        return currentRadius;
    }

    public void setCurrentRadius(Double currentRadius) {
        this.currentRadius = currentRadius;
    }

    public String getArticleUrl() {
        return articleUrl;
    }

    public void setArticleUrl(String articleUrl) {
        this.articleUrl = articleUrl;
    }

    public String getArticleEmbedUrl(Double radius) {
        return wikiService.getArticleEmbedUrl(radius != null ? radius : 3.0);
    }
}