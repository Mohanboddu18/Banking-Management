package com.bank.onlinebanking.util;

import com.bank.onlinebanking.dto.transaction.StatementSummaryResponse;
import com.bank.onlinebanking.dto.transaction.TransactionResponse;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVPrinter;
import org.springframework.stereotype.Component;

import java.io.ByteArrayOutputStream;
import java.io.OutputStreamWriter;
import java.nio.charset.StandardCharsets;
import java.time.format.DateTimeFormatter;

@Component
public class CsvStatementGenerator {

    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    public byte[] generateStatementCsv(StatementSummaryResponse statement) {
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try (CSVPrinter printer = new CSVPrinter(new OutputStreamWriter(out, StandardCharsets.UTF_8),
                CSVFormat.DEFAULT.builder().setHeader(
                        "Transaction Date", "Transaction Ref", "Type", "Description",
                        "From Account", "To Account", "Debit", "Credit", "Balance After", "Status"
                ).build())) {

            if (statement.getTransactions() != null) {
                for (TransactionResponse tx : statement.getTransactions()) {
                    String date = tx.getCreatedAt() != null ? tx.getCreatedAt().format(DATE_TIME_FORMATTER) : "";
                    String debit = "DEBIT".equalsIgnoreCase(tx.getEntryType()) ? tx.getAmount().toString() : "";
                    String credit = "CREDIT".equalsIgnoreCase(tx.getEntryType()) ? tx.getAmount().toString() : "";

                    printer.printRecord(
                            date,
                            tx.getTransactionRef(),
                            tx.getTransactionTypeName(),
                            tx.getDescription(),
                            tx.getFromAccountNumber() != null ? tx.getFromAccountNumber() : "-",
                            tx.getToAccountNumber() != null ? tx.getToAccountNumber() : "-",
                            debit,
                            credit,
                            tx.getBalanceAfter() != null ? tx.getBalanceAfter().toString() : "-",
                            tx.getStatus()
                    );
                }
            }

            printer.flush();
        } catch (Exception e) {
            throw new RuntimeException("Error creating bank statement CSV: " + e.getMessage(), e);
        }

        return out.toByteArray();
    }
}
