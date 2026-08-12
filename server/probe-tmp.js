require("dotenv").config();
const mongoose = require("mongoose");
const PlatformWallet = require("./models/PlatformWallet");

(async () => {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI || process.env.DB_URL;
  console.log("uri present:", !!uri);
  await mongoose.connect(uri);
  const wallet = await PlatformWallet.findOne({ key: "platform" }).lean();
  console.log("wallet found:", !!wallet);
  if (wallet) {
    console.log("tx count:", (wallet.transactions || []).length);
    console.log("totalRevenue:", wallet.totalRevenue, "gst:", wallet.gstCollected);
    const sample = (wallet.transactions || []).slice(0, 5).map(t => ({
      type: t.type, source: t.source, amount: t.amount, createdAt: t.createdAt,
    }));
    console.log("sample:", JSON.stringify(sample, null, 2));
    const types = {}, sources = {}, noDate = [];
    for (const t of wallet.transactions || []) {
      types[t.type] = (types[t.type] || 0) + 1;
      sources[t.source] = (sources[t.source] || 0) + 1;
      if (!t.createdAt || Number.isNaN(new Date(t.createdAt).getTime())) noDate.push(t);
    }
    console.log("types:", types);
    console.log("sources:", sources);
    console.log("rows with no/invalid createdAt:", noDate.length);
  }
  await mongoose.disconnect();
})().catch(e => { console.error("ERR:", e.message); process.exit(1); });
