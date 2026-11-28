import { notFound } from 'next/navigation';
import { SPECIAL_TYPES, type SpecialType } from '@/lib/specialReports';
import SpecialReadingForm from '@/components/home/SpecialReadingForm';
export default async function Page({params}:{params:Promise<{type:string}>}) {
  const {type}=await params;
  if (!SPECIAL_TYPES.includes(type as SpecialType)) notFound();
  return <SpecialReadingForm type={type as SpecialType}/>;
}
