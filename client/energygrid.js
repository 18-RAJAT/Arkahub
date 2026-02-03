const {postJson}=require("./http")
const {signatureForPath}=require("./signature")
async function queryBatch({baseUrl,path,token},snList){
  const timestamp=String(Date.now())
  const signature=signatureForPath(path,token,timestamp)
  const headers={timestamp,signature}
  const body={sn_list:snList}
  const res=await postJson(baseUrl,path,headers,body,15000)
  if(res.statusCode!==200){
    const msg=res.json&&res.json.error?String(res.json.error):res.raw||("HTTP "+res.statusCode)
    const err=new Error(msg)
    err.statusCode=res.statusCode
    err.response=res
    throw err
  }
  const data=res.json&&res.json.data?res.json.data:[]
  return{data}
}
module.exports={queryBatch}