require('dotenv').config();
const express = require("express");
const cp = require("child_process");
const crypto = require('crypto')
const bodyParser = require('body-parser')

const secret = process.env.PORT;

const sign_header_name = 'X-Hub-Signature-256'
const sign_hash_algo = 'sha256'
const events = [];
const app = express()

app.use(bodyParser.json({
  verify: (req, res, buf, encoding) => {
    if (buf && buf.length) {
      req.raw_body = buf.toString(encoding || 'utf8');
    }
  },
}))

function verifyPostData(req, res, next) {
  if (!req.raw_body) {
    return next('Request body empty')
  }
  const sig = Buffer.from(req.get(sign_header_name) || '', 'utf8')
  const hmac = crypto.createHmac(sign_hash_algo, secret)
  const digest = Buffer.from(sign_hash_algo + '=' + hmac.update(req.raw_body).digest('hex'), 'utf8')
  if (sig.length !== digest.length || !crypto.timingSafeEqual(digest, sig)) {
        body.authenticated = false;
        return next();
  }
  body.authenticated = true;
  return next()
}

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