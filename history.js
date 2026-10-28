const $=id=>document.getElementById(id);let page=1,version=0;
const mobileGrid=matchMedia('(max-width:600px)');
let pageSize=mobileGrid.matches?40:80;
const today=()=>{const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Taipei',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date()),v=Object.fromEntries(parts.map(p=>[p.type,p.value]));return `${v.year}-${v.month}-${v.day}`;};
$('date').value=today();
let returnState=null,updatedImage=null;
if(new URLSearchParams(location.search).get('updated')==='1')try{
 returnState=JSON.parse(sessionStorage.getItem('jiwu_image_history_return')||'null');
 updatedImage=JSON.parse(sessionStorage.getItem('jiwu_image_return_updated')||'null');
 if(returnState){$('date').value=returnState.date||'';$('query').value=returnState.query||'';$('folder').value=returnState.folder||'all';page=Number.isInteger(returnState.page)&&returnState.page>0?returnState.page:1;}
 sessionStorage.removeItem('jiwu_image_history_return');sessionStorage.removeItem('jiwu_image_return_updated');
}catch{}

async function load(refresh=false){
 const limit=pageSize,current=++version;$('status').textContent='讀取中…';$('prev').disabled=$('next').disabled=true;
 try{const r=await window.jiwuTools.request('/history',{date:$('date').value,query:$('query').value,folder:$('folder').value,page,pageSize:limit,refresh});if(current!==version)return;
 $('gallery').replaceChildren();for(const item of r.items){const card=document.createElement('article');card.className='card';const a=document.createElement('button');a.type='button';a.className='image-copy';a.setAttribute('aria-label','複製 '+item.name+' 的圖片網址');const img=document.createElement('img');img.src=item.url+(item.url.includes('?')?'&':'?')+'v='+item.sha;img.alt=item.name;img.loading='lazy';a.append(img);const p=document.createElement('p');p.textContent=item.name+'\n'+(item.date||'日期不明');const b=document.createElement('button');b.textContent='複製';b.onclick=async()=>{try{await navigator.clipboard.writeText(item.url);b.textContent='已複製';}catch{$('status').textContent='無法自動複製，請開啟圖片後複製網址';}};a.onclick=b.onclick;
 const del=document.createElement('button');del.type='button';del.className='image-delete';del.textContent='×';del.title='刪除圖片';del.setAttribute('aria-label','刪除 '+item.name);
 del.onclick=async e=>{e.stopPropagation();if(!confirm('確定刪除「'+item.name+'」？刪除後此圖片網址將無法繼續使用。'))return;del.disabled=true;try{await window.jiwuTools.request('/delete',{path:item.path,sha:item.sha});if(r.items.length===1&&page>1)page--;await load(true);}catch(e){$('status').textContent=e.message;del.disabled=false;}};
 const edit=document.createElement('button');edit.type='button';edit.textContent='編輯';edit.onclick=()=>{sessionStorage.setItem('jiwu_image_history_return',JSON.stringify({date:$('date').value,query:$('query').value,folder:$('folder').value,page,scrollY:window.scrollY}));sessionStorage.setItem('jiwu_image_edit',JSON.stringify({path:item.path,sha:item.sha,name:item.name}));location.href='./remove.html?edit=history';};const actions=document.createElement('div');actions.className='card-actions';actions.append(b,edit);card.append(a,p,actions,del);$('gallery').append(card);}
 if(returnState){const y=Number(returnState.scrollY)||0;requestAnimationFrame(()=>window.scrollTo(0,y));returnState=null;}
 $('status').textContent=r.total?`共 ${r.total} 張圖片`:'沒有符合條件的圖片';$('page').textContent=`${page} / ${Math.max(1,Math.ceil(r.total/limit))}`;if(updatedImage){$('status').textContent='已覆蓋「'+updatedImage.name+'」 · '+$('status').textContent;updatedImage=null;}
 $('prev').disabled=page<=1;$('next').disabled=page*limit>=r.total;
 }catch(e){if(current===version)$('status').textContent=e.message;}
}
$('filters').onsubmit=e=>{e.preventDefault();page=1;load();};$('today').onclick=()=>{$('date').value=today();
let returnState=null,updatedImage=null;
if(new URLSearchParams(location.search).get('updated')==='1')try{
 returnState=JSON.parse(sessionStorage.getItem('jiwu_image_history_return')||'null');
 updatedImage=JSON.parse(sessionStorage.getItem('jiwu_image_return_updated')||'null');
 if(returnState){$('date').value=returnState.date||'';$('query').value=returnState.query||'';$('folder').value=returnState.folder||'all';page=Number.isInteger(returnState.page)&&returnState.page>0?returnState.page:1;}
 sessionStorage.removeItem('jiwu_image_history_return');sessionStorage.removeItem('jiwu_image_return_updated');
}catch{}
page=1;load();};$('all').onclick=()=>{$('date').value='';page=1;load();};$('prev').onclick=()=>{page--;load();};$('next').onclick=()=>{page++;load();};window.addEventListener('tools-ready',()=>{load(true);});

mobileGrid.addEventListener('change',()=>{pageSize=mobileGrid.matches?40:80;page=1;if(window.jiwuTools?.authenticated)load();});

window.addEventListener('pageshow',e=>{if(e.persisted&&window.jiwuTools?.authenticated)load(true);});
