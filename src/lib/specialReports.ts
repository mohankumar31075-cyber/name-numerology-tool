import { getNameNumber, getLifePath, reduceToSingleDigit, NUMBER_MEANINGS } from './chaldean';
import { numberReading } from './numberReadings';
import { parseBirthDate, type BirthDetailsInput } from './report';
import { calculateKundli, SIGNS, SIGN_LORDS } from './kundli';
import type { StructuredReport } from './reportSections';

export const SPECIAL_TYPES = ['career','compatibility','mobile','vehicle'] as const;
export type SpecialType = typeof SPECIAL_TYPES[number];
export type SpecialDetails = { type: SpecialType; number?: string; partnerName?: string; partnerDate?: string };
export function readSpecial(value: unknown): SpecialDetails | null {
  if (!value || typeof value !== 'object') return null;
  const obj=value as Record<string,unknown>; const type=String(obj.type||'') as SpecialType;
  if (!SPECIAL_TYPES.includes(type)) return null;
  if (type==='mobile'||type==='vehicle') {
    const n=String(obj.number||'').trim().slice(0,32);
    if (!numberReading(n,type)) return null;
    return {type,number:n};
  }
  if (type==='compatibility') {
    const partnerName=String(obj.partnerName||'').trim().slice(0,120);
    const partnerDate=String(obj.partnerDate||'').trim().slice(0,10);
    if (partnerName.length<2 || !parseBirthDate(partnerDate) || partnerDate > new Date().toISOString().slice(0,10)) return null;
    return {type,partnerName,partnerDate};
  }
  return {type};
}
const meaning=(n:number)=> NUMBER_MEANINGS[n] || NUMBER_MEANINGS[reduceToSingleDigit(n)] || NUMBER_MEANINGS[1];
const labels:Record<SpecialType,string>={career:'Career reflection',compatibility:'Relationship numerology',mobile:'Mobile number numerology',vehicle:'Vehicle number numerology'};
export function buildSpecialReport(input: BirthDetailsInput, special: SpecialDetails): StructuredReport {
  const d=parseBirthDate(input.birthDate)!;
  const life=getLifePath(d.day,d.month,d.year).lifePath;
  const name=getNameNumber(input.fullName);
  const sections:StructuredReport['sections']=[];
  const summary:StructuredReport['summary']=[];
  if (special.type==='mobile'||special.type==='vehicle') {
    const r=numberReading(special.number!,special.type)!;
    summary.push({label:'Digit sum',value:String(r.sum)},{label:'Number',value:String(r.number)},{label:'Life path',value:String(life)});
    sections.push({id:'method',title:'How this reading was calculated',blocks:[{kind:'paragraph',text:`The digits ${r.digits.split('').join(' + ')} total ${r.sum}, reduced to ${r.number}. ${special.type==='mobile'?'All entered digits, including a country code if included, are counted.':'Only digits in the registration are counted; letters are not included.'} Other numerology systems use different methods.`}]},
      {id:'number',title:'Your number theme',blocks:[{kind:'paragraph',text:r.theme},{kind:'paragraph',text:'Treat this theme as a prompt for reflection, not as evidence of luck, safety, financial outcomes or relationship compatibility.'}]},
      {id:'personal',title:'Your personal numerology',blocks:[{kind:'table',columns:['Measure','Value','Theme'],rows:[['Name number',String(name.nameNumber),meaning(name.nameNumber).title],['Life path',String(life),meaning(life).title],['Number digit sum',String(r.number),r.theme]]},{kind:'list',items:[`Life path strengths: ${meaning(life).strengths.join(', ')}.`, `Challenges to reflect on: ${meaning(life).challenges.join(', ')}.`]},{kind:'paragraph',text:`Your life path is calculated from the birth date using this site's numerology method. It is separate from the number's digit sum; this report does not claim to calculate compatibility between them.`}]},
      {id:'reflection',title:'Reflection prompts',blocks:[{kind:'list',items:['Which qualities in the number theme resonate with you, and which do not?','Consider practical factors such as cost, coverage, legal requirements and safety separately from numerology.','When comparing another number, use the same digit-selection method for both.']}]});
  } else if (special.type==='compatibility') {
    const pd=parseBirthDate(special.partnerDate!)!; const partnerName=getNameNumber(special.partnerName!); const partnerLife=getLifePath(pd.day,pd.month,pd.year).lifePath;
    summary.push({label:'Your life path',value:String(life)},{label:'Partner life path',value:String(partnerLife)});
    sections.push({id:'method',title:'About this reading',blocks:[{kind:'paragraph',text:'This is a two-person numerology reflection based on names and birth dates. It is not a Kundli Milan, Ashtakoota / 36-guna score, or a prediction of relationship success.'}]},
      {id:'profiles',title:'Both profiles',blocks:[{kind:'table',columns:['Person','Name number','Life path','Life-path theme'],rows:[[input.fullName,String(name.nameNumber),String(life),meaning(life).title],[special.partnerName!,String(partnerName.nameNumber),String(partnerLife),meaning(partnerLife).title]]},{kind:'paragraph',text:`${input.fullName}: ${meaning(life).short} ${special.partnerName}: ${meaning(partnerLife).short}`}]},
      {id:'themes',title:'Personal themes',blocks:[{kind:'list',items:[`${input.fullName}: strengths often associated with ${life} include ${meaning(life).strengths.join(', ')}; challenges include ${meaning(life).challenges.join(', ')}.`, `${special.partnerName}: strengths often associated with ${partnerLife} include ${meaning(partnerLife).strengths.join(', ')}; challenges include ${meaning(partnerLife).challenges.join(', ')}.`]}]},
      {id:'relationship',title:'Conversation and reflection',blocks:[{kind:'list',items:['Discuss which qualities in each profile feel accurate or inaccurate.','Talk openly about communication, shared expectations and personal boundaries.','A numerology reading cannot judge consent, safety, or the future of a relationship.']} ]});
  } else {
    const c=calculateKundli(input).chart;
    if (!c) throw new Error('Birth details required for career chart');
    const ten=(c.ascSign+9)%12;const occupants=c.placements.filter(p=>p.house===10).map(p=>p.name);const lord=SIGN_LORDS[ten];const lp=c.placements.find(p=>p.name===lord);
    summary.push({label:'Ascendant',value:SIGNS[c.ascSign]},{label:'10th house',value:SIGNS[ten]},{label:'10th lord',value:lord});
    sections.push({id:'method',title:'Method and limitations',blocks:[{kind:'paragraph',text:`A traditional whole-sign reading of the tenth house using an approximate Lahiri sidereal chart for ${c.city}. Placements are sensitive to birth time; consult a professional ephemeris near boundaries. This is not employment, financial or legal advice.`}]},
      {id:'career',title:'Career and public role',blocks:[{kind:'table',columns:['Chart factor','Your placement'],rows:[['Ascendant',SIGNS[c.ascSign]],['10th house sign',SIGNS[ten]],['10th house lord',lord],['10th lord placement',lp?`${SIGNS[lp.sign]}, house ${lp.house}`:'Not available'],['Planets in 10th house',occupants.join(', ')||'None']]},{kind:'paragraph',text:'The tenth house is traditionally associated with work, responsibility and public activity. An empty house remains meaningful through its sign and ruling planet.'}]},
      {id:'life',title:'Your numerology lens',blocks:[{kind:'paragraph',text:`Life path ${life}: ${meaning(life).title}. ${meaning(life).short}`},{kind:'paragraph',text:'These traditional associations are prompts for reflection, not proof of aptitude or a guarantee of career outcomes.'}]},
      {id:'plan',title:'Practical next steps',blocks:[{kind:'list',items:['List the activities you enjoy and the skills you can demonstrate.','Explore roles, training requirements and current opportunities independently.','Speak with a qualified career adviser before making major decisions.']}]});
  }
  sections.push({id:'disclaimer',title:'Please note',blocks:[{kind:'paragraph',text:'Traditional numerology and astrology are offered for reflection and cultural interest. They do not replace professional advice. Content is currently in English.'}]});
  return {headline:`${input.fullName} — ${labels[special.type]}`,subline:`${input.birthDate} · ${labels[special.type]}`,generatedAt:new Date().toISOString(),source:special.type==='career'?'astronomy-engine / numerology':'numerology digit sum',summary,sections};
}
