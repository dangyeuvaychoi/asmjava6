package module.DAO;



import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.stereotype.Repository;


import module.Domain.Role;

@Repository
public interface RoleDAO extends JpaRepository<Role,String>{

}
