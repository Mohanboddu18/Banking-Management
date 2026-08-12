package com.bank.onlinebanking.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;

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
        log.info("Initializing Aiven MySQL DataSource with URL: {}", dbUrl);

        HikariConfig config = new HikariConfig();
        config.setJdbcUrl(dbUrl);
        config.setUsername(username);
        config.setPassword(password);
        config.setDriverClassName(driverClassName != null ? driverClassName : "com.mysql.cj.jdbc.Driver");

        // HikariCP connection pool settings optimized for cloud MySQL
        config.setMaximumPoolSize(10);
        config.setMinimumIdle(2);
        config.setIdleTimeout(30000);
        config.setConnectionTimeout(30000);
        config.setValidationTimeout(5000);
        config.setInitializationFailTimeout(60000); // Allow up to 60s for Aiven MySQL DNS / rebuilding startup

        return new HikariDataSource(config);
    }
}
