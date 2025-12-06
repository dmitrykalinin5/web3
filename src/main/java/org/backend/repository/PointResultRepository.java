package org.backend.repository;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;
import org.backend.model.PointResult;
import java.util.List;

@ApplicationScoped
public class PointResultRepository {

    @PersistenceContext(unitName = "pointCheckerPU")
    private EntityManager em;

    @Transactional
    public void save(PointResult result) {
        em.persist(result);
    }

    @Transactional
    public List<PointResult> findAll() {
        return em.createQuery("SELECT p FROM PointResult p ORDER BY p.timestamp DESC", PointResult.class)
                .getResultList();
    }

    @Transactional
    public void deleteAll() {
        em.createQuery("DELETE FROM PointResult").executeUpdate();
    }
}