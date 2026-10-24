(()=>{
'use strict';
const API='https://img88.jiwusales.workers.dev';
const AUTH='https://jiwu-mac-relay.jiwusales.workers.dev/functions/v1/jiwu-admin-test';
const KEY='jiwu_image_tools_session';
let token=sessionStorage.getItem(KEY)||'',authenticated=false,busy=false;
const login=document.getElementById('toolLogin'),error=document.getElementById('toolLoginError');
function lock(message=''){authenticated=false;token='';sessionStorage.removeItem(KEY);document.body.classList.remove('tools-authenticated');document.documentElement.classList.remove('tools-restoring');error.textContent=message;}
async function admin(action,params={}){
 const res=await fetch(AUTH,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action,...params}),signal:AbortSignal.timeout(25000)});
 const data=await res.json();if(!res.ok||!data.ok)throw Error(data.error||'登入服務暫時無法使用');return data;
}
async function request(path,body){
 if(!authenticated)throw Error('請先登入');
 if(path==='/upload'&&busy)throw Error('圖片正在上傳，請稍候');
 if(path==='/upload')busy=true;
 try{
 const res=await fetch(API+path,{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+token},body:JSON.stringify(body||{}),signal:AbortSignal.timeout(90000)});
 const data=await res.json();if(res.status===401)lock('登入已失效，請重新登入');if(!res.ok)throw Error(data.error||'操作失敗');return data;
 }finally{if(path==='/upload')busy=false;}
}
function unlock(){document.documentElement.classList.remove('tools-restoring');authenticated=true;document.body.classList.add('tools-authenticated');window.dispatchEvent(new Event('tools-ready'));}
window.jiwuTools={request,get authenticated(){return authenticated},get busy(){return busy}};
document.querySelectorAll('.tool-header a').forEach(a=>{if(new URL(a.href).pathname===location.pathname||(location.pathname.endsWith('/')&&a.pathname.endsWith('/index.html')))a.setAttribute('aria-current','page');});
document.getElementById('logout').onclick=()=>lock();
document.getElementById('reuseAdmin').onclick=async()=>{
 const saved=localStorage.getItem('jiwu_supabase_test_admin_auth_token_trusted')||sessionStorage.getItem('jiwu_supabase_test_admin_auth_token');
 if(!saved){error.textContent='這台裝置沒有已儲存的後台登入，請輸入後台密碼';return;}
 error.textContent='驗證後台登入中…';
 try{await admin('authCheck',{token:saved});token=saved;sessionStorage.setItem(KEY,token);error.textContent='';unlock();}catch(e){error.textContent=e.message;}
};
document.getElementById('toolLoginForm').onsubmit=async e=>{
 e.preventDefault();const input=document.getElementById('toolPassword'),button=e.target.querySelector('button');button.disabled=true;error.textContent='登入中…';
 try{const data=await admin('authLogin',{password:input.value,trusted:false});token=data.token;sessionStorage.setItem(KEY,token);input.value='';error.textContent='';unlock();}catch(e){error.textContent=e.message;}finally{button.disabled=false;}
};
if(token)admin('authCheck',{token}).then(unlock).catch(e=>lock(e.message));
})();
