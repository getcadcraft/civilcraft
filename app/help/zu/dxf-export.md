---
title: Thumela ipulani ibe yi-DXF
summary: Bhala imigqa yepulani njenge-DXF ye-R12 ezingqimbeni ezinamagama, namakhonthuwa ezinkomba zawo nemigqa yokuphula nge-3D, kunoma iyiphi inhlelo ye-CAD.
keywords: dxf, dwg, cad, thumela, imigqa, r12, 2000, 2004, 2007, 2010, 2013, 2018, izingqimba, amakhonthuwa, ukushintshana komdwebo, imephu yesisekelo, isizinda
from: f2d8ede9
---

{{ui:DXF}} ibhala okubonwa yipulani njengefayela le-DXF kufomethi ye-R12, inguqulo evulwa yiwo wonke amahlelo e-CAD. Uma usuke wasebenzisa i-AutoCAD noma i-Civil 3D, vula noma faka lo njengoba ungenza nganoma yiliphi i-DXF.

## Thumela

1. Lungisa ipulani ngendlela ofuna ngayo umdwebo: ngaphansi kwe-**Isibonisi**, khetha umphezulu (owekhona noma owenziwe), isikhala samakhonthuwa, nokuthi yiziphi izinto ezivulekile (amakhonthuwa, amalebula, amaphoyinti, amalebula amaphoyinti, onxantathu, imigqa yokuphula, umphetho womphezulu, amapayipi, izimpandla zethambeka).
2. Chofoza {{ui:DWG/DXF}} kweqembu le-**Thumela** bese ukhetha {{ui:DXF (R12, umbhalo) — ifayela elijwayelekile lokushintshana}}, bese {{ui:Landa}}.
3. Isiphequluli silanda `<name>.dxf`. Ibha yesimo ithi, isibonelo, "Kuthunyelwe i-R12 DXF: izinto ezingu-2,140; amalebula alinganiselwe ku-1" = 40'. Amabhendi awathunyelwe."

Izixhumanisi zibhalwa ngamayunithi wephrojekthi yakho, ngamanani azo angempela (izixhumanisi zendiza yesifunda zihlala njengoba zinjalo). Akukho okulinganiswa noma okuhanjiswa.

## Okusemfayeleni

| Into | Isinto se-DXF | Ungqimba |
|---|---|---|
| Amakhonthuwa amancane namakhulu | Iphola-layini ye-2D ngezinga layo | C-TOPO-MINR, C-TOPO-MAJR |
| Amalebula amakhonthuwa | Umbhalo | C-TOPO-TEXT |
| Onxantathu | Iphola-layini | C-TOPO-TINN |
| Imigqa yokuphula nomngcele | Iphola-layini ye-3D | C-TOPO-BRKL |
| Umphetho womphezulu | Iphola-layini | C-TOPO-BNDY |
| Izimpandla zethambeka | Iphola-layini | C-TOPO-SLOP |
| Amaphoyinti okuhlola namalebula awo | Amaphoyinti (anokuphakama), umbhalo | V-NODE, V-NODE-TEXT |
| Imigqa evela kumakhodi womugqa | Iphola-layini ye-3D | V-NODE-LINE |
| Imigqa emaphakathi womzila | Imigqa namajika | C-ROAD-CNTR |
| Amatiki okubalwa kwesiteshi namalebula | Iphola-layini, umbhalo | C-ROAD-STAN |
| Imiphetho yekhoridoro | Iphola-layini | C-ROAD-CORR |
| Imigqa yesampula | Iphola-layini | C-ROAD-SCTN |
| Amaphedi, imigqa yokukhanya kwemini, imigqa yethambeka | Iphola-layini | C-GRAD-PADS, C-GRAD-DAYL, C-GRAD-SLOP |
| [Imigqa ye-feature line](topic:feature-lines) | Iphola-layini ye-3D (amajika njengezingcezu ngaphakathi kuka-0.01; bona [Imigqa ye-feature line](topic:feature-lines)) | C-GRAD-FEAT |
| Izindlela zokuphenduka | Iphola-layini, umbhalo | C-ROAD-SWPT |
| Amapayipi, izakhiwo, amalebula | Iphola-layini, umbhalo | C-STRM-PIPE, C-STRM-STRC, C-STRM-TEXT |
| Amapayipi nezakhiwo ezinenkinga | Iphola-layini | C-STRM-PROB |

Ungqimba ngalunye linombala walo. Uhlu olugcwele lutholakala ku-[Izingqimba zepulani](topic:plan-layers).

## Usayizi wamalebula

Umbhalo kufanele ube nosayizi ngamayunithi omdwebo. I-CivilCraft ilinganisa amalebula ngesikali lapho ipulani yonke ilingana ngaphakathi kweshidi le-Tabloid (amafidi) noma eshidini le-A3 (amamitha), futhi ibonise isikali kumyalezo wesimo. Uma uphrinta ngesinye isikali ohlelweni lwakho lwe-CAD, lilinganise umbhalo khona lapho.

## Okungathunyelwe

- Amabhendi okuphakama (esikrinini kuphela).
- Umbono wephrofayili. Amaphrofayili athunyelwa njenge-LandXML, hhayi njengomdwebo.
- Umphezulu uqobo njengento ye-3D. Sebenzisa i-LandXML ye-TIN, noma vula {{ui:Onxantathu}} ukuze uthole imiphetho yawo njengemigqa.
- Noma yini oyicimile ngaphansi kwe-**Isibonisi**.

## DWG

{{ui:DWG/DXF}} ibhala futhi imigqa efanayo njengomdwebo we-DWG. Ingxoxo yayo ibuza ifomethi: i-DXF, noma i-DWG ka-2000, 2004, 2007, 2010, 2013 noma 2018. Ka-2000 uvula kunoma yiluphi uhlelo lwe-CAD, olwendabuko nolwamanje; khetha okusha uma lowo ozothola umdwebo ekucela. Ukukhetha kwakho kukhunjulwa kusiphequluli esi.

1. Chofoza {{ui:DWG}} kweqembu le-**Thumela**.
2. Khetha i-**Ifomethi** bese uchofoza **Landa i-DWG**.
3. Isiphequluli silanda `<name>.dwg`. Ibha yesimo ichaza okufakiwe, isibonelo "Kuthunyelwe i-DWG (ifomethi ka-2018): iphola-layini ezingu-12, amalebula angu-40 ezingqimbeni ezingu-9".

I-DWG inezingqimba, imibala, amakhonthuwa (njengeziphola-layini ezingeni layo), imigqa yokuphula ye-3D, amalebula namaphoyinti afanayo nalawo e-DXF, ezixhumanisweni ezifanayo. Amagama ezingqimba angakwazi ukugcinwa yi-DWG ayashintshwa, futhi umyalezo wesimo uyakutshela lokho. I-CivilCraft ibhala i-DWG ngekhodi yayo, ngakho akukho okushiya ikhompyutha yakho.

### Izingqimba zemephu ku-DWG

Umdwebo we-DWG awukwazi ukugcina isithombe ngaphakathi kwawo: amahlelo e-CAD akhombisa isithombe esihlala ecaleni komdwebo. Uma izingqimba zemephu zibonakala, ingxoxo inikeza i-**Izingqimba zemephu njengesithombe ecaleni komdwebo**. Uma lokhu kukhethiwe, ukulanda kuba ifayela le-`.zip` elinezinto ezintathu: `<name>.dwg`, `<name>-map.png` (izingqimba zemephu phezu komdwebo wonke, kufika ku-4,096 wamapikseli ububanzi) kanye ne-`<name>-map.pgw` (ifayela lawo lomhlaba, lezinhlelo ze-GIS). Umdwebo ubonisa isithombe njengesithombe esisesigabeni G-MAP-IMAG, endaweni yaso. Khipha amafayela ufake efolda eyodwa futhi uwagcine ndawonye.
