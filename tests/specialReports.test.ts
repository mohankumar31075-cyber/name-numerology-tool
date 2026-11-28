import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readSpecial, buildSpecialReport } from '../src/lib/specialReports';
import type { BirthDetailsInput } from '../src/lib/report';
const input:BirthDetailsInput={reportType:'numerology',fullName:'Test User',birthDate:'1988-07-09',birthTime:'14:30',birthPlace:'Bengaluru',language:'en',gender:''};
test('special reports validate data and produce report sections',()=>{
 for(const details of [{type:'mobile',number:'9876543210'},{type:'vehicle',number:'KA 01 AB 1234'},{type:'compatibility',partnerName:'Someone',partnerDate:'1990-05-09'},{type:'career'}]) {
  const special=readSpecial(details); assert.ok(special); const report=buildSpecialReport(input,special); assert.ok(report.sections.length>=4, special.type); assert.ok(report.summary.length>0);
 }
 assert.equal(readSpecial({type:'mobile',number:'12'}),null); assert.equal(readSpecial({type:'compatibility',partnerName:'x',partnerDate:'nonsense'}),null); assert.equal(readSpecial({type:'bad'}),null);
});
