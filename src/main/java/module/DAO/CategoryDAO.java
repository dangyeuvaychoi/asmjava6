package module.DAO;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import module.Domain.Category;

@Repository
public interface CategoryDAO extends JpaRepository<Category, Integer>{

}
