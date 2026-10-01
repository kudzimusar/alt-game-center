import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "wouter";
import {
  ArrowLeft, Bookmark, Check, ChevronLeft, ChevronRight, Clock3, Download,
  History, Home, PanelRight, Search, Star, Upload, Users, X,
} from "lucide-react";
import { hardcodedQuestions } from "@/pages/small-talk";

type Grade = "1" | "2" | "3";
type Day = "Mon" | "Tue" | "Wed" | "Thu" | "Fri";
type Activity = { week:number; day:Day; question:string; grammar:string; starter:string; example:string; _index:number; _id:string };
type ClassProfile = { id:string; label:string };
type Position = { week:number; day:Day; itemIndex:number|null; activityId:string|null; updatedAt:string };
type TeachingRecord = { id:string; timestamp:string; date:string; grade:Grade; profile:string; profileLabel:string; itemIndex:number; activityId:string; week:number; day:Day; grammar:string; question:string };
type BookmarkRecord = { grade:Grade; itemIndex:number; activityId:string; week:number; day:Day; grammar:string; question:string; createdAt:string };
type TeacherData = {
  version:number;
  profiles:Record<Grade, ClassProfile[]>;
  activeProfileByGrade:Record<Grade,string>;
  positions:Record<string,Position>;
  taughtByDate:Record<string,Record<string,TeachingRecord>>;
  history:TeachingRecord[];
  bookmarks:BookmarkRecord[];
  notes:Record<string,string>;
};

const DAYS:Day[] = ["Mon","Tue","Wed","Thu","Fri"];
const STORAGE_KEY = "smallTalk.premium.teacherState.v1";
const META:Record<Grade,{title:string;subtitle:string;accent:string;soft:string}> = {
  "1": { title:"Grade 1", subtitle:"Talk About You", accent:"from-blue-600 to-indigo-600", soft:"bg-blue-50 text-blue-700 border-blue-100" },
  "2": { title:"Grade 2", subtitle:"What If?", accent:"from-emerald-600 to-teal-600", soft:"bg-emerald-50 text-emerald-700 border-emerald-100" },
  "3": { title:"Grade 3", subtitle:"Imagine", accent:"from-violet-600 to-fuchsia-600", soft:"bg-violet-50 text-violet-700 border-violet-100" },
};

function defaults():TeacherData {
  return {
    version:1,
    profiles:{"1":[{id:"default",label:"Grade 1"}],"2":[{id:"default",label:"Grade 2"}],"3":[{id:"default",label:"Grade 3"}]},
    activeProfileByGrade:{"1":"default","2":"default","3":"default"}, positions:{}, taughtByDate:{}, history:[], bookmarks:[], notes:{}
  };
}
function loadData():TeacherData {
  if (typeof window === "undefined") return defaults();
  try {
    const raw=localStorage.getItem(STORAGE_KEY); if(!raw) return defaults();
    const parsed=JSON.parse(raw), base=defaults();
    return {...base,...parsed,profiles:{...base.profiles,...(parsed.profiles||{})},activeProfileByGrade:{...base.activeProfileByGrade,...(parsed.activeProfileByGrade||{})},positions:parsed.positions||{},taughtByDate:parsed.taughtByDate||{},history:Array.isArray(parsed.history)?parsed.history:[],bookmarks:Array.isArray(parsed.bookmarks)?parsed.bookmarks:[],notes:parsed.notes||{}};
  } catch { return defaults(); }
}
function dateKey(d=new Date()){ return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; }
function timeLabel(iso:string){ return new Date(iso).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}); }
function timerLabel(s:number){ return `${Math.floor(s/60)}:${String(s%60).padStart(2,"0")}`; }
function normalize(s:string){ return s.toLowerCase().replace(/[()\/–—-]/g," ").replace(/\s+/g," ").trim(); }
function buildActivities():Record<Grade,Activity[]> {
  const out={} as Record<Grade,Activity[]>;
  (["1","2","3"] as Grade[]).forEach(g=>{
    const count:Record<string,number>={};
    out[g]=(hardcodedQuestions[g]||[]).map((q:any,i:number)=>{
      const slot=`${q.week}-${q.day}`; count[slot]=(count[slot]||0)+1;
      return {...q,_index:i,_id:`g${g}-w${q.week}-${q.day}-${count[slot]}`} as Activity;
    });
  });
  return out;
}

export default function SmallTalkPremium(){
  const activities=useMemo(()=>buildActivities(),[]);
  const [data,setData]=useState<TeacherData>(()=>loadData());
  const [grade,setGrade]=useState<Grade|null>(null);
  const [week,setWeek]=useState(1);
  const [day,setDay]=useState<Day>("Mon");
  const [itemIndex,setItemIndex]=useState<number|null>(null);
  const [profile,setProfile]=useState("default");
  const [answer,setAnswer]=useState(false);
  const [searchOpen,setSearchOpen]=useState(false);
  const [teacherOpen,setTeacherOpen]=useState(false);
  const [query,setQuery]=useState("");
  const [className,setClassName]=useState("");
  const [toast,setToast]=useState("");
  const [timer,setTimer]=useState<{type:string;seconds:number;active:boolean}|null>(null);
  const importRef=useRef<HTMLInputElement>(null);

  const key=(g=grade,p=profile)=>`${g}::${p||"default"}`;
  const profiles=(g:Grade)=>data.profiles[g]?.length?data.profiles[g]:[{id:"default",label:`Grade ${g}`}];
  const profileLabel=(g:Grade,p:string)=>profiles(g).find(x=>x.id===p)?.label||`Grade ${g}`;
  const current=useMemo(()=>{
    if(!grade) return null; const list=activities[grade];
    const direct=itemIndex!==null?list[itemIndex]:null;
    return direct&&direct.week===week&&direct.day===day?direct:list.find(x=>x.week===week&&x.day===day)||null;
  },[activities,grade,week,day,itemIndex]);
  const currentProfile=grade?profileLabel(grade,profile):"";

  const persist=(next:TeacherData)=>{ setData(next); try{localStorage.setItem(STORAGE_KEY,JSON.stringify(next));}catch{} };
  const notify=(m:string)=>{ setToast(m); window.setTimeout(()=>setToast(v=>v===m?"":v),2600); };

  const chooseGrade=(g:Grade)=>{
    const p=data.activeProfileByGrade[g]||"default", pos=data.positions[`${g}::${p}`];
    setGrade(g); setProfile(p); setWeek(pos?.week||1); setDay(pos?.day||"Mon"); setItemIndex(Number.isInteger(pos?.itemIndex)?pos.itemIndex:null); setAnswer(false);
  };
  const jump=(g:Grade,index:number,p?:string)=>{
    const item=activities[g][index]; if(!item) return;
    const nextP=p&&profiles(g).some(x=>x.id===p)?p:(data.activeProfileByGrade[g]||"default");
    if(p&&nextP!==data.activeProfileByGrade[g]) persist({...data,activeProfileByGrade:{...data.activeProfileByGrade,[g]:nextP}});
    setGrade(g); setProfile(nextP); setWeek(item.week); setDay(item.day); setItemIndex(index); setAnswer(false); setSearchOpen(false); setTeacherOpen(false); window.scrollTo({top:0,behavior:"smooth"});
  };
  const changeWeek=(n:number)=>{ const next=week+n; if(next<1||next>40)return; setWeek(next);setItemIndex(null);setAnswer(false); };
  const changeDay=(n:number)=>{
    let di=DAYS.indexOf(day)+n,w=week;
    if(di<0){if(w<=1)return;w--;di=4;} if(di>4){if(w>=40)return;w++;di=0;}
    setWeek(w);setDay(DAYS[di]);setItemIndex(null);setAnswer(false);
  };

  useEffect(()=>{
    if(!grade||!current)return; const k=key(), old=data.positions[k];
    if(old?.week===week&&old?.day===day&&old?.itemIndex===current._index)return;
    persist({...data,positions:{...data.positions,[k]:{week,day,itemIndex:current._index,activityId:current._id,updatedAt:new Date().toISOString()}}});
  },[grade,profile,week,day,current?._id]);

  useEffect(()=>{
    if(!timer?.active)return;
    const id=window.setInterval(()=>setTimer(t=>!t||!t.active?t:t.seconds<=1?{...t,seconds:0,active:false}:{...t,seconds:t.seconds-1}),1000);
    return()=>clearInterval(id);
  },[timer?.active,timer?.type]);

  const markTaught=()=>{
    if(!grade||!current){notify("Choose a grade first.");return;}
    const now=new Date();
    const record:TeachingRecord={id:`${now.getTime()}-${Math.random().toString(36).slice(2,7)}`,timestamp:now.toISOString(),date:dateKey(now),grade,profile,profileLabel:currentProfile,itemIndex:current._index,activityId:current._id,week:current.week,day:current.day,grammar:current.grammar,question:current.question};
    const byDate={...(data.taughtByDate[record.date]||{}),[key()]:record};
    persist({...data,taughtByDate:{...data.taughtByDate,[record.date]:byDate},history:[record,...data.history].slice(0,500)}); notify(`Saved: ${record.profileLabel} · W${record.week} ${record.day}`);
  };
  const resume=()=>{
    let r=grade?data.history.find(x=>x.grade===grade&&x.profile===profile):undefined; if(!r)r=data.history[0];
    if(!r){notify("No taught activity has been recorded yet.");return;} jump(r.grade,r.itemIndex,r.profile||"default"); notify(`Resumed: ${r.profileLabel||`Grade ${r.grade}`}`);
  };
  const addProfile=()=>{
    if(!grade)return; const label=className.trim(); if(!label){notify("Enter a class name, for example 1-3.");return;}
    const ps=profiles(grade); if(ps.some(x=>x.label.toLowerCase()===label.toLowerCase())){notify("That class already exists.");return;}
    const id=`class-${Date.now().toString(36)}`, k=`${grade}::${id}`;
    const next={...data,profiles:{...data.profiles,[grade]:[...ps,{id,label}]},activeProfileByGrade:{...data.activeProfileByGrade,[grade]:id},positions:{...data.positions,[k]:{week,day,itemIndex:current?._index??null,activityId:current?._id??null,updatedAt:new Date().toISOString()}}};
    setProfile(id);setClassName("");persist(next);notify(`Class profile added: ${label}`);
  };
  const switchProfile=(p:string)=>{
    if(!grade)return; const pos=data.positions[`${grade}::${p}`]; setProfile(p);
    if(pos){setWeek(pos.week||1);setDay(DAYS.includes(pos.day)?pos.day:"Mon");setItemIndex(Number.isInteger(pos.itemIndex)?pos.itemIndex:null);} setAnswer(false);
    persist({...data,activeProfileByGrade:{...data.activeProfileByGrade,[grade]:p}});
  };
  const removeProfile=()=>{
    if(!grade||profile==="default")return; const label=currentProfile,k=key(), positions={...data.positions}; delete positions[k];
    const taught=Object.fromEntries(Object.entries(data.taughtByDate).map(([d,rs])=>{const n={...(rs as Record<string,TeachingRecord>)};delete n[k];return[d,n];})) as TeacherData["taughtByDate"];
    const next={...data,profiles:{...data.profiles,[grade]:profiles(grade).filter(x=>x.id!==profile)},activeProfileByGrade:{...data.activeProfileByGrade,[grade]:"default"},positions,taughtByDate:taught};
    setProfile("default"); const pos=positions[`${grade}::default`]; if(pos){setWeek(pos.week);setDay(pos.day);setItemIndex(pos.itemIndex);} persist(next); notify(`Removed class profile: ${label}`);
  };
  const bookmarked=!!current&&data.bookmarks.some(b=>b.activityId===current._id);
  const toggleBookmark=()=>{
    if(!grade||!current)return; const found=data.bookmarks.some(b=>b.activityId===current._id);
    if(found){persist({...data,bookmarks:data.bookmarks.filter(b=>b.activityId!==current._id)});notify("Bookmark removed.");return;}
    const b:BookmarkRecord={grade,itemIndex:current._index,activityId:current._id,week:current.week,day:current.day,grammar:current.grammar,question:current.question,createdAt:new Date().toISOString()};
    persist({...data,bookmarks:[b,...data.bookmarks]});notify("Activity bookmarked.");
  };
  const saveNote=(v:string)=>{ if(!current)return;const notes={...data.notes};if(v.trim())notes[current._id]=v;else delete notes[current._id];persist({...data,notes}); };
  const exportProgress=()=>{
    const blob=new Blob([JSON.stringify({exportedAt:new Date().toISOString(),storageKey:STORAGE_KEY,data},null,2)],{type:"application/json"}),url=URL.createObjectURL(blob),a=document.createElement("a");
    a.href=url;a.download=`small-talk-premium-progress-${dateKey()}.json`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);notify("Progress backup exported.");
  };
  const importProgress=async(file?:File)=>{
    if(!file)return; try{const parsed=JSON.parse(await file.text()),raw=parsed.data||parsed;if(!raw||typeof raw!=="object"||!Array.isArray(raw.history)||!raw.profiles)throw 0;const base=defaults();const next={...base,...raw,profiles:{...base.profiles,...(raw.profiles||{})},activeProfileByGrade:{...base.activeProfileByGrade,...(raw.activeProfileByGrade||{})},positions:raw.positions||{},taughtByDate:raw.taughtByDate||{},history:raw.history||[],bookmarks:Array.isArray(raw.bookmarks)?raw.bookmarks:[],notes:raw.notes||{}} as TeacherData;persist(next);notify("Progress backup imported.");}catch{notify("That file is not a valid Small Talk progress backup.");}finally{if(importRef.current)importRef.current.value="";}
  };

  const results=useMemo(()=>{
    const q=normalize(query);if(!q)return[];const terms=q.split(/\s+/).filter(Boolean),matches:Array<{grade:Grade;item:Activity;score:number}>=[];
    (["1","2","3"] as Grade[]).forEach(g=>activities[g].forEach(item=>{const gr=normalize(item.grammar),qu=normalize(item.question),st=normalize(item.starter),gh=terms.every(t=>gr.includes(t)),qh=terms.every(t=>qu.includes(t)),sh=terms.every(t=>st.includes(t));if(!(gh||qh||sh))return;let score=gr===q?100:gr.startsWith(q)?80:gh?60:0;if(qh)score+=25;if(sh)score+=10;matches.push({grade:g,item,score});}));
    return matches.sort((a,b)=>b.score-a.score||Number(a.grade)-Number(b.grade)||a.item.week-b.item.week||DAYS.indexOf(a.item.day)-DAYS.indexOf(b.item.day)).slice(0,60);
  },[query,activities]);

  useEffect(()=>{
    const fn=(e:KeyboardEvent)=>{const t=e.target as HTMLElement|null,tag=(t?.tagName||"").toLowerCase(),typing=["input","textarea","select"].includes(tag)||!!t?.isContentEditable;if(e.key==="Escape"){setSearchOpen(false);setTeacherOpen(false);return;}if(typing)return;if(e.key==="/"){e.preventDefault();setSearchOpen(true);return;}if(!grade)return;if(e.key==="ArrowLeft"){e.preventDefault();changeDay(-1);}else if(e.key==="ArrowRight"){e.preventDefault();changeDay(1);}else if(e.key==="ArrowUp"){e.preventDefault();changeWeek(-1);}else if(e.key==="ArrowDown"){e.preventDefault();changeWeek(1);}else if(e.key.toLowerCase()==="a")setAnswer(v=>!v);else if(e.key.toLowerCase()==="m")markTaught();else if(e.key.toLowerCase()==="r")resume();else if(["h","b"].includes(e.key.toLowerCase()))setTeacherOpen(true);};
    addEventListener("keydown",fn);return()=>removeEventListener("keydown",fn);
  });

  if(!grade) return <div className="min-h-screen bg-slate-950 text-white"><div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
    <div className="flex flex-wrap items-center justify-between gap-3"><div className="flex gap-3"><Link href="/dashboard"><button className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-bold text-slate-300 hover:bg-white/10"><Home size={16}/>Dashboard</button></Link><Link href="/games"><button className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-bold text-slate-300 hover:bg-white/10"><ArrowLeft size={16}/>All Games</button></Link></div><span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-xs font-black uppercase tracking-[.18em] text-amber-300">Small Talk · Teacher Edition</span></div>
    <div className="grid gap-10 py-16 lg:grid-cols-[1.1fr_.9fr] lg:items-end lg:py-24"><div><div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-400/10 px-4 py-2 text-sm font-bold text-indigo-200"><Star size={16}/>Premium classroom workflow</div><h1 className="max-w-4xl text-5xl font-black tracking-tight sm:text-6xl lg:text-7xl">Small Talk, built for the teacher who changes classes all day.</h1><p className="mt-6 max-w-2xl text-lg font-medium leading-8 text-slate-300">Search grammar instantly, resume each class where you left off, mark what you taught, keep notes and bookmarks, and back up your progress — without changing the familiar 40-week Grade 1–3 curriculum.</p><div className="mt-8 flex flex-wrap gap-3 text-sm font-bold text-slate-300">{["Grammar search","Class memory","Teaching history","Bookmarks","Notes","Backup"].map(x=><span key={x} className="rounded-full border border-white/10 bg-white/5 px-3 py-2">{x}</span>)}</div></div>
      <div className="rounded-[2rem] border border-white/10 bg-white/[.06] p-6 shadow-2xl"><div className="mb-5 flex items-center justify-between"><div><div className="text-xs font-black uppercase tracking-[.22em] text-slate-500">Choose a level</div><div className="mt-1 text-2xl font-black">Start or resume a class</div></div><Search className="text-indigo-300"/></div><div className="space-y-3">{(["1","2","3"] as Grade[]).map(g=>{const p=data.activeProfileByGrade[g]||"default",pos=data.positions[`${g}::${p}`],last=data.history.find(r=>r.grade===g&&r.profile===p);return <button key={g} onClick={()=>chooseGrade(g)} className="group w-full rounded-2xl border border-white/10 bg-slate-900/60 p-5 text-left transition hover:-translate-y-.5 hover:border-white/20 hover:bg-slate-900"><div className="flex items-center justify-between gap-4"><div><div className="text-xl font-black">{META[g].title}</div><div className="text-sm font-bold text-slate-400">{META[g].subtitle}</div></div><span className="rounded-full bg-white/10 px-3 py-1 text-xs font-black">{profileLabel(g,p)}</span></div><div className="mt-4 flex flex-wrap gap-2 text-xs font-bold text-slate-400"><span>{pos?`Resume W${pos.week} · ${pos.day}`:"Start Week 1 · Mon"}</span>{last&&<span>• Last taught {last.date===dateKey()?"today":last.date}</span>}</div></button>})}</div></div>
    </div></div></div>;

  const meta=META[grade],today=data.taughtByDate[dateKey()]?.[key()];
  return <div className="min-h-screen bg-slate-50 text-slate-950">
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl"><div className="mx-auto flex max-w-[1500px] flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6"><div className="flex min-w-0 items-center gap-3"><button onClick={()=>setGrade(null)} className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"><ArrowLeft size={19}/></button><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h1 className="truncate text-lg font-black sm:text-xl">Small Talk Premium</h1><span className={`rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-[.16em] ${meta.soft}`}>{meta.title}</span></div><div className="mt-.5 truncate text-xs font-bold text-slate-500">{meta.subtitle} · {currentProfile}</div></div></div><div className="flex flex-wrap items-center justify-end gap-2"><button onClick={()=>setSearchOpen(true)} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-black text-slate-700 shadow-sm hover:bg-slate-50"><Search size={17}/>Search grammar <span className="hidden rounded bg-slate-100 px-1.5 py-.5 text-[10px] text-slate-500 sm:inline">/</span></button><button onClick={()=>setTeacherOpen(true)} className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-3 py-2 text-sm font-black text-white hover:bg-slate-800"><PanelRight size={17}/>Control Center</button></div></div></header>
    <main className="mx-auto grid max-w-[1500px] gap-5 px-4 py-5 sm:px-6 lg:grid-cols-[minmax(0,1fr)_340px]"><section className="min-w-0 space-y-5">
      <div className="rounded-[1.75rem] border border-slate-200 bg-white p-4 shadow-sm sm:p-5"><div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between"><div className="flex items-center justify-between gap-3"><button onClick={()=>changeWeek(-1)} disabled={week===1} className="grid h-11 w-11 place-items-center rounded-xl border border-slate-200 text-slate-600 disabled:opacity-30"><ChevronLeft size={20}/></button><div className="min-w-[130px] text-center"><div className="text-[10px] font-black uppercase tracking-[.22em] text-slate-400">Curriculum</div><div className="text-xl font-black">Week {week}</div></div><button onClick={()=>changeWeek(1)} disabled={week===40} className="grid h-11 w-11 place-items-center rounded-xl border border-slate-200 text-slate-600 disabled:opacity-30"><ChevronRight size={20}/></button></div><div className="grid grid-cols-5 gap-2">{DAYS.map(d=><button key={d} onClick={()=>{setDay(d);setItemIndex(null);setAnswer(false)}} className={`rounded-xl px-3 py-2 text-xs font-black uppercase transition sm:px-4 ${day===d?"bg-slate-950 text-white shadow-lg":"bg-slate-100 text-slate-500 hover:bg-slate-200"}`}>{d}</button>)}</div></div></div>
      <article className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_24px_70px_-40px_rgba(15,23,42,.35)]"><div className={`h-2 w-full bg-gradient-to-r ${meta.accent}`}/><div className="p-6 sm:p-10 lg:p-12"><div className="flex flex-wrap items-start justify-between gap-4"><div><div className="text-[10px] font-black uppercase tracking-[.24em] text-slate-400">Today's opening question</div><div className="mt-3 inline-flex rounded-full bg-slate-100 px-4 py-2 text-xs font-black uppercase tracking-[.16em] text-slate-700">Grammar: {current?.grammar||"Systematic review"}</div></div>{today&&<div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-700"><Check size={15}/>Marked taught today</div>}</div><h2 className="mx-auto mt-10 max-w-5xl text-center text-4xl font-black leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl xl:text-7xl">{current?.question||"Review Day — share your progress!"}</h2><div className="mx-auto mt-10 max-w-3xl rounded-2xl border border-slate-200 bg-slate-50 p-6 sm:p-7"><div className="text-[10px] font-black uppercase tracking-[.22em] text-slate-400">Sentence starter</div><p className="mt-3 text-2xl font-black italic leading-relaxed text-slate-800 sm:text-3xl">“{current?.starter||"Starting phrase..."}”</p></div><div className="mx-auto mt-5 max-w-3xl"><button onClick={()=>setAnswer(v=>!v)} className="w-full rounded-2xl border-2 border-dashed border-slate-300 px-5 py-4 text-sm font-black uppercase tracking-[.16em] text-slate-500 hover:bg-slate-50">{answer?"Hide model answer":"Reveal model answer"}</button>{answer&&<div className="mt-4 rounded-2xl bg-slate-950 p-6 text-xl font-bold leading-relaxed text-white sm:p-7 sm:text-2xl">“{current?.example||"Model response..."}”</div>}</div></div></article>
      <section className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><div className="mb-4 flex items-center gap-2"><Clock3 size={18} className="text-slate-500"/><h3 className="font-black">Classroom timers</h3><span className="text-xs font-bold text-slate-400">Tap to start or reset.</span></div><div className="grid gap-3 sm:grid-cols-3">{[{label:"THINK",seconds:120},{label:"PAIR",seconds:180},{label:"SHARE",seconds:300}].map(x=>{const active=timer?.type===x.label;return <button key={x.label} onClick={()=>setTimer({type:x.label,seconds:x.seconds,active:true})} className={`rounded-2xl border p-5 text-left transition ${active?"border-indigo-600 bg-indigo-600 text-white shadow-lg shadow-indigo-200":"border-slate-200 bg-slate-50 hover:bg-white"}`}><div className={`text-[10px] font-black uppercase tracking-[.2em] ${active?"text-indigo-100":"text-slate-400"}`}>{x.label} time</div><div className="mt-2 text-4xl font-black tracking-tight">{active?timerLabel(timer.seconds):timerLabel(x.seconds)}</div></button>})}</div></section>
    </section><aside className="space-y-4 lg:sticky lg:top-[88px] lg:self-start"><div className="rounded-[1.75rem] bg-slate-950 p-5 text-white shadow-xl"><div className="text-[10px] font-black uppercase tracking-[.22em] text-slate-500">Current class</div><div className="mt-2 text-2xl font-black">{currentProfile}</div><div className="mt-1 text-sm font-bold text-slate-400">{meta.title} · W{week} {day}</div><div className="mt-5 grid grid-cols-2 gap-2"><button onClick={markTaught} className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-3 py-3 text-sm font-black text-emerald-950"><Check size={17}/>Mark taught</button><button onClick={toggleBookmark} className={`inline-flex items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-black ${bookmarked?"bg-amber-300 text-amber-950":"bg-white/10 text-white"}`}><Bookmark size={17} fill={bookmarked?"currentColor":"none"}/>{bookmarked?"Saved":"Bookmark"}</button></div><button onClick={resume} className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm font-black text-slate-200"><History size={17}/>Resume last taught</button></div><div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><div><div className="text-[10px] font-black uppercase tracking-[.2em] text-slate-400">Class memory</div><div className="mt-1 font-black">{profiles(grade).length} profile{profiles(grade).length===1?"":"s"}</div></div><Users size={20} className="text-slate-400"/></div><div className="mt-4 flex flex-wrap gap-2">{profiles(grade).map(p=><button key={p.id} onClick={()=>switchProfile(p.id)} className={`rounded-full px-3 py-2 text-xs font-black ${profile===p.id?"bg-slate-950 text-white":"bg-slate-100 text-slate-600"}`}>{p.label}</button>)}</div></div><div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm"><div className="text-[10px] font-black uppercase tracking-[.2em] text-slate-400">Teacher note</div><textarea key={current?._id} defaultValue={current?data.notes[current._id]||"":""} onBlur={e=>saveNote(e.currentTarget.value)} placeholder="Add a reminder for this activity..." className="mt-3 min-h-28 w-full resize-y rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-semibold outline-none focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"/><div className="mt-2 text-[11px] font-bold text-slate-400">Saved automatically when you leave the field.</div></div></aside></main>

    {searchOpen&&<div className="fixed inset-0 z-50 bg-slate-950/70 p-3 backdrop-blur-sm sm:p-6" onMouseDown={()=>setSearchOpen(false)}><div className="mx-auto flex h-full max-w-4xl flex-col overflow-hidden rounded-[2rem] bg-white shadow-2xl" onMouseDown={e=>e.stopPropagation()}><div className="border-b border-slate-200 p-5 sm:p-6"><div className="flex items-center gap-3"><Search className="text-indigo-600"/><div className="flex-1"><div className="text-xs font-black uppercase tracking-[.2em] text-slate-400">Find grammar instantly</div><input autoFocus value={query} onChange={e=>setQuery(e.target.value)} placeholder='Try “must”, “past simple”, “want to”…' className="mt-1 w-full border-0 p-0 text-2xl font-black outline-none placeholder:text-slate-300"/></div><button onClick={()=>setSearchOpen(false)} className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 text-slate-500"><X size={18}/></button></div></div><div className="flex-1 overflow-y-auto p-4 sm:p-5">{!query.trim()?<div className="grid h-full place-items-center text-center"><div><Search className="mx-auto text-slate-300" size={42}/><p className="mt-4 font-black text-slate-500">Search grammar, questions, or sentence starters.</p><p className="mt-1 text-sm font-semibold text-slate-400">Press / anywhere in the game to open this search.</p></div></div>:results.length===0?<div className="py-16 text-center font-bold text-slate-400">No matching grammar or question found.</div>:<div className="space-y-2">{results.map(({grade:g,item})=><button key={item._id} onClick={()=>jump(g,item._index)} className="w-full rounded-2xl border border-slate-200 p-4 text-left hover:border-indigo-200 hover:bg-indigo-50/40"><div className="flex items-start justify-between gap-4"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-[.16em] text-indigo-700">Grade {g}</span><span className="text-[10px] font-black uppercase tracking-[.16em] text-slate-400">Week {item.week} · {item.day}</span></div><div className="mt-2 text-lg font-black">{item.grammar}</div><div className="mt-1 truncate text-sm font-semibold text-slate-500">{item.question}</div></div><ArrowLeft className="mt-5 rotate-180 text-slate-300" size={18}/></div></button>)}</div>}</div></div></div>}

    {teacherOpen&&<div className="fixed inset-0 z-50 bg-slate-950/70 p-3 backdrop-blur-sm sm:p-6" onMouseDown={()=>setTeacherOpen(false)}><div className="mx-auto h-full max-w-6xl overflow-y-auto rounded-[2rem] bg-slate-50 shadow-2xl" onMouseDown={e=>e.stopPropagation()}><div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white/95 p-5 backdrop-blur sm:px-7"><div><div className="text-xs font-black uppercase tracking-[.22em] text-indigo-600">Small Talk Control Center</div><div className="mt-1 text-xl font-black">{currentProfile} · Grade {grade}</div></div><button onClick={()=>setTeacherOpen(false)} className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 text-slate-500"><X size={18}/></button></div><div className="grid gap-5 p-4 sm:p-6 lg:grid-cols-2">
      <section className="rounded-2xl border border-slate-200 bg-white p-5"><div className="flex items-center justify-between"><div><div className="text-[10px] font-black uppercase tracking-[.2em] text-slate-400">Class profiles</div><h3 className="mt-1 text-lg font-black">Remember each class separately</h3></div><Users className="text-slate-400"/></div><div className="mt-4 flex flex-wrap gap-2">{profiles(grade).map(p=><button key={p.id} onClick={()=>switchProfile(p.id)} className={`rounded-full px-3 py-2 text-sm font-black ${profile===p.id?"bg-slate-950 text-white":"bg-slate-100 text-slate-600"}`}>{p.label}</button>)}</div><div className="mt-4 flex gap-2"><input value={className} onChange={e=>setClassName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addProfile()} placeholder="Add class, e.g. 1-3" className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"/><button onClick={addProfile} className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-black text-white">Add</button></div>{profile!=="default"&&<button onClick={removeProfile} className="mt-3 text-xs font-black text-rose-600">Remove current class profile</button>}</section>
      <section className="rounded-2xl border border-slate-200 bg-white p-5"><div className="text-[10px] font-black uppercase tracking-[.2em] text-slate-400">Current activity</div><h3 className="mt-2 text-lg font-black">W{current?.week} {current?.day} · {current?.grammar}</h3><p className="mt-1 text-sm font-semibold text-slate-500">{current?.question}</p><div className="mt-4 grid gap-2 sm:grid-cols-3"><button onClick={markTaught} className="rounded-xl bg-emerald-500 px-3 py-3 text-sm font-black text-emerald-950">✓ Mark taught</button><button onClick={toggleBookmark} className="rounded-xl bg-amber-100 px-3 py-3 text-sm font-black text-amber-900">{bookmarked?"★ Bookmarked":"☆ Bookmark"}</button><button onClick={resume} className="rounded-xl bg-slate-100 px-3 py-3 text-sm font-black text-slate-700">Resume last</button></div><textarea key={`panel-${current?._id}`} defaultValue={current?data.notes[current._id]||"":""} onBlur={e=>saveNote(e.currentTarget.value)} placeholder="Teacher note for this activity..." className="mt-4 min-h-24 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-semibold outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"/></section>
      <section className="rounded-2xl border border-slate-200 bg-white p-5"><div className="flex items-center gap-2"><History size={18} className="text-slate-400"/><h3 className="font-black">Teaching history</h3></div><div className="mt-4 max-h-80 space-y-2 overflow-y-auto pr-1">{data.history.length===0?<div className="py-8 text-center text-sm font-bold text-slate-400">No taught activities recorded yet.</div>:data.history.slice(0,20).map(r=><button key={r.id} onClick={()=>jump(r.grade,r.itemIndex,r.profile||"default")} className="w-full rounded-xl bg-slate-50 p-3 text-left hover:bg-slate-100"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><div className="font-black">{r.profileLabel||`Grade ${r.grade}`} · W{r.week} {r.day}</div><div className="mt-.5 truncate text-xs font-semibold text-slate-500">{r.grammar} · {r.question}</div></div><div className="shrink-0 text-[10px] font-black text-slate-400">{r.date===dateKey()?"Today":r.date} · {timeLabel(r.timestamp)}</div></div></button>)}</div></section>
      <section className="rounded-2xl border border-slate-200 bg-white p-5"><div className="flex items-center gap-2"><Bookmark size={18} className="text-slate-400"/><h3 className="font-black">Bookmarks</h3></div><div className="mt-4 max-h-80 space-y-2 overflow-y-auto pr-1">{data.bookmarks.length===0?<div className="py-8 text-center text-sm font-bold text-slate-400">No bookmarks yet.</div>:data.bookmarks.map(b=><div key={b.activityId} className="flex gap-2"><button onClick={()=>jump(b.grade,b.itemIndex)} className="min-w-0 flex-1 rounded-xl bg-amber-50 p-3 text-left hover:bg-amber-100"><div className="font-black">Grade {b.grade} · W{b.week} {b.day}</div><div className="mt-.5 truncate text-xs font-semibold text-slate-500">{b.grammar} · {b.question}</div></button><button onClick={()=>persist({...data,bookmarks:data.bookmarks.filter(x=>x.activityId!==b.activityId)})} className="grid w-10 place-items-center rounded-xl bg-slate-100 text-slate-500"><X size={16}/></button></div>)}</div></section>
      <section className="rounded-2xl border border-slate-200 bg-white p-5 lg:col-span-2"><div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center"><div><div className="text-[10px] font-black uppercase tracking-[.2em] text-slate-400">Backup and shortcuts</div><div className="mt-2 flex flex-wrap gap-x-5 gap-y-2 text-xs font-bold text-slate-500"><span><b className="text-slate-950">/</b> Search</span><span><b className="text-slate-950">← →</b> Day</span><span><b className="text-slate-950">↑ ↓</b> Week</span><span><b className="text-slate-950">A</b> Answer</span><span><b className="text-slate-950">M</b> Mark taught</span><span><b className="text-slate-950">R</b> Resume</span><span><b className="text-slate-950">H / B</b> Control Center</span></div></div><div className="flex flex-wrap gap-2"><button onClick={exportProgress} className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-black text-white"><Download size={16}/>Export progress</button><button onClick={()=>importRef.current?.click()} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-700"><Upload size={16}/>Import progress</button><input ref={importRef} type="file" accept="application/json,.json" className="hidden" onChange={e=>importProgress(e.currentTarget.files?.[0])}/></div></div></section>
    </div></div></div>}
    {toast&&<div className="fixed bottom-5 left-1/2 z-[70] -translate-x-1/2 rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white shadow-2xl">{toast}</div>}
  </div>;
}
