const fs=require("fs")
const path=require("path")
const {config}=require("./config")
const {generateSerials,chunk}=require("./serials")
const {createLimiter}=require("./limiter")
const {sleep}=require("./sleep")
const {queryBatch}=require("./energygrid")

function backoffMs(attempt,base,max){
  const pow=Math.min(12,attempt-1)
  const ms=Math.min(max,base*Math.pow(2,pow))
  const jitter=Math.floor(Math.random()*250)
  return ms+jitter
}

async function run(){
  const serials=generateSerials(500)
  const batches=chunk(serials,config.batchSize)
  const limiter=createLimiter(config.minIntervalMs)
  const devices={}
  for(let i=0;i<batches.length;i++){
    const snList=batches[i]
    let attempt=0
    for(;;){
      attempt++
      await limiter.wait()
      try{
        const res=await queryBatch(config,snList)
        for(let j=0;j<res.data.length;j++){
          const d=res.data[j]
          if(d&&d.sn)devices[d.sn]=d
        }
        process.stdout.write("batch "+String(i+1)+"/"+String(batches.length)+" ok\n")
        break
      }catch(e){
        const sc=Number(e&&e.statusCode||0)
        const retryable=sc===429||sc===0||sc>=500
        if(!retryable||attempt>=config.maxAttempts)throw e
        const extra=sc===429?1200:backoffMs(attempt,config.baseBackoffMs,config.maxBackoffMs)
        limiter.bump(extra)
        process.stdout.write("batch "+String(i+1)+"/"+String(batches.length)+" retry "+String(attempt)+"\n")
        await sleep(extra)
      }
    }
  }
  const list=Object.values(devices)
  let online=0
  for(let i=0;i<list.length;i++)if(list[i]&&list[i].status==="Online")online++
  const out={generated_at:new Date().toISOString(),device_count:list.length,online_count:online,offline_count:list.length-online,devices}
  await fs.promises.mkdir(path.dirname(config.outputFile),{recursive:true})
  await fs.promises.writeFile(config.outputFile,JSON.stringify(out,null,2),"utf8")
  process.stdout.write("done "+String(list.length)+" devices -> "+config.outputFile+"\n")
}

run().catch(e=>{
  const msg=e&&e.message?e.message:String(e)
  process.stderr.write("failed "+msg+"\n")
  process.exit(1)
})