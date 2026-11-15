const menuButton=document.querySelector('.menu-toggle');
const menu=document.querySelector('#mobile-menu');
if(menuButton&&menu){
 const mobileViewport=window.matchMedia('(max-width:800px)');
 function setMenuOpen(open){
  menu.hidden=!open;
  menuButton.setAttribute('aria-expanded',String(open));
  menuButton.setAttribute('aria-label',open?'Закрыть меню':'Открыть меню');
 }
 menuButton.addEventListener('click',()=>setMenuOpen(menu.hidden));
 menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>setMenuOpen(false)));
 document.addEventListener('keydown',e=>{
  if(e.key==='Escape'&&!menu.hidden){setMenuOpen(false);menuButton.focus();}
 });
 mobileViewport.addEventListener('change',e=>{
  if(!e.matches){
   const focusedLink=menu.contains(document.activeElement)?document.activeElement:null;
   const wasToggle=document.activeElement===menuButton;
   setMenuOpen(false);
   if(focusedLink){
    const desktopLink=[...document.querySelectorAll('.desktop-nav a,.header>.button')].find(a=>a.getAttribute('href')===focusedLink.getAttribute('href'));
    desktopLink?.focus();
   }else if(wasToggle){document.querySelector('.header>.button')?.focus();}
  }
 });
}
const form=document.querySelector('#estimate-form');
if(form){
 const checks=[...form.querySelectorAll('[name="equipment"]')],format=document.querySelector('#event-type'),total=document.querySelector('#total'),list=document.querySelector('#selected-items'),status=document.querySelector('#calc-status'),conditions=document.querySelector('#selected-conditions');
 const money=n=>new Intl.NumberFormat('ru-RU').format(n)+' ₽';
 const presets={conference:['zvuk'],corporate:['corp_sound','svet'],wedding:['wedding_sound','wedding_light'],custom:[]};
 const alternativeGroups=[['zvuk','corp_sound','wedding_sound'],['svet','wedding_light']];
 const preview=document.querySelector('#quote-preview'),quoteText=document.querySelector('#quote-text');
 const selected=()=>checks.filter(c=>c.checked);
 const notes=document.querySelector('#notes');
 notes.addEventListener('input',update);
 function updatePreview(){if(preview.open)quoteText.value=buildQuote();}
 preview.addEventListener('toggle',updatePreview);
 form.addEventListener('input',updatePreview);
 function update(){list.replaceChildren();conditions.replaceChildren();const choices=selected(),customRequest=!choices.length&&Boolean(notes.value.trim());if(!choices.length){const hint=document.createElement('li');hint.textContent=customRequest?'Состав, период аренды, включённые работы и стоимость требуют отдельного согласования.':'Выберите оборудование, чтобы увидеть включения и отдельные расходы.';conditions.append(hint);}choices.forEach(c=>{const term=document.createElement('li');term.textContent=c.dataset.name+': '+c.dataset.conditions;conditions.append(term);});if(!choices.length)list.textContent=customRequest?'Индивидуальный состав по описанию':'Выберите оборудование';choices.forEach(c=>{const row=document.createElement('div');row.className='estimate-line';const name=document.createElement('span'),price=document.createElement('span');const label=document.createElement('span'),unit=document.createElement('small');label.textContent=c.dataset.name;unit.textContent=c.dataset.unit;name.append(label,unit);price.textContent=money(Number(c.dataset.price));row.append(name,price);list.append(row);});total.textContent=customRequest?'По расчёту':money(choices.reduce((s,c)=>s+Number(c.dataset.price),0));status.textContent='';updatePreview();}
 function setPreset(value){checks.forEach(c=>c.checked=(presets[value]||[]).includes(c.value));update();}
 format.addEventListener('change',()=>setPreset(format.value));
 checks.forEach(c=>c.addEventListener('change',()=>{if(c.checked){const group=alternativeGroups.find(g=>g.includes(c.value));if(group)checks.filter(x=>x!==c&&group.includes(x.value)).forEach(x=>x.checked=false);}format.value='custom';update();}));
 const date=document.querySelector('#event-date');const today=new Date();date.min=[today.getFullYear(),String(today.getMonth()+1).padStart(2,'0'),String(today.getDate()).padStart(2,'0')].join('-');
 const params=new URLSearchParams(location.search),preset=params.get('package'),equipment=params.get('equipment');
 const category=checks.find(c=>c.value===equipment);
 if(category){format.value='custom';checks.forEach(c=>c.checked=c===category);update();}
 else if(Object.hasOwn(presets,preset)){format.value=preset;setPreset(preset);}else update();
 function buildQuote(){
 const lines=['ЗВУК СВЕТ ПРОКАТ — предварительная заявка','Расчёт создан: '+new Date().toLocaleDateString('ru-RU'),'Дата мероприятия: '+(date.value||'Не указана'),'Гостей: '+(document.querySelector('#guests').value||'Не указано'),'Площадка: '+(document.querySelector('#venue').value||'Не указана'),'','ОБОРУДОВАНИЕ (период аренды указан для каждой позиции)',...(selected().length?selected().map(c=>c.dataset.name+' — '+c.dataset.unit+': '+money(Number(c.dataset.price))):[notes.value.trim()?'Индивидуальный состав по описанию; оборудование и стоимость требуют согласования.':'Оборудование пока не выбрано.']),'Бюджет оборудования: '+(selected().length?total.textContent:notes.value.trim()?'По расчёту':'Не рассчитан'),'Периоды разных позиций могут отличаться. Итог не является ценой за единые сутки или смену. Продление аренды рассчитывается отдельно.','','УСЛОВИЯ ВЫБРАННЫХ ПОЗИЦИЙ',...(selected().length?selected().map(c=>c.dataset.name+': '+c.dataset.conditions):['Состав, период аренды, включённые работы и стоимость требуют отдельного согласования.']),'Условия оплаты, продления и наличие подтверждаются исполнителем. Неуказанные расходы не считаются нулевыми.','Наличие и финальная стоимость не подтверждены. Источники: '+location.origin+'/ceny/','','ДОСТУП И ТЕХНИЧЕСКОЕ РАСПИСАНИЕ','Доступ и разгрузка: '+(document.querySelector('#access-notes').value.trim()||'Требует уточнения'),'Монтаж, программа и вывоз: '+(document.querySelector('#schedule-notes').value.trim()||'Требует уточнения'),'Окна доступа и продолжительность работ требуют согласования. Ввод этих данных не пересчитывает бюджет. Состав включённых работ — в условиях выбранных позиций.','','Программа и пожелания: '+(notes.value.trim()||'Не указаны'),'','Текст сформирован на вашем устройстве. Заявка не отправлена менеджеру.'];
 return lines.join('\r\n');
 }
 form.addEventListener('submit',e=>{e.preventDefault();if(!selected().length&&!notes.value.trim()){status.textContent='Выберите оборудование или опишите нужный состав в пожеланиях к программе.';notes.focus();return;}if(!form.reportValidity())return;

 const blob=new Blob(['\uFEFF'+buildQuote()],{type:'text/plain;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='smeta-zvuk-svet-prokat.txt';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);status.textContent='Смета подготовлена для скачивания. Заявка не отправлена менеджеру.';
 });
}
