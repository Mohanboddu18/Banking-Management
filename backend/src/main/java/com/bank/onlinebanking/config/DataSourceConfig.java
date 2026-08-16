package com.bank.onlinebanking.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;
import java.sql.Connection;

@Configuration
@Slf4j
public class DataSourceConfig {

    @Value("${spring.datasource.url:jdbc:mysql://mysql-2b7feb4e-mohanboddu18-d9b5.g.aivencloud.com:20198/defaultdb?useSSL=true&trustServerCertificate=true&allowPublicKeyRetrieval=true&serverTimezone=UTC}")
    private String dbUrl;

    @Value("${spring.datasource.username:avnadmin}")
    private String username;

    @Value("${spring.datasource.password:mohan}")
    private String password;

    @Value("${spring.datasource.driver-class-name:com.mysql.cj.jdbc.Driver}")
    private String driverClassName;

    @Bean
    @Primary
    public DataSource dataSource() {
        log.info("Attempting primary MySQL DataSource connection: {}", dbUrl);

        try {
            HikariConfig config = new HikariConfig();
            config.setJdbcUrl(dbUrl);
            config.setUsername(username);
            config.setPassword(password);
            config.setDriverClassName(driverClassName != null ? driverClassName : "com.mysql.cj.jdbc.Driver");

            config.setMaximumPoolSize(5);
            config.setMinimumIdle(1);
            config.setIdleTimeout(30000);
            config.setConnectionTimeout(5000);
            config.setValidationTimeout(3000);
            config.setInitializationFailTimeout(3000);

            HikariDataSource ds = new HikariDataSource(config);
            try (Connection conn = ds.getConnection()) {
                log.info("Successfully connected to primary MySQL database!");
            }
            return ds;
        } catch (Exception e) {
            log.warn("Primary MySQL connection failed ({}), falling back to embedded H2 database...", e.getMessage());

            HikariConfig h2Config = new HikariConfig();
            h2Config.setJdbcUrl("jdbc:h2:mem:bankdb;DB_CLOSE_DELAY=-1;MODE=MySQL;NON_KEYWORDS=USER,VALUE,KEY");
            h2Config.setUsername("sa");
            h2Config.setPassword("");
            h2Config.setDriverClassName("org.h2.Driver");
            h2Config.setMaximumPoolSize(10);
            h2Config.setMinimumIdle(2);

            HikariDataSource h2Ds = new HikariDataSource(h2Config);
            log.info("Embedded H2 MySQL-compatibility DataSource initialized successfully!");
            return h2Ds;
        }
    }
}
