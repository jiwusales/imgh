const $=id=>document.getElementById(id);let page=1,version=0;
const today=()=>{const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Taipei',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date()),v=Object.fromEntries(parts.map(p=>[p.type,p.value]));return `${v.year}-${v.month}-${v.day}`;};
$('date').value=today();
async function load(){
 const current=++version;$('status').textContent='讀取中…';$('prev').disabled=$('next').disabled=true;
 try{const r=await window.jiwuTools.request('/history',{date:$('date').value,query:$('query').value,folder:$('folder').value,page});if(current!==version)return;
 $('gallery').replaceChildren();for(const item of r.items){const card=document.createElement('article');card.className='card';const a=document.createElement('a');a.href=item.url;a.target='_blank';a.rel='noopener';const img=document.createElement('img');img.src=item.url;img.alt=item.name;img.loading='lazy';a.append(img);const p=document.createElement('p');p.textContent=item.name+'\n'+(item.date||'日期不明');const b=document.createElement('button');b.textContent='複製網址';b.onclick=async()=>{try{await navigator.clipboard.writeText(item.url);b.textContent='已複製';}catch{$('status').textContent='無法自動複製，請開啟圖片後複製網址';}};card.append(a,p,b);$('gallery').append(card);}
 $('status').textContent=r.total?`共 ${r.total} 張圖片`:'沒有符合條件的圖片';$('page').textContent=`${page} / ${Math.max(1,Math.ceil(r.total/40))}`;$('prev').disabled=page<=1;$('next').disabled=page*40>=r.total;
 }catch(e){if(current===version)$('status').textContent=e.message;}
}
$('filters').onsubmit=e=>{e.preventDefault();page=1;load();};$('today').onclick=()=>{$('date').value=today();page=1;load();};$('all').onclick=()=>{$('date').value='';page=1;load();};$('prev').onclick=()=>{page--;load();};$('next').onclick=()=>{page++;load();};window.addEventListener('tools-ready',()=>{page=1;load();});
