const express = require('express');
const {open} = require('sqlite');
const sqlite3 = require('sqlite3');
const path = require('path');
const https = require('https');

const app = express();
const PORT = 3000;

app.use(express.json());
let db = null;

const initializeDbAndServer = async () => {
    try{
        db = await open({
            filename : path.join(__dirname,'cryptoinfo.db'),
            driver : sqlite3.Database,
        })

        await db.run(`CREATE TABLE IF NOT EXISTS tickers(
            name TEXT,last REAL, buy REAL,sell REAL,volume REAL,
            base_unit TEXT
        )`)

        await fetchAndStoreData()

        app.listen(PORT,()=>{
            console.log(`Server is running on http://localhost:${PORT}`);
        });
    }
    catch(e){
        console.log(`DB error:${e.message}`);
        process.exit(1);
    }
}

const fetchAndStoreData = () => {
    const url = "https://api.wazirx.com/api/v2/tickers";
    https.get(url,(response)=>{
        let data = ""
        response.on('data',(loadData)=>{
            data += loadData
        })
        
        response.on('end',async ()=>{
            try{
                const tickers = JSON.parse(data)
                const top10 = Object.keys(tickers).slice(0,10)
                await db.run('DELETE from tickers')

                await Promise.all(top10.map(async (key)=>{
                    const ticker = tickers[key]
                    const insertQuery = `INSERT INTO tickers(name,last,buy,sell,volume,base_unit)
                    VALUES ('${ticker.name}','${ticker.last}','${ticker.buy}','${ticker.sell}','${ticker.volume}',
                    '${ticker.base_unit}')`;
                    await db.run(insertQuery)
                }))
                console.log("Data fetched successfully")
            }
            catch(e)
            {
                console.log('Error Parsing:',e)
            }
        })
       
    })
    .on('error',(error)=>{
        console.log('Error fetching data from API:',error);
    });
};

initializeDbAndServer()

app.get('/',(request,response)=>{
    response.sendFile(path.join(__dirname,'index.html'))
})

app.get('/style.css',(request,response)=>{
    response.sendFile(path.join(__dirname,'style.css'))
})

app.get('/tickers',async (request,response)=>{
    try{
        const rows = await db.all('SELECT * FROM tickers');
        response.json(rows)
    }
    catch(e)
    {
        console.log('ERROR in db');
        response.status(500)
    }
})

// Start the server and listen on the specified port


// app.get('/',(request,response)=>{
//     response.sendFile(path.join(__dirname,'index.html'));
// })

// app.get('/style.css',(request,response)=>{
//     response.sendFile(path.join(__dirname,'style.css'))
// })

// app.listen(PORT,()=>{
//     console.log(`Server is running on http://localhost:${PORT}`)
// })

// app.use(express.static(__dirname))
// app.get('/',(request,response)=>{
//     response.sendFile(path.join(__dirname,'index.html'))
// })

// app.listen(PORT,()=>{
//     console.log(`Server is running on http://localhost:${PORT}`)
// })

