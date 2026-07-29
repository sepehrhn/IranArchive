import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const VICTIMS_DIR = path.join(__dirname, '../data/victims');

// Helper to determine if a string contains Persian characters
function isPersian(str) {
    if (!str) return false;
    const persianRegex = /[\u0600-\u06FF]/;
    return persianRegex.test(str);
}

// Mappings: "Original Lowercase" -> { city: "New City", address: "Partial/Full Address" }
// If address is "preserve", we use the original string as address.
const specificMappings = {
    // Persian Translations & Corrections
    "abadeh": { city: "Abadeh" },
    "abdanan": { city: "Abdanan" },
    "abgarm": { city: "Abgarm" },
    "abik": { city: "Abyek" },
    "abpakhsh": { city: "Abpakhsh" },
    "abpuyeh": { city: "Abpuyeh" },
    "abresham": { city: "Abresham" },
    "ahmadabad": { city: "Ahmadabad" },
    "alvand": { city: "Alvand" },
    "amlash": { city: "Amlash" },
    "amol": { city: "Amol" },
    "anbaran": { city: "Anbaran" },
    "anzali": { city: "Bandar Anzali" },
    "arem street": { city: "", address: "Arem Street" }, // Don't know city
    "armak village": { city: "Armak" },
    "asadabad": { city: "Asadabad" },
    "ashkehran village": { city: "Ashkehran" },
    "astaneh-ye ashrafiyyeh": { city: "Astaneh-ye Ashrafieh" },
    "azadshahr": { city: "Azadshahr" },
    "azna": { city: "Azna" },
    "azna county": { city: "Azna" },
    "baba meydan": { city: "Baba Meydan" },
    "babol": { city: "Babol" },
    "babolsar": { city: "Babolsar" },
    "baghbahadoran": { city: "Bagh-e Bahadoran" },
    "balochistan": { city: "", address: "Balochistan" }, // Region
    "bandar-e anzali": { city: "Bandar Anzali" },
    "bandar-e kiyashahr": { city: "Kiashahr" },
    "bandar-e mahshahr": { city: "Mahshahr" },
    "bashagerd": { city: "Bashagard" },
    "behzad township": { city: "", address: "Behzad Township" },
    "bijar": { city: "Bijar" },
    "bijar / sanandaj": { city: "Bijar", address: "Sanandaj" },
    "bojnourd": { city: "Bojnurd" },
    "booshehr": { city: "Bushehr" },
    "borazjan/bushehr": { city: "Borazjan", address: "Bushehr" },
    "borujerd": { city: "Borujerd" },
    "buldaji": { city: "Boldaji" },
    "bumehen": { city: "Bumehen" },
    "bushehr - bandar ganaveh": { city: "Bushehr", address: "Bandar Ganaveh" },
    "chaboksar": { city: "Chaboksar" },
    "chaf": { city: "Chaf" },
    "chalous": { city: "Chalous" },
    "chalus": { city: "Chalous" },
    "chamestan": { city: "Chamestan" },
    "chamgardan": { city: "Chamgardan" },
    "chamgardaneh": { city: "Chamgardan" }, // Typo likely
    "chanarshahijan": { city: "Chenar Shahijan" },
    "charmhain (lenjan region": { city: "Chamgardan", address: "Lenjan Region" }, // likely Chamgardan/Chermahin
    "chenar-shahijan": { city: "Chenar Shahijan" },
    "chenaran": { city: "Chenaran" },
    "chenarshahi-jan": { city: "Chenar Shahijan" },
    "chenarshahiha": { city: "Chenar Shahijan" }, // Colloquial
    "chenarshahijan": { city: "Chenar Shahijan" },
    "chenarsufli": { city: "Chenar Sofla" },
    "choghan": { city: "Choghan" },
    "dalahu": { city: "Dalahu" },
    "dansfahan": { city: "Danesfahan" },
    "darab": { city: "Darab" },
    "daragan village": { city: "Daragan" },
    "dargahan": { city: "Dargahan" },
    "darreh darizh": { city: "Kermanshah", address: "Darreh Darizh" }, // Neighborhood
    "darreh dirizh": { city: "Kermanshah", address: "Darreh Darizh" },
    "darzikolay-e akhondi village": { city: "Babol", address: "Darzikola-ye Akhondi" }, // Village near Babol
    "dastgerd-e barkhvar": { city: "Dastgerd" },
    "dastgerd-e برخوار": { city: "Dastgerd" },
    "dehagh": { city: "Dehagh" },
    "dehdasht": { city: "Dehdasht" },
    "dehno": { city: "Dehno" },
    "dezful": { city: "Dezful" },
    "dizicheh": { city: "Dizicheh" },
    "dorahi neighborhood": { city: "", address: "Dorahi neighborhood" },
    "dorud": { city: "Dorud" },
    "eligoodarz": { city: "Aligudarz" },
    "emamshahr": { city: "Emamshahr" },
    "esfahan": { city: "Isfahan" },
    "esfarayen": { city: "Esfarayen" },
    "eslamabad-e gharb": { city: "Islamabad-e Gharb" },
    "eslamshahr": { city: "Islamshahr" },
    "falak-e amuzesh va parvaresh": { city: "", address: "Falak-e Amuzesh va Parvaresh" },
    "falavarjan": { city: "Falavarjan" },
    "fari abad village": { city: "Fari Abad" }, // typo?
    "faridabad": { city: "Faridabad" },
    "farrokh shahr": { city: "Farrokh Shahr" },
    "farrokh-shahr": { city: "Farrokh Shahr" },
    "farrokhshahr": { city: "Farrokh Shahr" },
    "fasa": { city: "Fasa" },
    "ferdows": { city: "Ferdows" },
    "fereydunkenar": { city: "Fereydunkenar" },
    "fereydunshahr": { city: "Fereydunshahr" },
    "firoozkooh": { city: "Firuzkuh" },
    "flowerjan": { city: "Falavarjan" },
    "fooladshahr": { city: "Fooladshahr" },
    "fouladshahr": { city: "Fooladshahr" },
    "fuladshahr": { city: "Fooladshahr" },
    "fلاورجان اصفهان": { city: "Falavarjan" },
    "gahru": { city: "Gahru" },
    "garchak": { city: "Qarchak" },
    "ghadir yabrud": { city: "", address: "Ghadir Yabrud" },
    "ghaemieh chenarshahiha": { city: "Chenar Shahijan" },
    "ghaemshahr": { city: "Qaem Shahr" },
    "gharchak": { city: "Qarchak" },
    "gharcheh": { city: "Qarchak" }, // likely typo
    "gharhak": { city: "Qarchak" }, // likely typo
    "ghir": { city: "Qir" }, // Qirokarzin
    "ghorchek": { city: "Qarchak" },
    "gilan": { city: "", address: "" }, // Province
    "gilan province": { city: "", address: "" },
    "gilan and mazandaran": { city: "", address: "" },
    "gilan and pusikhaneh": { city: "", address: "Pusikhaneh" },
    "gilan or mazandaran provinces": { city: "", address: "" },
    "gilan-e gharb": { city: "Gilan-e Gharb" },
    "golestan": { city: "Golestan" }, // City exists, or province? Usually city in this context if not 'province'
    "golestan province": { city: "", address: "" },
    "golpayegan": { city: "Golpayegan" },
    "golsar": { city: "Rasht", address: "Golsar" }, // Neighborhood in Rasht
    "gonabad": { city: "Gonabad" },
    "gonbad kavous": { city: "Gonbad-e Kavus" },
    "gonbad-e kavus": { city: "Gonbad-e Kavus" },
    "gorgan": { city: "Gorgan" },
    "gotvand": { city: "Gotvand" },
    "goz": { city: "Gaz" }, // Gaz-e Borkhar?
    "hafshejan": { city: "Hafshejan" },
    "hajilarghala village": { city: "Hajilar Qaleh" },
    "hamadan": { city: "Hamadan" },
    "hamedan": { city: "Hamadan" },
    "harikandeh village": { city: "Babol", address: "Harikandeh" },
    "harsin": { city: "Harsin" },
    "harsin county": { city: "Harsin" },
    "hashtgerd": { city: "Hashtgerd" },
    "hassan abad": { city: "Hassan Abad" },
    "hassan-abad village": { city: "Hassan Abad" },
    "homayoun shahr": { city: "Khomeini Shahr" },
    "homayounshahr": { city: "Khomeini Shahr" },
    "ilam": { city: "Ilam" },
    "ilam province": { city: "", address: "" },
    "iran": { city: "", address: "" },
    "iran (provinces of ilam": { city: "", address: "" },
    "iran's kurdish regions": { city: "", address: "" },
    "iranshahr": { city: "Iranshahr" },
    "isfahan": { city: "Isfahan" },
    "isfahan province": { city: "", address: "" },
    "isfahan province": { city: "", address: "" },
    "islamabad-e gharb": { city: "Islamabad-e Gharb" },
    "islamshahr": { city: "Islamshahr" },
    "izeh": { city: "Izeh" },
    "jahrom": { city: "Jahrom" },
    "jajarm": { city: "Jajarm" },
    "jamalabad village": { city: "Jamalabad" },
    "javanrud": { city: "Javanrud" },
    "jooneghan": { city: "Junayghan" },
    "kahrizak": { city: "Kahrizak" },
    "kalachay": { city: "Kelachay" },
    "kalaleh": { city: "Kalaleh" },
    "kangavar": { city: "Kangavar" },
    "kangaver": { city: "Kangavar" },
    "karaj": { city: "Karaj" },
    "kareh": { city: "Kareh" },
    "kashmar": { city: "Kashmar" },
    "kazeroon": { city: "Kazerun" },
    "kazerun": { city: "Kazerun" },
    "kelachaei": { city: "Kelachay" },
    "kelardasht": { city: "Kelardasht" },
    "kengavar": { city: "Kangavar" },
    "kerman": { city: "Kerman" },
    "kermanshah": { city: "Kermanshah" },
    "kermanshah or islamabad-e gharb": { city: "Kermanshah", address: "or Islamabad-e Gharb" },
    "khalij-e fars": { city: "Tehran", address: "Khalij-e Fars" }, // Neighborhood
    "khomeih": { city: "Khomein" },
    "khomein": { city: "Khomein" },
    "khomeini shahr": { city: "Khomeini Shahr" },
    "khomeinishahr": { city: "Khomeini Shahr" },
    "khomeyni shahr": { city: "Khomeini Shahr" },
    "khorasan": { city: "", address: "" }, // Region
    "khorasan region (from sabzevar": { city: "Sabzevar", address: "" },
    "khormajan": { city: "Khorramabad" },
    "khormashti": { city: "", address: "Khormashti" },
    "khorramabad": { city: "Khorramabad" },
    "khorzough": { city: "Khorzuq" },
    "khoshkbijar county": { city: "Khoshkbijar" },
    "khvansar": { city: "Khansar" },
    "kiasahr": { city: "Kiashahr" },
    "kish": { city: "Kish" },
    "kish island": { city: "Kish" },
    "koch-e-sefid": { city: "Kuchesfahan" }, // ? Maybe Kouch-e Sefid
    "kohsar": { city: "Kohsar" },
    "kovar": { city: "Kavar" },
    "kuchesfehan": { city: "Kuchesfahan" },
    "kuhchenar": { city: "Kuhchenar" },
    "kuhdasht": { city: "Kuhdasht" },
    "kuhdasht or nurabad": { city: "Kuhdasht", address: "or Nurabad" },
    "lahijan": { city: "Lahijan" },
    "lapouei": { city: "Lapui" },
    "lekak": { city: "Likak" },
    "lordegan": { city: "Lordegan" },
    "lushak": { city: "Lowshan" }, // Maybe typo for Lowshan
    "lushan": { city: "Lowshan" },
    "mahabad": { city: "Mahabad" },
    "mahalat": { city: "Mahallat" },
    "mahallat": { city: "Mahallat" },
    "mahshahr": { city: "Mahshahr" },
    "malard": { city: "Malard" },
    "malayer": { city: "Malayer" },
    "malekshahi": { city: "Malekshahi" },
    "malekshahi county": { city: "Malekshahi" },
    "mamasani": { city: "Mamasani" },
    "mamsani": { city: "Mamasani" },
    "manjil": { city: "Manjil" },
    "marivan": { city: "Marivan" },
    "markazi province": { city: "", address: "" },
    "marvdasht": { city: "Marvdasht" },
    "mashhad": { city: "Mashhad" },
    "mashhad and sabzevar": { city: "Mashhad", address: "and Sabzevar" },
    "mashhad or esfarayen": { city: "Mashhad", address: "or Esfarayen" },
    "mashour/mahshahr": { city: "Mahshahr" },
    "masjed soleyman": { city: "Masjed Soleyman" },
    "masjed-e soleyman": { city: "Masjed Soleyman" },
    "masur": { city: "Khorramabad", address: "Masur" },
    "melard": { city: "Malard" },
    "meleksahi": { city: "Malekshahi" },
    "merodشت": { city: "Marvdasht" },
    "meybod": { city: "Meybod" },
    "meymand": { city: "Meymand" },
    "mianjadeh": { city: "Karaj", address: "Mianjadeh" }, // Neighborhood
    "milajerd": { city: "Milajerd" },
    "mobarakeh": { city: "Mobarakeh" },
    "mobarakieh": { city: "Mobarakeh" },
    "mobaraké": { city: "Mobarakeh" },
    "mohammadiyeh": { city: "Mohammadiyeh" },
    "muzigoleh village": { city: "Babol", address: "Muzigoleh" },
    "nahavand": { city: "Nahavand" },
    "nain": { city: "Nain" },
    "najaf abad": { city: "Najafabad" },
    "najafabad": { city: "Najafabad" },
    "najafabad / falavarjan": { city: "Najafabad", address: "Falavarjan" },
    "narjeh": { city: "Narjeh" },
    "nasim shahr": { city: "Nasim Shahr" },
    "nasimshahr": { city: "Nasim Shahr" },
    "nazarabad": { city: "Nazarabad" },
    "neyriz": { city: "Neyriz" },
    "neyshabour": { city: "Neyshabur" },
    "neyshabur": { city: "Neyshabur" },
    "noor": { city: "Nur" },
    "noor-mazandaran": { city: "Nur" },
    "noorabad": { city: "Nurabad" },
    "noorabad mamasani": { city: "Nurabad Mamasani" },
    "noorabad mamsani": { city: "Nurabad Mamasani" },
    "northern iran (chalous": { city: "Chalous" },
    "nourabad mamasoli": { city: "Nurabad Mamasani" },
    "nowsher village": { city: "Nowshahr" }, // Actually City
    "nur": { city: "Nur" },
    "nurabad": { city: "Nurabad" },
    "nurabad mamasani": { city: "Nurabad Mamasani" },
    "nurabad mamsani": { city: "Nurabad Mamasani" },
    "pakdasht": { city: "Pakdasht" },
    "parand": { city: "Parand" },
    "pardis": { city: "Pardis" },
    "pare sar": { city: "Pareh Sar" },
    "poldokhtar": { city: "Poldokhtar" },
    "preshahr": { city: "Pareh Sar" }, // Check?
    "qaem shahr": { city: "Qaem Shahr" },
    "qaemiyeh": { city: "Chenar Shahijan" }, // Qaemiyeh is alias
    "qaemshahr": { city: "Qaem Shahr" },
    "qaimiyeh": { city: "Chenar Shahijan" },
    "qal'eh hassan khan": { city: "Qods City" },
    "qaleh hassan khan": { city: "Qods City" },
    "qarah county": { city: "", address: "Qarah County" },
    "qarchak": { city: "Qarchak" },
    "qarchak varamin": { city: "Qarchak" },
    "qasr-e shirin": { city: "Qasr-e Shirin" },
    "qazvin": { city: "Qazvin" },
    "qazvin province": { city: "", address: "" },
    "qeshm": { city: "Qeshm" },
    "qeshm island": { city: "Qeshm" },
    "qir and karzin area": { city: "Qirokarzin" },
    "qirokarzin": { city: "Qirokarzin" },
    "qods city": { city: "Qods City" },
    "qom": { city: "Qom" },
    "quds": { city: "Qods City" },
    "rafsanjan": { city: "Rafsanjan" },
    "ramsar": { city: "Ramsar" },
    "ranan": { city: "Isfahan", address: "Rahnan" }, // Rahnan is neighborhood/city
    "rasht": { city: "Rasht" },
    "razgardan near arak": { city: "Arak", address: "Razgardan" },
    "rey": { city: "Rey" },
    "robat karim": { city: "Robat Karim" },
    "rostamabad": { city: "Rostamabad" },
    "rostamkola": { city: "Rostamkola" },
    "rudbar": { city: "Rudbar" },
    "rumeshkan": { city: "Rumeshkan" },
    "rustamkola": { city: "Rostamkola" },
    "saadat shahr": { city: "Sa'adat Shahr" },
    "sabashahr": { city: "Sabashahr" },
    "sabzevar": { city: "Sabzevar" },
    "sadeh lenjan": { city: "Sadeh Lenjan" },
    "salehiyeh": { city: "Salehiyeh" },
    "saman": { city: "Saman" },
    "sari": { city: "Sari" },
    "saveh": { city: "Saveh" },
    "savojbolagh": { city: "Savojbolagh" },
    "shabad": { city: "Islamabad-e Gharb" },
    "shaft": { city: "Shaft" },
    "shahabad": { city: "Islamabad-e Gharb" },
    "shahid shahr": { city: "Shahedshahr" },
    "shahin shahr": { city: "Shahin Shahr" },
    "shahindezh": { city: "Shahindezh" },
    "shahinn shahr": { city: "Shahin Shahr" },
    "shahinshahr": { city: "Shahin Shahr" },
    "shahinshehr": { city: "Shahin Shahr" },
    "shahr-e abrisham": { city: "Abrisham" },
    "shahr-e-alvand": { city: "Alvand" },
    "shahr-e-reza": { city: "Shahreza" },
    "shahrekord": { city: "Shahrekord" },
    "shahreza": { city: "Shahreza" },
    "shahriar": { city: "Shahriar" },
    "shahriar (anjamabad village": { city: "Shahriar", address: "Anjamabad" },
    "shahriyar": { city: "Shahriar" },
    "shahrood": { city: "Shahroud" },
    "shahroud": { city: "Shahroud" },
    "shahrud": { city: "Shahroud" },
    "shahsavar": { city: "Tonekabon" },
    "shandiz": { city: "Shandiz" },
    "shazand": { city: "Shazand" },
    "shiraz": { city: "Shiraz" },
    "shirvan": { city: "Shirvan" },
    "shushtar": { city: "Shushtar" },
    "siah-kola mahalleh village": { city: "Siah Kola" },
    "siahan border region": { city: "", address: "Siahan Border Region" },
    "siyadarka village": { city: "Siah Darka" },
    "sonqor and koliai": { city: "Sonqor" },
    "sorkh": { city: "Sorkh" },
    "susangerd": { city: "Susangerd" },
    "tabriz": { city: "Tabriz" },
    "taherouye sirik": { city: "Sirik", address: "Taherouye" },
    "takestan": { city: "Takestan" },
    "talesh": { city: "Talesh" },
    "tehran": { city: "Tehran" },
    "tehran / khorasan shomali": { city: "Tehran", address: "Khorasan Shomali" },
    "tehrān-pārs": { city: "Tehran", address: "Tehranpars" },
    "tonekabon": { city: "Tonekabon" },
    "torbat-e jam": { city: "Torbat-e Jam" },
    "towhid": { city: "Towhid" },
    "unknown": { city: "", address: "" },
    "vahdat town": { city: "Vahdat" },
    "vahidieh": { city: "Vahidieh" },
    "vakilabad": { city: "", address: "Vakilabad" }, // Could be Mashhad
    "varamin": { city: "Varamin" },
    "yasuj": { city: "Yasuj" },
    "yazd": { city: "Yazd" },
    "yazdabad": { city: "Isfahan", address: "Yazdabad" },
    "yazdan-shahr": { city: "Yazdanshahr" },
    "yazdan-shahr": { city: "Yazdanshahr" },
    "yazdahshah": { city: "Yazdanshahr" },
    "yazdanshah": { city: "Yazdanshahr" },
    "yazdanshahr": { city: "Yazdanshahr" },
    "yazdanshar": { city: "Yazdanshahr" },
    "yazdshahr": { city: "Yazdanshahr" },
    "zahedan": { city: "Zahedan" },
    "zanjan": { city: "Zanjan" },
    "zarghan": { city: "Zarghan" },
    "zarinshahr": { city: "Zarrinshahr" },
    "zarneh": { city: "Zarneh" },
    "zarrinshahr": { city: "Zarrinshahr" },
    "zayandeh rud": { city: "Zayandeh Rud" },
    "zayandeh rud riverbed": { city: "Isfahan", address: "Zayandeh Rud Riverbed" },
    "zirab": { city: "Zirab" },
    "ازنا": { city: "Azna" },
    "اسفراین": { city: "Esfarayen" },

    // Persian Translations
    "تهران": { city: "Tehran" },
    "کرج": { city: "Karaj" },
    "مشهد": { city: "Mashhad" },
    "اصفهان": { city: "Isfahan" },
    "شیراز": { city: "Shiraz" },
    "رشت": { city: "Rasht" },
    "تبریز": { city: "Tabriz" },
    "اهواز": { city: "Ahvaz" },
    "اراک": { city: "Arak" },
    "ساری": { city: "Sari" },
    "گرگان": { city: "Gorgan" },
    "سنندج": { city: "Sanandaj" },
    "کرمانشاه": { city: "Kermanshah" },
    "ارومیه": { city: "Urmia" },
    "زاهدان": { city: "Zahedan" },
    "بندرعباس": { city: "Bandar Abbas" },
    "کرمان": { city: "Kerman" },
    "همدان": { city: "Hamadan" },
    "یزد": { city: "Yazd" },
    "قزوین": { city: "Qazvin" },
    "زنجان": { city: "Zanjan" },
    "خرم‌آباد": { city: "Khorramabad" },
    "بوشهر": { city: "Bushehr" },
    "بیرجند": { city: "Birjand" },
    "بجنورد": { city: "Bojnurd" },
    "شهرکرد": { city: "Shahrekord" },
    "ایلام": { city: "Ilam" },
    "سمنان": { city: "Semnan" },
    "قم": { city: "Qom" },
    "یاسوج": { city: "Yasuj" },
    "آبادان": { city: "Abadan" },
    "اسلام‌آبادغرب": { city: "Islamabad-e Gharb" },
    "اندیشمک": { city: "Andimeshk" },
    "بازار آستانه": { city: "Astaneh-ye Ashrafieh", address: "Bazaar" },
    "باغبهادران": { city: "Bagh-e Bahadoran" },
    "بهارستان": { city: "Baharestan" },
    "بهارستان اصفهان (isfahan's baharestan) / ایذه (izeh)": { city: "Baharestan", address: "Isfahan's Baharestan / Izeh" },
    "تهران یافت اباد": { city: "Tehran", address: "Yaftabad" },
    "خیابان پونک": { city: "Tehran", address: "Punak Street" },
    "زرین‌شهر": { city: "Zarrinshahr" },
    "زورابادکرج": { city: "Karaj", address: "Zourabad" },
    "زینبیه": { city: "Isfahan", address: "Zeynabieh" },
    "ستارخان": { city: "Tehran", address: "Sattarkhan" },
    "شاندیز مشهد": { city: "Mashhad", address: "Shandiz" },
    "شرق تهران ( نارمک ،هفت حوض)": { city: "Tehran", address: "East Tehran (Narmak, Haft Howz)" },
    "شهرضا": { city: "Shahreza" },
    "شهرضا (shahreza)": { city: "Shahreza" },
    "شهرضا اصفهان": { city: "Shahreza" },
    "فرديس كرج": { city: "Karaj", address: "Fardis" },
    "قلعه‌حسن‌خان": { city: "Qods City" },
    "قیر و کارزین": { city: "Qirokarzin" },
    "لاهیجان": { city: "Lahijan" },
    "لردگان": { city: "Lordegan" },
    "ماههشر": { city: "Mahshahr" },
    "محله آب‌موتور در خیابان پیروزی تهران": { city: "Tehran", address: "Ab-Motor neighborhood, Piroozi Street" },
    "محله مسکن": { city: "Kermanshah", address: "Maskan Neighborhood" }, // Usually Kermanshah context
    "مرودشت": { city: "Marvdasht" },
    "ملک‌شهر اصفهان": { city: "Isfahan", address: "Malekshahr" },
    "مهاباد": { city: "Mahabad" },
    "میبد": { city: "Meybod" },
    "نجف آباد": { city: "Najafabad" },
    "نورآباد ممسنی استان فارس": { city: "Nurabad Mamasani" },
    "نی‌ریز": { city: "Neyriz" },
    "هفشجان": { city: "Hafshejan" },
    "چالوس": { city: "Chalous" },
    "کوهدشت": { city: "Kuhdasht" },
    "یافت آباد": { city: "Tehran", address: "Yaftabad" },
    "خرمدره": { city: "Khorramdarreh" },

    // Neighborhoods & Locations -> City + Address
    "afsarieh": { city: "Tehran", address: "Afsarieh" },
    "afsariyeh": { city: "Tehran", address: "Afsariyeh" },
    "afsariyeh district": { city: "Tehran", address: "Afsariyeh District" },
    "afsariyeh neighborhood": { city: "Tehran", address: "Afsariyeh Neighborhood" },
    "afsariyeh-tehran": { city: "Tehran", address: "Afsariyeh" },
    "afseriesh": { city: "Tehran", address: "Afsarieh" },
    "androgoo boulevard": { city: "Tehran", address: "Andarzgoo Boulevard" },
    "andarzgoo boulevard": { city: "Tehran", address: "Andarzgoo Boulevard" },
    "anderazgu": { city: "Tehran", address: "Andarzgoo" },
    "andisheh": { city: "Tehran", address: "Andisheh" }, // Can be new town, usually assoc w/ Tehran/Karaj
    "andisheh township": { city: "Tehran", address: "Andisheh Township" },
    "andisheh township phase 1": { city: "Tehran", address: "Andisheh Township Phase 1" },
    "andisheh township phase 1, tehran": { city: "Tehran", address: "Andisheh Township Phase 1" },
    "andisheh township": { city: "Tehran", address: "Andisheh Township" },
    "ariashahr": { city: "Tehran", address: "Ariashahr (Sadeghieh)" },
    "ariashahr neighborhood": { city: "Tehran", address: "Ariashahr Neighborhood" },
    "ariyashahr": { city: "Tehran", address: "Ariashahr" },
    "aryashahr": { city: "Tehran", address: "Aryashahr" },
    "aryashahr (sadeghieh)": { city: "Tehran", address: "Aryashahr (Sadeghieh)" },
    "aryashahr neighborhood": { city: "Tehran", address: "Aryashahr Neighborhood" },
    "ashouri street": { city: "", address: "Ashouri Street" }, // Don't know city
    "azari avenue (presumed to be in tehran or nearby": { city: "Tehran", address: "Azari Avenue" },
    "azimieh": { city: "Karaj", address: "Azimieh" },
    "azimiyeh": { city: "Karaj", address: "Azimiyeh" },
    "baghistan": { city: "Tehran", address: "Baghestan" }, // or Karaj
    "basij boulevard": { city: "", address: "Basij Boulevard" },
    "behesht square": { city: "Tehran", address: "Behesht Square" }, // Likely Tehran
    "behesht-e zahra": { city: "Tehran", address: "Behesht-e Zahra" },
    "behesht-e zahra cemetery": { city: "Tehran", address: "Behesht-e Zahra Cemetery" },
    "chay kalan": { city: "Tabriz", address: "Chay Kalan" }, // Tabriz
    "district 20 (dolatabad)": { city: "Tehran", address: "District 20 (Dolatabad)" },
    "east tehran": { city: "Tehran", address: "East Tehran" },
    "ekbaran town": { city: "Tehran", address: "Ekbatan Town" },
    "falah": { city: "Tehran", address: "Falah" },
    "fallah": { city: "Tehran", address: "Fallah" },
    "fardis": { city: "Karaj", address: "Fardis" },
    "fardis, karaj": { city: "Karaj", address: "Fardis" },
    "fatemi square": { city: "Tehran", address: "Fatemi Square" },
    "ferdows boulevard": { city: "Tehran", address: "Ferdows Boulevard" },
    "ferdowsi boulevard": { city: "", address: "Ferdowsi Boulevard" },
    "ghaleh hassan khan": { city: "Qods City", address: "Ghaleh Hassan Khan" },
    "ghaleh-ye mir": { city: "Baharestan", address: "Ghaleh-ye Mir" },
    "ghiyamdasht": { city: "Tehran", address: "Ghiyamdasht" },
    "ghods town": { city: "Qods City" },
    "gisha": { city: "Tehran", address: "Gisha" },
    "gohardasht": { city: "Karaj", address: "Gohardasht" },
    "gohardasht, karaj": { city: "Karaj", address: "Gohardasht" },
    "golshahr": { city: "Karaj", address: "Golshahr" },
    "golshahr, karaj": { city: "Karaj", address: "Golshahr" },
    "haft howz": { city: "Tehran", address: "Haft Howz" },
    "haft howz narmak": { city: "Tehran", address: "Haft Howz, Narmak" },
    "haft hoz": { city: "Tehran", address: "Haft Howz" },
    "haft hoz police station": { city: "Tehran", address: "Haft Howz Police Station" },
    "haft tir area": { city: "Tehran", address: "Haft Tir Area" },
    "haft-howz": { city: "Tehran", address: "Haft Howz" },
    "haft-e howz": { city: "Tehran", address: "Haft Howz" },
    "hasan ghorbani street": { city: "", address: "Hasan Ghorbani Street" },
    "her home parking lot": { city: "", address: "Home Parking Lot" },
    "hesar": { city: "Karaj", address: "Hesar" },
    "hesar, karaj": { city: "Karaj", address: "Hesar" },
    "hesaraki": { city: "Karaj", address: "Hesar" },
    "hessarak": { city: "Karaj", address: "Hessarak" },
    "imamat area": { city: "Tehran", address: "Imamat Area" },
    "isfahan (baboukan)": { city: "Isfahan", address: "Baboukan" },
    "isfahan (baharestan)": { city: "Isfahan", address: "Baharestan" },
    "isfahan (zeynabieh)": { city: "Isfahan", address: "Zeynabieh" },
    "isfahan / laleh": { city: "Isfahan", address: "Laleh" },
    "isfahan, steel city (فولادشهر)": { city: "Isfahan", address: "Fooladshahr" },
    "jafarabad area": { city: "Karaj", address: "Jafarabad" }, // Likely Karaj or others, usually Karaj in this context
    "joyaabad": { city: "Isfahan", address: "Joyaabad" },
    "juyabad": { city: "Isfahan", address: "Juyabad" },
    "kaj square": { city: "Tehran", address: "Kaj Square" },
    "kamalshehr": { city: "Karaj", address: "Kamalshahr" },
    "karaj (taleghani)": { city: "Karaj", address: "Taleghani" },
    "karaj, alborz": { city: "Karaj" },
    "karaj, mespah neighborhood": { city: "Karaj", address: "Mespah neighborhood" },
    "karaj/qazvin area": { city: "Karaj" },
    "kermanshah (elyeh neighborhood)": { city: "Kermanshah", address: "Elyeh neighborhood" },
    "kermanshah (specifically in shahrak-e moalem": { city: "Kermanshah", address: "Shahrak-e Moalem" },
    "khuzestan province": { city: "", address: "" }, // Province not city
    "khaniabad": { city: "Tehran", address: "Khaniabad" },
    "khazaneh neighborhood": { city: "Tehran", address: "Khazaneh neighborhood" },
    "kian shahr": { city: "Tehran", address: "Kianshahr" }, // Could be Ahvaz too, default Tehran for now unless collision
    "kianmehr": { city: "Karaj", address: "Kianmehr" },
    "kianshahr": { city: "Tehran", address: "Kianshahr" },
    "kianshar": { city: "Tehran", address: "Kianshahr" },
    "lakan prison": { city: "Rasht", address: "Lakan Prison" },
    "mahallati (bagh-e gol neighborhood)": { city: "Tehran", address: "Mahallati, Bagh-e Gol" },
    "mahdasht": { city: "Karaj", address: "Mahdasht" },
    "majidieh": { city: "Tehran", address: "Majidieh" },
    "majidiyeh": { city: "Tehran", address: "Majidiyeh" },
    "malekshahr": { city: "Isfahan", address: "Malekshahr" },
    "marlick": { city: "Melard", address: "Marlik" },
    "marlik": { city: "Melard", address: "Marlik" },
    "marlik (near malard)": { city: "Melard", address: "Marlik" },
    "marlik town": { city: "Melard", address: "Marlik" },
    "marzdaran": { city: "Tehran", address: "Marzdaran" },
    "mashhad (sayyad street)": { city: "Mashhad", address: "Sayyad Street" },
    "mehrabad": { city: "Tehran", address: "Mehrabad" }, // Could be others
    "mehrshahr": { city: "Karaj", address: "Mehrshahr" },
    "mehrville area": { city: "Karaj", address: "Mehrshahr" },
    "meshkindasht": { city: "Karaj", address: "Meshkindasht" },
    "meydan-e haft-e howz": { city: "Tehran", address: "Haft Howz Square" },
    "meydan-e har": { city: "Tehran", address: "Hor Square" },
    "meydan-e kaj": { city: "Tehran", address: "Kaj Square" },
    "meydan-e moallem": { city: "Tehran", address: "Moallem Square" },
    "mishirieh (near police station 196)": { city: "Tehran", address: "Moshirieh" },
    "mohammadshahr": { city: "Karaj", address: "Mohammadshahr" },
    "mohammadshahr, karaj": { city: "Karaj", address: "Mohammadshahr" },
    "moshirieh": { city: "Tehran", address: "Moshirieh" },
    "motahari street": { city: "", address: "Motahari Street" },
    "naelbandan bazaar (gorgan)": { city: "Gorgan", address: "Naelbandan Bazaar" },
    "narmak": { city: "Tehran", address: "Narmak" },
    "narmak neighborhood": { city: "Tehran", address: "Narmak" },
    "nazabad": { city: "Tehran", address: "Nazi Abad" },
    "nazabad behesht square": { city: "Tehran", address: "Nazi Abad, Behesht Square" },
    "nazi abad": { city: "Tehran", address: "Nazi Abad" },
    "nazi abad square": { city: "Tehran", address: "Nazi Abad Square" },
    "nazi-abad district": { city: "Tehran", address: "Nazi Abad" },
    "naziaabad": { city: "Tehran", address: "Nazi Abad" }, // typo
    "near sohrevardi": { city: "Tehran", address: "Sohrevardi" },
    "near vanak square": { city: "Tehran", address: "Near Vanak Square" },
    "nezamabad": { city: "Tehran", address: "Nezamabad" },
    "niavaran": { city: "Tehran", address: "Niavaran" },
    "niroo daryaee neighborhood": { city: "Rasht", address: "Niroo Daryaee" }, // Usually Rasht
    "not specified": { city: "", address: "" },
    "parand": { city: "Parand" }, // New city near Tehran
    "pasargad building": { city: "", address: "Pasargad Building" },
    "pasdaran": { city: "Tehran", address: "Pasdaran" },
    "piroozi": { city: "Tehran", address: "Piroozi" },
    "piroozi neighborhood": { city: "Tehran", address: "Piroozi" },
    "pirouzi neighborhood": { city: "Tehran", address: "Piroozi" },
    "punak": { city: "Tehran", address: "Punak" },
    "qasemabad, mashhad": { city: "Mashhad", address: "Qasemabad" },
    "qezel hesar prison": { city: "Karaj", address: "Qezel Hesar Prison" },
    "qiamdasht, near pakdasht": { city: "Tehran", address: "Qiamdasht" },
    "qods city (galeh hassan)": { city: "Qods City" },
    "qods city (qaleh hassan khan)": { city: "Qods City" },
    "robait karim": { city: "Robat Karim" },
    "sa'adat abad": { city: "Tehran", address: "Sa'adat Abad" },
    "sa'idabad": { city: "Tehran", address: "Sa'idabad" },
    "saadat abad": { city: "Tehran", address: "Saadat Abad" },
    "saadat abad, kaj square": { city: "Tehran", address: "Saadat Abad, Kaj Square" },
    "sabzdasht": { city: "Baharestan", address: "Sabzdasht" },
    "sadeghieh": { city: "Tehran", address: "Sadeghieh" },
    "sadeghieh (opposite ibn sina hospital)": { city: "Tehran", address: "Sadeghieh (Opposite Ibn Sina Hospital)" },
    "sadeghieh area": { city: "Tehran", address: "Sadeghieh Area" },
    "sadeghieh square": { city: "Tehran", address: "Sadeghieh Square" },
    "sadeghiyeh": { city: "Tehran", address: "Sadeghiyeh" },
    "sadeghiyeh square": { city: "Tehran", address: "Sadeghiyeh Square" },
    "salasabil": { city: "Tehran", address: "Salsabil" },
    "salsabil": { city: "Tehran", address: "Salsabil" },
    "salsabil neighborhood": { city: "Tehran", address: "Salsabil" },
    "sarcheshmeh street": { city: "", address: "Sarcheshmeh Street" },
    "sattarkhan street": { city: "Tehran", address: "Sattarkhan Street" },
    "sattarkhan neighborhood": { city: "Tehran", address: "Sattarkhan Neighborhood" },
    "saveh road": { city: "Tehran", address: "Saveh Road" },
    "shad abad": { city: "Tehran", address: "Shad Abad" },
    "shadabad": { city: "Tehran", address: "Shadabad" },
    "shahinvilla": { city: "Karaj", address: "Shahinvilla" },
    "shahr-e andisheh": { city: "Tehran", address: "Andisheh" },
    "shahr-e jadid-e andisheh phase 3": { city: "Tehran", address: "Andisheh Phase 3" },
    "shahr-e qods": { city: "Qods City" },
    "shahr-e rey": { city: "Rey" },
    "shahr-e ziba": { city: "Tehran", address: "Shahr-e Ziba" },
    "shahrak ghaemiyeh": { city: "Tehran", address: "Shahrak Ghaemiyeh" },
    "shahrak-e andisheh": { city: "Tehran", address: "Andisheh" },
    "shahrak-e gharb": { city: "Tehran", address: "Shahrak-e Gharb" },
    "shahrak-e razaviye karavan": { city: "Tehran", address: "Shahrak-e Razaviye Karavan" },
    "shahrqods": { city: "Qods City" },
    "sohrevardi": { city: "Tehran", address: "Sohrevardi" },
    "south mehrabad": { city: "Tehran", address: "South Mehrabad" },
    "tabarsi north police station": { city: "Mashhad", address: "Tabarsi North Police Station" },
    "tehran (ariashahr": { city: "Tehran", address: "Ariashahr" },
    "tehran (ariashahr/sadeghiyeh area)": { city: "Tehran", address: "Ariashahr/Sadeghiyeh" },
    "tehran (baghershah square)": { city: "Tehran", address: "Baghershah Square" },
    "tehran (ghaleh hassan khan district)": { city: "Qods City", address: "Ghaleh Hassan Khan" },
    "tehran (golchin neighborhood)": { city: "Tehran", address: "Golchin" },
    "tehran (haft houz area)": { city: "Tehran", address: "Haft Houz" },
    "tehran (narmak": { city: "Tehran", address: "Narmak" },
    "tehran (narmak district)": { city: "Tehran", address: "Narmak" },
    "tehran (narmak/dardasht neighborhood)": { city: "Tehran", address: "Narmak/Dardasht" },
    "tehran (parand)": { city: "Parand" },
    "tehran (piroozi street)": { city: "Tehran", address: "Piroozi Street" },
    "tehran (saadat abad)": { city: "Tehran", address: "Saadat Abad" },
    "tehran (satar khan)": { city: "Tehran", address: "Sattarkhan" },
    "tehran (sattarkhan district)": { city: "Tehran", address: "Sattarkhan" },
    "tehran (setareh khan area": { city: "Tehran", address: "Sattarkhan" },
    "tehran (tehranpars": { city: "Tehran", address: "Tehranpars" },
    "tehran (tehranpars district)": { city: "Tehran", address: "Tehranpars" },
    "tehran (tehranpars neighborhood)": { city: "Tehran", address: "Tehranpars" },
    "tehran (tehranpars, third circle)": { city: "Tehran", address: "Tehranpars, Third Circle" },
    "tehran (likely": { city: "Tehran" },
    "tehran (originally from salehiyeh": { city: "Tehran", address: "Originally from Salehiyeh" },
    "tehran bazaar area": { city: "Tehran", address: "Bazaar" },
    "tehran narmak": { city: "Tehran", address: "Narmak" },
    "tehran and karaj": { city: "Tehran" }, // Roughly
    "tehran or karaj": { city: "Tehran" },
    "tehran or mashhad": { city: "Tehran" },
    "tehran or rey": { city: "Tehran" },
    "tehran suburbs": { city: "Tehran" },
    "tehran, amiriyeh": { city: "Tehran", address: "Amiriyeh" },
    "tehran, enghelab street": { city: "Tehran", address: "Enghelab Street" },
    "tehran, karaj": { city: "Tehran" },
    "tehran-pars": { city: "Tehran", address: "Tehranpars" },
    "tehranpars": { city: "Tehran", address: "Tehranpars" },
    "tehranpars park": { city: "Tehran", address: "Tehranpars Park" },
    "tehranpars district": { city: "Tehran", address: "Tehranpars" },
    "tehranpars, iran": { city: "Tehran", address: "Tehranpars" },
    "tehransar": { city: "Tehran", address: "Tehransar" },
    "tehran\u200c-pars": { city: "Tehran", address: "Tehranpars" },
    "valiasr town": { city: "Tehran", address: "Valiasr Town" }, // Could be others, likely Tehran/Karaj
    "vali-e-asr township": { city: "Tehran", address: "Valiasr Township" },
    "vavan": { city: "Islamshahr", address: "Vavan" },
    "vayen": { city: "Shahriar", address: "Vayen" },
    "vilashahr": { city: "Najafabad", address: "Vilashahr" },
    "west tehran": { city: "Tehran", address: "West Tehran" },
    "yaftabad": { city: "Tehran", address: "Yaftabad" },
    "yafteh abad": { city: "Tehran", address: "Yaftabad" },
    "yousef abad": { city: "Tehran", address: "Yousef Abad" },
    "yusefabad": { city: "Tehran", address: "Yousef Abad" },
    "zaynabieh": { city: "Isfahan", address: "Zeynabieh" },
    "zeinabiyeh": { city: "Isfahan", address: "Zeynabieh" },
    "zeynabieh": { city: "Isfahan", address: "Zeynabieh" },
    "zibashahr": { city: "Qazvin", address: "Zibashahr" },
};

function normalizeCity(input) {
    if (!input) return { city: "", address: "" };
    let clean = input.trim();
    if (!clean) return { city: "", address: "" };

    const lower = clean.toLowerCase();

    // 1. Literal full matches
    if (specificMappings[lower]) {
        const mapped = specificMappings[lower];
        return {
            city: mapped.city,
            address: mapped.address ? mapped.address : (mapped.address === "preserve" ? clean : "")
        };
    }

    // 2. Contains parenthesis -> split
    if (clean.includes('(')) {
        const match = clean.match(/^([^(]+)\s*\(([^)]+)\)/);
        if (match) {
            let cityName = match[1].trim();
            const extra = match[2].trim();

            // Check extracted city name
            const lowerCity = cityName.toLowerCase();
            if (specificMappings[lowerCity]) {
                cityName = specificMappings[lowerCity].city;
            }

            return { city: cityName, address: extra };
        }
    }

    // 3. Contains comma -> split
    if (clean.includes(',')) {
        const parts = clean.split(',');
        let p1 = parts[0].trim();
        const p2 = parts.slice(1).map(s => s.trim()).join(', ');

        const lowerP1 = p1.toLowerCase();
        if (specificMappings[lowerP1]) {
            p1 = specificMappings[lowerP1].city;
        }

        return { city: p1, address: p2 };
    }

    // 4. Default Check for Persian
    if (isPersian(clean)) {
        // Enforce English-only cities
        return { city: "", address: clean };
    }

    // 5. Default Pass-through
    return { city: clean, address: "" };
}

async function main() {
    console.log('Standardizing cities with enhanced mappings...');
    const files = fs.readdirSync(VICTIMS_DIR).filter(f => f.endsWith('.yaml') && f.startsWith('vic-'));
    let modifiedCount = 0;

    for (const file of files) {
        const filePath = path.join(VICTIMS_DIR, file);
        let content = fs.readFileSync(filePath, 'utf-8');
        let data;
        try {
            data = yaml.load(content);
        } catch (e) { continue; }

        if (!data) continue;

        const originalCity = data.incident_city;
        if (originalCity) {
            const { city, address, warning } = normalizeCity(originalCity);

            let changed = false;

            // Update city if it's different (including clearing it)
            if (city !== originalCity) {
                // Determine logic: 
                // data.incident_city = city;
                // BUT wait, if we cleared city, we moved it to address.
                // If original was "Tehran (Narmak)", New City="Tehran", New Address="Narmak".
                // If original was "Narmak", New City="Tehran", New Address="Narmak".

                // If the new city is empty and original wasn't, we are clearing it.
                data.incident_city = city;
                changed = true;
            }

            // Append address if new data found
            if (address) {
                const currentAddr = data.incident_address || "";
                // Prevent duplicate appending if script runs twice
                if (!currentAddr.includes(address)) {
                    data.incident_address = currentAddr ? `${currentAddr}, ${address}` : address;
                    changed = true;
                }
            }

            if (changed) {
                const newHeader = `# ==========================================\n# Victim Documentation - ${data.name || 'Unknown'}\n# ==========================================\n\n`;
                const newContent = newHeader + yaml.dump(data, { lineWidth: -1 });
                fs.writeFileSync(filePath, newContent);
                modifiedCount++;
            }
        }
    }
    console.log(`Finished. Modified ${modifiedCount} files.`);
}

main().catch(console.error);
