import express from "express";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";
dotenv.config();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3e3;
const isProd = process.env.NODE_ENV === "production";
function generateFallbackVeterinaryResponse(message, cowContext, language) {
  const query = (message || "").toLowerCase();
  const cowName = cowContext?.name || "Lakshmi";
  const cowId = cowContext?.id || "C-024";
  const vetName = cowContext?.vetName || "Dr. Rajesh Sharma";
  const vetPhone = cowContext?.vetPhone || "+91 98960 11982";
  const milkTemp = cowContext?.temperature || 40.1;
  const scc = cowContext?.scc || 450;
  const affectedQuarter = cowContext?.affectedQuarter || "Left-rear quarter";
  if (query.includes("temperature") || query.includes("milk temp") || query.includes("temp") || query.includes("\u0924\u093E\u092A\u092E\u093E\u0928") || query.includes("\u0BB5\u0BC6\u0BAA\u0BCD\u0BAA\u0BA8\u0BBF\u0BB2\u0BC8")) {
    return `\u{1F321}\uFE0F **Milk Temperature & Mastitis Indicator Guide**:
\u2022 **Normal Milk Temp**: 38.0\xB0C \u2013 38.8\xB0C (healthy baseline is ~38.5\xB0C during milking).
\u2022 **Elevated Milk Temp**: >39.5\xB0C (like ${cowName}'s current ${milkTemp}\xB0C reading).
\u2022 **Why it Rises**: Mastitis causes localized vasodilation and neutrophil rush in the infected udder quarter tissue. This releases inflammatory heat directly into the secreted milk before leaving the teat!
\u2022 **Immediate Action**:
  1. Inspect the warm quarter (${affectedQuarter}) for swelling, firmness, or redness.
  2. Strip milk onto a clean plate or California Mastitis Test (CMT) paddle.
  3. Apply cool water compress after milking and isolate milk from bulk tank.`;
  }
  if (query.includes("scc") || query.includes("somatic") || query.includes("cell count") || query.includes("cells")) {
    return `\u{1F9EA} **Somatic Cell Count (SCC) Breakdown**:
\u2022 **< 200,000 cells/mL (Healthy)**: Normal shedding of epithelial cells; safe for human consumption and premium dairy rate.
\u2022 **200,000 \u2013 400,000 cells/mL (Subclinical Mastitis)**: Early inflammatory response. No visible milk clots yet, but 10-15% milk yield loss is occurring.
\u2022 **> 400,000 cells/mL (Clinical Danger)**: Active infection (Current ${cowName}: ${scc}k cells/mL).
\u2022 **Action**: Move ${cowName} to the designated isolation stall, disinfect milking clusters with peracetic acid, and call ${vetName}.`;
  }
  if (query.includes(cowName.toLowerCase()) || query.includes(cowId.toLowerCase()) || query.includes("why") || query.includes("risk")) {
    return `\u{1F404} **Clinical Summary for ${cowName} (${cowId})**:
\u2022 **Risk Level**: 82% High Mastitis Risk in Stall ${cowContext?.stall || 4}.
\u2022 **Milk Temperature**: Elevated at ${milkTemp}\xB0C (normal 38.5\xB0C).
\u2022 **Somatic Cells**: ${scc},000 cells/mL (dangerously elevated).
\u2022 **Affected Teat**: ${affectedQuarter} is hot, sensitive, and yielding 18.2 L (down from 27 L).
\u2022 **Rumination**: Down by 130 minutes (cow is lethargic and resting less).
\u2022 **Doctor Alert**: Mobile veterinary van dispatched. Contact ${vetName} at ${vetPhone}.`;
  }
  if (query.includes("dip") || query.includes("clean") || query.includes("hygiene") || query.includes("iodine") || query.includes("disinfect")) {
    return `\u{1F9F4} **Post-Milking Teat Disinfection Protocol**:
\u2022 **Why Dip?** The teat canal sphincter muscle remains dilated for 30\u201345 minutes after milking. Dipping coats the teat with a protective antibacterial seal.
\u2022 **Recommended Solutions**: 0.5%\u20131.0% available iodine solution with 10% glycerin emollient, or 0.5% chlorhexidine.
\u2022 **Coverage**: Dip at least 75% of each teat length immediately after releasing the milking cluster.
\u2022 **Bedding Care**: Ensure dry straw or sand bedding in Stall ${cowContext?.stall || 4}; spray lime powder to keep floors dry.`;
  }
  if (query.includes("vet") || query.includes("doctor") || query.includes("call") || query.includes("emergency") || query.includes("van")) {
    return `\u{1F691} **Veterinary Support Contact**:
\u2022 **Assigned Doctor**: ${vetName} (Chief Bovine Officer).
\u2022 **Direct Phone**: ${vetPhone}.
\u2022 **Mobile Van**: Van TN-07-BV-4091 is in Salem rural sector (~35 minutes away).
\u2022 **Pre-Arrival Instructions**:
  - Keep cow calm and provide clean fresh water.
  - Do not administer antibiotics without veterinary prescription.
  - Separate milk from affected quarter.`;
  }
  if (query.includes("conductivity") || query.includes("ms/cm") || query.includes("ion")) {
    return `\u26A1 **Milk Electrical Conductivity Insights**:
\u2022 **Normal**: 4.5 \u2013 5.5 mS/cm.
\u2022 **Mastitis Warning**: > 6.5 mS/cm.
\u2022 **Mechanism**: When mastitis bacteria damage the mammary epithelial junction, sodium (Na+) and chloride (Cl-) ions leak from blood into the milk, increasing electrical conductivity before physical clots appear!`;
  }
  return `Namaste! I am AAROGYA Bovine AI, your cattle health and mastitis guardian.
I am monitoring your dairy herd including ${cowName} (${cowId}) in Stall ${cowContext?.stall || 4}.

**Key recommendations right now**:
\u2022 Keep close observation on milk temperature (watch for >39.5\xB0C during milking).
\u2022 Check SCC telemetry daily for spikes above 200,000 cells/mL.
\u2022 Apply post-milking barrier teat dip on all active cows.
\u2022 Assigned Doctor: ${vetName} (${vetPhone}).

What specific cattle health or milking question can I assist you with?`;
}
async function startServer() {
  const app = express();
  app.use(express.json());
  const apiKey = process.env.GEMINI_API_KEY;
  let ai = null;
  if (apiKey) {
    try {
      ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build"
          }
        }
      });
    } catch (e) {
      console.warn("GoogleGenAI initialization warning:", e);
    }
  }
  const SYSTEM_INSTRUCTION = `You are AAROGYA Bovine AI, an empathetic, highly knowledgeable veterinary intelligence assistant for dairy farmers in India and worldwide.
CRITICAL DOMAIN RULES:
1. MILK TEMPERATURE VS BODY TEMPERATURE:
   - In dairy mastitis monitoring, automated inline sensors measure MILK TEMPERATURE during milking.
   - Normal healthy milk temperature is 38.0\xB0C to 38.8\xB0C (baseline ~38.5\xB0C).
   - Elevated milk temperature (>39.5\xB0C, up to 40.2\xB0C) is a primary physiological biomarker of localized udder inflammation and mastitis.
   - Never call it body temperature when discussing milking sensors or mastitis quarters; always explicitly refer to it as "Milk Temperature".
2. SOMATIC CELL COUNT (SCC):
   - <200,000 cells/mL: Healthy uninfected udder.
   - 200,000\u2013400,000 cells/mL: Subclinical mastitis warning zone.
   - >400,000 cells/mL: Active clinical mastitis requiring isolation.
3. ELECTRICAL CONDUCTIVITY:
   - Baseline 4.5\u20135.5 mS/cm. Elevated >6.5 mS/cm indicates ion leakage from blood-milk barrier damage.
4. TONE & FORMAT:
   - Friendly, practical, empathetic to dairy farmers.
   - Use concise bullet points, bold key numbers, and actionable steps.
   - If asked in Hindi, Punjabi, or Tamil, provide answers in that language or English with respectful tone.`;
  app.post("/api/gemini/chat", async (req, res) => {
    try {
      const { message, history, cowContext, language } = req.body;
      if (!message || typeof message !== "string") {
        return res.status(400).json({ error: "Message is required" });
      }
      if (!ai) {
        const fallbackReply = generateFallbackVeterinaryResponse(message, cowContext, language);
        return res.json({ reply: fallbackReply, source: "offline-knowledge-base" });
      }
      const contents = [];
      if (cowContext) {
        contents.push({
          role: "user",
          parts: [{
            text: `[CURRENT FARM TELEMETRY: Cow ${cowContext.name || "Lakshmi"} (${cowContext.id || "C-024"}), Stall: ${cowContext.stall || 4}, SCC: ${cowContext.scc || 450}k cells/mL, Milk Temperature: ${cowContext.temperature || 40.1}\xB0C, Mastitis Risk: ${cowContext.riskLevel || "High"} (${cowContext.riskPercentage || 82}%), Affected Quarter: ${cowContext.affectedQuarter || "Left-rear"}, Assigned Vet: ${cowContext.vetName || "Dr. Rajesh Sharma"} (${cowContext.vetPhone || "+91 98960 11982"})]`
          }]
        });
        contents.push({
          role: "model",
          parts: [{
            text: `Understood. I have active telemetry for ${cowContext.name || "the cow"}. How can I assist you with herd health today?`
          }]
        });
      }
      if (Array.isArray(history)) {
        for (const item of history.slice(-6)) {
          if (item && item.text) {
            contents.push({
              role: item.sender === "user" ? "user" : "model",
              parts: [{ text: item.text }]
            });
          }
        }
      }
      contents.push({
        role: "user",
        parts: [{ text: message }]
      });
      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: 0.7
        }
      });
      const replyText = response.text || generateFallbackVeterinaryResponse(message, cowContext, language);
      return res.json({ reply: replyText, source: "gemini-3.8-flash" });
    } catch (err) {
      console.error("Gemini chat API error:", err?.message || err);
      const fallbackReply = generateFallbackVeterinaryResponse(req.body?.message || "", req.body?.cowContext, req.body?.language);
      return res.json({ reply: fallbackReply, source: "offline-knowledge-base", error: err?.message });
    }
  });
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", app: "AAROGYA Bovine Health", timestamp: (/* @__PURE__ */ new Date()).toISOString() });
  });
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, "dist")));
    app.get("*", (_req, res) => {
      res.sendFile(path.resolve(__dirname, "dist", "index.html"));
    });
  }
  app.listen(Number(PORT), "0.0.0.0", () => {
    console.log(`Server listening on port ${PORT}`);
  });
}
startServer();
