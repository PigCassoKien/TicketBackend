package com.example.besrc.Service;

import com.example.besrc.Entities.Account;
import com.example.besrc.Entities.EnumEntities.ERole;
import com.example.besrc.Entities.EnumEntities.UserStatus;
import com.example.besrc.Entities.Role;
import com.example.besrc.Repository.AccountRepository;
import com.example.besrc.Repository.RoleRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

@Service
public class SuperAdminInitializer {

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private RoleRepository roleRepository;

    @PostConstruct
    public void init() {
        if (!roleRepository.existsByName(ERole.SUPER_ADMIN)) {
            Role superAdminRole = new Role();
            superAdminRole.setRoleId(UUID.randomUUID().getMostSignificantBits() & Long.MAX_VALUE); // Fix lỗi này
            superAdminRole.setName(ERole.SUPER_ADMIN);
            roleRepository.save(superAdminRole);
        }

        Optional<Account> existingSAdmin = accountRepository.findByUsername("superadmin");
        if (existingSAdmin.isPresent()) {
            System.out.println("Existed Super Admin");
            return;
        }

        Account superAdmin = new Account();
        superAdmin.setId(String.valueOf(UUID.randomUUID().getMostSignificantBits() & Long.MAX_VALUE)); // Fix lỗi này
        superAdmin.setFullName("Super Admin");
        superAdmin.setUsername("superadmin");
        superAdmin.setPassword(passwordEncoder.encode("SuperAdmin123!"));
        superAdmin.setEmail("superadmin@example.com");
        superAdmin.setPhoneNumber("0123456789");
        superAdmin.setAddress("System Address");
        superAdmin.setIp("127.0.0.1");
        superAdmin.setStatus(UserStatus.ACTIVE);

        Role superAdminRole = roleRepository.findByName(ERole.SUPER_ADMIN)
                .orElseThrow(() -> new RuntimeException("Role not found"));

        Set<Role> roles = new HashSet<>();
        roles.add(superAdminRole);
        superAdmin.setRoles(roles); // Thêm dòng này để gán role

        accountRepository.save(superAdmin);
        System.out.println("Successfully!!!");
    }

}
