(()=>{
 'use strict';
 if(window.jiwuImageURL)return;
 let versions={},pending=null,last=0;
 function imagePath(value){
  try{
   const u=new URL(value,location.href);let path='';
   if(u.hostname==='raw.githubusercontent.com')path=u.pathname.replace(/^\/jiwusales\/imgh\/main\//,'');
   else if(u.hostname==='cdn.jsdelivr.net')path=u.pathname.replace(/^\/gh\/jiwusales\/imgh@main\//,'');
   else return '';
   path=decodeURIComponent(path);
   return /^(images|images_1350)\/[^/]+\.(png|jpe?g|webp|gif)$/i.test(path)?path:'';
  }catch{return '';}
 }
 window.jiwuImageURL=value=>{
  const path=imagePath(value),sha=versions[path];
  return sha?'https://raw.githubusercontent.com/jiwusales/imgh/main/'+path.split('/').map(encodeURIComponent).join('/')+'?v='+sha:value;
 };
 function update(root=document){
  const images=root instanceof HTMLImageElement?[root]:root.querySelectorAll?.('img[src]')||[];
  for(const img of images){const src=img.getAttribute('src'),next=window.jiwuImageURL(src);if(src!==next)img.src=next;}
 }
 new MutationObserver(records=>{for(const r of records){if(r.type==='attributes')update(r.target);else for(const node of r.addedNodes)if(node.nodeType===1)update(node);}}).observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['src']});
 async function refresh(force=false){
  if(pending||(!force&&Date.now()-last<5000))return pending;
  pending=(async()=>{
   const response=await fetch('https://img88.jiwusales.workers.dev/versions',{cache:'no-store'});if(!response.ok)throw Error('圖片版本讀取失敗');
   const data=await response.json();if(!data.versions||typeof data.versions!=='object')return;
   const changed=JSON.stringify(versions)!==JSON.stringify(data.versions);versions=data.versions;last=Date.now();update();
   if(changed)window.dispatchEvent(new Event('jiwu-images-updated'));
  })().catch(e=>console.warn(e.message)).finally(()=>pending=null);
  return pending;
 }
 window.jiwuRefreshImages=refresh;
 window.addEventListener('pageshow',()=>refresh(true));
 document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')refresh();});
 refresh(true);
})();
