import { useState, useRef, useCallback } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Cell
} from "recharts";

/* ═══════════════════════════════════════════
   THEME
   ═══════════════════════════════════════════ */
const C = {
  navyDeep: "#031148",
  navy: "#041552",
  blue: "#0b2280",
  accent: "#00a6e6",
  cyan: "#00bcd4",
  cardBlue: "#0071ce",
  barFill: "#1a3080",
  barHi: "#29b6f6",
  white: "#fff",
  off: "#f4f5f8",
  bdr: "#dde0e8",
  txt: "#041552",
  tb: "#333",
  tm: "#7a8399",
  red: "#e84c4c",
  green: "#4caf50",
};
const F = "'Segoe UI',-apple-system,system-ui,sans-serif";

/* ═══════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════ */
const allBars = [
  {id:"C1",p:80},{id:"C2",p:82},{id:"C3",p:83},{id:"C4",p:83},{id:"C5",p:74},
  {id:"C6",p:72},{id:"C7",p:75},{id:"C10",p:79},{id:"C11",p:77},{id:"C12",p:84},
  {id:"C13",p:70},{id:"C14",p:83},{id:"C15",p:82},{id:"C16",p:74},{id:"C17",p:75},
  {id:"C18",p:87},{id:"C19",p:78},{id:"C20",p:65},{id:"C21",p:79},{id:"C22",p:80},
  {id:"C23",p:82},{id:"C25",p:35},{id:"C26",p:60},{id:"C27",p:65},{id:"C28",p:70},
  {id:"C29",p:55},{id:"C30",p:55},{id:"C31",p:60},{id:"C32",p:55},{id:"C33",p:35},
  {id:"C34",p:43},{id:"C35",p:30},{id:"C36",p:38},{id:"C37",p:65},{id:"C38",p:30},
  {id:"C39",p:48},
];
const D = {
  col: "Amundsen", miId: "C7",
  mu: { mi: 17, t: 894 },
  p40: { mi: 75, t: 79 },
  pP: { mi: 67, t: 60 },
  p45: { mi: 74, t: 77 },
  matCont: [
    { n: "Numeración", mi: 78, t: 83 },
    { n: "Geometría", mi: 83, t: 82 },
    { n: "Medidas", mi: 64, t: 68 },
  ],
  matComp: [
    { n: "Reconocimiento de conceptos", mi: 78, t: 78 },
    { n: "Resolución de problemas", mi: 68, t: 80 },
    { n: "Resolución de algoritmos", mi: 77, t: 83 },
  ],
  bpMi: { min:50,q1:68,md:78,q3:88,max:95,av:75 },
  bpAll: { min:28,q1:70,md:80,q3:90,max:98,av:79 },
  lenComp: [
    { n: "Reflexión sobre los hechos del lenguaje", mi: 88, t: 79 },
    { n: "Comprensión lectora", mi: 81, t: 80 },
  ],
  lenCont: [
    { n: "Texto narrativo", mi: 85, t: 83 },
    { n: "Texto informativo", mi: 72, t: 75 },
  ],
  bpMiL: { min:52,q1:70,md:82,q3:90,max:95,av:82 },
  bpAllL: { min:20,q1:68,md:80,q3:88,max:98,av:80 },
};

/* ═══════════════════════════════════════════
   SEMÁFORO LOGIC
   ═══════════════════════════════════════════ */
function calcSemaforo(mi, todos) {
  const diff = mi - todos;
  if (diff >= 5) return "verde";
  if (diff >= -5) return "amarillo";
  return "rojo";
}
const semColors = {
  verde: { bg: "#e8f5e9", fg: "#4caf50", label: "Por encima de lo esperado" },
  amarillo: { bg: "#fff8e1", fg: "#ff9800", label: "Dentro de lo esperado" },
  rojo: { bg: "#ffebee", fg: "#f44336", label: "Por debajo de lo esperado" },
};

function SemaforoDot({ mi, todos, size = 14 }) {
  const s = calcSemaforo(mi, todos);
  const sc = semColors[s];
  return <div title={sc.label} style={{
    width: size, height: size, borderRadius: "50%", background: sc.fg,
    boxShadow: `0 0 6px ${sc.fg}88`, display: "inline-block", verticalAlign: "middle",
    cursor: "help",
  }} />;
}

function SemaforoRow({ items, title }) {
  return <div style={{
    background: C.white, borderRadius: 8, border: `1px solid ${C.bdr}`,
    padding: "16px 20px", marginBottom: 20,
  }}>
    <div style={{ fontSize: 14, fontWeight: 600, color: C.txt, marginBottom: 12 }}>{title}</div>
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {items.map(item => {
        const s = calcSemaforo(item.mi, item.t);
        const sc = semColors[s];
        return <div key={item.n} style={{
          display: "flex", alignItems: "center", gap: 12,
          padding: "10px 14px", borderRadius: 8,
          background: sc.bg, border: `1px solid ${sc.fg}22`,
        }}>
          <div style={{
            width: 12, height: 12, borderRadius: "50%", background: sc.fg,
            boxShadow: `0 0 6px ${sc.fg}66`, flexShrink: 0,
          }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: 13, color: C.txt }}>{item.n}</div>
            <div style={{ fontSize: 11, color: C.tm }}>{sc.label}</div>
          </div>
          <div style={{ textAlign: "right", fontSize: 12 }}>
            <span style={{ fontWeight: 700, color: sc.fg }}>{item.mi}%</span>
            <span style={{ color: C.tm, margin: "0 4px" }}>vs</span>
            <span style={{ color: C.tm }}>{item.t}%</span>
          </div>
        </div>;
      })}
    </div>
    <div style={{ display: "flex", gap: 16, marginTop: 12, fontSize: 10, color: C.tm }}>
      {Object.entries(semColors).map(([k, v]) => (
        <span key={k} style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: v.fg, display: "inline-block" }} />
          {v.label}
        </span>
      ))}
    </div>
  </div>;
}

/* ═══════════════════════════════════════════
   ATOMS
   ═══════════════════════════════════════════ */
function Logo({ s = 28 }) {
  return <span style={{fontWeight:900,fontSize:s,letterSpacing:-1}}>
    <span style={{color:C.accent}}>I</span><span style={{color:C.cyan}}>Q</span>
    <span style={{color:C.accent,marginLeft:2}}>meta</span>
  </span>;
}
function Austral({ light }) {
  const c = light ? "rgba(255,255,255,0.7)" : C.tm;
  return <div style={{fontSize:10,color:c,lineHeight:1.5}}>
    <span style={{fontWeight:800,fontSize:12,letterSpacing:1}}>UNIVERSIDAD AUSTRAL</span>
    <span style={{margin:"0 6px",opacity:0.5}}>|</span>
    <span style={{fontSize:9}}>ESCUELA DE EDUCACIÓN</span>
  </div>;
}
function Badge({ v, dark }) {
  return <div style={{
    background:dark?C.navy:C.cardBlue,color:C.white,fontWeight:800,fontSize:24,
    borderRadius:6,padding:"7px 16px",display:"inline-block",minWidth:62,textAlign:"center",
  }}>{typeof v==="number"&&v>1?`${v} %`:v}</div>;
}
function Sel({ label, value, opts, set }) {
  return <div style={{marginBottom:20}}>
    <div style={{fontSize:14,fontWeight:700,color:C.white,marginBottom:5}}>{label}</div>
    <div style={{position:"relative"}}>
      <select value={value} onChange={e=>set(e.target.value)} style={{
        width:"100%",padding:"8px 11px",borderRadius:4,border:"none",fontSize:13,
        color:C.tb,background:C.white,cursor:"pointer",appearance:"none",WebkitAppearance:"none",paddingRight:28,
      }}>{opts.map(o=><option key={o}>{o}</option>)}</select>
      <div style={{position:"absolute",right:9,top:"50%",transform:"translateY(-50%)",pointerEvents:"none",fontSize:9,color:C.tm}}>▼</div>
    </div>
  </div>;
}
function MetCol({ title, sub, mi, todos, showSemaforo }) {
  return <div style={{flex:1,minWidth:150,padding:"0 10px"}}>
    <div style={{fontSize:12,fontWeight:700,color:C.accent,marginBottom:1,lineHeight:1.3}}>{title}</div>
    {sub&&<div style={{fontSize:10,color:C.accent,marginBottom:9,opacity:0.8}}>{sub}</div>}
    <div style={{display:"flex",justifyContent:"space-between",gap:10,alignItems:"flex-end"}}>
      <div><div style={{fontSize:10,color:C.tm,marginBottom:3}}>Mi colegio</div><Badge v={mi}/></div>
      <div><div style={{fontSize:10,color:C.tm,marginBottom:3}}>Todos los colegios</div><Badge v={todos} dark/></div>
      {showSemaforo && typeof mi === "number" && mi > 1 && <div style={{marginBottom:6}}><SemaforoDot mi={mi} todos={todos}/></div>}
    </div>
  </div>;
}
function HBar({ label, mi, todos, w=220 }) {
  return <div style={{marginBottom:14}}>
    <div style={{fontSize:12,color:C.tb,marginBottom:4}}>{label}</div>
    <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:2}}>
      <div style={{height:18,borderRadius:2,background:C.accent,width:(mi/100)*w,transition:"width 0.5s"}}/>
      <span style={{fontSize:11,fontWeight:600}}>{mi} %</span>
    </div>
    <div style={{display:"flex",alignItems:"center",gap:7}}>
      <div style={{height:18,borderRadius:2,background:C.barFill,width:(todos/100)*w,transition:"width 0.5s"}}/>
      <span style={{fontSize:11,fontWeight:600}}>{todos} %</span>
    </div>
  </div>;
}
function Leg({ c, t }) {
  return <span style={{fontSize:11,marginRight:14}}>
    <span style={{display:"inline-block",width:10,height:10,background:c,borderRadius:2,marginRight:4,verticalAlign:"middle"}}/>{t}
  </span>;
}
function BP({ d, w=85, h=260 }) {
  const pad=26,ch=h-pad*2,y=v=>pad+ch-(v/100)*ch,cx=w/2,bw=34;
  return <svg width={w} height={h}>
    {[0,20,40,60,80,100].map(v=><g key={v}>
      <line x1={14} y1={y(v)} x2={w-2} y2={y(v)} stroke="#eaeaea" strokeWidth={0.5}/>
      <text x={12} y={y(v)+3} fontSize={8} fill={C.tm} textAnchor="end">{v}%</text>
    </g>)}
    <line x1={cx} y1={y(d.max)} x2={cx} y2={y(d.q3)} stroke={C.accent} strokeWidth={1.5}/>
    <line x1={cx} y1={y(d.q1)} x2={cx} y2={y(d.min)} stroke={C.accent} strokeWidth={1.5}/>
    <line x1={cx-10} y1={y(d.max)} x2={cx+10} y2={y(d.max)} stroke={C.accent} strokeWidth={1.5}/>
    <line x1={cx-10} y1={y(d.min)} x2={cx+10} y2={y(d.min)} stroke={C.accent} strokeWidth={1.5}/>
    <rect x={cx-bw/2} y={y(d.q3)} width={bw} height={y(d.q1)-y(d.q3)} fill={C.accent} stroke={C.barFill} strokeWidth={1.5} rx={1} opacity={0.85}/>
    <line x1={cx-bw/2} y1={y(d.md)} x2={cx+bw/2} y2={y(d.md)} stroke={C.white} strokeWidth={2}/>
    <circle cx={cx} cy={y(d.av)} r={3.5} fill="#7a8a60" stroke={C.white} strokeWidth={1}/>
  </svg>;
}
function BL({x,y,width,value}){
  return <text x={x+width/2} y={y-4} fill={C.tb} fontSize={8} fontWeight={600} textAnchor="middle">{value}%</text>;
}

/* Wrappers */
function BluePage({ children, style }) {
  return <div style={{
    minHeight:"100vh",background:`linear-gradient(135deg,${C.navyDeep} 0%,${C.blue} 100%)`,
    color:C.white,fontFamily:F,display:"flex",flexDirection:"column",
    justifyContent:"center",padding:"60px 80px",position:"relative",...style,
  }}>{children}</div>;
}
function WhitePage({ children }) {
  return <div style={{
    minHeight:"100vh",fontFamily:F,background:C.off,display:"flex",flexDirection:"column",position:"relative",
  }}>{children}</div>;
}
function PageHeader() {
  return <div style={{position:"absolute",top:28,right:40,zIndex:5}}><Logo s={26}/></div>;
}
function PageFooter({ light }) {
  return <div style={{textAlign:"right",padding:"0 40px 28px"}}><Austral light={light}/></div>;
}
function SectionTitle({ children }) {
  return <h2 style={{
    fontSize:26,fontWeight:800,color:C.txt,borderBottom:`3px solid ${C.accent}`,
    display:"inline-block",paddingBottom:6,marginBottom:28,marginTop:0,
  }}>{children}</h2>;
}

/* Sidebar */
function Sidebar({ filters, showMateria = true }) {
  const { materia, anio, division, toma, setMateria, setAnio, setDivision, setToma } = filters;
  return <div style={{
    width:185,minHeight:"100vh",flexShrink:0,
    background:`linear-gradient(180deg,${C.navy} 0%,${C.blue} 100%)`,
    padding:"18px 13px",display:"flex",flexDirection:"column",
  }}>
    {showMateria && <Sel label="Materia" value={materia} opts={["Matemática","Prácticas del Lenguaje"]} set={setMateria}/>}
    <Sel label="Año" value={anio} opts={["3ro","6to","9no","12mo"]} set={setAnio}/>
    <Sel label="División" value={division} opts={["Única","A","B"]} set={setDivision}/>
    <Sel label="Toma" value={toma} opts={["1-2022","2-2022","1-2023","2-2023"]} set={setToma}/>
    <button onClick={()=>{setMateria("Matemática");setAnio("3ro");setDivision("Única");setToma("2-2023");}}
      style={{marginTop:4,padding:"9px 14px",borderRadius:4,border:"none",background:C.red,color:C.white,fontWeight:700,fontSize:12,cursor:"pointer"}}>
      Borrar Filtros
    </button>
    <div style={{flex:1}}/>
    <div style={{borderTop:"1px solid rgba(255,255,255,0.15)",paddingTop:12,textAlign:"center"}}><Austral light/></div>
  </div>;
}

/* Metrics row */
function MetricsRow() {
  return <div style={{display:"flex",gap:0,marginBottom:20,background:C.white,borderRadius:8,border:`1px solid ${C.bdr}`,padding:"16px 6px"}}>
    <MetCol title="Datos de la muestra" sub="Cantidad de alumnos participantes" mi={D.mu.mi} todos={D.mu.t}/>
    <div style={{width:1,background:C.bdr,margin:"0 3px"}}/>
    <MetCol title="% de respuestas correctas" sub="40 ítems" mi={D.p40.mi} todos={D.p40.t} showSemaforo/>
    <div style={{width:1,background:C.bdr,margin:"0 3px"}}/>
    <MetCol title="% de respuestas correctas" sub="ítems PISA" mi={D.pP.mi} todos={D.pP.t} showSemaforo/>
    <div style={{width:1,background:C.bdr,margin:"0 3px"}}/>
    <MetCol title="% de respuestas correctas" sub="45 ítems" mi={D.p45.mi} todos={D.p45.t} showSemaforo/>
  </div>;
}

/* ═══════════════════════════════════════════
   PAGE 1 — PORTADA
   ═══════════════════════════════════════════ */
function P1() {
  return <BluePage style={{justifyContent:"flex-end",padding:0}}>
    <div style={{position:"absolute",top:30,left:40}}><Austral light/></div>
    <div style={{
      position:"absolute",top:0,right:0,width:"50%",height:"100%",
      background:"linear-gradient(135deg,rgba(10,30,100,0.3),rgba(0,80,180,0.15))",
      clipPath:"polygon(30% 0,100% 0,100% 100%,0% 100%)",
      display:"flex",alignItems:"center",justifyContent:"center",
    }}>
      <div style={{fontSize:16,color:"rgba(255,255,255,0.25)",textAlign:"center",letterSpacing:2}}>
        [ Foto estudiante ]
      </div>
    </div>
    <div style={{position:"relative",zIndex:2,padding:"0 80px 90px"}}>
      <div style={{marginBottom:28}}><Logo s={56}/></div>
      <div style={{fontSize:44,fontWeight:800,letterSpacing:-1}}>Segunda Toma 2023</div>
    </div>
  </BluePage>;
}

/* ═══════════════════════════════════════════
   PAGE 2 — INTRODUCCIÓN + LAS PRUEBAS
   ═══════════════════════════════════════════ */
function P2() {
  return <BluePage>
    <PageHeader/>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:60}}>
      <div>
        <div style={{marginBottom:36}}><Logo s={44}/></div>
        <h2 style={{fontSize:24,fontWeight:800,marginBottom:16,borderBottom:"3px solid rgba(255,255,255,0.3)",paddingBottom:8,display:"inline-block"}}>
          Las pruebas
        </h2>
        <ul style={{fontSize:15,lineHeight:1.9,paddingLeft:20,margin:0}}>
          <li>En todos los casos, se trata de ejercicios de respuestas de selección múltiple de cuatro distractores entre los que siempre uno solo es el correcto.</li>
          <li style={{marginTop:8}}>Son de aplicación virtual.</li>
          <li style={{marginTop:8}}>Los estudiantes disponen de 80 minutos para completarlas.</li>
          <li style={{marginTop:8}}>Los resultados se presentan:
            <div style={{paddingLeft:14,marginTop:4,fontSize:14,opacity:0.85}}>
              por años y por materias,<br/>
              por sectores de contenidos y competencias en cada materia,<br/>
              por secciones de cada curso y de cada estudiante.
            </div>
          </li>
        </ul>
      </div>
      <div>
        <h2 style={{fontSize:28,fontWeight:800,marginBottom:16,borderBottom:"3px solid rgba(255,255,255,0.3)",paddingBottom:8,display:"inline-block"}}>
          Introducción
        </h2>
        <p style={{fontSize:15,lineHeight:1.8,margin:"0 0 16px"}}>
          En el siguiente informe se presentan los resultados obtenidos por las escuelas del Proyecto META (Medición y Evaluación para la Transformación de los Aprendizajes) en la primera aplicación de 2022 (julio/agosto), segunda aplicación de 2022 (noviembre), primera aplicación 2023 (abril) y segunda aplicación 2023.
        </p>
        <p style={{fontSize:15,lineHeight:1.8,margin:"0 0 16px"}}>
          El informe brinda a los colegios información sobre resultados de aprendizaje que les permitirá analizar procesos de aprendizaje y, en consecuencia, aspectos y dimensiones de la enseñanza.
        </p>
        <p style={{fontSize:15,lineHeight:1.8,margin:0}}>
          Y, por tanto, desarrollar planes de profundización y ampliación de esos logros, así como proyectos de mejora de las acciones de enseñanza si así correspondiera.
        </p>
      </div>
    </div>
    <PageFooter light/>
  </BluePage>;
}

/* ═══════════════════════════════════════════
   PAGE 3 — PRESENTACIÓN: MATEMÁTICA
   ═══════════════════════════════════════════ */
function P3() {
  return <WhitePage>
    <PageHeader/>
    <div style={{padding:"50px 80px",flex:1}}>
      <SectionTitle>Presentación de materias</SectionTitle>
      <h3 style={{fontSize:22,fontWeight:700,color:C.txt,marginBottom:20,marginTop:0}}>Matemática:</h3>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:40}}>
        <div>
          <h4 style={{fontSize:16,fontWeight:700,color:C.txt,marginBottom:12,marginTop:0}}>Contenidos</h4>
          <ul style={{fontSize:14,lineHeight:2,color:C.tb,paddingLeft:18,margin:0}}>
            <li>Numeración y operaciones.</li>
            <li>Medidas.</li>
            <li>Geometría: cuerpos y polígonos.</li>
            <li>Estadística y probabilidad. A partir de 6º grado.</li>
            <li>Álgebra. En 9º y 12º.</li>
            <li>Funciones, ecuaciones e inecuaciones. 9º y 12º.</li>
          </ul>
        </div>
        <div>
          <h4 style={{fontSize:16,fontWeight:700,color:C.txt,marginBottom:12,marginTop:0}}>Competencias</h4>
          <div style={{fontSize:14,lineHeight:1.7,color:C.tb}}>
            <p style={{marginBottom:12,marginTop:0}}>
              <strong>Reconocimiento de conceptos:</strong> Capacidad de identificar conceptos por medio de ejemplos, casos, atributos o definiciones de los mismos o viceversa: identificar ejemplos, casos, atributos o definiciones de conceptos dados.
            </p>
            <p style={{marginBottom:12}}>
              <strong>Resolución de operaciones (algoritmos):</strong> Capacidad de resolver diversas operaciones matemáticas mediante distintos procedimientos canónicos o no convencionales.
            </p>
            <p style={{margin:0}}>
              <strong>Resolución de problemas:</strong> Capacidad de resolución de situaciones matemáticas nuevas, integrales y situadas en contextos intra-matemáticos y/o de la realidad cotidiana.
            </p>
          </div>
        </div>
      </div>
    </div>
    <PageFooter/>
  </WhitePage>;
}

/* ═══════════════════════════════════════════
   PAGE 4 — PRESENTACIÓN: PRÁCTICAS DEL LENGUAJE
   ═══════════════════════════════════════════ */
function P4() {
  const [expanded, setExpanded] = useState(false);
  return <WhitePage>
    <PageHeader/>
    <div style={{padding:"50px 80px",flex:1}}>
      <SectionTitle>Presentación de materias</SectionTitle>
      <h3 style={{fontSize:22,fontWeight:700,color:C.txt,marginBottom:16,marginTop:0}}>Prácticas del Lenguaje:</h3>
      <p style={{fontSize:14,lineHeight:1.7,color:C.tb,marginBottom:20,marginTop:0}}>
        Las competencias seleccionadas para el área de Lenguaje son <strong>comprensión lectora y reflexión sobre los hechos de la práctica del lenguaje</strong>, tanto para texto de ficción, texto informativo, texto argumentativo (9º y 12º).
      </p>
      <p style={{fontSize:14,lineHeight:1.7,color:C.tb,marginBottom:24}}>A partir de ellas y en todos los casos, se evalúa:</p>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:24}}>
        <div style={{background:C.white,borderRadius:8,padding:24,border:`1px solid ${C.bdr}`}}>
          <h4 style={{fontSize:15,fontWeight:700,color:C.txt,marginBottom:10,marginTop:0}}>El reconocimiento de información explícita:</h4>
          <p style={{fontSize:13,lineHeight:1.7,color:C.tb,margin:0}}>
            Capacidad para buscar, localizar, seleccionar y extraer una información de un texto, más concretamente de fragmentos aislados de información relevante. Para encontrar el fragmento de información necesario es posible que el lector tenga que procesar más de un fragmento de información. Para localizar la información los alumnos deben cotejar lo que se pregunta con la información literal o equivalente del texto. La localización de información se basa en el propio texto y en la información explícita contenida en él.
          </p>
        </div>
        <div style={{background:C.white,borderRadius:8,padding:24,border:`1px solid ${C.bdr}`}}>
          <h4 style={{fontSize:15,fontWeight:700,color:C.txt,marginBottom:10,marginTop:0}}>El reconocimiento de información implícita:</h4>
          <p style={{fontSize:13,lineHeight:1.7,color:C.tb,margin:0}}>
            Capacidad para relacionar las distintas partes de un texto para lo que se precisa comprender la interacción entre la cohesión local y global del texto y esto requiere procesar desde una secuencia compuesta de tan solo dos oraciones recurriendo a la cohesión con marcadores de cohesión («en primer lugar» y «en segundo lugar»), hasta establecer relaciones de causa/efecto sin marcadores explícitos.
            {expanded && <span> Realizar deducciones (que dependen, en mayor o menor medida, del conocimiento del mundo por parte del lector) sobre la intención del autor, el significado por el contexto, etc.; comparar y contrastar información integrando dos o más fragmentos de información del texto; identificar el motivo o la intención de un personaje concreto, la causa y su efecto, son otros aspectos de esta dimensión.</span>}
          </p>
          <button onClick={()=>setExpanded(!expanded)} style={{
            marginTop:10,fontSize:12,fontWeight:600,color:C.accent,background:"none",border:"none",
            cursor:"pointer",padding:0,textDecoration:"underline",
          }}>{expanded ? "Ver menos" : "Seguir leyendo"}</button>
        </div>
      </div>
    </div>
    <PageFooter/>
  </WhitePage>;
}

/* ═══════════════════════════════════════════
   PAGE 5 — EJERCICIOS TIPO PISA
   ═══════════════════════════════════════════ */
function P5() {
  return <WhitePage>
    <PageHeader/>
    <div style={{padding:"50px 80px",flex:1,maxWidth:960}}>
      <SectionTitle>Ejercicios tipo PISA</SectionTitle>
      <p style={{fontSize:15,lineHeight:1.8,color:C.tb,marginBottom:20,marginTop:0}}>
        Se recuerda que respondiendo a los pedidos de algunas instituciones en el sentido de elevar el nivel de exigencia de las pruebas, hemos agregado 5 ejercicios en cada una de ellas que hemos dado en llamar "ejercicios tipo PISA" porque responden al estilo y al tipo de situaciones que plantean dichas pruebas.
      </p>
      <p style={{fontSize:15,lineHeight:1.8,color:C.tb,marginBottom:20}}>
        Los contenidos y las competencias que evalúan esos ítems corresponden a los de las pruebas "clásicas" de 40 ejercicios de nuestras META.
      </p>
      <p style={{fontSize:15,lineHeight:1.8,color:C.tb,marginBottom:24}}>
        Sin embargo, esos "ejercicios tipo PISA", se insiste, resultan de un nivel más exigente por el tipo de situaciones que plantean.
      </p>
      <p style={{fontSize:15,lineHeight:1.8,color:C.tb,marginBottom:14}}>
        Como consecuencia de lo anterior, los informes presentan 3 tipos de resultados:
      </p>
      <div style={{paddingLeft:24,fontSize:15,lineHeight:2,color:C.tb,marginBottom:24}}>
        <div><strong>a.</strong> Los correspondientes a los 40 ejercicios propios de META a fin de sostener la comparabilidad con los resultados de aplicaciones anteriores (también con los de CRECE).</div>
        <div><strong>b.</strong> Los de los 5 ejercicios "tipo PISA".</div>
        <div><strong>c.</strong> Los de los 45 ejercicios que integran la prueba en su totalidad.</div>
      </div>
      <p style={{fontSize:15,lineHeight:1.8,color:C.tb,fontWeight:500,margin:0}}>
        Las comparaciones entre instituciones se presentan sobre los 40 ejercicios mencionados en el punto "a".
      </p>
    </div>
    <PageFooter/>
  </WhitePage>;
}

/* ═══════════════════════════════════════════
   PAGE 6 — DIVIDER: RESULTADOS GENERALES
   ═══════════════════════════════════════════ */
function P6() {
  return <BluePage style={{alignItems:"center",justifyContent:"center",textAlign:"center"}}>
    <div style={{position:"absolute",top:40,left:"50%",transform:"translateX(-50%)",display:"flex",gap:30,alignItems:"center"}}>
      <Austral light/><Logo s={28}/>
    </div>
    <div style={{fontSize:52,fontWeight:800,letterSpacing:-1}}>Resultados Generales</div>
  </BluePage>;
}

/* ═══════════════════════════════════════════
   PAGE 7 — DASHBOARD: RESULTADOS GENERALES (full width)
   ═══════════════════════════════════════════ */
function P7({ f }) {
  return <div style={{minHeight:"100vh",fontFamily:F,display:"flex",background:C.off}}>
    <Sidebar filters={f}/>
    <div style={{flex:1,display:"flex",flexDirection:"column",minWidth:0}}>
      <div style={{display:"flex",alignItems:"center",background:C.white,borderBottom:`1px solid ${C.bdr}`,padding:"14px 24px",justifyContent:"space-between"}}>
        <div>
          <h2 style={{margin:0,fontSize:20,fontWeight:800,color:C.txt,borderBottom:`3px solid ${C.accent}`,display:"inline-block",paddingBottom:4}}>Resultados generales</h2>
          <div style={{marginTop:5,fontSize:13}}><span style={{color:C.tm}}>Colegio:</span><span style={{fontSize:22,fontWeight:700,color:C.txt,marginLeft:10}}>{D.col}</span></div>
        </div>
        <Logo s={26}/>
      </div>
      <div style={{flex:1,overflow:"auto",padding:"20px 24px 40px"}}>
        <MetricsRow/>
        <div style={{background:C.white,borderRadius:8,border:`1px solid ${C.bdr}`,padding:"18px 18px 10px"}}>
          <div style={{fontSize:14,color:C.txt,marginBottom:14,fontWeight:500}}>Porcentaje de respuesta correcta por colegios sobre los 40 ítems</div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={allBars} margin={{top:18,right:6,bottom:4,left:-16}}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" vertical={false}/>
              <XAxis dataKey="id" tick={{fontSize:8,fill:C.tm}} interval={0} axisLine={{stroke:"#ddd"}} tickLine={false}/>
              <YAxis domain={[0,100]} tick={{fontSize:9,fill:C.tm}} tickFormatter={v=>`${v} %`} axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={{borderRadius:6,border:`1px solid ${C.bdr}`,fontSize:12}} formatter={v=>[`${v} %`,"Resp. correctas"]}/>
              <Bar dataKey="p" radius={[2,2,0,0]} label={<BL/>}>
                {allBars.map(e=><Cell key={e.id} fill={e.id===D.miId?C.barHi:C.barFill}/>)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div style={{display:"flex",justifyContent:"center",marginTop:4}}><Leg c={C.barHi} t="Mi colegio"/><Leg c={C.barFill} t="Todos los colegios"/></div>
        </div>
      </div>
    </div>
  </div>;
}

/* ═══════════════════════════════════════════
   PAGE 8 — DASHBOARD: RESULTADOS GENERALES (horizontal bars)
   ═══════════════════════════════════════════ */
function P8({ f }) {
  const subset = allBars.slice(0, 28);
  return <div style={{minHeight:"100vh",fontFamily:F,display:"flex",background:C.off}}>
    <Sidebar filters={f}/>
    <div style={{flex:1,display:"flex",flexDirection:"column",minWidth:0}}>
      <div style={{display:"flex",alignItems:"center",background:C.white,borderBottom:`1px solid ${C.bdr}`,padding:"14px 24px",justifyContent:"space-between"}}>
        <div>
          <h2 style={{margin:0,fontSize:20,fontWeight:800,color:C.txt,borderBottom:`3px solid ${C.accent}`,display:"inline-block",paddingBottom:4}}>Resultados generales</h2>
          <div style={{marginTop:5,fontSize:13}}><span style={{color:C.tm}}>Colegio:</span><span style={{fontSize:22,fontWeight:700,color:C.txt,marginLeft:10}}>{D.col}</span></div>
        </div>
        <Logo s={26}/>
      </div>
      <div style={{flex:1,overflow:"auto",padding:"20px 24px 40px"}}>
        <MetricsRow/>
        <div style={{background:C.white,borderRadius:8,border:`1px solid ${C.bdr}`,padding:"18px 18px 10px"}}>
          <div style={{fontSize:14,color:C.txt,marginBottom:14,fontWeight:500}}>Porcentaje de respuesta correcta por colegios sobre los 40 ítems</div>
          <ResponsiveContainer width="100%" height={520}>
            <BarChart data={subset} layout="vertical" margin={{top:6,right:40,bottom:4,left:10}}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" horizontal={false}/>
              <YAxis dataKey="id" type="category" tick={{fontSize:10,fill:C.tm}} axisLine={false} tickLine={false} width={35}/>
              <XAxis type="number" domain={[0,100]} tick={{fontSize:9,fill:C.tm}} tickFormatter={v=>`${v} %`} axisLine={{stroke:"#ddd"}} tickLine={false}/>
              <Tooltip contentStyle={{borderRadius:6,border:`1px solid ${C.bdr}`,fontSize:12}} formatter={v=>[`${v} %`,"Resp. correctas"]}/>
              <Bar dataKey="p" radius={[0,2,2,0]} barSize={14}>
                {subset.map(e=><Cell key={e.id} fill={e.id===D.miId?C.barHi:C.barFill}/>)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div style={{display:"flex",justifyContent:"center",marginTop:4}}><Leg c={C.barHi} t="Mi colegio"/><Leg c={C.barFill} t="Todos los colegios"/></div>
        </div>
      </div>
    </div>
  </div>;
}

/* ═══════════════════════════════════════════
   PAGE 9 — DASHBOARD: RESULTADOS GENERALES (full, variant 2)
   ═══════════════════════════════════════════ */
function P9({ f }) {
  return <div style={{minHeight:"100vh",fontFamily:F,display:"flex",background:C.off}}>
    <Sidebar filters={f}/>
    <div style={{flex:1,display:"flex",flexDirection:"column",minWidth:0}}>
      <div style={{display:"flex",alignItems:"center",background:C.white,borderBottom:`1px solid ${C.bdr}`,padding:"14px 24px",justifyContent:"space-between"}}>
        <div>
          <h2 style={{margin:0,fontSize:20,fontWeight:800,color:C.txt,borderBottom:`3px solid ${C.accent}`,display:"inline-block",paddingBottom:4}}>Resultados generales</h2>
          <div style={{marginTop:5,fontSize:13}}><span style={{color:C.tm}}>Colegio:</span><span style={{fontSize:22,fontWeight:700,color:C.txt,marginLeft:10}}>{D.col}</span></div>
        </div>
        <Logo s={26}/>
      </div>
      <div style={{flex:1,overflow:"auto",padding:"20px 24px 40px"}}>
        <MetricsRow/>
        <div style={{background:C.white,borderRadius:8,border:`1px solid ${C.bdr}`,padding:"18px 18px 10px"}}>
          <div style={{fontSize:14,color:C.txt,marginBottom:14,fontWeight:500}}>Porcentaje de respuesta correcta por colegios sobre los 40 ítems</div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={allBars} margin={{top:18,right:6,bottom:4,left:-16}}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" vertical={false}/>
              <XAxis dataKey="id" tick={{fontSize:8,fill:C.tm}} interval={0} axisLine={{stroke:"#ddd"}} tickLine={false}/>
              <YAxis domain={[0,100]} tick={{fontSize:9,fill:C.tm}} tickFormatter={v=>`${v} %`} axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={{borderRadius:6,border:`1px solid ${C.bdr}`,fontSize:12}} formatter={v=>[`${v} %`,"Resp. correctas"]}/>
              <Bar dataKey="p" radius={[2,2,0,0]} label={<BL/>}>
                {allBars.map(e=><Cell key={e.id} fill={e.id===D.miId?C.barHi:C.barFill}/>)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div style={{display:"flex",justifyContent:"center",marginTop:4}}><Leg c={C.barHi} t="Mi colegio"/><Leg c={C.barFill} t="Todos los colegios"/></div>
        </div>
      </div>
    </div>
  </div>;
}

/* ═══════════════════════════════════════════
   PAGE 10 — DETALLE MATEMÁTICA
   ═══════════════════════════════════════════ */
function P10({ f }) {
  return <div style={{minHeight:"100vh",fontFamily:F,display:"flex",background:C.off}}>
    <Sidebar filters={f} showMateria={false}/>
    <div style={{flex:1,display:"flex",flexDirection:"column",minWidth:0}}>
      <div style={{display:"flex",alignItems:"center",background:C.white,borderBottom:`1px solid ${C.bdr}`,padding:"14px 24px",justifyContent:"space-between"}}>
        <div>
          <h2 style={{margin:0,fontSize:18,fontWeight:800,color:C.txt}}>
            <span style={{color:C.accent,textDecoration:"underline"}}>Matemática</span>
            <span style={{color:C.tm,margin:"0 8px",fontWeight:400}}>&gt;</span>{D.col}
          </h2>
          <div style={{fontSize:14,color:C.txt,marginTop:4}}>{f.anio} &gt; {f.division}</div>
        </div>
        <Logo s={26}/>
      </div>
      <div style={{flex:1,overflow:"auto",padding:"20px 24px 40px"}}>
        <SemaforoRow title="Semáforo por contenido" items={D.matCont}/>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:18}}>
          {/* Contenido */}
          <div style={{background:C.white,borderRadius:8,padding:"18px 22px",border:`1px solid ${C.bdr}`}}>
            <div style={{fontSize:14,fontWeight:600,color:C.accent,marginBottom:5}}>Resultados por contenido</div>
            <div style={{fontSize:11,color:C.tm,marginBottom:8}}>Porcentaje de respuestas correctas</div>
            <div style={{marginBottom:12}}><Leg c={C.accent} t="Mi colegio"/><Leg c={C.barFill} t="Todos los colegios"/></div>
            {D.matCont.map(c=><HBar key={c.n} label={c.n} mi={c.mi} todos={c.t}/>)}
          </div>
          {/* Boxplots */}
          <div style={{background:C.white,borderRadius:8,padding:"18px 22px",border:`1px solid ${C.bdr}`}}>
            <div style={{fontSize:14,fontWeight:600,color:C.accent,marginBottom:14,textAlign:"center"}}>Distribución de calificaciones</div>
            <div style={{display:"flex",justifyContent:"center",gap:20}}>
              <div style={{textAlign:"center"}}>
                <BP d={D.bpMi}/>
                <div style={{fontSize:10,color:C.tm,marginTop:4}}>Mi colegio</div>
              </div>
              <div style={{textAlign:"center"}}>
                <BP d={D.bpAll}/>
                <div style={{fontSize:10,color:C.tm,marginTop:4}}>Todos</div>
              </div>
            </div>
          </div>
          {/* Competencia */}
          <div style={{background:C.white,borderRadius:8,padding:"18px 22px",border:`1px solid ${C.bdr}`}}>
            <div style={{fontSize:14,fontWeight:600,color:C.accent,marginBottom:5}}>Resultados por competencia</div>
            <div style={{fontSize:11,color:C.tm,marginBottom:8}}>Porcentaje de respuestas correctas</div>
            <div style={{marginBottom:12}}><Leg c={C.accent} t="Mi colegio"/><Leg c={C.barFill} t="Todos los colegios"/></div>
            {D.matComp.map(c=><HBar key={c.n} label={c.n} mi={c.mi} todos={c.t}/>)}
          </div>
          {/* Alumnos */}
          <div style={{background:C.white,borderRadius:8,padding:"18px 22px",border:`1px solid ${C.bdr}`}}>
            <div style={{fontSize:14,fontWeight:600,color:C.accent,marginBottom:14}}>Resultados por alumnos</div>
            <div style={{fontSize:12,color:C.tb,marginBottom:4,fontWeight:500}}>ID del alumno</div>
            <select style={{width:"100%",padding:"8px 11px",borderRadius:4,border:`1px solid ${C.bdr}`,fontSize:13,color:C.tb,marginBottom:12,background:C.white}}>
              <option>Todas</option>
            </select>
            <div style={{background:C.off,borderRadius:8,padding:"36px 16px",textAlign:"center",color:C.tm,fontSize:13,border:`1px dashed ${C.bdr}`}}>
              Seleccione ID del Alumno
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>;
}

/* ═══════════════════════════════════════════
   PAGE 11 — DETALLE PRÁCTICAS DEL LENGUAJE
   ═══════════════════════════════════════════ */
function P11({ f }) {
  return <div style={{minHeight:"100vh",fontFamily:F,display:"flex",background:C.off}}>
    <Sidebar filters={f} showMateria={false}/>
    <div style={{flex:1,display:"flex",flexDirection:"column",minWidth:0}}>
      <div style={{display:"flex",alignItems:"center",background:C.white,borderBottom:`1px solid ${C.bdr}`,padding:"14px 24px",justifyContent:"space-between"}}>
        <div>
          <h2 style={{margin:0,fontSize:18,fontWeight:800,color:C.txt}}>
            <span style={{color:C.accent,textDecoration:"underline"}}>Prácticas del Lenguaje</span>
            <span style={{color:C.tm,margin:"0 8px",fontWeight:400}}>&gt;</span>{D.col}
          </h2>
          <div style={{fontSize:14,color:C.txt,marginTop:4}}>{f.anio} &gt; {f.division}</div>
        </div>
        <Logo s={26}/>
      </div>
      <div style={{flex:1,overflow:"auto",padding:"20px 24px 40px"}}>
        <SemaforoRow title="Semáforo por competencia" items={D.lenComp}/>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:18}}>
          {/* Competencia */}
          <div style={{background:C.white,borderRadius:8,padding:"18px 22px",border:`1px solid ${C.bdr}`}}>
            <div style={{fontSize:14,fontWeight:600,color:C.accent,marginBottom:5}}>Resultados por competencia</div>
            <div style={{fontSize:11,color:C.tm,marginBottom:8}}>Porcentaje de respuestas correctas</div>
            <div style={{marginBottom:12}}><Leg c={C.accent} t="Mi colegio"/><Leg c={C.barFill} t="Todos los colegios"/></div>
            {D.lenComp.map(c=><HBar key={c.n} label={c.n} mi={c.mi} todos={c.t}/>)}
          </div>
          {/* Boxplots */}
          <div style={{background:C.white,borderRadius:8,padding:"18px 22px",border:`1px solid ${C.bdr}`}}>
            <div style={{fontSize:14,fontWeight:600,color:C.accent,marginBottom:14,textAlign:"center"}}>Distribución de calificaciones</div>
            <div style={{display:"flex",justifyContent:"center",gap:20}}>
              <div style={{textAlign:"center"}}>
                <BP d={D.bpMiL}/>
                <div style={{fontSize:10,color:C.tm,marginTop:4}}>Mi colegio</div>
              </div>
              <div style={{textAlign:"center"}}>
                <BP d={D.bpAllL}/>
                <div style={{fontSize:10,color:C.tm,marginTop:4}}>Todos</div>
              </div>
            </div>
          </div>
          {/* Tipo texto */}
          <div style={{background:C.white,borderRadius:8,padding:"18px 22px",border:`1px solid ${C.bdr}`}}>
            <div style={{fontSize:14,fontWeight:600,color:C.accent,marginBottom:5}}>Resultados por tipo de texto y microcompetencia</div>
            <div style={{fontSize:11,color:C.tm,marginBottom:8}}>Porcentaje de respuestas correctas</div>
            <div style={{marginBottom:12}}><Leg c={C.accent} t="Mi colegio"/><Leg c={C.barFill} t="Todos los colegios"/></div>
            {D.lenCont.map(c=><HBar key={c.n} label={c.n} mi={c.mi} todos={c.t}/>)}
          </div>
          {/* Alumnos */}
          <div style={{background:C.white,borderRadius:8,padding:"18px 22px",border:`1px solid ${C.bdr}`}}>
            <div style={{fontSize:14,fontWeight:600,color:C.accent,marginBottom:14}}>Resultados por alumnos</div>
            <div style={{fontSize:12,color:C.tb,marginBottom:4,fontWeight:500}}>ID del alumno</div>
            <select style={{width:"100%",padding:"8px 11px",borderRadius:4,border:`1px solid ${C.bdr}`,fontSize:13,color:C.tb,marginBottom:12,background:C.white}}>
              <option>Todas</option>
            </select>
            <div style={{background:C.off,borderRadius:8,padding:"36px 16px",textAlign:"center",color:C.tm,fontSize:13,border:`1px dashed ${C.bdr}`}}>
              Seleccione ID del Alumno
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>;
}

/* ═══════════════════════════════════════════
   PAGE 12 — CIERRE
   ═══════════════════════════════════════════ */
function P12() {
  return <BluePage style={{alignItems:"center",justifyContent:"center",textAlign:"center"}}>
    <Logo s={64}/>
    <div style={{marginTop:40}}><Austral light/></div>
  </BluePage>;
}

/* ═══════════════════════════════════════════
   PDF DOWNLOAD UTILS
   ═══════════════════════════════════════════ */
function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve();
    const s = document.createElement("script");
    s.src = src;
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

async function loadPdfLibs() {
  await loadScript("https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js");
  await loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js");
}

/* ═══════════════════════════════════════════
   PAGINATION NAV
   ═══════════════════════════════════════════ */
function Nav({ pg, total, go, onDownload, downloading }) {
  const labels = [
    "Portada","Introducción","Matemática","Lenguaje","PISA","Divider",
    "Res. Generales","Res. Generales (H)","Res. Generales (V)","Det. Matemática","Det. Lenguaje","Cierre"
  ];
  return <div style={{
    position:"fixed",bottom:0,left:0,right:0,zIndex:200,
    background:"rgba(4,17,72,0.92)",backdropFilter:"blur(8px)",
    padding:"10px 20px",display:"flex",alignItems:"center",justifyContent:"center",gap:6,
  }}>
    <button onClick={()=>go(Math.max(0,pg-1))} disabled={pg===0}
      style={{background:"none",border:"none",color:C.white,fontSize:20,cursor:"pointer",opacity:pg===0?.3:1,padding:"0 10px"}}>‹</button>
    {Array.from({length:total}).map((_,i)=>(
      <div key={i} onClick={()=>go(i)} title={labels[i]} style={{
        width:pg===i?28:8,height:8,borderRadius:4,cursor:"pointer",
        background:pg===i?C.accent:"rgba(255,255,255,0.3)",
        transition:"all 0.2s",
      }}/>
    ))}
    <button onClick={()=>go(Math.min(total-1,pg+1))} disabled={pg===total-1}
      style={{background:"none",border:"none",color:C.white,fontSize:20,cursor:"pointer",opacity:pg===total-1?.3:1,padding:"0 10px"}}>›</button>
    <span style={{fontSize:11,color:"rgba(255,255,255,0.55)",marginLeft:12,minWidth:80}}>
      {pg+1}/{total} — {labels[pg]}
    </span>
    {/* PDF Download button */}
    <button
      onClick={onDownload}
      disabled={downloading}
      style={{
        marginLeft:20,padding:"7px 16px",borderRadius:6,border:"none",
        background:downloading?"rgba(255,255,255,0.15)":C.accent,
        color:C.white,fontWeight:700,fontSize:12,cursor:downloading?"wait":"pointer",
        display:"flex",alignItems:"center",gap:6,
        opacity:downloading?0.7:1,transition:"all 0.2s",
      }}
    >
      {downloading ? (
        <>
          <span style={{
            display:"inline-block",width:12,height:12,
            border:"2px solid rgba(255,255,255,0.3)",borderTopColor:C.white,
            borderRadius:"50%",animation:"pdfspin 0.7s linear infinite",
          }}/>
          Generando...
        </>
      ) : (
        <>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Descargar PDF
        </>
      )}
      <style>{`@keyframes pdfspin { to { transform: rotate(360deg) } }`}</style>
    </button>
  </div>;
}

/* ═══════════════════════════════════════════
   PROGRESS OVERLAY
   ═══════════════════════════════════════════ */
function ProgressOverlay({ step, total }) {
  const pct = Math.round((step / total) * 100);
  return <div style={{
    position:"fixed",top:0,left:0,right:0,bottom:0,zIndex:9999,
    background:"rgba(3,17,72,0.88)",backdropFilter:"blur(6px)",
    display:"flex",alignItems:"center",justifyContent:"center",
    flexDirection:"column",gap:20,color:C.white,fontFamily:F,
  }}>
    <Logo s={40}/>
    <div style={{fontSize:18,fontWeight:600}}>Generando PDF...</div>
    <div style={{width:280,height:6,background:"rgba(255,255,255,0.15)",borderRadius:3,overflow:"hidden"}}>
      <div style={{height:"100%",background:C.accent,borderRadius:3,transition:"width 0.3s",width:`${pct}%`}}/>
    </div>
    <div style={{fontSize:13,opacity:0.7}}>Página {step} de {total} — {pct}%</div>
  </div>;
}

/* ═══════════════════════════════════════════
   ROOT
   ═══════════════════════════════════════════ */
export default function App() {
  const [pg, setPg] = useState(0);
  const [materia, setMateria] = useState("Matemática");
  const [anio, setAnio] = useState("3ro");
  const [division, setDivision] = useState("Única");
  const [toma, setToma] = useState("2-2023");
  const [downloading, setDownloading] = useState(false);
  const [dlStep, setDlStep] = useState(0);
  const containerRef = useRef(null);

  const f = { materia, anio, division, toma, setMateria, setAnio, setDivision, setToma };
  const total = 12;

  const pages = [
    <P1 key={0}/>,   <P2 key={1}/>,   <P3 key={2}/>,   <P4 key={3}/>,
    <P5 key={4}/>,   <P6 key={5}/>,   <P7 key={6} f={f}/>, <P8 key={7} f={f}/>,
    <P9 key={8} f={f}/>, <P10 key={9} f={f}/>, <P11 key={10} f={f}/>, <P12 key={11}/>,
  ];

  const handleDownload = useCallback(async () => {
    setDownloading(true);
    setDlStep(0);

    try {
      await loadPdfLibs();
      const html2canvas = window.html2canvas;
      const jsPDF = window.jspdf.jsPDF;

      // Landscape A4-ish proportions matching 1920x1095
      const pdfW = 297; // mm (A4 landscape width)
      const pdfH = 167; // mm (keep ~16:9 ratio)
      const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: [pdfW, pdfH] });

      // Create offscreen container
      const offscreen = document.createElement("div");
      offscreen.style.cssText = "position:fixed;left:-9999px;top:0;width:1920px;min-height:1095px;overflow:hidden;z-index:-1;";
      document.body.appendChild(offscreen);

      const savedPg = pg;

      for (let i = 0; i < total; i++) {
        setDlStep(i + 1);

        // Render the page into offscreen container
        // We use a simple approach: temporarily show the page in the main view
        // and capture it
        if (i > 0) pdf.addPage([pdfW, pdfH], "landscape");

        // Briefly switch to page i to render it
        await new Promise(resolve => {
          setPg(i);
          // Wait for React to render + charts to animate
          setTimeout(resolve, 400);
        });

        // Capture the visible page
        const target = containerRef.current;
        if (!target) continue;

        const canvas = await html2canvas(target, {
          scale: 2,
          useCORS: true,
          backgroundColor: null,
          width: target.scrollWidth,
          height: Math.max(target.scrollHeight, 600),
          windowWidth: 1920,
        });

        const imgData = canvas.toDataURL("image/jpeg", 0.92);
        const imgRatio = canvas.width / canvas.height;
        let w = pdfW;
        let h = pdfW / imgRatio;
        if (h > pdfH) { h = pdfH; w = pdfH * imgRatio; }
        const x = (pdfW - w) / 2;
        const y = (pdfH - h) / 2;
        pdf.addImage(imgData, "JPEG", x, y, w, h);
      }

      // Restore original page
      setPg(savedPg);

      // Clean up
      document.body.removeChild(offscreen);

      // Download
      pdf.save(`Informe_META_${D.col}_${toma}.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert("Error al generar el PDF. Intentá nuevamente.");
    } finally {
      setDownloading(false);
      setDlStep(0);
    }
  }, [pg, toma, total]);

  return <div style={{paddingBottom:50}}>
    <div ref={containerRef}>
      {pages[pg]}
    </div>
    {downloading && <ProgressOverlay step={dlStep} total={total}/>}
    <Nav pg={pg} total={total} go={setPg} onDownload={handleDownload} downloading={downloading}/>
  </div>;
}
