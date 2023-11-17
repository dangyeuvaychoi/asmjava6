package module.DAO;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

import module.Domain.Products;

@Repository
public interface ProductDAO extends JpaRepository<Products, Integer> {

	@Query(value = "select * from products where categoryid = ?", nativeQuery = true)
	List<Products> findByCategory(Integer categoryid);
}
