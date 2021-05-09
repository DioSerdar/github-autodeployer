require('dotenv').config();
const express = require("express");
const cp = require("child_process");

const app = express();

const events = [];

app.get('/',(req,res)=>{
    return res.send(events);
})

app.post("/",express.json(),(req,res)=>{
    const {body} =req;
    events.push(body);
    if(events.length > 20)
        events.pop();
    return res.send("ok");
})

app.listen(process.env.PORT);