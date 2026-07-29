import type { Incident } from '~/types/incident'

const CHILD_SOURCE = 'https://www.amnesty.org/en/documents/mde13/6104/2022/en/'
const NOV19_SOURCE = 'https://www.amnesty.org/en/latest/press-release/2019/11/iran-more-than-100-protesters-believed-to-be-killed-as-top-officials-give-green-light-to-crush-protests/'
const HRW_SOURCE = 'https://www.hrw.org/news/2022/10/05/iran-security-forces-fire-kill-protesters'
const CAPITAL_SOURCE = 'https://www.amnesty.org/en/documents/mde13/6308/2022/en/'

const children = [
  ["Sarina Esmailzadeh","2022/09/23","Alborz","Karaj"],
  ["Mehdi Hazrati","2022/11/03","Alborz","Karaj"],
  ["Amir Hossein Basati","2022/09/21","Kermanshah","Kermanshah"],
  ["Bahaoddin Veisi","2022/11/20","Kermanshah","Javanroud"],
  ["Abolfazl Adinehzadeh","2022/10/08","Razavi Khorasan","Mashhad"],
  ["Ali Mozaffari","2022/09/21","Razavi Khorasan","Quchan"],
  ["Kian Pirfalak","2022/11/16","Khuzestan","Izeh"],
  ["Artin Rahmani","2022/11/16","Khuzestan","Izeh"],
  ["Sepehr Maghsoudi","2022/11/16","Khuzestan","Izeh"],
  ["Sarina Saedi","2022/10/27","Kurdistan","Sanandaj"],
  ["Danial Pabandi","2022/11/16","Kurdistan","Saqqez"],
  ["Sina Loh Mousavi","2022/09/21","Mazandaran","Amol"],
  ["Abolfazl Bahou","2022/09/20","Mazandaran","Qaem Shahr"],
  ["Mohammad Eghbal Shahnavazi (Nayebzehi)","2022/09/30","Sistan and Baluchistan","Zahedan"],
  ["Jaber Shiroozehi","2022/09/30","Sistan and Baluchistan","Zahedan"],
  ["Javad Pousheh","2022/09/30","Sistan and Baluchistan","Zahedan"],
  ["Mohammad Amin Gamshadzehi","2022/09/30","Sistan and Baluchistan","Zahedan"],
  ["Samer Hashemzehi","2022/09/30","Sistan and Baluchistan","Zahedan"],
  ["Sodeys Keshani","2022/09/30","Sistan and Baluchistan","Zahedan"],
  ["Yaser Shahouzehi","2022/09/30","Sistan and Baluchistan","Zahedan"],
  ["Ali Barahouie","2022/09/30","Sistan and Baluchistan","Zahedan"],
  ["Hasti Narouie","2022/09/30","Sistan and Baluchistan","Zahedan"],
  ["Danial Shahbakhsh","2022/09/30","Sistan and Baluchistan","Zahedan"],
  ["Mohammad Rakhshani","2022/09/30","Sistan and Baluchistan","Zahedan"],
  ["Omid Safarzehi","2022/09/30","Sistan and Baluchistan","Zahedan"],
  ["Omid Sarani","2022/09/30","Sistan and Baluchistan","Zahedan"],
  ["Mirshekar (first name possibly Mohammad Mehdi)","2022/10/02","Sistan and Baluchistan","Zahedan"],
  ["Omid Narouei","2022/10/28","Sistan and Baluchistan","Zahedan"],
  ["Adel Kochak Zay (Barichi)","2022/10/28","Sistan and Baluchistan","Zahedan"],
  ["Mobin Mirkazehi","2022/11/04","Sistan and Baluchistan","Khash"],
  ["Yaser Bahadorzehi","2022/11/04","Sistan and Baluchistan","Khash"],
  ["Nika Shakarami","2022/09/21","Tehran","Tehran"],
  ["Mohammad Reza Sarvari","2022/09/21","Tehran","Shahr-e Rey"],
  ["Setareh Tajik","2022/09/22","Tehran","Tehran"],
  ["Siavash Mahmoudi","2022/09/25","Tehran","Tehran"],
  ["Amir Mehdi Farrokhipour","2022/09/28","Tehran","Tehran"],
  ["Ahmadreza Qeleji","2022/09/21","Tehran","Tehran"],
  ["Zakaria Khial","2022/09/20","West Azerbaijan","Piranshahr"],
  ["Abdollah Mahmoudpour","2022/09/21","West Azerbaijan","Balou"],
  ["Amin Marefat","2022/09/21","West Azerbaijan","Oshnavieh"],
  ["Koumar Daroftadeh","2022/10/30","West Azerbaijan","Piranshahr"],
  ["Nima Shafaghdoost","2022/10/05","West Azerbaijan","Urmia"],
  ["Karvan Ghader Shokri","2022/11/19","West Azerbaijan","Piranshahr"],
  ["Mehdi Mousavi Nikou","2022/09/21","Zanjan","Zanjan"]
] as const
const strongChildren = new Set([1,5,6,7,16,32,37])
const november2019 = [
  ["Abadan","Khuzestan",2],
  ["Ahvaz","Khuzestan",2],
  ["Bandar-e Mahshahr","Khuzestan",14],
  ["Behbahan","Khuzestan",8],
  ["Bukan","West Azerbaijan",4],
  ["Bumehen","Tehran",2],
  ["Isfahan","Isfahan",1],
  ["Eslamshahr","Tehran",1],
  ["Javanroud","Kermanshah",14],
  ["Karaj","Alborz",4],
  ["Kermanshah","Kermanshah",16],
  ["Khorramshahr","Khuzestan",3],
  ["Marivan","Kurdistan",9],
  ["Ramhormoz","Khuzestan",6],
  ["Robat Karim","Tehran",4],
  ["Sadra","Fars",6],
  ["Sanandaj","Kurdistan",1],
  ["Shahriar","Tehran",1],
  ["Shiraz","Fars",6],
  ["Sirjan","Kerman",1],
  ["Tehran","Tehran",1]
] as const
const verifiedVideoCities = [
  ["Tehran","Tehran"],
  ["Divandarreh","Kurdistan"],
  ["Garmsar","Semnan"],
  ["Hamadan","Hamadan"],
  ["Kerman","Kerman"],
  ["Mashhad","Razavi Khorasan"],
  ["Mehrshahr","Alborz"],
  ["Rasht","Gilan"],
  ["Shiraz","Fars"],
  ["Sanandaj","Kurdistan"],
  ["Marivan","Kurdistan"],
  ["Saqqez","Kurdistan"],
  ["Zahedan","Sistan and Baluchistan"]
] as const
const capitalCases = ["Sahand Nourmohammad-Zadeh", "Mahan Sadrat Madani", "Manouchehr Mehman Navaz", "Mohammad Boroughani", "Mohammad Ghobadlou", "Saman Seydi (Yasin)", "Hamid Ghare Hasanlou", "Mohammad Mehdi Karami", "Sayed Mohammad Hosseini", "Hossein Mohammadi", "Saeed Shirazi", "Abolfazl Mehri Hossein Hajilou", "Mohsen Rezazadeh Gharegholou", "Akbar Ghafari", "Toomaj Salehi", "Ebrahim Rigi", "Amir Nasr Azadani", "Saleh Mirhashemi", "Saeed Yaghoubi", "Farzad (Farzin) Tahazadeh", "Farhad Tahazadeh", "Karvan Shahiparvaneh"] as const

type Seed = {
  date: string; province: string; city: string; veracity: number; evidence: number;
  title: string; summary: string; source: string; kind: 'child'|'crackdown'|'capital';
}

const seeds: Seed[] = [
  ...children.map((x, i) => ({
    date:x[1], province:x[2], city:x[3], veracity:10, evidence:strongChildren.has(i+1)?10:9,
    title:`Killing of ${x[0]}`,
    summary:`Amnesty International documented the killing of child protester or bystander ${x[0]} by Iranian security forces during the 2022 uprising in ${x[3]}, ${x[2]}.`,
    source:CHILD_SOURCE, kind:'child' as const
  })),
  ...november2019.map(x => ({
    date:'2019/11/15', province:x[1], city:x[0], veracity:10, evidence:8,
    title:`November 2019 protest crackdown in ${x[0]}`,
    summary:`Amnesty International documented at least ${x[2]} protester death${x[2]===1?'':'s'} in ${x[0]}, ${x[1]}, during the nationwide November 2019 crackdown.`,
    source:NOV19_SOURCE, kind:'crackdown' as const
  })),
  ...verifiedVideoCities.map(x => ({
    date:'2022/09/21', province:x[1], city:x[0], veracity:10, evidence:10,
    title:`Verified lethal-force crackdown in ${x[0]}`,
    summary:`Human Rights Watch verified audiovisual evidence and witness reporting showing Iranian security forces using excessive or lethal force against protesters in ${x[0]}, ${x[1]}, during September 2022.`,
    source:HRW_SOURCE, kind:'crackdown' as const
  })),
  ...capitalCases.map(name => ({
    date:'2022/12/16', province:'', city:'', veracity:10, evidence:8,
    title:`Protest-related death-penalty case of ${name}`,
    summary:`Amnesty International identified ${name} as facing execution in connection with Iran's 2022 nationwide protests following grossly unfair proceedings.`,
    source:CAPITAL_SOURCE, kind:'capital' as const
  }))
]

export const verifiedHistoricalIncidentBatch: Incident[] = seeds.map((s, index) => ({
  id:`ia-batch-${String(index+1).padStart(3,'0')}`,
  status:'verified',
  ratings:{veracity:s.veracity,evidence_availability:s.evidence},
  occurred_at:{start:s.date,start_time:'',end:'',end_time:'',timezone:'Asia/Tehran',precision:s.kind==='capital'?'approx':'exact'},
  location:{country:'Iran',province:s.province,city:s.city,address:'',lat:undefined,lng:undefined},
  incident_type:s.kind==='child'?'Uprising / Killing of Child':s.kind==='capital'?'Judicial Repression / Death Penalty':'Uprising / Crackdown / Unlawful Killing',
  severity:{deaths:{min:s.kind==='child'?1:0,max:s.kind==='child'?1:0},injured:{min:0,max:0},arrests:{min:0,max:0}},
  title:s.title,
  summary:s.summary,
  narrative:`${s.summary}\n\nThis record is deliberately limited to the bounded core claim established by the cited investigation.`,
  key_claims:[s.summary],
  open_questions:['Individual chain-of-command responsibility and complete underlying case files remain unavailable for public review.'],
  limitations:['The record is limited to facts supported by the cited investigation; casualty totals may be undercounts.'],
  evidence_ids:[],
  sources:[{id:'src-001',label:'Authoritative investigation',url:s.source,publisher:s.source.includes('hrw.org')?'Human Rights Watch':'Amnesty International',published_at:s.date,type:'secondary',archived_urls:[],language:'en',notes:s.evidence===10?'Includes verified audiovisual evidence and corroborating testimony or documentation.':'Documents the core claim through a rights-investigation methodology.'}],
  timeline:[{at:s.date,time:'',title:s.title,description:s.summary,evidence_ids:[],source_ids:['src-001']}],
  review_history:[{at:'2026/07/29',reviewer:'OpenAI research batch',change:'created',to_status:'verified',notes:'Source-backed batch; ratings reflect public reviewability, not legal adjudication.'}],
  victims:[],
  related_incidents:[]
} as Incident))
