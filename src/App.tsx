import { useEffect, useRef, useState } from 'react';
import { commands, education, experience, profile, projects, skills, snippets, themes } from './content';
import type { Command } from './content';
import { useTyping } from './TypingEngine';
import KeyboardVisualizer from './KeyboardVisualizer';

function Highlight({text}:{text:string}) {
 const tokens = text.split(/("[^"\n]*"|'[^'\n]*'|#[^\n]*|\b(?:class|def|return|from|import|async|await|for|in|if|not|and|continue|export|interface|type|throw|new|const)\b|\b\d+(?:\.\d+)?\b)/g);
 return <>{tokens.map((t,i)=><span key={i} className={t.startsWith('#')?'comment':/^['"]/.test(t)?'string':/^(class|def|return|from|import|async|await|for|in|if|not|and|continue|export|interface|type|throw|new|const)$/.test(t)?'keyword':/^\d/.test(t)?'number':''}>{t}</span>)}</>;
}
export default function App() {
 const [view,setView] = useState<Command>('home');
 const [theme,setTheme] = useState(()=>{try { const t=localStorage.getItem('yt-theme'); return themes.some(x=>x.id===t)?t!:'warm'; } catch{return 'warm';}});
 const [prompt,setPrompt] = useState(false);
 const [query,setQuery] = useState('');
 const [error,setError] = useState('');
 const [project,setProject] = useState(0);
 const [paused,setPaused] = useState(false);
 const input=useRef<HTMLInputElement>(null);
 const editor=useRef<HTMLDivElement>(null);
 const trigger=useRef<HTMLElement|null>(null);
 const content=useRef<HTMLDivElement>(null);
 const typing=useTyping(view!=='home'||prompt||paused);
 const snippet=snippets[typing.file];
 const code=snippet.code.slice(0,typing.count);
 const lines=code.split('\n');
 const isInsert=typing.phase==='typing'&&!paused&&!prompt&&!typing.reduced;
 useEffect(()=>{document.documentElement.dataset.theme=theme;try{localStorage.setItem('yt-theme',theme);}catch{/* storage may be unavailable */}},[theme]);
 useEffect(()=>{if(editor.current)editor.current.scrollTop=editor.current.scrollHeight;},[typing.count]);
 useEffect(()=>{if(prompt)input.current?.focus();},[prompt]);
 useEffect(()=>{if(content.current){content.current.scrollTop=0;content.current.focus({preventScroll:true});}},[view]);
 const openPrompt=()=>{trigger.current=document.activeElement as HTMLElement;setQuery('');setPrompt(true);setError('');};
 const closePrompt=()=>{setPrompt(false);trigger.current?.focus();};
 const execute=(raw:string)=>{
  const cmd=raw.trim().replace(/^:/,'').toLowerCase();
  if(!commands.includes(cmd as Command)){setError(`E492: Unknown command: ${cmd}. Try :help`);return;}
  if(cmd==='resume') { const a=document.createElement('a');a.href=profile.resume;a.download='Younes-Traouki-CV.pdf';a.click(); }
  else setView(cmd as Command);
  setPrompt(false);setQuery('');setError('');
 };
 useEffect(()=>{
  const handle=(e:KeyboardEvent)=>{
   if(e.key==='Escape'){if(prompt)closePrompt();else setView('home');setError('');}
   if(e.key===':' && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || (e.target instanceof HTMLElement && e.target.isContentEditable))){e.preventDefault();openPrompt();}
  };
  window.addEventListener('keydown',handle);return()=>window.removeEventListener('keydown',handle);
 });
 const p=projects[project];
 return <main className="shell">
  <header><a className="identity" href="#" onClick={e=>{e.preventDefault();setView('home');}} aria-label="Younes Traouki home"><strong>yt.</strong><span>{profile.domain || profile.label}</span></a><a href={profile.github} target="_blank" rel="noreferrer">github <span className="accent">↗</span></a></header>
  <section className="workstation" aria-label="Interactive engineering portfolio">
   <div className="buffer-heading"><span><span className="accent">⌁</span> {view==='home'?snippet.path:`~/younes/${view}.md`}</span><span>{view==='home'?`${String(typing.file+1).padStart(2,'0')} / 05`:'READ ONLY'}</span></div>
   <div className={`editor ${view!=='home'?'content-editor':''}`}>
    {view==='home'?<div ref={editor} className="code-scroll" tabIndex={0} aria-label="Animated illustrative code"><div aria-hidden="true">{lines.map((line,i)=><div className={`code-line ${i===lines.length-1?'current':''}`} key={i}><span className="line-number">{i+1}</span><code><Highlight text={line}/>{i===lines.length-1&&<span className={`cursor ${isInsert?'insert':''}`}> </span>}</code></div>)}</div><span className="sr-only">Original illustrative {snippet.language} code about Younes’s engineering interests. Use the navigation buttons to explore his work.</span></div>:
    <div ref={content} tabIndex={-1} className="content-scroll">
     <div className="content-title"><span># {view}</span><button onClick={()=>setView('home')}>close <kbd>esc</kbd></button></div>
     {view==='about'&&<><h1>{profile.name}</h1><p className="lead">Building intelligent systems from models to production.</p><p>{profile.role}<br/>{profile.location}</p><p>I work across AI, optimization, computer vision and software engineering, connecting models to applications people can use.</p><h2>education</h2>{education.map(([date,title,place])=><div className="entry" key={date}><small>{date}</small><h3>{title}</h3><p>{place}</p></div>)}<button onClick={()=>execute('resume')}>download résumé ↗</button></>}
     {view==='projects'&&<div className="project-explorer"><nav aria-label="Project files">{projects.map((item,i)=><button key={item.file} className={i===project?'selected':''} onClick={()=>setProject(i)} aria-pressed={i===project}><span>{String(i+1).padStart(2,'0')}</span> {item.file}</button>)}</nav><article><small>{p.area}</small><h1>{p.name}</h1><p>{p.description}</p><h2>engineering challenge</h2><p>{p.challenge}</p><h2>my contribution</h2><p>{p.contribution}</p><p className="stack">{p.stack}</p><small>{p.status}</small></article></div>}
     {view==='experience'&&<>{experience.map(item=><article className="entry" key={item.company}><small>{item.date}</small><h2>{item.company}</h2><h3>{item.role}</h3><p>{item.text}</p></article>)}<h2>selected achievements</h2><p>01 · First Prize — HPC Hackathon, UM6P · Dec 2024<br/>02 · First Prize — CROMEK 7 · May 2024<br/>03 · Third Place — NXP Cup Qualifications · Apr 2024</p></>}
     {view==='skills'&&<><p className="comment"># Tools used across work, study and prototypes; depth varies.</p>{skills.map(([name,tools])=><article className="entry" key={name}><h2>{name}</h2><p>{tools}</p></article>)}</>}
     {view==='contact'&&<><h1>Let’s build something meaningful.</h1><p>For engineering opportunities and thoughtful collaborations.</p><h2>email</h2><a className="contact-link" href={`mailto:${profile.email}`}>{profile.email} ↗</a><h2>elsewhere</h2><p><a href={profile.github} target="_blank" rel="noreferrer">github / younestr ↗</a>{profile.linkedin&&<a href={profile.linkedin}>LinkedIn ↗</a>}{profile.kaggle&&<a href={profile.kaggle}>Kaggle ↗</a>}</p><p className="comment">Casablanca, Morocco</p><a href={profile.resume} download>download résumé.pdf ↓</a></>}
     {view==='theme'&&<><h1>A different light.</h1><p>Choose a color scheme for this workspace.</p><div className="theme-list">{themes.map(t=><button key={t.id} onClick={()=>setTheme(t.id)} aria-pressed={theme===t.id}><span>{theme===t.id?'●':'○'} {t.label}</span><small>{t.detail}</small></button>)}</div></>}
     {view==='help'&&<><h1>A small guide to this workspace.</h1><p>Press <kbd>:</kbd> to enter a command, then <kbd>enter</kbd> to open a buffer. <kbd>esc</kbd> returns home.</p><div className="help-list">{commands.filter(c=>c!=='help').map(c=><button key={c} onClick={()=>execute(c)}>:{c}<span>{({about:'Profile & education',projects:'Six engineering projects',experience:'Work & achievements',skills:'Tools & disciplines',contact:'Get in touch',resume:'Download the provided CV',theme:'Change color scheme',home:'Return to the living editor'} as Record<string,string>)[c]}</span></button>)}</div><p className="comment">The code fragments are original illustrations, not production or employer source code. Motion pauses while you explore.</p></>}
    </div>}
    <div className="status-bar"><span className={`mode ${isInsert&&view==='home'?'mode-insert':''}`}>{view==='home'?(isInsert?'INSERT':'NORMAL'):'NORMAL'}</span><span className="status-path">{view==='home'?snippet.path:`${view}.md`}</span><span className="encoding">utf-8</span><span>{view==='home'?`${lines.length}:${(lines.at(-1)?.length||0)+1}`:'1:1'}</span><span>Top</span></div>
   </div>
   <div className="command-line">{prompt?<form onSubmit={e=>{e.preventDefault();execute(query);}}><label htmlFor="command">:</label><input ref={input} id="command" aria-label="Vim command" value={query} onChange={e=>{setQuery(e.target.value);setError('');}} list="commands" autoComplete="off" spellCheck={false}/><datalist id="commands">{commands.map(c=><option key={c} value={c}/>)}</datalist><button type="submit">enter ↵</button><button type="button" onClick={closePrompt}>esc</button></form>:<><span className="comment">{error|| (view==='home'?'" intelligence, engineered.':'" press esc to return to the editor')}</span><button onClick={openPrompt}>:command <kbd>↵</kbd></button></>}</div>
   {error&&prompt&&<p className="error" role="alert">{error}</p>}
   <nav className="quick-nav" aria-label="Portfolio commands">{(['about','projects','experience','skills','contact'] as Command[]).map(c=><button key={c} className={view===c?'active':''} onClick={()=>execute(c)}>:{c}</button>)}<button onClick={()=>execute('help')} aria-label="Help">?</button></nav>
   <KeyboardVisualizer pressed={typing.key} reduced={typing.reduced||paused||view!=='home'||prompt}/>
  </section>
  <footer><span>// intelligence, engineered.</span><div><button onClick={()=>setPaused(!paused)} aria-pressed={paused}>{paused?'resume motion':'pause motion'}</button><button onClick={()=>execute('theme')}>:theme <span className="theme-dot"/></button></div></footer>
 </main>;
}
