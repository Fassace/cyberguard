async function analyze(){

const text = document.getElementById("message").value

const res = await fetch("/analyze-scam",{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({message:text})
})

const data = await res.json()

const result = document.getElementById("result")

result.innerText = data.result

if(data.result.includes("Warning")){
result.className="warning"
}else{
result.className="safe"
}

}