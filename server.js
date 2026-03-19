require("dotenv").config()
const express = require("express")
const cors = require("cors")
const axios = require("axios")

const app = express()

app.use(cors())
app.use(express.json())
app.use(express.static("public"))

const HF_API_KEY = process.env.HF_API_KEY

const HF_URL =
"https://router.huggingface.co/hf-inference/models/facebook/bart-large-mnli"



/* =========================
   SCAM MESSAGE ANALYZER
========================= */

app.post("/analyze-scam", async (req, res) => {

const message = req.body.message

if (!message) {
  return res.json({ result: "⚠️ No message provided" })
}

try {

const response = await axios.post(
HF_URL,
{
inputs: message,
parameters: {
candidate_labels: ["scam", "safe message"]
}
},
{
headers: {
Authorization: `Bearer ${HF_API_KEY}`
},
timeout: 10000
}
)

// 🔐 SAFE RESPONSE HANDLING
let data = response.data

if (Array.isArray(data)) {
  data = data[0]
}

if (!data || data.error) {
  return res.json({
    result: "⏳ AI model is loading, try again...",
  })
}

let label, confidence

// Handle both formats
if (data.labels && data.scores) {
  label = data.labels[0]
  confidence = (data.scores[0] * 100).toFixed(2)
} else if (data.label && data.score) {
  label = data.label
  confidence = (data.score * 100).toFixed(2)
} else {
  console.error("Unexpected response:", data)
  return res.json({
    result: "⚠️ AI response error",
  })
}


/* =========================
   🧠 EXPLANATION ENGINE
========================= */

const reasons = []

const text = message.toLowerCase()

if (text.includes("urgent") || text.includes("immediately")) {
  reasons.push("Creates urgency")
}

if (text.includes("click") || text.includes("link")) {
  reasons.push("Contains suspicious link instruction")
}

if (text.includes("verify") || text.includes("account")) {
  reasons.push("Requests account verification")
}

if (text.includes("password") || text.includes("otp")) {
  reasons.push("Requests sensitive information")
}

if (text.includes("bank")) {
  reasons.push("Mentions financial institution")
}

if (text.includes("won") || text.includes("prize") || text.includes("reward")) {
  reasons.push("Too-good-to-be-true offer")
}

// 🧾 Format explanation
let explanation = ""

if (reasons.length > 0) {
  explanation = "\n\nReason:\n- " + reasons.join("\n- ")
}


/* =========================
   FINAL RESPONSE
========================= */

if (label === "scam") {
  res.json({
    result: `⚠️ Scam detected (${confidence}% confidence)${explanation}`,
  })
} else {
  res.json({
    result: `✅ Message appears safe (${confidence}% confidence)`,
  })
}

} catch (error) {

console.error("SCAM ERROR:", error.response?.data || error.message)

res.json({ result: "❌ Error analyzing message" })

}

})


/* =========================
   AI URL SAFETY CHECKER
========================= */

app.post("/check-url", async (req, res) => {

const url = req.body.url

if (!url || !url.startsWith("http")) {
  return res.json({ result: "⚠️ Invalid URL format" })
}

/* Known suspicious patterns */
const suspiciousPatterns = [
"bit.ly",
"tinyurl",
"free-money",
"login-verification",
"secure-account",
"update-bank",
"crypto-giveaway"
]

for (let pattern of suspiciousPatterns) {
  if (url.includes(pattern)) {
    return res.json({
      result: "⚠️ Suspicious URL pattern detected",
    })
  }
}

/* Brand impersonation check */
const fakeBrands = [
"paypal",
"amazon",
"bank",
"netflix",
"apple",
"google"
]

for (let brand of fakeBrands) {
  if (url.includes(brand) && !url.includes(".com")) {
    return res.json({
      result: "⚠️ Possible brand impersonation detected",
    })
  }
}

/* =========================
   AI PHISHING ANALYSIS
========================= */

try {

const aiResponse = await axios.post(
HF_URL,
{
inputs: `Is this URL phishing or malicious: ${url}`,
parameters: {
candidate_labels: ["phishing", "scam", "safe website", "malware"]
}
},
{
headers: {
Authorization: `Bearer ${HF_API_KEY}`
},
timeout: 10000
}
)

// 🔐 SAFE RESPONSE HANDLING
let data = aiResponse.data

if (Array.isArray(data)) {
  data = data[0]
}

if (!data || data.error) {
  return res.json({
    result: "⏳ AI model is loading, try again...",
  })
}

if (!data.labels || !data.scores) {
  console.error("Unexpected response:", data)
  return res.json({
    result: "⚠️ AI response error",
  })
}

const label = data.labels[0]
const confidence = (data.scores[0] * 100).toFixed(2)

if (label === "safe website") {
  res.json({
    result: `✅ URL appears safe (${confidence}% confidence)`,
  })
} else {
  res.json({
    result: `⚠️ URL may be malicious (${confidence}% confidence)`,
  })
}

} catch (error) {

console.error("URL ERROR:", error.response?.data || error.message)

res.json({ result: "❌ Error analyzing URL" })

}

})



/* =========================
   HEALTH CHECK (Render)
========================= */

app.get("/health", (req, res) => {
res.send("CyberGuard server is running")
})



/* =========================
   SERVER START
========================= */

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`CyberGuard running on port ${PORT}`)
})