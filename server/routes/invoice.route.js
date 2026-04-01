// const express = require("express");
// const router = express.Router();
// const { generateInvoicePDF } = require("../services/invoice.service");
// const Purchase = require("../models/Purchase");
// const { requireAuth } = require("../utils/auth");

// router.get("/invoice/by-prompt/:promptId", requireAuth, async (req, res) => {
//   try {
//     const { promptId } = req.params;
//     const buyerId = req.user._id;

//     const purchase = await Purchase.findOne({
//       prompt: promptId,
//       buyer: buyerId, // ✅ FIXED
//     })
//       .populate("prompt")
//       .populate("buyer", "name email");

//     if (!purchase) {
//       return res.status(404).json({
//         success: false,
//         message: "No purchase found for this prompt",
//       });
//     }

//     const items = [
//       {
//         title: purchase.prompt.title,
//         subtitle: "Prompt Purchase",
//         price: purchase.pricePaid, // ✅ FIXED
//       },
//     ];

//     const pdf = await generateInvoicePDF({
//       logo: `${process.env.APP_URL}/icons/Tokun.png`,
//       date: new Date(purchase.createdAt).toLocaleDateString("en-GB"),
//       invoiceNo: `INV-${purchase._id}`,
//       buyerName: purchase.buyer.name,
//       buyerEmail: purchase.buyer.email,
//       items,
//       total: purchase.pricePaid.toFixed(2), // ✅ FIXED
//     });

//     res.set({
//       "Content-Type": "application/pdf",
//       "Content-Disposition": `attachment; filename=invoice_${purchase._id}.pdf`,
//     });

//     res.send(pdf);
//   } catch (err) {
//     console.error("Invoice error:", err);
//     res.status(500).json({
//       success: false,
//       message: "Invoice generation failed",
//     });
//   }
// });

// module.exports = router;




// routes/invoiceRoutes.js
const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");

const { generateInvoicePDF } = require("../services/invoice.service");
const Purchase = require("../models/Purchase");
const { requireAuth } = require("../utils/auth");

router.get("/invoice/by-prompt/:promptId", requireAuth, async (req, res) => {
  try {
    const { promptId } = req.params;
    const userId = req.user._id;

    // 1️⃣ Find purchase
    const purchase = await Purchase.findOne({
      prompt: promptId,
      buyer: userId,
    })
      .populate("prompt")
      .populate("buyer", "name email");

    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: "No purchase found for this prompt",
      });
    }

    // 2️⃣ Invoice items
    const items = [
      {
        title: purchase.promptSnapshot?.title || purchase.prompt.title,
        subtitle: "Prompt",
        price: purchase.pricePaid,
      },
    ];

    // 3️⃣ 🔥 ADD LOGO BASE64 HERE (THIS ANSWERS YOUR QUESTION)
            const logoPath = path.join(__dirname, "../assets/icons/Tokun.png");

    const logoBase64 = fs.existsSync(logoPath)
      ? `data:image/png;base64,${fs.readFileSync(logoPath).toString("base64")}`
      : "";

    // 4️⃣ Generate PDF
    const pdf = await generateInvoicePDF({
      logo: logoBase64,
      date: purchase.createdAt
        ? new Date(purchase.createdAt).toLocaleDateString("en-GB")
        : new Date().toLocaleDateString("en-GB"),
      invoiceNo: `INV-${purchase._id}`,
      buyerName: purchase.buyer.name,
      buyerEmail: purchase.buyer.email,
      items,
      total: purchase.pricePaid.toFixed(2),
    });

    // 5️⃣ Send PDF
    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=invoice_${purchase._id}.pdf`,
    });

    res.send(pdf);
  } catch (err) {
    console.error("Invoice error:", err);
    res.status(500).json({
      success: false,
      message: "Invoice generation failed",
    });
  }
});

module.exports = router;
