require("dotenv").config()
const express = require("express")
const cors = require("cors")
const axios = require("axios")

const app = express()

app.use(cors())
app.use(express.json())
app.use(express.static("public"))

const HF_API_KEY = process.env.HF_API_KEY



/* =========================
   SCAM MESSAGE ANALYZER
========================= */

app.post("/analyze-scam", async (req, res) => {

const message = req.body.message

try{

const response = await axios.post(
"https://api-inference.huggingface.co/models/facebook/bart-large-mnli",
{
inputs: message,
parameters:{
candidate_labels:["scam","safe message"]
}
},
{
headers:{
Authorization:`Bearer ${HF_API_KEY}`
}
}
)

const label = response.data.labels[0]

if(label === "scam"){
res.json({result:"⚠️ Warning: This message looks like a scam."})
}
else{
res.json({result:"✅ This message appears safe."})
}

}catch(error){

res.json({result:"Error analyzing message"})

}

})



/* =========================
   AI URL SAFETY CHECKER
========================= */

app.post("/check-url", async (req,res)=>{

const url = req.body.url

if(!url || !url.startsWith("http")){
return res.json({result:"⚠️ Invalid URL format"})
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

for(let pattern of suspiciousPatterns){

if(url.includes(pattern)){
return res.json({
result:"⚠️ Suspicious URL pattern detected"
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

for(let brand of fakeBrands){

if(url.includes(brand) && !url.includes(".com")){
return res.json({
result:"⚠️ Possible brand impersonation detected"
})
}

}


/* AI phishing analysis */

try{

const aiResponse = await axios.post(
"https://api-inference.huggingface.co/models/facebook/bart-large-mnli",
{
inputs: `Is this URL phishing or malicious: ${url}`,
parameters:{
candidate_labels:["phishing","scam","safe website","malware"]
}
},
{
headers:{
Authorization:`Bearer ${HF_API_KEY}`
}
}
)

const label = aiResponse.data.labels[0]

if(label === "safe website"){
res.json({result:"✅ URL appears safe"})
}
else{
res.json({result:"⚠️ This URL may be malicious or phishing"})
}

}catch(error){

res.json({result:"Error analyzing URL"})

}

})



app.listen(3000, () => {
console.log("CyberGuard running at http://localhost:3000")
})