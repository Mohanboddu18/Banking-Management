package com.bank.onlinebanking.util;

import com.bank.onlinebanking.dto.transaction.StatementSummaryResponse;
import com.bank.onlinebanking.dto.transaction.TransactionResponse;
import com.lowagie.text.Document;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.Rectangle;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.stereotype.Component;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;

@Component
public class PdfStatementGenerator {

    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("dd-MMM-yyyy HH:mm");
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd-MMM-yyyy");

    public byte[] generateStatementPdf(StatementSummaryResponse statement) {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4, 36, 36, 36, 36);

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            // Colors
            Color primaryBlue = new Color(0, 51, 102);
            Color lightGray = new Color(245, 247, 250);
            Color headerBg = new Color(230, 238, 248);
            Color debitRed = new Color(180, 40, 40);
            Color creditGreen = new Color(30, 130, 60);

            // Fonts
            Font bankTitleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18, primaryBlue);
            Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11, primaryBlue);
            Font boldFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, Color.DARK_GRAY);
            Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 9, Color.BLACK);
            Font smallFont = FontFactory.getFont(FontFactory.HELVETICA, 8, Color.GRAY);

            // 1. Bank Header Table
            PdfPTable headerTable = new PdfPTable(2);
            headerTable.setWidthPercentage(100);
            headerTable.setWidths(new float[]{60, 40});

            PdfPCell leftHeader = new PdfPCell();
            leftHeader.setBorder(Rectangle.NO_BORDER);
            leftHeader.addElement(new Paragraph("GODAVARI BANK (SIMULATION)", bankTitleFont));
            leftHeader.addElement(new Paragraph("Godavari Bank Online Financial Statement", FontFactory.getFont(FontFactory.HELVETICA, 10, Color.GRAY)));
            leftHeader.addElement(new Paragraph("Branch: " + statement.getBranchName() + " | IFSC: " + statement.getIfscCode(), smallFont));
            headerTable.addCell(leftHeader);

            PdfPCell rightHeader = new PdfPCell();
            rightHeader.setBorder(Rectangle.NO_BORDER);
            rightHeader.setHorizontalAlignment(Element.ALIGN_RIGHT);
            Paragraph dateP = new Paragraph("Generated On: " + java.time.LocalDate.now().format(DATE_FORMATTER), smallFont);
            dateP.setAlignment(Element.ALIGN_RIGHT);
            Paragraph periodP = new Paragraph("Statement Period: " + statement.getStartDate().format(DATE_FORMATTER) + " to " + statement.getEndDate().format(DATE_FORMATTER), boldFont);
            periodP.setAlignment(Element.ALIGN_RIGHT);
            rightHeader.addElement(dateP);
            rightHeader.addElement(periodP);
            headerTable.addCell(rightHeader);

            document.add(headerTable);
            document.add(new Paragraph(" "));

            // 2. Customer & Account Summary Box
            PdfPTable accountTable = new PdfPTable(4);
            accountTable.setWidthPercentage(100);
            accountTable.setWidths(new float[]{25, 25, 25, 25});

            addCell(accountTable, "Customer Name:", boldFont, headerBg);
            addCell(accountTable, statement.getCustomerName(), normalFont, Color.WHITE);
            addCell(accountTable, "Account Number:", boldFont, headerBg);
            addCell(accountTable, statement.getAccountNumber(), boldFont, Color.WHITE);

            addCell(accountTable, "Customer ID:", boldFont, headerBg);
            addCell(accountTable, statement.getCustomerId(), normalFont, Color.WHITE);
            addCell(accountTable, "Account Type:", boldFont, headerBg);
            addCell(accountTable, statement.getAccountType(), normalFont, Color.WHITE);

            addCell(accountTable, "Opening Balance:", boldFont, headerBg);
            addCell(accountTable, "INR " + statement.getOpeningBalance(), boldFont, lightGray);
            addCell(accountTable, "Closing Balance:", boldFont, headerBg);
            addCell(accountTable, "INR " + statement.getClosingBalance(), boldFont, lightGray);

            addCell(accountTable, "Total Credits (+):", boldFont, headerBg);
            addCell(accountTable, "INR " + statement.getTotalCredits(), FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, creditGreen), Color.WHITE);
            addCell(accountTable, "Total Debits (-):", boldFont, headerBg);
            addCell(accountTable, "INR " + statement.getTotalDebits(), FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, debitRed), Color.WHITE);

            document.add(accountTable);
            document.add(new Paragraph(" "));

            // 3. Transactions Table
            Paragraph txHeader = new Paragraph("Transaction Details (" + statement.getTransactionCount() + " records)", headerFont);
            document.add(txHeader);
            document.add(new Paragraph(" "));

            PdfPTable txTable = new PdfPTable(6);
            txTable.setWidthPercentage(100);
            txTable.setWidths(new float[]{18, 18, 28, 12, 12, 12});

            // Table Headers
            addHeaderCell(txTable, "Date & Time", boldFont, primaryBlue);
            addHeaderCell(txTable, "Txn Reference", boldFont, primaryBlue);
            addHeaderCell(txTable, "Description", boldFont, primaryBlue);
            addHeaderCell(txTable, "Debit (INR)", boldFont, primaryBlue);
            addHeaderCell(txTable, "Credit (INR)", boldFont, primaryBlue);
            addHeaderCell(txTable, "Balance", boldFont, primaryBlue);

            // Table Rows
            if (statement.getTransactions() == null || statement.getTransactions().isEmpty()) {
                PdfPCell emptyCell = new PdfPCell(new Phrase("No transactions recorded during this period.", normalFont));
                emptyCell.setColspan(6);
                emptyCell.setHorizontalAlignment(Element.ALIGN_CENTER);
                emptyCell.setPadding(10);
                txTable.addCell(emptyCell);
            } else {
                java.util.List<TransactionResponse> sortedTxns = new java.util.ArrayList<>(statement.getTransactions());
                sortedTxns.sort((a, b) -> {
                    if (a.getCreatedAt() == null || b.getCreatedAt() == null) return 0;
                    return b.getCreatedAt().compareTo(a.getCreatedAt());
                });

                for (TransactionResponse tx : sortedTxns) {
                    Color rowBg = Color.WHITE;
                    String formattedDate = tx.getCreatedAt() != null ? tx.getCreatedAt().format(DATE_TIME_FORMATTER) : "-";
                    
                    addTxCell(txTable, formattedDate, normalFont, rowBg, Element.ALIGN_LEFT);
                    addTxCell(txTable, tx.getTransactionRef(), smallFont, rowBg, Element.ALIGN_LEFT);
                    addTxCell(txTable, tx.getDescription() != null ? tx.getDescription() : tx.getTransactionTypeName(), normalFont, rowBg, Element.ALIGN_LEFT);

                    if ("DEBIT".equalsIgnoreCase(tx.getEntryType())) {
                        addTxCell(txTable, tx.getAmount().toString(), FontFactory.getFont(FontFactory.HELVETICA_BOLD, 8, debitRed), rowBg, Element.ALIGN_RIGHT);
                        addTxCell(txTable, "-", normalFont, rowBg, Element.ALIGN_CENTER);
                    } else {
                        addTxCell(txTable, "-", normalFont, rowBg, Element.ALIGN_CENTER);
                        addTxCell(txTable, tx.getAmount().toString(), FontFactory.getFont(FontFactory.HELVETICA_BOLD, 8, creditGreen), rowBg, Element.ALIGN_RIGHT);
                    }

                    addTxCell(txTable, tx.getBalanceAfter() != null ? tx.getBalanceAfter().toString() : "-", normalFont, rowBg, Element.ALIGN_RIGHT);
                }
            }

            document.add(txTable);

            // Footer Note
            document.add(new Paragraph(" "));
            Paragraph footerP = new Paragraph("This is a computer-generated simulated bank statement and does not require a physical signature.", smallFont);
            footerP.setAlignment(Element.ALIGN_CENTER);
            document.add(footerP);

            document.close();
        } catch (Exception e) {
            throw new RuntimeException("Error creating bank statement PDF: " + e.getMessage(), e);
        }

        return out.toByteArray();
    }

    private void addCell(PdfPTable table, String text, Font font, Color bgColor) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setBackgroundColor(bgColor);
        cell.setPadding(5);
        cell.setBorderColor(new Color(220, 220, 220));
        table.addCell(cell);
    }

    private void addHeaderCell(PdfPTable table, String text, Font font, Color bgColor) {
        PdfPCell cell = new PdfPCell(new Phrase(text, FontFactory.getFont(FontFactory.HELVETICA_BOLD, 8, Color.WHITE)));
        cell.setBackgroundColor(bgColor);
        cell.setPadding(6);
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        table.addCell(cell);
    }

    private void addTxCell(PdfPTable table, String text, Font font, Color bgColor, int alignment) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setBackgroundColor(bgColor);
        cell.setPadding(5);
        cell.setHorizontalAlignment(alignment);
        cell.setBorderColor(new Color(235, 235, 235));
        table.addCell(cell);
    }
}
