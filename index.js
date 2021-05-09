require('dotenv').config();
const express = require("express");
const cp = require("child_process");

const app = express();

const events = [];

app.get('/',(req,res)=>{
    return res.send(events);
})

app.post("/",express.json(),(req,res)=>{
    const sign = req.header("X-Hub-Signature");
    const {body} =req;
    body.authenticated = false
    body.sign = sign;
    if(sign == process.env.SECRET)
        body.authenticated = true;
    events.push(body);
    if(events.length > 20)
        events.pop();
    return res.send("ok");
})

app.listen(process.env.PORT);