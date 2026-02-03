function serial(i){return"SN-"+String(i).padStart(3,"0")}
function generateSerials(n){const out=new Array(n);for(let i=0;i<n;i++)out[i]=serial(i);return out}
function chunk(arr,size){const out=[];for(let i=0;i<arr.length;i+=size)out.push(arr.slice(i,i+size));return out}
module.exports={generateSerials,chunk}