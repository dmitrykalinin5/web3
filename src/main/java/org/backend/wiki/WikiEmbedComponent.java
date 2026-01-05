package org.backend.wiki;

import jakarta.enterprise.context.RequestScoped;
import jakarta.inject.Named;
import java.io.Serializable;

@Named
@RequestScoped
public class WikiEmbedComponent implements Serializable {

    private String wikiBaseUrl = "http://localhost:3000";

    public String getEmbedUrl(String radius) {
        String articlePath = mapRadiusToArticle(radius);
        return wikiBaseUrl + articlePath + "?embed=true";
    }

    public String getSafeEmbedHtml(String radius) {
        String url = getEmbedUrl(radius);
        return createSafeIframeHtml(url);
    }

    private String mapRadiusToArticle(String radius) {
        double r = Double.parseDouble(radius);
        if (r == 1.0) return "/mathematics/circle/unit-circle";
        if (r == 2.0) return "/mathematics/circle/diameter-properties";
        if (r == 3.0) return "/mathematics/circle/circumference-formula";
        if (r == 4.0) return "/mathematics/circle/area-calculation";
        return "/mathematics/circle/general-properties";
    }

    private String createSafeIframeHtml(String url) {
        return "<iframe src=\"" + url + "\" " +
                "width=\"100%\" height=\"600px\" " +
                "frameborder=\"0\" " +
                "sandbox=\"allow-same-origin allow-scripts allow-forms allow-popups allow-modals\" " +
                "allow=\"fullscreen\" " +
                "style=\"border: 1px solid #ddd; border-radius: 8px;\">" +
                "</iframe>";
    }
}