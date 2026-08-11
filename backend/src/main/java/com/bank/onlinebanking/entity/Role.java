package com.bank.onlinebanking.entity;

import com.bank.onlinebanking.entity.enums.RoleName;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "roles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Role {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(length = 40, unique = true, nullable = false)
    private RoleName name;

    @Column(length = 150)
    private String description;
}
