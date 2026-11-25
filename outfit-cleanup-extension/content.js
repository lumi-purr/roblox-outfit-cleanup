(() => {
'use strict';
// Roblox outfit manager. Runs locally on www.roblox.com/my/avatar.
// Only Roblox API requests, no external services or cookie reading.
async function openOutfitManager() {
  if (location.hostname !== 'www.roblox.com' || !location.pathname.startsWith('/my/avatar')) {
    alert('Open www.roblox.com/my/avatar first.'); return;
  }
  if (document.getElementById('local-outfit-manager')) return;
  const api = 'https://avatar.roblox.com';
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const get = async url => {
    const r = await fetch(url, {credentials:'include'});
    if (!r.ok) throw Error('Roblox returned HTTP ' + r.status + ' for ' + new URL(url).pathname);
    return r.json();
  };
  const host = document.createElement('div'); host.id = 'local-outfit-manager';
  Object.assign(host.style, {position:'fixed', inset:'0', zIndex:'2147483647'});
  document.body.append(host);
  const root = host.attachShadow({mode:'open'});
  root.innerHTML = `<style>
  *{box-sizing:border-box} .panel{height:100%;background:#17191f;color:#f2f2f4;font:15px system-ui;display:flex;flex-direction:column;padding:20px;gap:12px} h2,p{margin:0} .bar{display:flex;gap:8px;flex-wrap:wrap;align-items:center} button,input{font:inherit;border:1px solid #555963;border-radius:7px;padding:9px;background:#30333c;color:white} button{cursor:pointer} button:disabled{opacity:.45;cursor:default} .danger{background:#a72f3c} .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(125px,1fr));gap:9px;overflow:auto;align-content:start;flex:1;padding:3px} .tile{position:relative;border:2px solid #393d47;background:#24272e;border-radius:8px;padding:6px;cursor:pointer;overflow:hidden} .tile.selected{border-color:#ff6875;background:#462a32} .tile img{width:100%;aspect-ratio:1;object-fit:contain;display:block;background:#363944;border-radius:4px} .tile input{position:absolute;top:10px;left:10px;width:20px;height:20px;accent-color:#bd394b} .name{overflow-wrap:anywhere;padding:4px} .note{color:#bdc1cd} #status{white-space:pre-wrap} .preview{max-height:28vh;overflow:auto;white-space:pre-wrap;background:#22252c;padding:10px;border-radius:8px} [hidden]{display:none!important}
  </style><div class="panel"><div class="bar"><h2>Outfit cleanup</h2><span style="flex:1"></span><button id="close">Close</button></div><p class="note">Checked = delete. Unchecked = keep. Only editable saved avatar outfits are shown.</p><p id="status">Loading outfits…</p><div class="bar"><button id="all" disabled>Select all for deletion</button><button id="none" disabled>Clear selection</button><input id="search" placeholder="Search outfits" disabled><button id="review" class="danger" disabled>Review deletion</button><button id="stop" hidden>Stop after current request</button></div><p id="count"></p><div id="preview" class="preview" hidden></div><div id="confirmbar" class="bar" hidden><input id="typed" placeholder="Type confirmation"><button id="go" class="danger" disabled>Back up and delete</button><button id="cancel">Cancel review</button></div><div class="grid" id="grid"></div></div>`;
  const $ = id => root.getElementById(id);
  let outfits = [], user, selected = new Set(), cards = new Map(), busy = false, stopped = false, reviewed = [], token = '';
  const setStatus = msg => $('status').textContent = msg;
  const refresh = () => {
    $('count').textContent = `${outfits.length} outfits | ${selected.size} selected for deletion | ${outfits.length-selected.size} kept`;
    const q = $('search').value.toLowerCase();
    for (const o of outfits) {
      const c = cards.get(o.id); if (!c) continue;
      c.label.hidden = !String(o.name).toLowerCase().includes(q);
      c.check.checked = selected.has(o.id);
      c.check.disabled = busy;
      c.label.classList.toggle('selected', c.check.checked);
    }
    $('review').disabled = busy || !selected.size;
    for (const id of ['all','none','search','close']) $(id).disabled = busy;
  };
  const cancelReview = () => {reviewed=[]; $('preview').hidden=true; $('confirmbar').hidden=true; $('typed').value=''; $('go').disabled=true;};
  const selectionChanged = () => {cancelReview();refresh();};
  $('close').onclick = () => {if (!busy) host.remove();};
  $('all').onclick = () => {selected = new Set(outfits.map(o=>o.id)); selectionChanged();};
  $('none').onclick = () => {selected.clear();selectionChanged();};
  $('search').oninput = refresh;
  $('cancel').onclick = cancelReview;
  $('stop').onclick = () => {stopped=true; setStatus('Stopping after the current request…');};
  $('review').onclick = () => {
    reviewed = outfits.filter(o=>selected.has(o.id));
    $('preview').textContent = 'DELETE:\n'+reviewed.map(o=>`${o.name} (#${o.id})`).join('\n')+'\n\nKEEP:\n'+outfits.filter(o=>!selected.has(o.id)).map(o=>`${o.name} (#${o.id})`).join('\n');
    $('preview').hidden=false; $('confirmbar').hidden=false; $('typed').value=''; $('typed').placeholder=`Type DELETE ${reviewed.length}`; $('go').disabled=true; $('typed').focus();
  };
  $('typed').oninput=()=>{$('go').disabled=$('typed').value!==`DELETE ${reviewed.length}`;};
  const download = (obj, name) => {const url=URL.createObjectURL(new Blob([JSON.stringify(obj,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);};
  const remove = async id => {
    const request = () => fetch(`${api}/v1/outfits/${id}/delete`,{method:'POST',credentials:'include',headers:{'Content-Type':'application/json',...(token?{'X-CSRF-TOKEN':token}:{})},body:'{}'});
    let r=await request();
    if(r.status===403 && r.headers.get('x-csrf-token')) {token=r.headers.get('x-csrf-token'); if(stopped) throw Error('Stopped'); r=await request();}
    if(!r.ok) throw Error(`Delete failed for #${id}: HTTP ${r.status}. No further deletions attempted.`);
  };
  $('go').onclick = async () => {
    if(busy || !reviewed.length || $('typed').value!==`DELETE ${reviewed.length}`) return;
    const targets=reviewed.slice(); busy=true; stopped=false; cancelReview(); refresh(); $('stop').hidden=false;
    let deleted=0, attempted=false;
    try {
      const current=await get('https://users.roblox.com/v1/users/authenticated');
      if(current.id!==user.id) throw Error('Account changed. Reload the page.');
      const backup=[];
      for(const o of targets) {
        if(stopped) throw Error('Stopped before deletion.');
        setStatus(`Backing up ${backup.length+1}/${targets.length}: ${o.name}`);
        const details=await get(`${api}/v4/outfits/${o.id}/details`);
        backup.push({outfit:o,details});
        await wait(350);
      }
      if(stopped) throw Error('Stopped before deletion.');
      download({userId:user.id,createdAt:new Date().toISOString(),outfits:backup},`roblox-outfit-backup-${Date.now()}.json`);
      if(!confirm(`Backup download requested for ${targets.length} outfits. Verify it downloaded. Delete these ${targets.length} outfits permanently? This is not an automatic restore file.`)) throw Error('Cancelled before deletion.');
      for(const o of targets) {
        if(stopped) break;
        setStatus(`Deleting ${deleted+1}/${targets.length}: ${o.name}`);
        attempted=true; await remove(o.id); deleted++;
        selected.delete(o.id); cards.get(o.id)?.label.remove(); cards.delete(o.id); outfits=outfits.filter(x=>x.id!==o.id); refresh();
        await wait(750);
      }
      setStatus(`${stopped?'Stopped':'Finished'}: ${deleted} of ${targets.length} outfits deleted. Refresh the avatar page to see changes.`);
    } catch(e) {setStatus(`${deleted} confirmed deleted. ${e.message}${attempted?' Reload before retrying to verify the current list.':''}`);}
    finally {busy=false; $('stop').hidden=true;refresh();}
  };
  try {
    user=await get('https://users.roblox.com/v1/users/authenticated');
    if(!Number.isSafeInteger(user.id)) throw Error('Could not identify the signed-in account.');
    const seen=new Set(), cursors=new Set();let cursor='';
    do {
      const q=new URLSearchParams({itemsPerPage:'50',isEditable:'true',outfitType:'Avatar'});
      if(cursor)q.set('paginationToken',cursor);
      const page=await get(`${api}/v2/avatar/users/${user.id}/outfits?${q}`);
      if(!Array.isArray(page.data))throw Error('Unexpected outfit list response.');
      for(const o of page.data){if(o.isEditable===true && (o.outfitType==='Avatar'||o.outfitType==null) && Number.isSafeInteger(o.id) && !seen.has(o.id)){seen.add(o.id);outfits.push(o);}}
      cursor=page.paginationToken||'';if(cursor&&cursors.has(cursor))throw Error('Repeated pagination token.');if(cursor)cursors.add(cursor);
      setStatus(`Loading outfits: ${outfits.length}`); await wait(200);
    }while(cursor);
    for(const o of outfits){
      const label=document.createElement('label');label.className='tile';
      const img=document.createElement('img');img.alt='Thumbnail unavailable';img.loading='lazy';img.referrerPolicy='no-referrer';
      const check=document.createElement('input');check.type='checkbox';check.setAttribute('aria-label',`Delete ${o.name}`);
      const name=document.createElement('div');name.className='name';name.textContent=o.name;
      check.onchange=()=>{if(check.checked)selected.add(o.id);else selected.delete(o.id);selectionChanged();};
      label.append(img,check,name);$('grid').append(label);cards.set(o.id,{label,img,check});
    }
    let missing=0;
    for(let i=0;i<outfits.length;i+=50){
      const batch=outfits.slice(i,i+50);
      try{const thumbs=await get(`https://thumbnails.roblox.com/v1/users/outfits?userOutfitIds=${batch.map(o=>o.id).join(',')}&size=150x150&format=Png&isCircular=false`);for(const t of thumbs.data||[]){if(t.imageUrl && cards.has(t.targetId)){const u=new URL(t.imageUrl);if(u.protocol==='https:'&&u.hostname.endsWith('.rbxcdn.com'))cards.get(t.targetId).img.src=u.href;}}}catch(e){missing+=batch.length;}
      await wait(150);
    }
    setStatus(`Signed in as ${user.name}. ${outfits.length} editable outfits loaded.${missing?' Some thumbnails could not load.':''} Check the count before deleting.`);refresh();
  }catch(e){setStatus('Could not load outfits: '+e.message+' Nothing was deleted.');}
}

if (location.hostname !== 'www.roblox.com' || !location.pathname.startsWith('/my/avatar')) return;
const buttonId = 'outfit-cleanup-launcher';
let scheduled = false;
function mountButton() {
  if (!document.body || !location.pathname.startsWith('/my/avatar')) return;
  let launcher = document.getElementById(buttonId);
  if (!launcher) {
    launcher = document.createElement('button');
    launcher.id = buttonId;
    launcher.type = 'button';
    launcher.textContent = 'Manage Outfits';
    launcher.title = 'Open Outfit Cleanup';
    Object.assign(launcher.style, {background:'#292c34',color:'#fff',border:'1px solid #777',borderRadius:'6px',padding:'7px 12px',font:'600 13px system-ui',cursor:'pointer',whiteSpace:'nowrap'});
    launcher.addEventListener('click', event => {event.preventDefault();event.stopPropagation();openOutfitManager().catch(e => alert('Outfit Cleanup: '+e.message));});
  }
  const anchor = [...document.querySelectorAll('button, a, [role="button"]')].find(el => el !== launcher && el.textContent.trim().toLowerCase() === 'create new character' && el.getClientRects().length);
  if (anchor && anchor.parentElement) {
    Object.assign(launcher.style, {position:'static',bottom:'auto',right:'auto',zIndex:'auto',marginRight:'8px'});
    if (launcher.nextElementSibling !== anchor || launcher.parentElement !== anchor.parentElement) anchor.before(launcher);
  } else {
    Object.assign(launcher.style, {position:'fixed',bottom:'64px',right:'20px',zIndex:'10000',marginRight:'0'});
    if (launcher.parentElement !== document.body) document.body.append(launcher);
  }
}
function schedule() {
  if (scheduled) return;
  scheduled = true;
  requestAnimationFrame(() => {scheduled = false;mountButton();});
}
mountButton();
new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true});
})();
