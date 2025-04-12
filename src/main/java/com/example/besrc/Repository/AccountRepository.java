package com.example.besrc.Repository;

import com.example.besrc.Entities.Account;
import com.example.besrc.Entities.EnumEntities.ERole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import javax.swing.text.html.Option;
import java.util.List;
import java.util.Optional;

@Repository
public interface AccountRepository extends JpaRepository<Account, String> {
    Optional<Account> getByUsername(String username);
    Optional<Account> getByEmail(String email);
    Optional<Account> findByUsername(String username);
    Optional <Account> findByEmail(String email);

    boolean existsByUsername( String username);
    Boolean existsByEmail( String email);
    boolean existsByRoles (ERole roles);

    int countByIp(String ip);

    List<Account> findByUsernameContaining(String username);
    void deleteByUsername( String username);

}
