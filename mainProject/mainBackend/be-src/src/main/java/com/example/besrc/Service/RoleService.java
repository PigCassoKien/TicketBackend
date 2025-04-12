package com.example.besrc.Service;

import com.example.besrc.Entities.EnumEntities.ERole;
import com.example.besrc.Entities.Role;
import com.example.besrc.Repository.RoleRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;



@Component
public class RoleService {

    @Autowired
    private RoleRepository roleRepository;

    @PostConstruct
    public void init() {
        // Kiểm tra xem role "USER" đã tồn tại chưa
        if (roleRepository.findByName(ERole.USER).isEmpty()) {
            // Nếu chưa, tạo mới và lưu vào cơ sở dữ liệu
            roleRepository.save(new Role(ERole.USER));
        }
        if (roleRepository.findByName(ERole.ADMIN).isEmpty()) {
            roleRepository.save(new Role(ERole.ADMIN));
        }
    }
}
