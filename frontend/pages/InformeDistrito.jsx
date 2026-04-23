import { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Cell, LineChart, Line
} from "recharts";

/* ═══════════════════════════════════════════
   THEME (mismos colores que InformeMETA)
   ═══════════════════════════════════════════ */
const C = {
  navyDeep: "#031148", navy: "#041552", blue: "#0b2280",
  accent: "#00a6e6", cyan: "#00bcd4", cardBlue: "#0071ce",
  barFill: "#1a3080", barHi: "#29b6f6",
  white: "#fff", off: "#f4f5f8", bdr: "#dde0e8",
  txt: "#041552", tb: "#333", tm: "#7a8399",
  red: "#e84c4c", green: "#4caf50", yellow: "#ff9800",
};
const F = "'Segoe UI',-apple-system,system-ui,sans-serif";
const sem = {
  verde:    { bg:"#e8f5e9", fg:"#4caf50", label:"Por encima" },
  amarillo: { bg:"#fff8e1", fg:"#ff9800", label:"Dentro de lo esperado" },
  rojo:     { bg:"#ffebee", fg:"#f44336", label:"Por debajo" },
};

/* ═══════════════════════════════════════════
   MOCK DATA — Vicente López, 8 escuelas
   ═══════════════════════════════════════════ */
const MOCK = {
  distrito: "Vicente López",
  cantidad: 8,
  general: {
    muestra: { mi: 312, todos: 894 },
    pct40: { mi: 78, todos: 79 },
    pctPISA: { mi: 72, todos: 60 },
    pct45: { mi: 77, todos: 77 },
  },
  escuelas: [
    { id:"C18", nombre:"Colegio San Martín",  p:87 },
    { id:"C12", nombre:"Instituto Belgrano",  p:84 },
    { id:"C3",  nombre:"Escuela Rivadavia",   p:83 },
    { id:"C7",  nombre:"Colegio Amundsen",    p:75 },
    { id:"C5",  nombre:"Instituto Sarmiento",  p:74 },
    { id:"C6",  nombre:"Escuela Moreno",      p:72 },
    { id:"C13", nombre:"Escuela Alberdi",     p:70 },
    { id:"C20", nombre:"Colegio Mitre",       p:65 },
  ],
  promDistrito: 76.3,
  ranking: [
    { id:"C18", nombre:"Colegio San Martín",  al:42, p40:87, pP:80, p45:85, s:"verde" },
    { id:"C12", nombre:"Instituto Belgrano",  al:38, p40:84, pP:75, p45:82, s:"verde" },
    { id:"C3",  nombre:"Escuela Rivadavia",   al:45, p40:83, pP:71, p45:81, s:"amarillo" },
    { id:"C7",  nombre:"Colegio Amundsen",    al:17, p40:75, pP:67, p45:74, s:"amarillo" },
    { id:"C5",  nombre:"Instituto Sarmiento",  al:50, p40:74, pP:62, p45:72, s:"amarillo" },
    { id:"C6",  nombre:"Escuela Moreno",      al:40, p40:72, pP:58, p45:70, s:"amarillo" },
    { id:"C13", nombre:"Escuela Alberdi",     al:35, p40:70, pP:55, p45:68, s:"rojo" },
    { id:"C20", nombre:"Colegio Mitre",       al:45, p40:65, pP:50, p45:63, s:"rojo" },
  ],
  contenido: [
    { n:"Numeración", mi:80, t:83 },
    { n:"Geometría",  mi:82, t:82 },
    { n:"Medidas",    mi:70, t:68 },
  ],
  competencia: [
    { n:"Reconocimiento de conceptos", mi:81, t:78 },
    { n:"Resolución de problemas",     mi:72, t:80 },
    { n:"Resolución de algoritmos",    mi:79, t:83 },
  ],
  bpMi:   { min:45, q1:68, md:78, q3:88, max:98, av:76 },
  bpAll:  { min:28, q1:70, md:80, q3:90, max:98, av:79 },
  tendencia: [
    { toma:"1-2022", pct:71.2, al:290 },
    { toma:"2-2022", pct:73.5, al:305 },
    { toma:"1-2023", pct:75.8, al:310 },
    { toma:"2-2023", pct:78.0, al:312 },
  ],
};

/* ═══════════════════════════════════════════
   SHARED ATOMS
   ═══════════════════════════════════════════ */
function Logo({ s=28 }) {
  return <span style={{fontWeight:900,fontSize:s,letterSpacing:-1}}>
    <span style={{color:C.accent}}>I</span><span style={{color:C.cyan}}>Q</span>
    <span style={{color:C.accent,marginLeft:2}}>meta</span>
  </span>;
}
function Austral({ light }) {
  const c = light?"rgba(255,255,255,0.7)":C.tm;
  return <div style={{fontSize:10,color:c}}>
    <span style={{fontWeight:800,fontSize:12,letterSpacing:1}}>UNIVERSIDAD AUSTRAL</span>
    <span style={{margin:"0 6px",opacity:.5}}>|</span>
    <span style={{fontSize:9}}>ESCUELA DE EDUCACIÓN</span>
  </div>;
}
function Badge({ v, dark }) {
  return <div style={{
    background:dark?C.navy:C.cardBlue,color:C.white,fontWeight:800,fontSize:22,
    borderRadius:6,padding:"6px 14px",display:"inline-block",minWidth:58,textAlign:"center",
  }}>{typeof v==="number"&&v>1?`${v} %`:v}</div>;
}
function Sel({ label, value, opts, set }) {
  return <div style={{marginBottom:18}}>
    <div style={{fontSize:13,fontWeight:700,color:C.white,marginBottom:4}}>{label}</div>
    <div style={{position:"relative"}}>
      <select value={value} onChange={e=>set(e.target.value)} style={{
        width:"100%",padding:"7px 10px",borderRadius:4,border:"none",fontSize:13,
        color:C.tb,background:C.white,appearance:"none",WebkitAppearance:"none",paddingRight:26,cursor:"pointer",
      }}>{opts.map(o=><option key={o}>{o}</option>)}</select>
      <div style={{position:"absolute",right:8,top:"50%",transform:"translateY(-50%)",pointerEvents:"none",fontSize:9,color:C.tm}}>▼</div>
    </div>
  </div>;
}
function SemDot({ s, size=12 }) {
  const sc = sem[s];
  return <div title={sc.label} style={{
    width:size,height:size,borderRadius:"50%",background:sc.fg,
    boxShadow:`0 0 5px ${sc.fg}88`,display:"inline-block",
  }}/>;
}
function Leg({ c, t }) {
  return <span style={{fontSize:11,marginRight:14}}>
    <span style={{display:"inline-block",width:10,height:10,background:c,borderRadius:2,marginRight:4,verticalAlign:"middle"}}/>{t}
  </span>;
}
function HBar({ label, mi, todos, w=200 }) {
  return <div style={{marginBottom:12}}>
    <div style={{fontSize:12,color:C.tb,marginBottom:3}}>{label}</div>
    <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:2}}>
      <div style={{height:16,borderRadius:2,background:C.accent,width:(mi/100)*w,transition:"width 0.5s"}}/>
      <span style={{fontSize:11,fontWeight:600}}>{mi}%</span>
    </div>
    <div style={{display:"flex",alignItems:"center",gap:6}}>
      <div style={{height:16,borderRadius:2,background:C.barFill,width:(todos/100)*w,transition:"width 0.5s"}}/>
      <span style={{fontSize:11,fontWeight:600}}>{todos}%</span>
    </div>
  </div>;
}
function BP({ d, w=80, h=240 }) {
  const pad=24,ch=h-pad*2,y=v=>pad+ch-(v/100)*ch,cx=w/2,bw=32;
  return <svg width={w} height={h}>
    {[0,20,40,60,80,100].map(v=><g key={v}>
      <line x1={14} y1={y(v)} x2={w-2} y2={y(v)} stroke="#eaeaea" strokeWidth={.5}/>
      <text x={12} y={y(v)+3} fontSize={7} fill={C.tm} textAnchor="end">{v}%</text>
    </g>)}
    <line x1={cx} y1={y(d.max)} x2={cx} y2={y(d.q3)} stroke={C.accent} strokeWidth={1.5}/>
    <line x1={cx} y1={y(d.q1)} x2={cx} y2={y(d.min)} stroke={C.accent} strokeWidth={1.5}/>
    <line x1={cx-9} y1={y(d.max)} x2={cx+9} y2={y(d.max)} stroke={C.accent} strokeWidth={1.5}/>
    <line x1={cx-9} y1={y(d.min)} x2={cx+9} y2={y(d.min)} stroke={C.accent} strokeWidth={1.5}/>
    <rect x={cx-bw/2} y={y(d.q3)} width={bw} height={y(d.q1)-y(d.q3)} fill={C.accent} stroke={C.barFill} strokeWidth={1.5} rx={1} opacity={.85}/>
    <line x1={cx-bw/2} y1={y(d.md)} x2={cx+bw/2} y2={y(d.md)} stroke={C.white} strokeWidth={2}/>
    <circle cx={cx} cy={y(d.av)} r={3} fill="#7a8a60" stroke={C.white} strokeWidth={1}/>
  </svg>;
}
function calcSem(mi,t){
  const d=mi-t;
  if(d>=5)return"verde";
  if(d>=-5)return"amarillo";
  return"rojo";
}

/* ═══════════════════════════════════════════
   PAGES
   ═══════════════════════════════════════════ */
const PAGES = [
  { key:"resumen",   label:"Resumen distrito" },
  { key:"ranking",   label:"Ranking escuelas" },
  { key:"detalle",   label:"Contenido y competencia" },
  { key:"tendencia", label:"Tendencia histórica" },
];

/* ── RESUMEN ─────────────────────────────── */
function Resumen() {
  const d = MOCK;
  const g = d.general;
  return <>
    {/* Header cards */}
    <div style={{display:"flex",gap:14,marginBottom:20,flexWrap:"wrap"}}>
      <div style={{background:C.navy,color:C.white,borderRadius:8,padding:"16px 22px",flex:1,minWidth:140}}>
        <div style={{fontSize:11,opacity:.7,marginBottom:4}}>Distrito</div>
        <div style={{fontSize:22,fontWeight:800}}>{d.distrito}</div>
        <div style={{fontSize:12,opacity:.7,marginTop:4}}>{d.cantidad} escuelas</div>
      </div>
      <div style={{background:C.white,borderRadius:8,padding:"16px 22px",flex:1,minWidth:140,border:`1px solid ${C.bdr}`}}>
        <div style={{fontSize:11,color:C.tm,marginBottom:4}}>Alumnos evaluados</div>
        <div style={{display:"flex",gap:16,alignItems:"baseline"}}>
          <div><div style={{fontSize:10,color:C.tm}}>Distrito</div><Badge v={g.muestra.mi}/></div>
          <div><div style={{fontSize:10,color:C.tm}}>Programa</div><Badge v={g.muestra.todos} dark/></div>
        </div>
      </div>
    </div>

    {/* Metric row */}
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:14,marginBottom:20}}>
      {[
        {label:"% correctas · 40 ítems",mi:g.pct40.mi,t:g.pct40.todos},
        {label:"% correctas · ítems PISA",mi:g.pctPISA.mi,t:g.pctPISA.todos},
        {label:"% correctas · 45 ítems",mi:g.pct45.mi,t:g.pct45.todos},
      ].map(m=>(
        <div key={m.label} style={{background:C.white,borderRadius:8,padding:"16px 18px",border:`1px solid ${C.bdr}`}}>
          <div style={{fontSize:12,color:C.accent,fontWeight:600,marginBottom:10}}>{m.label}</div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div style={{display:"flex",gap:12}}>
              <div><div style={{fontSize:10,color:C.tm}}>Distrito</div><Badge v={m.mi}/></div>
              <div><div style={{fontSize:10,color:C.tm}}>Programa</div><Badge v={m.t} dark/></div>
            </div>
            <SemDot s={calcSem(m.mi,m.t)} size={16}/>
          </div>
        </div>
      ))}
    </div>

    {/* Bar chart — escuelas del distrito */}
    <div style={{background:C.white,borderRadius:8,border:`1px solid ${C.bdr}`,padding:"18px 18px 10px"}}>
      <div style={{fontSize:14,color:C.txt,marginBottom:14,fontWeight:500}}>
        Porcentaje de respuesta correcta por escuela del distrito (40 ítems)
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={d.escuelas} margin={{top:16,right:6,bottom:4,left:-10}}>
          <CartesianGrid strokeDasharray="3 3" stroke="#eee" vertical={false}/>
          <XAxis dataKey="id" tick={{fontSize:9,fill:C.tm}} axisLine={{stroke:"#ddd"}} tickLine={false}/>
          <YAxis domain={[0,100]} tick={{fontSize:9,fill:C.tm}} tickFormatter={v=>`${v}%`} axisLine={false} tickLine={false}/>
          <Tooltip
            contentStyle={{borderRadius:6,border:`1px solid ${C.bdr}`,fontSize:12}}
            formatter={(v,n,props)=>[`${v} %`,props.payload.nombre]}
          />
          <Bar dataKey="p" radius={[2,2,0,0]}>
            {d.escuelas.map(e=><Cell key={e.id} fill={e.p>=d.promDistrito?C.accent:C.barFill}/>)}
          </Bar>
          {/* Reference line for district average */}
        </BarChart>
      </ResponsiveContainer>
      <div style={{display:"flex",justifyContent:"center",gap:16,marginTop:6,fontSize:11,color:C.tm}}>
        <Leg c={C.accent} t="≥ Promedio distrito"/>
        <Leg c={C.barFill} t="< Promedio distrito"/>
        <span>Promedio distrito: <strong>{d.promDistrito}%</strong></span>
      </div>
    </div>
  </>;
}

/* ── RANKING ─────────────────────────────── */
function Ranking() {
  const r = MOCK.ranking;
  return <div style={{background:C.white,borderRadius:8,border:`1px solid ${C.bdr}`,overflow:"hidden"}}>
    <div style={{padding:"16px 20px",borderBottom:`1px solid ${C.bdr}`}}>
      <div style={{fontSize:15,fontWeight:600,color:C.txt}}>Ranking de escuelas — {MOCK.distrito}</div>
      <div style={{fontSize:12,color:C.tm,marginTop:2}}>{MOCK.cantidad} escuelas · ordenadas por % respuestas correctas (40 ítems)</div>
    </div>
    <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
      <thead>
        <tr style={{background:C.off}}>
          {["#","","Escuela","Alumnos","40 ítems","PISA","45 ítems","Estado"].map(h=>(
            <th key={h} style={{padding:"10px 14px",textAlign:"left",fontWeight:600,color:C.tm,fontSize:11,
              borderBottom:`1px solid ${C.bdr}`}}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {r.map((e,i)=>{
          const sc = sem[e.s];
          return <tr key={e.id} style={{
            borderBottom:`1px solid ${C.bdr}`,
            background:i%2===0?C.white:"#fafbfd",
          }}>
            <td style={{padding:"10px 14px",fontWeight:700,color:C.tm}}>{i+1}</td>
            <td style={{padding:"10px 4px"}}><SemDot s={e.s}/></td>
            <td style={{padding:"10px 14px"}}>
              <div style={{fontWeight:600,color:C.txt}}>{e.nombre}</div>
              <div style={{fontSize:11,color:C.tm}}>{e.id}</div>
            </td>
            <td style={{padding:"10px 14px",color:C.tb}}>{e.al}</td>
            <td style={{padding:"10px 14px",fontWeight:700,color:C.txt}}>{e.p40}%</td>
            <td style={{padding:"10px 14px",color:C.tb}}>{e.pP}%</td>
            <td style={{padding:"10px 14px",color:C.tb}}>{e.p45}%</td>
            <td style={{padding:"10px 14px"}}>
              <span style={{
                fontSize:11,fontWeight:600,color:sc.fg,
                background:sc.bg,padding:"3px 10px",borderRadius:12,
              }}>{sc.label}</span>
            </td>
          </tr>;
        })}
      </tbody>
    </table>
  </div>;
}

/* ── DETALLE ─────────────────────────────── */
function Detalle() {
  const d = MOCK;
  return <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:18}}>
    {/* Contenido */}
    <div style={{background:C.white,borderRadius:8,padding:"18px 22px",border:`1px solid ${C.bdr}`}}>
      <div style={{fontSize:14,fontWeight:600,color:C.accent,marginBottom:4}}>Resultados por contenido</div>
      <div style={{fontSize:11,color:C.tm,marginBottom:8}}>Distrito vs. Programa</div>
      <div style={{marginBottom:12}}><Leg c={C.accent} t="Distrito"/><Leg c={C.barFill} t="Programa"/></div>
      {d.contenido.map(c=><HBar key={c.n} label={c.n} mi={c.mi} todos={c.t}/>)}
    </div>
    {/* Boxplots */}
    <div style={{background:C.white,borderRadius:8,padding:"18px 22px",border:`1px solid ${C.bdr}`}}>
      <div style={{fontSize:14,fontWeight:600,color:C.accent,marginBottom:14,textAlign:"center"}}>Distribución de calificaciones</div>
      <div style={{display:"flex",justifyContent:"center",gap:20}}>
        <div style={{textAlign:"center"}}><BP d={d.bpMi}/><div style={{fontSize:10,color:C.tm,marginTop:2}}>Distrito</div></div>
        <div style={{textAlign:"center"}}><BP d={d.bpAll}/><div style={{fontSize:10,color:C.tm,marginTop:2}}>Programa</div></div>
      </div>
    </div>
    {/* Competencia */}
    <div style={{background:C.white,borderRadius:8,padding:"18px 22px",border:`1px solid ${C.bdr}`,gridColumn:"span 2"}}>
      <div style={{fontSize:14,fontWeight:600,color:C.accent,marginBottom:4}}>Resultados por competencia</div>
      <div style={{fontSize:11,color:C.tm,marginBottom:8}}>Distrito vs. Programa</div>
      <div style={{marginBottom:12}}><Leg c={C.accent} t="Distrito"/><Leg c={C.barFill} t="Programa"/></div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:16}}>
        {d.competencia.map(c=><HBar key={c.n} label={c.n} mi={c.mi} todos={c.t} w={160}/>)}
      </div>
    </div>
  </div>;
}

/* ── TENDENCIA ───────────────────────────── */
function Tendencia() {
  const t = MOCK.tendencia;
  const diff = t[t.length-1].pct - t[0].pct;
  return <div style={{background:C.white,borderRadius:8,border:`1px solid ${C.bdr}`,padding:"20px 22px"}}>
    <div style={{fontSize:15,fontWeight:600,color:C.txt,marginBottom:4}}>
      Evolución del distrito — {MOCK.distrito}
    </div>
    <div style={{fontSize:12,color:C.tm,marginBottom:20}}>
      Promedio de respuestas correctas (40 ítems) a lo largo de las tomas
    </div>
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={t} margin={{top:10,right:20,bottom:10,left:-5}}>
        <CartesianGrid strokeDasharray="3 3" stroke="#eee"/>
        <XAxis dataKey="toma" tick={{fontSize:12,fill:C.tm}} axisLine={{stroke:"#ddd"}} tickLine={false}/>
        <YAxis domain={[60,90]} tick={{fontSize:11,fill:C.tm}} tickFormatter={v=>`${v}%`} axisLine={false} tickLine={false}/>
        <Tooltip
          contentStyle={{borderRadius:6,border:`1px solid ${C.bdr}`,fontSize:12}}
          formatter={(v,n,props)=>[`${v}% (${props.payload.al} alumnos)`,""]}
        />
        <Line type="monotone" dataKey="pct" stroke={C.accent} strokeWidth={3}
          dot={{fill:C.accent,r:6,strokeWidth:2,stroke:C.white}}
          activeDot={{r:8,stroke:C.accent,strokeWidth:2}}
        />
      </LineChart>
    </ResponsiveContainer>
    <div style={{
      textAlign:"center",marginTop:12,fontSize:14,
      color:diff>=0?C.green:C.red,fontWeight:600,
    }}>
      {diff>=0?"↑":"↓"} {Math.abs(diff).toFixed(1)} puntos en {t.length} tomas
    </div>
  </div>;
}

/* ═══════════════════════════════════════════
   MAIN
   ═══════════════════════════════════════════ */
export default function InformeDistrito() {
  const [page, setPage] = useState("resumen");
  const [materia, setMateria] = useState("Matemática");
  const [anio, setAnio] = useState("3ro");
  const [toma, setToma] = useState("2-2023");

  return (
    <div style={{fontFamily:F,display:"flex",minHeight:"100vh",background:C.off}}>
      {/* Sidebar */}
      <div style={{
        width:185,minHeight:"100vh",flexShrink:0,
        background:`linear-gradient(180deg,${C.navy} 0%,${C.blue} 100%)`,
        padding:"18px 13px",display:"flex",flexDirection:"column",
      }}>
        <div style={{
          fontSize:11,fontWeight:700,color:"rgba(255,255,255,0.5)",
          letterSpacing:1,marginBottom:4,textTransform:"uppercase",
        }}>REPORTE DISTRITO</div>
        <div style={{fontSize:16,fontWeight:800,color:C.white,marginBottom:20}}>{MOCK.distrito}</div>

        <Sel label="Materia" value={materia} opts={["Matemática","Prácticas del Lenguaje"]} set={setMateria}/>
        <Sel label="Año" value={anio} opts={["3ro","6to","9no","12mo"]} set={setAnio}/>
        <Sel label="Toma" value={toma} opts={["1-2022","2-2022","1-2023","2-2023"]} set={setToma}/>

        <button onClick={()=>{setMateria("Matemática");setAnio("3ro");setToma("2-2023");}}
          style={{marginTop:4,padding:"8px 12px",borderRadius:4,border:"none",background:C.red,
          color:C.white,fontWeight:700,fontSize:11,cursor:"pointer"}}>Borrar Filtros</button>

        <div style={{flex:1}}/>
        <div style={{borderTop:"1px solid rgba(255,255,255,0.15)",paddingTop:12,textAlign:"center"}}><Austral light/></div>
      </div>

      {/* Main */}
      <div style={{flex:1,display:"flex",flexDirection:"column",minWidth:0}}>
        {/* Tab bar */}
        <div style={{display:"flex",background:C.white,borderBottom:`2px solid ${C.bdr}`}}>
          {PAGES.map(tab=>(
            <button key={tab.key} onClick={()=>setPage(tab.key)} style={{
              padding:"13px 20px",fontSize:13,fontWeight:600,border:"none",cursor:"pointer",
              background:page===tab.key?C.white:"transparent",
              color:page===tab.key?C.txt:C.tm,
              borderBottom:page===tab.key?`3px solid ${C.accent}`:"3px solid transparent",
              marginBottom:-2,
            }}>{tab.label}</button>
          ))}
          <div style={{marginLeft:"auto",display:"flex",alignItems:"center",paddingRight:20}}>
            <Logo s={24}/>
          </div>
        </div>

        {/* Content */}
        <div style={{flex:1,overflow:"auto",padding:"22px 24px 40px"}}>
          {page === "resumen" && <Resumen/>}
          {page === "ranking" && <Ranking/>}
          {page === "detalle" && <Detalle/>}
          {page === "tendencia" && <Tendencia/>}
        </div>

        {/* Footer */}
        <div style={{
          textAlign:"center",padding:"12px 28px",fontSize:10,color:C.tm,
          borderTop:`1px solid ${C.bdr}`,background:C.white,
        }}>
          Proyecto META · Reporte por Distrito · Universidad Austral – Escuela de Educación
        </div>
      </div>
    </div>
  );
}
