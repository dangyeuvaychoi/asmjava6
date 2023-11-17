package module.DAO;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import module.Domain.Account;

@Repository
public interface AccountDAO extends JpaRepository<Account, String>{
}
