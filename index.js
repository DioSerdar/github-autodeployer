require('dotenv').config();
const express = require("express");
const { spawn } = require('child_process');
const crypto = require('crypto')
const bodyParser = require('body-parser')

const secret = process.env.SECRET;

const sign_header_name = 'X-Hub-Signature-256'
const sign_hash_algo = 'sha256'
const events = [];
const app = express()


function verify_request(req, res, next) {
  if (!req.raw_body) {
    return next('Request body empty')
  }
  const sig = Buffer.from(req.get(sign_header_name) || '', 'utf8')
  const hmac = crypto.createHmac(sign_hash_algo, secret)
  const digest = Buffer.from(sign_hash_algo + '=' + hmac.update(req.raw_body).digest('hex'), 'utf8')
  if (sig.length !== digest.length || !crypto.timingSafeEqual(digest, sig)) {
        req.body.authenticated = false;
        return next();
  }
  req.body.authenticated = true;
  return next()
}

app.get('/',(req,res)=>{
    return res.send(events);
})

app.use(bodyParser.json({
    verify: (req, res, buf, encoding) => {
      if (buf && buf.length) {
        req.raw_body = buf.toString(encoding || 'utf8');
      }
    },
}))

app.post("/",verify_request,(req,res)=>{
    const {body} =req;
    if(!body.authenticated)
    {
        return res.status(403).send("Unauthorized");
    }
    
    const ls = spawn('pm2',["restart","all"]);

    ls.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
    });
    
    ls.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
    });
    
    ls.on('close', (code) => {
        console.log(`child process exited with code ${code}`);
    });
    return res.send("ok");
})

app.listen(process.env.PORT);