import fs from 'node:fs';
const pages=await fetch('http://127.0.0.1:9237/json/list').then(r=>r.json());
const ws=new WebSocket(pages.find(p=>p.type==='page').webSocketDebuggerUrl);await new Promise(r=>ws.addEventListener('open',r,{once:true}));
let id=0;const pending=new Map(),errors=[];
ws.addEventListener('message',e=>{const v=JSON.parse(e.data);if(v.id){pending.get(v.id)?.(v);pending.delete(v.id)}if(v.method==='Runtime.exceptionThrown'){errors.push(v.params);console.log('ERROR',JSON.stringify(v.params.exceptionDetails))}});
const send=(method,params={})=>new Promise(resolve=>{const n=++id;pending.set(n,resolve);ws.send(JSON.stringify({id:n,method,params}))});
const evaluate=async expression=>(await send('Runtime.evaluate',{expression,returnByValue:true})).result?.result?.value;
const wait=ms=>new Promise(r=>setTimeout(r,ms));
await send('Runtime.enable');await send('Emulation.setDeviceMetricsOverride',{width:1100,height:750,deviceScaleFactor:1,mobile:false});await send('Page.navigate',{url:'http://127.0.0.1:8000/'});
for(let i=0;i<100;i++){await wait(300);if(await evaluate('!!document.querySelector(".interface-toggle")'))break}
await evaluate(`(()=>{const e=document.createElement('script');e.type='module';e.src='http://[::1]:5173/.showroom-db-bridge.ts';document.head.appendChild(e);document.querySelector('.imported-showroom header button')?.click()})()`);
let loaded=[];
for(let i=0;i<100;i++){await wait(400);loaded=await evaluate(`(()=>{const s=window.qaState?.();if(!s)return [];const result=[];s.scene.traverse(o=>{if(o.userData.productId){const model=o.children.find(c=>c.type==='Group');if(model)result.push({id:o.userData.productId,url:o.userData.modelUrl})}});return result})()`);if(loaded?.length===10)break}
console.log('databaseModels',JSON.stringify(loaded));console.log('runtimeErrors',errors.length);
const shot=await send('Page.captureScreenshot',{format:'png'});if(shot.result?.data)fs.writeFileSync('.showroom-db-preview.png',Buffer.from(shot.result.data,'base64'));
await evaluate(`document.querySelectorAll('.imported-showroom > nav button')[1]?.click()`);await wait(1400);
const position=await evaluate('window.qaCenter?.(1)');
if(position){await send('Input.dispatchMouseEvent',{type:'mouseMoved',x:position.x,y:position.y});await send('Input.dispatchMouseEvent',{type:'mousePressed',x:position.x,y:position.y,button:'left',buttons:1,clickCount:1});await send('Input.dispatchMouseEvent',{type:'mouseReleased',x:position.x,y:position.y,button:'left',buttons:0,clickCount:1});await wait(400);console.log('productSelection',await evaluate('({title:document.querySelector(".product-details h3")?.textContent,href:document.querySelector(".product-detail-link")?.getAttribute("href"),visible:!!document.querySelector(".product-details")&&getComputedStyle(document.querySelector(".product-details")).display!=="none"})'))}
await send('Browser.close');ws.close();
