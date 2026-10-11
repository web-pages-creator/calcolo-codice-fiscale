/* Libreria codice fiscale: calcolo, verifica, decodifica (con omocodia) */
const CF={
 V:'AEIOU',
 MESI:'ABCDEHLMPRST',
 OMO:'LMNPQRSTUV',
 POS_OMO:[6,7,9,10,12,13,14],
 DISP:{0:1,1:0,2:5,3:7,4:9,5:13,6:15,7:17,8:19,9:21,A:1,B:0,C:5,D:7,E:9,F:13,G:15,H:17,I:19,J:21,K:2,L:4,M:18,N:20,O:11,P:3,Q:6,R:8,S:12,T:14,U:16,V:10,W:22,X:25,Y:24,Z:23},
 norm(s){return s.toUpperCase().replace(/[ÀÁÂÄ]/g,'A').replace(/[ÈÉÊË]/g,'E').replace(/[ÌÍÎÏ]/g,'I').replace(/[ÒÓÔÖ]/g,'O').replace(/[ÙÚÛÜ]/g,'U').replace(/[^A-Z]/g,'')},
 cons(s){return [...s].filter(c=>!CF.V.includes(c)).join('')},
 voc(s){return [...s].filter(c=>CF.V.includes(c)).join('')},
 cognome(v){const s=CF.norm(v);return (CF.cons(s)+CF.voc(s)+'XXX').slice(0,3)},
 nome(v){const s=CF.norm(v),c=CF.cons(s);if(c.length>=4)return c[0]+c[2]+c[3];return (c+CF.voc(s)+'XXX').slice(0,3)},
 dataOk(y,m,d){const t=new Date(Date.UTC(y,m-1,d));return t.getUTCFullYear()===y&&t.getUTCMonth()===m-1&&t.getUTCDate()===d},
 data(iso,sesso){const [y,m,d]=iso.split('-').map(Number);return String(y).slice(-2).padStart(2,'0')+CF.MESI[m-1]+String(d+(sesso==='F'?40:0)).padStart(2,'0')},
 ctrl(c15){let s=0;for(let i=0;i<15;i++){const ch=c15[i];s+=(i%2===0)?CF.DISP[ch]:(/\d/.test(ch)?+ch:ch.charCodeAt(0)-65)}return String.fromCharCode(65+s%26)},
 calcola(n,c,iso,sesso,belfiore){const k=CF.cognome(c)+CF.nome(n)+CF.data(iso,sesso)+belfiore;return k+CF.ctrl(k)},
 /* decodifica: restituisce {ok, errori[], ...} */
 decodifica(raw){
  const cf=raw.toUpperCase().replace(/\s/g,''),err=[];
  if(!/^[A-Z]{6}[0-9LMNPQRSTUV]{2}[A-Z][0-9LMNPQRSTUV]{2}[A-Z][0-9LMNPQRSTUV]{3}[A-Z]$/.test(cf))return{ok:false,errori:['Formato non valido: servono 16 caratteri nella sequenza corretta (6 lettere, 2 cifre, 1 lettera, 2 cifre, 1 lettera, 3 cifre, 1 lettera).']};
  let omo=false,a=[...cf];
  CF.POS_OMO.forEach(i=>{const p=CF.OMO.indexOf(a[i]);if(p>=0){omo=true;a[i]=String(p)}});
  const n=a.join(''),att=CF.ctrl(cf.slice(0,15));
  if(att!==cf[15])err.push('Il carattere di controllo non corrisponde (atteso '+att+'): il codice contiene un errore.');
  const mese=CF.MESI.indexOf(n[8])+1;if(!mese)err.push('Lettera del mese non valida.');
  let g=+n.slice(9,11),sesso='M';if(g>40){sesso='F';g-=40}
  const yy=+n.slice(6,8),anno=yy+(yy<=new Date().getFullYear()%100?2000:1900);
  if(mese&&!CF.dataOk(anno,mese,g)&&!CF.dataOk(anno-100,mese,g))err.push('Giorno non valido per il mese indicato.');
  return{ok:!err.length,errori:err,cf,omocodia:omo,sesso,giorno:g,mese,annoA:anno,annoB:anno-100,belfiore:n.slice(11,15),cognome:cf.slice(0,3),nome:cf.slice(3,6),normale:n.slice(0,15)+CF.ctrl(n.slice(0,15))}
 }
};
const COMUNI=[["Roma","H501"],["Milano","F205"],["Napoli","F839"],["Torino","L219"],["Palermo","G273"],["Genova","D969"],["Bologna","A944"],["Firenze","D612"],["Bari","A662"],["Venezia","L736"],["Verona","L781"],["Catania","C351"],["Padova","G224"],["Trieste","L424"],["Brescia","B157"],["Prato","G999"],["Taranto","L049"],["Reggio Calabria","H224"],["Reggio nell'Emilia","H223"],["Perugia","G478"],["Livorno","E625"],["Cagliari","B354"],["Foggia","D643"],["Rimini","H294"],["Salerno","H703"],["Ferrara","D548"],["Sassari","I452"],["Latina","E472"],["Pescara","G482"],["Monza","F704"],["Bergamo","A794"],["Ancona","A271"],["Novara","F952"],["Piacenza","G535"],["Udine","L483"],["Lecce","E506"],["Trento","L378"],["Vicenza","L840"],["Terni","L117"],["Como","C933"],["Siena","I726"],
["Aosta","A326"],["Bolzano","A952"],["Campobasso","B519"],["Potenza","G942"],["Catanzaro","C352"],["L'Aquila","A345"],["Cosenza","D086"],["Messina","F158"],["Siracusa","I754"],["Parma","G337"],["Modena","F257"],["Ravenna","H199"],["Arezzo","A390"],["Pisa","G702"],["Lucca","E715"],["Pistoia","G713"],["La Spezia","E463"],["Savona","I480"],["Varese","L682"],["Cremona","D150"],["Mantova","E897"],["Pavia","G388"],["Treviso","L407"],["Belluno","A757"],["Pordenone","G888"],["Gorizia","E098"],["Cuneo","D205"],["Asti","A479"],["Alessandria","A182"],["Brindisi","B180"],["Caserta","B963"],["Avellino","A509"],["Benevento","A783"],["Viterbo","M082"],["Rieti","H282"],["Frosinone","D810"],["Macerata","E783"],["Teramo","L103"],["Chieti","C632"],["Nuoro","F979"],["Oristano","G113"],["Trapani","L331"],["Agrigento","A089"],["Ragusa","H163"],["Matera","F052"],["Isernia","E335"],["Imperia","E290"],["Biella","A859"],["Vercelli","L750"],["Lodi","E648"],["Sondrio","I829"],["Rovigo","H620"],["Grosseto","E202"],["Forlì","D704"],["Cesena","C573"],["Massa","F023"],["Lecco","E507"],["Crotone","D122"]];
const STATI=[["Albania","Z100"],["Algeria","Z301"],["Argentina","Z600"],["Austria","Z102"],["Bangladesh","Z249"],["Belgio","Z103"],["Brasile","Z602"],["Canada","Z401"],["Cina","Z210"],["Colombia","Z604"],["Croazia","Z149"],["Ecuador","Z605"],["Egitto","Z336"],["Filippine","Z216"],["Francia","Z110"],["Germania","Z112"],["Ghana","Z318"],["Grecia","Z115"],["India","Z222"],["Marocco","Z330"],["Messico","Z514"],["Moldova","Z140"],["Nigeria","Z335"],["Paesi Bassi","Z126"],["Pakistan","Z223"],["Perù","Z611"],["Polonia","Z127"],["Portogallo","Z128"],["Regno Unito","Z114"],["Romania","Z129"],["Russia","Z154"],["Senegal","Z343"],["Spagna","Z131"],["Stati Uniti","Z404"],["Svizzera","Z133"],["Tunisia","Z352"],["Turchia","Z243"],["Ucraina","Z138"],["Venezuela","Z614"]];
function riempiLuoghi(sel){
 const og=(l,arr)=>{const g=document.createElement('optgroup');g.label=l;arr.slice().sort((a,b)=>a[0].localeCompare(b[0],'it')).forEach(([n,c])=>{const o=document.createElement('option');o.value=c;o.textContent=n;g.appendChild(o)});sel.appendChild(g)};
 og('Comuni italiani',COMUNI);og('Stati esteri',STATI);
 const g=document.createElement('optgroup');g.label='Altro';const o=document.createElement('option');o.value='ALTRO';o.textContent='Altro luogo (inserisci il codice)…';g.appendChild(o);sel.appendChild(g);
}

/* Code 39: pattern a 9 elementi (barra,spazio,...) 1 = largo, 0 = stretto */
CF.C39={'0':'000110100','1':'100100001','2':'001100001','3':'101100000','4':'000110001','5':'100110000','6':'001110000','7':'000100101','8':'100100100','9':'001100100','A':'100001001','B':'001001001','C':'101001000','D':'000011001','E':'100011000','F':'001011000','G':'000001101','H':'100001100','I':'001001100','J':'000011100','K':'100000011','L':'001000011','M':'101000010','N':'000010011','O':'100010010','P':'001010010','Q':'000000111','R':'100000110','S':'001000110','T':'000010110','U':'110000001','V':'011000001','W':'111000000','X':'010010001','Y':'110010000','Z':'011010000','*':'010010100'};
CF.barcode=function(text){
 const N=2,W=5,Q=20,H=64,t='*'+text+'*';let x=Q,bars='';
 for(const ch of t){const p=CF.C39[ch];if(!p)return '';
  for(let i=0;i<9;i++){const w=p[i]==='1'?W:N;if(i%2===0)bars+='<rect x="'+x+'" y="0" width="'+w+'" height="'+H+'"/>';x+=w}
  x+=N}
 const tot=x-N+Q;
 return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 '+tot+' '+(H+22)+'" role="img" aria-label="Codice a barre Code 39 di '+text+'" style="max-width:100%;width:'+Math.min(tot,420)+'px;height:auto;background:#fff;border-radius:6px"><g fill="#000">'+bars+'</g><text x="'+tot/2+'" y="'+(H+16)+'" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="13" fill="#000" letter-spacing="2">'+text+'</text></svg>';
};
