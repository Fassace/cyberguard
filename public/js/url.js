async function checkURL(){

const url = document.getElementById("url").value
const result = document.getElementById("result")

if(!url){
result.innerText="⚠️ Please enter a URL"
result.className="warning"
return
}

result.innerText="Analyzing URL..."
result.className=""

try{

const response = await fetch("/check-url",{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body: JSON.stringify({url:url})
})

const data = await response.json()

result.innerText = data.result

if(data.result.includes("safe")){
result.className="safe"
}
else{
result.className="warning"
}

}catch(error){

result.innerText="Server error"
result.className="warning"

}

}