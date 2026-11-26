import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calculateKundli } from '../src/lib/kundli';
import { buildHoroscopeSections } from '../src/lib/reportSections';
import type { BirthDetailsInput } from '../src/lib/report';

const input: BirthDetailsInput = {reportType:'horoscope',fullName:'Test',birthDate:'1988-07-09',birthTime:'14:30',birthPlace:'Bengaluru, India',language:'en',gender:''};
// Swiss Ephemeris 2.10, Moshier, Lahiri, mean node; independent reference.
const fixtures = [
  {date:'1988-07-09',time:'14:30',city:'Bengaluru',asc:204.75573, planets:[83.66413,30.11330,334.18317,62.71799,34.00651,50.65951,244.19625,323.38958]},
  {date:'2000-01-01',time:'12:00',city:'Mumbai',asc:336.92746, planets:[256.28209,196.71169,303.93234,247.67956,1.39056,217.43554,16.54704,101.19957]},
  {date:'1995-11-20',time:'06:15',city:'Delhi',asc:205.70964, planets:[213.40915,178.01578,238.26048,211.57212,236.21039,236.84485,324.19694,180.85926]},
];
const difference=(a:number,b:number)=>Math.abs((a-b+540)%360-180);
test('positions and ascendant match independent Swiss Ephemeris fixtures within 0.1 degree',()=>{
 for(const f of fixtures){const c=calculateKundli({...input,birthDate:f.date,birthTime:f.time,birthPlace:f.city}).chart; assert.ok(c); assert.ok(difference(c.asc,f.asc)<0.1, `${f.city} asc ${c.asc}`); f.planets.forEach((x,i)=>assert.ok(difference(c.placements[i].longitude,x)<0.1,`${f.city} ${c.placements[i].name}: ${c.placements[i].longitude} vs ${x}`)); assert.equal(c.placements.length,9); assert.equal(difference(c.placements[7].longitude,c.placements[8].longitude),180); }
});
test('missing time and unsupported city never invent a chart',()=>{
 assert.equal(calculateKundli({...input,birthTime:''}).chart,null);
 assert.equal(calculateKundli({...input,birthPlace:'Unknown'}).chart,null);
 const report=buildHoroscopeSections({...input,birthTime:''}); assert.equal(report.sections[0].id,'details-needed');
});
test('chart sections and sensible dasha balance',()=>{
 const result=calculateKundli(input).chart!; assert.ok(result.balance>0&&result.balance<=20); assert.equal(result.dashas[0].from,'1988-07-09');
 const report=buildHoroscopeSections(input); assert.deepEqual(report.sections.filter(s=>s.blocks.some(b=>b.kind==='chart')).map(s=>s.id),['rashi-chart','navamsa']);
 assert.equal(result.placements.find(p=>p.name==='Moon')?.nakshatra,'Krittika');
});
