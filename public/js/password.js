function checkPassword(){

const password = document.getElementById("password").value

let score = 0

if(password.length >=8) score++
if(/[A-Z]/.test(password)) score++
if(/[0-9]/.test(password)) score++
if(/[!@#$%^&*]/.test(password)) score++

const result = document.getElementById("result")

if(password.length === 0){
result.innerText=""
return
}

if(score<=1){
result.innerText="⚠️ Weak Password"
result.className="warning"
}
else if(score<=3){
result.innerText="⚠️ Medium Strength Password"
result.className="warning"
}
else{
result.innerText="✅ Strong Password"
result.className="safe"
}

}



function togglePassword(){

const input = document.getElementById("password")

if(input.type === "password"){
input.type = "text"
}
else{
input.type = "password"
}

}