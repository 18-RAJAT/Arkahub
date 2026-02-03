const http=require("http")
const https=require("https")
function postJson(baseUrl,path,headers,body,timeoutMs){
  const u=new URL(baseUrl)
  const lib=u.protocol==="https:"?https:http
  const payload=Buffer.from(JSON.stringify(body),"utf8")
  const h={...headers,"content-type":"application/json","content-length":String(payload.length)}
  const opts={method:"POST",hostname:u.hostname,port:u.port||undefined,path,headers:h}
  return new Promise((resolve,reject)=>{
    const req=lib.request(opts,res=>{
      const chunks=[]
      res.on("data",d=>chunks.push(d))
      res.on("end",()=>{
        const text=Buffer.concat(chunks).toString("utf8")
        let json=null
        try{json=text?JSON.parse(text):null}catch(e){json=null}
        resolve({statusCode:res.statusCode||0,headers:res.headers,raw:text,json})
      })
    })
    req.on("error",reject)
    if(timeoutMs&&timeoutMs>0)req.setTimeout(timeoutMs,()=>req.destroy(new Error("timeout")))
    req.write(payload)
    req.end()
  })
}
module.exports={postJson}