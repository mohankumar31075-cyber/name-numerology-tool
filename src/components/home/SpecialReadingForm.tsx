"use client";
import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { readSpecial, type SpecialType } from '@/lib/specialReports';
import { BASE_REPORT_PRICE, parseBirthDate, parseBirthTime } from '@/lib/report';
import { CITIES } from '@/lib/hinduCalendarMcp';

const labels: Record<SpecialType,string> = {career:'Career reflection',compatibility:'Love & compatibility',mobile:'Mobile number',vehicle:'Vehicle number'};
const descriptions: Record<SpecialType,string> = {
  career:'A traditional tenth-house chart and numerology reflection, plus practical planning prompts.',
  compatibility:'A two-person numerology reflection. This is not a Kundli Milan or 36-guna score.',
  mobile:'A digit-sum reading alongside your personal name and life-path numbers.',
  vehicle:'A digit-sum reading of the registration alongside your personal numbers.',
};
const field='w-full rounded-xl border border-ink-500 bg-ink-950 px-4 py-3 text-sm text-ink-50 outline-none focus:border-gold-300';
const label='block space-y-2 text-sm text-ink-100';
export default function SpecialReadingForm({type}:{type:SpecialType}) {
  const [name,setName]=useState(''); const [dob,setDob]=useState(''); const [time,setTime]=useState(''); const [city,setCity]=useState('Bengaluru');
  const [number,setNumber]=useState(''); const [partnerName,setPartnerName]=useState(''); const [partnerDate,setPartnerDate]=useState('');
  const [coupon,setCoupon]=useState(''); const [quote,setQuote]=useState<{price:number;discountPercent:number;coupon:string|null}|null>(null);
  const [error,setError]=useState(''); const [busy,setBusy]=useState(false); const [url,setUrl]=useState('');
  const reportDetails={type,number,partnerName,partnerDate};
  const body={reportType:'numerology',fullName:name,birthDate:dob,birthTime:type==='career'?time:'',birthPlace:type==='career'?city:'Not provided',language:'en',gender:'',reportDetails};
  function validate() {
    if(name.trim().length<2||!parseBirthDate(dob)||dob>new Date().toISOString().slice(0,10)) return 'Enter your full name and a valid date of birth.';
    if(!readSpecial(reportDetails)) return type==='compatibility'?'Enter the second person’s name and a valid birth date.':'Enter a valid mobile number or vehicle registration.';
    if(type==='career'&&!parseBirthTime(time)) return 'Enter your exact birth time for the career chart.';
    return '';
  }
  async function request(action:'quote'|'create') {
    const problem=validate(); if(problem){setError(problem);return;} setError('');setBusy(true);
    try {
      const res=await fetch('/api/report',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...body,action,coupon:coupon.trim().toUpperCase()})});
      const data=await res.json(); if(!res.ok||!data.ok) {setError(data.error||'Could not prepare your report. Please try again.');return;}
      if(action==='quote')setQuote(data.quote); else if(data.reportUrl)setUrl(data.reportUrl); else setError('The order could not be created. Please contact support.');
    } catch {setError('Network error. Please try again.');} finally {setBusy(false);}
  }
  function submit(e:FormEvent){e.preventDefault();void request('create');}
  return <main className="mx-auto max-w-2xl px-5 py-12 sm:px-7">
    <Link href="/#explore" className="text-xs text-gold-300">← All readings</Link>
    <p className="mt-6 text-xs font-semibold uppercase tracking-eyebrow text-gold-300">Personalised PDF · ₹{BASE_REPORT_PRICE}</p>
    <h1 className="mt-3 font-serif text-3xl text-ink-50 sm:text-4xl">{labels[type]}</h1>
    <p className="mt-3 text-sm leading-relaxed text-ink-200">{descriptions[type]}</p>
    {url ? <div className="mt-7 rounded-2xl border border-gold-300/30 bg-white/[0.03] p-6"><h2 className="font-serif text-xl">Your report page is ready</h2><p className="mt-2 text-sm text-ink-200">Open and keep this link. If payment is required, the page explains how to pay and unlock your PDF.</p><Link href={url} className="mt-5 block rounded-xl bg-gold-cta p-3 text-center font-bold text-[#20180e]">Open report →</Link></div> : <form onSubmit={submit} className="mt-7 space-y-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-7">
      <label className={label}><span>Full name</span><input className={field} value={name} onChange={e=>setName(e.target.value)} maxLength={120} required /></label>
      <label className={label}><span>Date of birth</span><input className={field} type="date" value={dob} onChange={e=>setDob(e.target.value)} min="1900-01-01" max={new Date().toISOString().slice(0,10)} required /></label>
      {type==='career' && <><label className={label}><span>Exact birth time</span><input className={field} type="time" value={time} onChange={e=>setTime(e.target.value)} required /></label><label className={label}><span>Birth city</span><select className={field} value={city} onChange={e=>setCity(e.target.value)}>{Object.keys(CITIES).map(c=><option key={c}>{c}</option>)}</select></label><p className="text-xs text-ink-300">Supported cities only; city-centre coordinates are used.</p></>}
      {type==='compatibility' && <><label className={label}><span>Second person’s full name</span><input className={field} value={partnerName} onChange={e=>setPartnerName(e.target.value)} maxLength={120} required /></label><label className={label}><span>Second person’s date of birth</span><input className={field} type="date" value={partnerDate} onChange={e=>setPartnerDate(e.target.value)} min="1900-01-01" max={new Date().toISOString().slice(0,10)} required /></label></>}
      {(type==='mobile'||type==='vehicle') && <><label className={label}><span>{type==='mobile'?'Mobile number':'Vehicle registration'}</span><input className={field} value={number} onChange={e=>setNumber(e.target.value)} maxLength={32} inputMode={type==='mobile'?'tel':'text'} required /></label><p className="text-xs text-ink-300">{type==='mobile'?'All entered digits, including country code, are counted.':'Only registration digits are counted, not letters.'}</p></>}
      <div className="border-t border-white/10 pt-4"><label className={label}><span>Coupon code (optional)</span><div className="flex gap-2"><input className={field} value={coupon} onChange={e=>{setCoupon(e.target.value.toUpperCase());setQuote(null);}} maxLength={32} /><button type="button" disabled={busy} onClick={()=>void request('quote')} className="rounded-xl border border-white/20 px-4 text-sm text-ink-50">Apply</button></div></label><p aria-live="polite" className="mt-3 text-sm text-ink-100">{quote?`${quote.discountPercent}% off · Total ₹${quote.price}`:`Full report ₹${BASE_REPORT_PRICE}`}</p></div>
      <p className="text-xs leading-relaxed text-ink-300">Your report details are stored with your order to generate your report. Share another person’s information only with their consent. Reports are in English and intended for reflection, not professional advice.</p>
      {error&&<p role="alert" className="text-sm text-rose-300">{error}</p>}
      <button disabled={busy} type="submit" className="w-full rounded-xl bg-gold-cta p-3 text-sm font-bold text-[#20180e] disabled:opacity-60">{busy?'Preparing…':'Create report order →'}</button>
    </form>}
  </main>;
}
