/** Geocentric sidereal birth chart using Astronomy Engine and an approximate Lahiri ayanamsa.
 * Whole-sign houses, mean lunar node and standard D9; dates are not a substitute for
 * a professional ephemeris near a sign/nakshatra cusp. */
import { Body, Ecliptic, GeoVector, SiderealTime } from 'astronomy-engine';
import { CITIES } from './hinduCalendarMcp';
import { parseBirthDate, parseBirthTime, type BirthDetailsInput } from './report';

export const SIGNS = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
const NAKSHATRAS = ['Ashwini','Bharani','Krittika','Rohini','Mrigashira','Ardra','Punarvasu','Pushya','Ashlesha','Magha','Purva Phalguni','Uttara Phalguni','Hasta','Chitra','Swati','Vishakha','Anuradha','Jyeshtha','Mula','Purva Ashadha','Uttara Ashadha','Shravana','Dhanishta','Shatabhisha','Purva Bhadrapada','Uttara Bhadrapada','Revati'];
const LORDS = ['Ketu','Venus','Sun','Moon','Mars','Rahu','Jupiter','Saturn','Mercury'];
const YEARS = [7,20,6,10,7,18,16,19,17];
const SIGN_LORDS = ['Mars','Venus','Mercury','Moon','Sun','Mercury','Venus','Mars','Jupiter','Saturn','Saturn','Jupiter'];
const norm = (x: number) => (x % 360 + 360) % 360;
const toSign = (x: number) => Math.floor(norm(x) / 30);
const deg = Math.PI / 180;
const yearMs = 365.2425 * 86400000;
const fmt = (ms: number) => new Date(ms).toISOString().slice(0,10);
const bodies = [Body.Sun, Body.Moon, Body.Mars, Body.Mercury, Body.Jupiter, Body.Venus, Body.Saturn];

// Converts a local civil time using the IANA zone, including historical offsets.
function localToUtc(y: number, m: number, d: number, h: number, min: number, zone: string): Date | null {
  const wall = Date.UTC(y, m-1, d, h, min);
  const f = new Intl.DateTimeFormat('en-GB', {timeZone: zone, year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'});
  const parts = (t: number) => Object.fromEntries(f.formatToParts(new Date(t)).map(p => [p.type, Number(p.value)]));
  let t = wall;
  for (let i=0;i<4;i++) { const p = parts(t); t += wall - Date.UTC(p.year,p.month-1,p.day,p.hour,p.minute); }
  const p = parts(t);
  return p.year === y && p.month === m && p.day === d && p.hour === h && p.minute === min ? new Date(t) : null;
}

export type Placement = { name: string; longitude: number; sign: number; house: number; nakshatra: string; pada: number; retrograde: boolean; d9: number };
export type Chart = { asc: number; ascSign: number; ayanamsa: number; utc: string; city: string; lat: number; lon: number; zone: string; placements: Placement[]; d9Asc: number; dashas: { lord:string; from:string; to:string; current:boolean }[]; currentSub: {lord:string;from:string;to:string} | null; balance:number };
function d9(lon: number): number { const sign=toSign(lon); const part=Math.floor((norm(lon)%30)/(30/9)); return (sign + [0,8,4][sign%3] + part)%12; }
function longitude(body: Body, t: Date): number { return Ecliptic(GeoVector(body,t,true)).elon; }
export function calculateKundli(input: BirthDetailsInput): {chart: Chart | null; reason?: string} {
  const date=parseBirthDate(input.birthDate), time=parseBirthTime(input.birthTime);
  if (!date || !time) return {chart:null,reason:'An exact birth date and time are required for a Kundli, ascendant, houses and dasha. Please contact us to update your birth details.'};
  const cityName=input.birthPlace.split(',')[0].trim();
  const entry=Object.entries(CITIES).find(([name])=>name.toLowerCase()===cityName.toLowerCase());
  if (!entry) return {chart:null,reason:`Birthplace coordinates are not available for “${cityName}”. Please contact us with a supported city or your precise birth coordinates. Supported cities: ${Object.keys(CITIES).join(', ')}.`};
  const [city,loc]=entry;
  const utc=localToUtc(date.year,date.month,date.day,time.hour,time.minute,loc.tz);
  if (!utc) return {chart:null,reason:'This local birth time could not be resolved in the birthplace time zone. Please contact us to confirm it.'};
  const jd=utc.getTime()/86400000+2440587.5, T=(jd-2451545)/36525;
  const aya=23.85709235 + 1.3969713*T + 0.0003086*T*T;
  const theta=(SiderealTime(utc)*15+loc.lon)*deg;
  const eps=(23.439291-0.0130042*T)*deg;
  const asc=norm(Math.atan2(Math.cos(theta),-(Math.sin(theta)*Math.cos(eps)+Math.tan(loc.lat*deg)*Math.sin(eps)))/deg-aya);
  const ascSign=toSign(asc);
  const raw=bodies.map(body=>{const lon=norm(longitude(body,utc)-aya); const prior=longitude(body,new Date(utc.getTime()-86400000)); const next=longitude(body,new Date(utc.getTime()+86400000)); return {name:String(body),lon,retrograde: norm(next-prior)>180};});
  const node=norm(125.04452-1934.136261*T+0.0020708*T*T-aya);
  raw.push({name:'Rahu',lon:node,retrograde:true},{name:'Ketu',lon:norm(node+180),retrograde:true});
  const placements=raw.map(({name,lon,retrograde})=>{const ni=Math.floor(lon/(360/27)); return {name,longitude:lon,sign:toSign(lon),house:(toSign(lon)-ascSign+12)%12+1,nakshatra:NAKSHATRAS[ni],pada:Math.floor((lon%(360/27))/(360/108))+1,retrograde,d9:d9(lon)};});
  const moon=placements.find(p=>p.name==='Moon')!;
  const nakIndex=Math.floor(moon.longitude/(360/27)); const start=nakIndex%9;
  const elapsed=(moon.longitude%(360/27))/(360/27); const balance=YEARS[start]*(1-elapsed);
  const birth=utc.getTime(); let cursor=birth; const dashas: Chart['dashas']=[]; let currentSub: Chart['currentSub']=null;
  for(let i=0;i<10;i++) { const idx=(start+i)%9; const fullYears=YEARS[idx]; const from=cursor, end=from+(i===0?balance:fullYears)*yearMs; const now=Date.now();
    dashas.push({lord:LORDS[idx],from:fmt(from),to:fmt(end),current:now>=from&&now<end});
    // The birth mahadasha began before birth: clip its subperiods, never rescale them.
    let subStart=i===0 ? birth-elapsed*fullYears*yearMs : from;
    for(let j=0;j<9;j++){const sub=(idx+j)%9; const subEnd=subStart+fullYears*YEARS[sub]/120*yearMs; if(now>=Math.max(subStart,from)&&now<Math.min(subEnd,end)) currentSub={lord:LORDS[sub],from:fmt(Math.max(subStart,from)),to:fmt(Math.min(subEnd,end))}; subStart=subEnd;}
    cursor=end;
  }
  return {chart:{asc,ascSign,ayanamsa:aya,utc:utc.toISOString(),city,lat:loc.lat,lon:loc.lon,zone:loc.tz,placements,d9Asc:d9(asc),dashas,currentSub,balance}};
}
export const HOUSE_THEMES = ['self and identity','resources and speech','communication and initiative','home and foundations','creativity and learning','work and wellbeing','partnerships','change and shared resources','beliefs and higher learning','career and public role','networks and aspirations','rest and retreat'];
export { SIGN_LORDS };
