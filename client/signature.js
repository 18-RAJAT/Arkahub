const crypto=require("crypto")
function md5hex(s){return crypto.createHash("md5").update(String(s)).digest("hex")}
function signatureForPath(path,token,timestamp){return md5hex(path+token+timestamp)}
module.exports={signatureForPath}