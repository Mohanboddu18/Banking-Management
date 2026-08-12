package com.bank.onlinebanking.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;
import java.net.InetAddress;

@Configuration
@Slf4j
public class DataSourceConfig {

    @Value("${spring.datasource.url:jdbc:h2:mem:bankingdb;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE;MODE=MySQL}")
    private String dbUrl;

    @Value("${spring.datasource.username:sa}")
    private String username;

    @Value("${spring.datasource.password:}")
    private String password;

    @Value("${spring.datasource.driver-class-name:org.h2.Driver}")
    private String driverClassName;

    @Bean
    @Primary
    public DataSource dataSource() {
        boolean useH2Fallback = false;

        if (dbUrl != null && dbUrl.startsWith("jdbc:mysql://")) {
            try {
                String cleanUrl = dbUrl.substring(13); // strip jdbc:mysql://
                int slashIdx = cleanUrl.indexOf("/");
                int colonIdx = cleanUrl.indexOf(":");
                String host = cleanUrl;
                if (colonIdx != -1 && (slashIdx == -1 || colonIdx < slashIdx)) {
                    host = cleanUrl.substring(0, colonIdx);
                } else if (slashIdx != -1) {
                    host = cleanUrl.substring(0, slashIdx);
                }

                log.info("Testing DNS reachability for MySQL database host: [{}]", host);
                InetAddress.getByName(host);
                log.info("Database host [{}] DNS resolution succeeded. Connecting to MySQL.", host);
            } catch (Exception e) {
                log.warn("Database host in DB_URL is unreachable ({}: {}). Automatically falling back to H2 in-memory database!",
                        dbUrl, e.getMessage());
                useH2Fallback = true;
            }
        }

        HikariConfig config = new HikariConfig();
        if (useH2Fallback || dbUrl == null || dbUrl.contains("h2")) {
            log.info("Initializing H2 In-Memory DataSource (MODE=MySQL)...");
            config.setJdbcUrl("jdbc:h2:mem:bankingdb;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE;MODE=MySQL");
            config.setUsername("sa");
            config.setPassword("");
            config.setDriverClassName("org.h2.Driver");
        } else {
            log.info("Initializing DataSource with URL: {}", dbUrl);
            config.setJdbcUrl(dbUrl);
            config.setUsername(username);
            config.setPassword(password);
            if (driverClassName != null && !driverClassName.isEmpty() && !"org.h2.Driver".equals(driverClassName)) {
                config.setDriverClassName(driverClassName);
            } else {
                config.setDriverClassName("com.mysql.cj.jdbc.Driver");
            }
        }

        config.setMaximumPoolSize(10);
        config.setMinimumIdle(2);
        config.setIdleTimeout(30000);
        config.setConnectionTimeout(10000);

        return new HikariDataSource(config);
    }
}
