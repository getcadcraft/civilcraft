---
title: Projekteeritud pikiprofiili koostamine
summary: Ava pikiprofiilivaade, alusta projekteeritud profiili maapinnast, lisa ja lohista PVI-sid, määra vertikaalkõverate pikkused ning loe kaldeid, K-väärtusi ning kõrgeid ja madalaid punkte.
keywords: profiil, vertikaaltrass, PVI, vertikaalkõver, kalle, K-väärtus, hari, org, BVC, EVC, pikiprofiilivaade, lõplik kõrgus, FG, olemasoleva maapinna profiil, tunnusjooned profiilis, ristumised, projitseeritud, äärekivi, kraav, sildid
from: dbb1f32d
---

Igal trassil on üks projekteeritud pikiprofiil: PVI-de loend (jaam ja kõrgus), mis on ühendatud sirgete kallete abil, ning sümmeetriline parabooli vertikaalkõver igal sisemisel PVI-l, millel on pikkus. Olemasoleva maapinna profiil võetakse sinu eest pinnalt.

## Pikiprofiilivaate avamine

1. Vali trass (klõpsa sellel nupuga {{ui:Vali}}).
2. Vajuta {{key:R}}, või klõpsa tööriistaribal {{ui:Pikiprofiil}}, või {{ui:Profiilivaade}} parempoolse paneeli allosas.
   Pikiprofiilivaade avaneb plaani all, koos olemasoleva maapinnaga trassi mööda. Kahe või enama trassi korral vali nimekirjast pikiprofiiliriba vasakul.

Vaade näitab alguses kogu trassi ja venitab kõrgused paneeli täitma; liialdus on kirjas vasakus alanurgas, näiteks „Vertikaalne liialdus 10×“.

## Pikiprofiili suumimine ja nihutamine

- **Suum:** keera hiireratast (või näpista puuteplaadil) ja vaade suumib osuti ümber. Hoia {{key:Shift}}, et suumida ainult jaamu, või {{key:Alt}}, et suumida ainult kõrgusi (see muudab liialdust). Kui pikiprofiilivaade on fookuses, suumivad plussi- ja miinusklahvid keskpunkti ümber.
- **Nihe:** lohista parema või keskmise hiireklahviga, või libista kahe sõrmega puuteplaadil.
- **Sobita:** topeltklõps pikiprofiilil või vajuta {{key:F}}, et näidata kogu trassi uuesti.

PVI muutmine säilitab sinu valitud suumi; see ei hüppa tagasi sobitusse.

Liigu osutiga mööda profiili: riba näitab jaama, maapinna ja projekti kõrgusi, kallet ning seal olevat lõiget või täidet, ja punkt liigub trassil plaanil.

## Projekteeritud profiili alustamine

1. Paremas paneelis jaotises **Projekteeritud profiil** klõpsa {{ui:Alusta maapinnast}}.
   Kaks PVI-d asetatakse maapinnale trassi kahte otsa, ühendatuna ühe sirge kalde abil. Olekuriba ütleb: „Projekteeritud profiil alustatud maapinnast mõlemas otsas. Lülita sisse Lisa PVI-d ja klõpsa, et lisada kaldemurded; anna neile kõverapikkus tabelis.“

Kui trass ei lõika pinda, saad teate: „Sellel trassil pole maapinda, millest alustada.“ Siis lisa PVI-d klõpsates (järgmine jaotis).

## PVI-de lisamine

1. Vajuta {{key:I}} või klõpsa pikiprofiiliribal {{ui:Lisa PVI-d}}. Nupp jääb vajutatuks.
2. Klõpsa pikiprofiilil kohta, kus soovid kaldemurdet. PVI lisatakse sellele jaamale ja kõrgusele, ümardatuna 0.01 täpsusega, ja valitakse.
3. Lisa neid nii palju kui vaja, seejärel vajuta {{key:I}} uuesti, et lisamine lõpetada.

Klõpsamine kohta, kus juba on PVI, lükatakse tagasi („On juba PVI aadressil …“). PVI-d jäävad alati jaamade järjekorda.

## Haakumine lisamisel ja lohistamisel

Nupp **Haakumine** pikiprofiiliribal on alguses sisse lülitatud. Kui see on sees, maandub lisatud või lohistatud PVI lähimale PVI-le, maapinnapunktile, PVI jaamale või maapinna joonele, ja markeri kõrval olev silt ütleb, milline. Hoia {{key:Alt}}, et saada vaba punkt kuhu tahes.

## PVI-de muutmine

- **Lohista** PVI-d pikiprofiilil, et seda liigutada. See ei saa oma naabritest mööda minna. Liigutamine on üks tagasivõtmise samm.
- **Sisesta** täpsed väärtused PVI-tabelisse paremas paneelis: **Jaam**, **Kõrgus**, **Kalle %** ja **Kõver L** (vertikaalkõvera pikkus). Vajuta pärast igat {{key:Enter}}.
- **Vali** väärtus pikiprofiililt: väike nupp PVI jaama või kõrguse kõrval ootab ühte klõpsu pikiprofiilivaates ja täidab selle väärtuse. Klõps haakub nagu PVI lisamisel; hoia {{key:Alt}} vaba punkti jaoks; {{key:Esc}} tühistab.
- **Kalle %** on selle PVI-st alguse saava ja järgmise PVI-ni jooksva puutuja kalle. Selle sisestamine liigutab **järgmise** PVI kõrgust (tema jaam ei liigu kunagi). Kui järgmine PVI on lukus, liigub hoopis eelmise PVI kõrgus.
- **Lukusta** PVI rea lõpus oleva lukuga. Lukustatud PVI-d ei lohistata ja kalde muutmine ei liiguta seda. Kui puutuja mõlemad otsad on lukus, ei saa tema kallet muuta: olekuriba ütleb seda ja sa pead esmalt ühe otsa lahti lukustama. Lukk salvestatakse faili.
- **Eemalda** PVI rea lõpus oleva x-iga või vali see (klõpsa) ja vajuta {{key:Delete}}. Kui pikiprofiilivaade on fookuses, eemaldab selle ka {{key:Backspace}}.

Esimene ja viimane PVI ei saa kunagi kõverat.

## Vertikaalkõverad

1. Sisesta pikkus väljale **Kõver L** sisemisele PVI-le, näiteks 200.
2. Kõver joonistatakse PVI keskele. Profiil ja parem paneel näitavad selle liiki (hari või org), L ja K, BVC ja EVC jaamu ning kõrgusi ning selle kõrgeimat või madalaimat punkti, kui see on kõvera sees.

K arvutatakse L-ist (K = L jagatud kallete algebralise vahega protsentides). Sisestad L; K otsest sisestamist pole veel saadaval.

Kui vertikaalkõver ei mahu, ütleb punane kast miks: see jookseb tagasi eelmise PVI või kõvera sisse või üle järgmise PVI-st ning ütleb, kui palju ruumi sellel küljel on (kõver vajab poolt oma pikkusest PVI mõlemal küljel). Selle nupp seab **pikima kõvera, mis mahub**, koos oma K-ga, ühe sammuna ({{key:Mod+Z}} võtab tagasi). Või liiguta PVI-sid kaugemale.

## Faktide lugemine

PVI-tabeli all loetleb nimekiri iga kalde protsentides („Kalle 1: +1.25%“) ja iga kõvera, näiteks „Hari jaamas 2+00.00: L 200.00, K 85.3, BVC 1+00.00 (253.10), EVC 3+00.00 (252.40)“, seejärel „Kõrgeim punkt 1+62.40, 254.12“.

Kui PVI-d ei jõua trassi mõlema otsani, ütleb märkus seda. Koridor ehitatakse ainult seal, kus profiil ja trass kattuvad.

## Tunnusjooned pikiprofiilis

Tunnusjooned on näha ka pikiprofiilivaates, nii et näed äärekivi, kraavi või seina ülaosa teeprofiili kõrval.

- Kus tunnusjoon **ristub** trassiga, näitab profiil väikest rombi sellel jaamal ja kõrgusel, märgituna joone nime ja selle kõrgusega seal (joone enda kõrgus, arvutatud ristuvast lõigust).
- Kirjuta kaugus väljale {{ui:Trassi kõrval kuni}}, et joonistada ka tunnusjooned, mis **kulgevad kõrvuti** trassiga selle kauguse piires, katkendjoontena nende enda kõrgustel. Tühi või 0 näitab ainult ristumisi.
- Märgised ja sildid järgivad iga muudatust: liiguta tippu, sisesta kalle või tõsta joont, ja profiil näitab kohe uusi kõrgusi.
- Klõpsa ristumise rombil, et valida see tunnusjoon; valitud joon joonistatakse esiletõstetud värviga.
- {{ui:Tunnusjooned}} pikiprofiiliribal peidab või näitab neid kõiki. Mõlemad seaded salvestatakse projektiga.

Vt [Tunnusjooned](topic:feature-lines).

## Järgmiseks

- [Teekoridori trassi mööda ehitamine](topic:corridor) mööda seda trassi ja seda profiili.
- Profiil kirjutatakse LandXML-i koos trassiga; vt [LandXML-i vahetus](topic:landxml).
