---
title: Eksportuoti planą į DXF
summary: Įrašyti plano linijas kaip R12 DXF su pavadintais sluoksniais, horizontalės su kotomis ir lūžio linijos 3D erdvėje, bet kuriai CAD programai.
keywords: dxf, dwg, cad, eksportas, linijos, r12, 2000, 2004, 2007, 2010, 2013, 2018, sluoksniai, horizontalės, brėžinių mainai, pagrindinis žemėlapis, fonas
from: f2d8ede9
---

{{ui:DXF}} įrašo tai, ką rodo planas, į DXF failą R12 formatu – versiją, kurią atidaro kiekviena CAD programa. Jei naudojate AutoCAD ar Civil 3D, atidarykite arba įterpkite jį kaip bet kurį kitą DXF.

## Eksportavimas

1. Nustatykite planą taip, kaip norite brėžinio: skiltyje **Rodymas** pasirinkite paviršių (esamą ar projektuojamą), horizontalių intervalą ir tai, kas įjungta (horizontalės, žymos, taškai, taškų žymos, {{ui:Trikampiai}}, {{ui:Lūžio linija}}, paviršiaus kraštas, vamzdžiai, nuolydžio rodyklės).
2. Spustelėkite {{ui:DWG/DXF}} grupėje **Eksportuoti** ir pasirinkite {{ui:DXF (R12, tekstinis) — paprastas mainų failas}}, tada {{ui:Atsisiųsti}}.
3. Naršyklė atsisiunčia `<name>.dxf`. Būsenos juosta, pavyzdžiui, rodo: „Eksportuotas R12 DXF: 2,140 objektų; užrašai pritaikyti 1" = 40'. Juostos neeksportuojamos."

Koordinatės įrašomos projekto vienetais, tikromis reikšmėmis (valstybinės plokštumos koordinatės lieka tokios, kokios yra). Niekas nekeičiama ir nepaslenkama.

## Ką turi failas

| Objektas | DXF elementas | Sluoksnis |
|---|---|---|
| Mažosios ir didžiosios horizontalės | 2D polilinijos jų kotose | C-TOPO-MINR, C-TOPO-MAJR |
| Horizontalių žymos | Tekstas | C-TOPO-TEXT |
| Trikampiai | Polilinijos | C-TOPO-TINN |
| Lūžio linijos ir riba | 3D polilinijos | C-TOPO-BRKL |
| Paviršiaus kraštas | Polilinijos | C-TOPO-BNDY |
| Nuolydžio rodyklės | Polilinijos | C-TOPO-SLOP |
| Geodeziniai taškai ir jų žymos | Taškai (su kota), tekstas | V-NODE, V-NODE-TEXT |
| Linijos pagal linijų kodus | 3D polilinijos | V-NODE-LINE |
| Trasos ašys | Linijos ir lankai | C-ROAD-CNTR |
| Kilometražo brūkšneliai ir žymos | Polilinijos, tekstas | C-ROAD-STAN |
| Koridoriaus kraštai | Polilinijos | C-ROAD-CORR |
| Pjūvių linijos | Polilinijos | C-ROAD-SCTN |
| Aikštelės, dienos šviesos linijos, nuolydžio linijos | Polilinijos | C-GRAD-PADS, C-GRAD-DAYL, C-GRAD-SLOP |
| Charakteristinės linijos | 3D polilinijos (lankai – atkarpomis, ne toliau kaip 0,01; žr. [Charakteristinės linijos](topic:feature-lines)) | C-GRAD-FEAT |
| Važiavimo trajektorijos | Polilinijos, tekstas | C-ROAD-SWPT |
| Vamzdžiai, konstrukcijos, žymos | Polilinijos, tekstas | C-STRM-PIPE, C-STRM-STRC, C-STRM-TEXT |
| Vamzdžiai ir konstrukcijos su problemomis | Polilinijos | C-STRM-PROB |

Kiekvienas sluoksnis turi spalvą. Visas sąrašas – [Plano sluoksniai](topic:plan-layers).

## Žymų dydis

Tekstas turi turėti dydį brėžinio vienetais. CivilCraft pritaiko žymas masteliui, kuriame visas planas telpa ant Tabloid lapo (pėdos) arba A3 lapo (metrai), ir būsenos pranešime nurodo mastelį. Jei CAD programoje braižote kitu mastelių, tekstą pakeiskite ten.

## Kas neeksportuojama

- Kotų juostos (tik ekrane).
- Profilio vaizdas. Profiliai eksportuojami kaip LandXML, ne kaip brėžinys.
- Pats paviršius kaip 3D objektas. Naudokite LandXML TIN arba įjunkite {{ui:Trikampiai}}, kad gautumėte jo kraštines kaip linijas.
- Viskas, ką išjungėte skiltyje **Rodymas**.

## DWG

{{ui:DWG/DXF}} įrašo tas pačias linijas ir kaip DWG brėžinį. Jo dialogas klausia formato: DXF arba DWG 2000, 2004, 2007, 2010, 2013 arba 2018. 2000 atidaro beveik kiekviena CAD programa, senos ir naujos; pasirinkite naujesnį, kai to paprašo brėžinį gaunantis asmuo. Jūsų pasirinkimas įsimenamas šioje naršyklėje.

1. Spustelėkite {{ui:DWG}} grupėje **Eksportuoti**.
2. Pasirinkite **Formatas** ir spustelėkite **Atsisiųsti DWG**.
3. Naršyklė atsisiunčia `<name>.dwg`. Būsenos juosta nurodo, kas įtraukta, pavyzdžiui: „Eksportuotas DWG (2018 formatas): 12 polilinijų, 40 žymų 9 sluoksniuose".

DWG turi tuos pačius sluoksnius, spalvas, horizontales (kaip polilinijas jų kotose), 3D lūžio linijas, žymas ir taškus kaip DXF, tomis pačiomis koordinatėmis. Sluoksnių pavadinimai, kurių DWG negali talpinti, pakeičiami, ir apie tai pranešama būsenos pranešime. CivilCraft DWG rašo savo kodu, todėl niekas nepalieka jūsų kompiuterio.

### Žemėlapio sluoksniai DWG

DWG brėžinio viduje negalima saugoti paveikslėlio: CAD programos rodo paveikslėlį šalia brėžinio. Kai rodomi žemėlapio sluoksniai, dialogas siūlo **Žemėlapio sluoksniai kaip paveikslėlis šalia brėžinio**. Pažymėjus, atsisiunčiamas `.zip` failas, kuriame yra `<name>.dwg`, `<name>-map.png` (žemėlapio sluoksniai per visą brėžinį, iki 4 096 pikselių pločio) ir `<name>-map.pgw` (pasaulio failas GIS programoms). Brėžinyje paveikslėlis rodomas kaip vaizdas sluoksnyje G-MAP-IMAG, savo vietoje. Išskleiskite failus į vieną aplanką ir laikykite juos kartu.
