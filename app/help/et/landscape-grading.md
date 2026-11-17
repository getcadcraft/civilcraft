---
title: Haljastuse tasandamine
summary: Platvormid, vallid, kraavid ja vaba tasandamine, mille kõrgusmärke ja samakõrgusjooni sa lohistad, kaevand ja täide reaalajas, nõlvade analüüs, voolunooled ja vee kogunemine, kõik CivilCraftis projekteeritud pinnal.
keywords: tugisein, tugiseinad, vertikaalne külg, sein nõlva asemel, nõlva kalle küljeti, nõlv, tasandamine, haljastuse tasandamine, platvorm, terrass, plats, vall, kraav, kõrgusmärk, punktkõrgus, samakõrgusjooned, muuda samakõrgusjooni, kaevand ja täide, pinnatööd, nõlvade analüüs, ligipääsetavus, järsud nõlvad, voolunooled, drenaaž, vee kogunemine, lombid
from: e1559eb9
---

Kõik siin tasandatakse **projekteeritud pinnale** samade tasandamisreeglitega nagu platsid ja koridorid. **Olemasolevat maapinda** ei muudeta kunagi ja pinnatööd arvestavad seda kõike. Tasandamise menüü on haljastuse grupis.

## Platvormid

{{ui:Planeerimine}} › {{ui:Platvorm}}, siis klõpsa nurki ja vajuta {{key:Enter}}. Platvorm algab selle all oleva keskmise maapinna kõrgusest; sisesta **Kõrgus**, et seda määrata, või tühjenda väli, et platvorm taas maapinda järgiks. **Langus** protsentides ja **Langeb suunas** kraadides (0 = ida, 90 = põhi) kallutavad seda. Selle küljed tasandatakse maapinnani **kaevandi nõlva** ja **täite nõlva** järgi (horisontaalselt 1-le).

## Nõlvad külgede kaupa ja tugiseinad

Platvormi, platsi või valli Omaduste all **Küljed ja tugiseinad** võib iga külg tasandada omal moel. Külg 1 kulgeb esimesest nurgast, mille klõpsasid, teiseni; külg 2 teisest kolmandani ja nii edasi.

- **Kõik küljed**: **Nõlvaga** kasutab ülal toodud kaevandi- ja täitenõlvu igal pool; **Vertikaalne: tugiseinad** paneb seina igale küljele.
- Külgede kaupa: **Ülal olevad nõlvad**, **Oma nõlvad** (sisesta selle külje kaevandi- ja täitenõlv) või **Vertikaalne (tugisein)**.
- Nõlva kirjuta kujul `3` või `3:1` (horisontaalselt 1 vertikaalselt), `33%` või `18.4°`; see näidatakse kujul H:1. Platsi enda **Kaevandi nõlv** ja **Täite nõlv** võtavad sama.
- Vertikaalsel küljel ei ole nõlva: tugisein kulgeb mööda serva, platvormilt alla olemasoleva maapinnani (täites) või maapinnalt alla platvormini (kaevandis). **Seina paksus** (algselt 0.3 m või 1 ft) on see, kui kaugele maapind astub platsi servast olemasoleva maapinnani. Kaevandi ja täite mahud jätavad välja nõlva, mida sellel küljel enam ei ole.
- Kui sein kohtub nõlva küljega, mähib nõlv seina otsa ümber; kaks seina kohtuvad lõikenurgaga.
- Väljade all: seinte pikkus, väline külgpind (kõrgus × pikkus), kõrgeim ja keskmine kõrgus.

Plaan joonistab iga seina välispinna lühikeste joontega üle selle ning kõrguse mõlemas otsas ja kõrgeimas punktis (tugiseinte kihil, mis läheb ka DXF- ja DWG-faili). 3D-vaade näitab seinu tahkisena (Näita › Tugiseinad) ja GLB-, OBJ- ja USD-eksport sisaldavad neid. Lõiked üle serva näitavad astet.

**Hoiatused** (Omadustes ja probleemide paneelis): sein, mis on kõrgem kui **Hoiata, kui seina kõrgus on üle** (algselt 1.0 m või 3.3 ft), „võib vajada projekteeritud seina või luba; kontrolli kohalikke reegleid“, ja kui sa kirjutad **Suurim nõlv, mida pinnas püsib**, siis iga külg, mille kaevandi- või täitenõlv on sellest järsem. Need on hoiatused: tasandamine ehitatakse ikka. Iga muudatus on üks samm {{key:Mod+Z}} jaoks.

## Vallid

{{ui:Planeerimine}} › {{ui:Vall}}: künnis, mille tipp on **Kõrgus** selle all oleva keskmise maapinna kohal, küljed tasandatud välja.

## Kraavid

{{ui:Planeerimine}} › {{ui:Kraav}}, siis klõpsa mööda kraavi **nii, nagu vesi voolab**, ja vajuta {{key:Enter}}. Määra selle **Sügavus**, **Põhja laius** (0 = V-kujuline) ja **Külje nõlv**. Ilma **Languseta** järgib selle põhi maapinda, sügavusega selle all, ega lähe kunagi mäkke; kirjuta langus, et anda sellele algusest ühtlane langus.

## Kõrgusmärgid ja samakõrgusjooned

1. {{ui:Planeerimine}} › {{ui:Vertikaalplaneerimise ala}}: klõpsa selle ala piirjoont, mida tahad kujundada.
2. {{ui:Planeerimine}} › {{ui:Kõrgusmärk}}: klõpsa ala sees. Sisesta selle kõrgus Omadustes või kasuta ▲ ▼ nuppe.
3. {{ui:Planeerimine}} › {{ui:Muuda samakõrgusjoont}}: klõpsa ala sees olevat samakõrgusjoont, et võtta see joonena, mida saab ümber kujundada.

Vali kõrgusmärk või samakõrgusjoon ja **lohista** seda (või selle punkte) plaanil: pind järgib, kui lased lahti, ja see on üks tagasivõtmise samm. Ala sees ehitatakse maapind uuesti selle servast (kus see kohtub olemasoleva maapinnaga), kõrgusmärkidest ja muudetud samakõrgusjoontest.

## Kaevand ja täide reaalajas

Iga tasandamisobjekti Omadused näitavad selle **kaevandit** ja **täidet** ning kogu saidi oma, Pinnatööde meetodil ruudustikuga, nii nagu sa seda muudad. Probleemid (pinnast väljas, iseend ristav piirjoon) on seal loetletud.

## Tasandamise kontrollid

Vasakul jaotises **Tasandamise kontrollid**:

- **Nõlvade analüüs** värvib pinna kalde järgi: kuni leebe piirini, vahepeal ja järsem kui järsk piir (algselt 5 % ja 33.3 %: tavaline 1:20 ligipääsetavatele teedele ja 1:3 niitmiseks). Legend ütleb, kui suur osa alast jääb igasse. Järsud alad trükitakse ka lehtedele.
- **Voolunooled ja vee kogunemine** joonistavad, kuhu vesi voolab, ja märgivad iga koha, kus see kogunev, koos sügavusega; jaotis ütleb, mitu kohta on, kõige sügavam ja kui palju vett nad hoiavad.

Kontrollid loevad projekteeritud pinda, kui midagi on tasandatud, muidu olemasolevat maapinda.
