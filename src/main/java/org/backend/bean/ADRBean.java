package org.backend.bean;

import jakarta.annotation.PostConstruct;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.inject.Named;
import org.backend.adr.ADR;
import org.backend.service.ADRService;

import java.io.Serializable;
import java.util.List;

@Named("adrBean")
@ApplicationScoped
public class ADRBean implements Serializable {

    @Inject
    private ADRService adrService;

    private List<ADR> allADRs;

    @PostConstruct
    public void init() {
        loadAllADRs();
    }

    public void loadAllADRs() {
        adrService.loadADRFiles();
        allADRs = adrService.getAllADRs();
    }

    public List<ADR> getAllADRs() {
        return allADRs;
    }
}