---
title: Hlanganisa nge-LandXML
summary: Vula i-LandXML evela kwezinye izinhlelo zomhlaba njengephrojekthi entsha, uthumele amaphoyinti, umphezulu, imizila, amaphrofayili nenethiwekhi yamapayipi njenge-LandXML 1.2, futhi wazi okungayi lapho.
keywords: landxml, xml, ngenisa, thumela, hlanganisa, tin, umphezulu, umzila, iphrofayili, inethiwekhi yamapayipi, ukusebenzisana, ukwabelana ngedatha
from: 870d5ece
---

LandXML ukwakheka okuvulekile lokuhlanganisa okusetshenziswa izinhlelo eziningi zomhlaba. I-CivilCraft ifunda futhi ibhale i-LandXML 1.2. Uma usebenzise i-Civil 3D, izingxoxo zayo zokungenisa nokuthumela yiyona efana kakhulu; lapha akukho okukhethwayo, nezaziso zikutshela okushiywe.

## Vula ifayela le-LandXML

1. Chofoza {{ui:Vula}} (noma cindezela {{key:Mod+O}}) ukhethe ifayela `.xml` noma `.landxml`, noma liphonse epulanini.
2. Uma iprojekthi yamanje inezinguquko ezingalondolozwanga, i-CivilCraft iyabuza kuqala. Khetha {{ui:Londoloza ikhophi}}, {{ui:Ungalondolozi}} noma {{ui:Khansela}}.
3. **Iprojekthi entsha** iyenziwa. Ibha yesimo itshela okufundiwe, isibonelo "Ivuliwe site.xml: amaphoyinti angu-412, imiphezulu emi-2, imizila emi-3."
4. Bheka ibhokisi ngaphansi kwe-**Umphezulu** izinto. Lidwebe konke okushiywe noma okushintshiwe, isibonelo:
   - "Umphezulu wokuqala kuphela ("EG") ovulwe; ifayela linomunye."
   - "Umzila "Ramp A" unezakhi i-CivilCraft engakwazi ukudweba kwanamanje (hhayi imigqa, amajika noma izinsila ze-clothoid); ushiywe."
   - "Imithetho yenethiwekhi yamapayipi ayikho efayeleni; izibambi zendawo zisasetshenziswa — setha ezakho ngaphansi kwe-Iphrojekthi."

Okufakwe kukho:

| Esifayeleni | Ku-CivilCraft |
|---|---|
| Iyunithi (Imperial noma Metric) | **Iyunithi** yeprojekthi (amafidi noma imitha) |
| Igama leprojekthi | **Igama** leprojekthi |
| CgPoints | Amaphoyinti eprojekthi; incazelo (noma ikhodi) inikeza iqembu |
| Umphezulu we-TIN wokuqala | Umhlaba okhona, usetshenziswa njengoba unjalo ("Surface (from LandXML)") |
| Yonke imizila yemigqa, amajika nezinsila ze-clothoid | Umzila onama-PI, imisongo nezinsila ezakhiwe kabusha kusuka emajikeni |
| Iphrofayili yokwakha yokuqala yomzila ngamunye | Iphrofayili yawo yokwakha, namajika aqondile athe xaxa |
| Inethiwekhi yamapayipi yokuqala | Inethiwekhi yamapayipi, namaphethelo, nama-sump namaInvert |
| Izakhi zeplani zemigqa namajika | Imigqa yezici, namajika agcinwa; ezivela kwezinye izinhlelo ziqala njenge-**Kudwetshwe kuphela** |

Uhlu olugcwele lwezakhi nezici lutholakala ku-[LandXML: okufundwayo nokubhalwayo](topic:landxml-reference).

:::note
Umphezulu ofundwe kwi-LandXML awakhiwa kabusha uma ushintsha amaqembu amaphoyinti noma udweba imigqa yokuhlukanisa. Chofoza {{ui:Akha kabusha indawo kumaphoyinti}} ngaphansi kwe-**Umphezulu** ukuze wakhe kusuka kumaphoyinti esikhundleni salokho ({{key:Mod+Z}} ibuyisa umphezulu we-LandXML).
:::

## Thumela i-LandXML

1. Chofoza {{ui:LandXML}} eqenjini **Thumela**.
2. Isiphequluli sikhipha `<name>.xml`. Ibha yesimo itshela okufakiwe, isibonelo "Kuthunyelwe i-LandXML 1.2: amaphoyinti angu-276, imiphezulu emi-2, umzila o-1, inethiwekhi yamapayipi. Amapad awasiyingxenye ye-LandXML lapha; umphezulu oqoshiwe uyiwo."

Ifayela liqukethe:

- **Iyunithi**: amafidi e-US survey noma imitha.
- **CgPoints**: wonke amaphoyinti negama lawo njengenombolo, incazelo nequmbu njengekhodi.
- **Surfaces**: umhlaba okhona njenge-TIN, nemigqa yokuhlukanisa nomngcele wangaphandle njengedatha yomthombo; futhi, uma amapad noma imigwaqo ilinganiswa, umphezulu wesibili we-TIN ogama lawo ngu-"Proposed".
- **Alignments**: imigqa, amajika nezinsila ze-clothoid namasiteshi awo, ngalinye linephrofayili equkethe umhlaba okhona osampulelwe kuwo kanye neprofayili yokwakha (ama-PVI namajika aphindwe ngokwe-parabola) uma inama-PVI amabili noma ngaphezulu.
- **PipeNetworks**: izakhiwo nemiphetho, isumpu nokuphakama kwe-invert ngepayipi ngalinye, namapayipi anobubanzi, ubude nethambeka.
- **PlanFeatures**: yonke imigqa yezici njengemigqa namajika nokuphakama ngasemaphethelweni ngamunye, nokuthi isetshenziselwani.

## Okungayi lapho

- Amapad nemigwaqo njengezinto. Umphumela wazo usemphezulwini othi "Proposed".
- Imizila enamaphutha (isibonelo amajika agqumile): ayishiywa, futhi ibalwa emyalezweni wesimo.
- Amapayipi angenawo womabili ama-invert, nenethiwekhi enezakhiwo ezimbalwa kunezimbili.
- Umphetho othathwe emphezulwini ubhalwa njengophetho oluqinile. Uma kuvulwa futhi, isakhiwo sigcina leyonombolo noma sishintsha umphezulu.
- Imithetho yenethiwekhi (ithambeka elincane, ukumbozwa, ukwehla): i-LandXML ayinendawo yazo.
- Izilungiselelo zokubonisa namakhetho omphezulu wamaqembu amaphoyinti: gcina iprojekthi ye-CivilCraft lapho lezo zinto.
- Lapho kuvulwa, i-CivilCraft ayifundi izinsila ezingesona i-clothoid, amagridi emiphezulu, amaphoyinti abhekisela kwamanye amaphoyinti kuphela, amapaseli, izinsila zezici zeplani, imigwaqo noma idatha yokuhlola. Okunye ngakunye kubalwa emanothini, akukaze kuqagelwe.

## Ukuhamba kabili

Ukuze uthumele umsebenzi kumuntu osebenzisa ezinye izinhlelo zomhlaba futhi uwuthole ubuyele, thumela i-LandXML, vumela bawuhlele, bese uvula i-LandXML yabo njengephrojekthi entsha. Gcina nefayela lakho le-`.civilcraft.json`: yilo kuphela elibamba konke i-CivilCraft yazi.
