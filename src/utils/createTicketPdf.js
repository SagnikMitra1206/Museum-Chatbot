import { PDFDocument, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import QRCode from "qrcode";
import fs from "fs";
import path from "path";
import { promisify } from "util";

const writeFile = promisify(fs.writeFile);

/**
 * Convert base64 QR to Uint8Array
 */
function dataURLToUint8Array(dataURL) {
  const base64 = dataURL.split(",")[1];
  const binary = Buffer.from(base64, "base64");
  return new Uint8Array(binary);
}

export async function createTicketPdf(booking) {
  const {
    bookingId,
    showName,
    date,
    time,
    purchaserName,
    purchaserEmail,
    quantity,
    pricePerTicket,
    totalPrice,
    venue = "City Museum",
    seatInfo = "General Admission",
  } = booking;

  // ===== QR Code pointing to /verify endpoint =====
  const BASE_URL = process.env.BASE_URL || "http://localhost:5000";
  const verifyUrl = `${BASE_URL.replace(/\/$/, "")}/verify?bookingId=${encodeURIComponent(bookingId)}`;
  const qrDataUrl = await QRCode.toDataURL(verifyUrl, { margin: 1, width: 300 });

  // ===== Create PDF =====
  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkit);
  const page = pdfDoc.addPage([540, 780]);
  const { width, height } = page.getSize();

  // ===== Embed fonts =====
  const fontRegularPath = path.join(process.cwd(), "backend/fonts/NotoSans-Regular.ttf");
  const fontBoldPath = path.join(process.cwd(), "backend/fonts/NotoSans-Bold.ttf");

  const fontRegularBytes = fs.readFileSync(fontRegularPath);
  const fontBoldBytes = fs.readFileSync(fontBoldPath);

  const fontRegular = await pdfDoc.embedFont(fontRegularBytes);
  const fontBold = await pdfDoc.embedFont(fontBoldBytes);

  const dark = rgb(0.07, 0.09, 0.11);
  const accent = rgb(0.02, 0.58, 0.54);

  // ===== Header =====
  page.drawText(venue, { x: 48, y: height - 84, size: 20, font: fontBold, color: dark });
  page.drawText("Admission Ticket", { x: 48, y: height - 106, size: 12, font: fontRegular, color: rgb(0.4, 0.45, 0.5) });
  page.drawText(showName, { x: 48, y: height - 144, size: 16, font: fontBold, color: dark });

  // ===== Meta info =====
  let metaY = height - 176;
  const lineGap = 18;
  page.drawText(`Date: ${date}`, { x: 48, y: metaY, size: 11, font: fontRegular, color: dark }); metaY -= lineGap;
  page.drawText(`Time: ${time}`, { x: 48, y: metaY, size: 11, font: fontRegular, color: dark }); metaY -= lineGap;
  page.drawText(`Seat: ${seatInfo}`, { x: 48, y: metaY, size: 11, font: fontRegular, color: dark }); metaY -= lineGap;
  page.drawText(`Quantity: ${quantity}`, { x: 48, y: metaY, size: 11, font: fontRegular, color: dark }); metaY -= lineGap;

  page.drawText(`Price (each): ₹${pricePerTicket}`, { x: 48, y: metaY, size: 11, font: fontRegular, color: dark }); metaY -= lineGap;
  page.drawText(`Total: ₹${totalPrice}`, { x: 48, y: metaY, size: 12, font: fontBold, color: accent });

  page.drawText(`Purchaser: ${purchaserName} (${purchaserEmail})`, { x: 48, y: metaY - 36, size: 10, font: fontRegular, color: dark });
  page.drawText(`Booking ID: ${bookingId}`, { x: 48, y: 110, size: 10, font: fontRegular, color: rgb(0.35, 0.38, 0.42) });

  // ===== Embed QR code =====
  const qrBytes = dataURLToUint8Array(qrDataUrl);
  const qrImage = await pdfDoc.embedPng(qrBytes);
  const qrDims = qrImage.scale(0.9);
  page.drawImage(qrImage, { x: width - 48 - qrDims.width, y: height - 270, width: qrDims.width, height: qrDims.height });

  // ===== Save PDF =====
  const TICKETS_DIR = path.join(process.cwd(), "backend/tickets");
  if (!fs.existsSync(TICKETS_DIR)) fs.mkdirSync(TICKETS_DIR, { recursive: true });

  const filename = `ticket_${bookingId}.pdf`;
  const filepath = path.join(TICKETS_DIR, filename);
  await writeFile(filepath, await pdfDoc.save());

  return { filename, filepath, webPath: `/tickets/${filename}` };
}
