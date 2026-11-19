package br.com.motivafit.repository;

import br.com.motivafit.entity.DesafioItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;

public interface DesafioItemRepository extends JpaRepository<DesafioItem, Long> {

    List<DesafioItem> findAllByDesafioIdIn(Collection<Long> desafioIds);
}