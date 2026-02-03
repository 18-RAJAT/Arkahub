const {sleep}=require("./sleep")
function createLimiter(minIntervalMs){
  let last=0
  async function wait(){
    const now=Date.now()
    const due=last?last+minIntervalMs:now
    const ms=due-now
    if(ms>0)await sleep(ms)
    last=Date.now()
  }
  function bump(ms){last=Math.max(last,Date.now()+ms-minIntervalMs)}
  return{wait,bump}
}
module.exports={createLimiter}