package com.bank.onlinebanking.repository;

import com.bank.onlinebanking.entity.MerchantQrCode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MerchantQrCodeRepository extends JpaRepository<MerchantQrCode, Long> {
    Optional<MerchantQrCode> findByQrPayload(String qrPayload);
    Optional<MerchantQrCode> findByMerchant_MerchantCode(String merchantCode);
}
