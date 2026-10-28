/* Submits forms ourselves so sandboxed previews work */
/* submit forms ourselves: works in sandboxed previews that silently block native form submission */
(function(){const fire=f=>f.dispatchEvent(new Event('submit',{cancelable:true,bubbles:true}));
 HTMLFormElement.prototype.requestSubmit=function(){fire(this)};
 document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('button');if(!b||!b.form)return;if((b.getAttribute('type')||'submit').toLowerCase()!=='submit')return;e.preventDefault();fire(b.form)},true);
 document.addEventListener('keydown',e=>{if(e.key!=='Enter'||e.isComposing)return;const el=e.target;if(!el||el.tagName!=='INPUT'||!el.form)return;if(['checkbox','radio','button','submit','reset','file'].includes((el.type||'text').toLowerCase()))return;e.preventDefault();fire(el.form)},true)})();
