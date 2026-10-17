sed -i '1165,1210c\
    let leftY = y + 20;\
    if (leftY > 260) {\
      doc.addPage();\
      leftY = margin;\
    } else {\
      leftY = Math.max(startTotalsY + 15, y + 15);\
    }\
    \
    doc.setTextColor(30, 64, 137);\
    doc.setFont("helvetica", "bold");\
    doc.setFontSize(9);\
    doc.text("TÉRMINOS Y CONDICIONES", margin, leftY);\
\
    leftY += 5;\
    doc.setTextColor(0, 0, 0);\
    doc.setFont("helvetica", "normal");\
    doc.setFontSize(8);\
    \
    const splitNotes = doc.splitTextToSize(notesForPdf, contentWidth);\
    doc.text(splitNotes, margin, leftY);\
    leftY += splitNotes.length * 4;\
\
    leftY += 8;\
    doc.setTextColor(30, 64, 137);\
    doc.setFont("helvetica", "bold");\
    doc.setFontSize(10);\
    doc.text(`Empresa: ${state.businessDetails.name || "Aludev"}`, margin, leftY);\
    leftY += 5;\
    doc.text(`Contacto: ${businessPhoneForPdf.trim() || "-"}`, margin, leftY);\
\
    // 6. Footer\
    doc.setTextColor(150, 150, 150);\
    doc.setFont("helvetica", "normal");\
    doc.setFontSize(7);\
    doc.text("Documento generado automáticamente por el sistema de cotización ALUDEV.", pageWidth / 2, pageHeight - 10, { align: "center" });\
' src/components/Cotizador.tsx
