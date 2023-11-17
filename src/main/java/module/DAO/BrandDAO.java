package module.DAO;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import module.Domain.Brand;

@Repository
public interface BrandDAO extends JpaRepository<Brand, Integer>{

}
