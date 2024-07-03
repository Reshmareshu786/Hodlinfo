const express = require('express')
const fs = require('fs')
const path = require('path')
const PORT = 3000
const app = express()

app.use(express.static(__dirname))
app.get('/',(request,response)=>{
    response.sendFile(path.join(__dirname,'index.html'))
})

app.listen(PORT,()=>{
    console.log(`Server is running on http://localhost:${PORT}`)
})
