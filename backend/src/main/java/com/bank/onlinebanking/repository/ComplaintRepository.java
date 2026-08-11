package com.bank.onlinebanking.repository;

import com.bank.onlinebanking.entity.Complaint;
import com.bank.onlinebanking.entity.enums.ComplaintStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ComplaintRepository extends JpaRepository<Complaint, Long> {
    Optional<Complaint> findByComplaintTicket(String complaintTicket);
    List<Complaint> findAllByCustomer_User_Username(String username);
    List<Complaint> findAllByStatus(ComplaintStatus status);
    List<Complaint> findAllByAssignedEmployee_User_Username(String username);
}
