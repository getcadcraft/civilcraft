---
title: Planeeri hoone plats
summary: Joonista lame plats, määra selle kõrgus ja lõige- ning täitenõlvad ning lase CivilCraftil see olemasoleva maapinnaga päevavalgusesse viia ja lisada projekteeritud pinnale.
keywords: tugimüür, tugimüürid, vertikaalne külg, sein nõlva asemel, nõlv külje kohta, pengerdus, vertikaalplaneerimine, plats, hoone plats, päevavalgus, tunnusjoon, vertikaalplaneerimise rühm, lõikenõlv, täitenõlv, lõplik kõrgus, projekteeritud pind, saidi vertikaalplaneerimine
from: 482319a6
---

Plats on lame ala ühel kõrgusel. Oma servast planeerib CivilCraft väljapoole sinu lõikenõlvaga seal, kus maapind on platsist kõrgemal, ja täitenõlvaga seal, kus see on madalamal, kuni nõlv kohtub olemasoleva maapinnaga. See kohtumisjoon on päevavalguse joon. Plats ja selle nõlvad asendavad olemasoleva maapinna päevavalguse joonest seespool, et moodustada projekteeritud pind.

## Joonista plats

Sul on vaja kõigepealt olemasolevat maapinda.

1. Vajuta {{key:G}} või klõpsa **Kujundus**-rühmas {{ui:Plats}}.
   Vihje ütleb: „Plats: klõpsa nurki. Enter või topeltklõps lõpetab, Backspace eemaldab viimase, Esc tühistab.“
2. Klõpsa platsi nurki järjekorras, kumbki suund sobib. Sinine piirjoon jälgib kursorit.
3. Vajuta {{key:Enter}} pärast viimast nurka (vähemalt kolm).
   Plats joonistatakse ja valitakse. See algab maapinna kõrgusel tema keskel, ümardatuna 0.1 täpsusega, lõikenõlvaga 2 : 1 ja täitenõlvaga 3 : 1. Olekurida ütleb näiteks: „Plats 1 kõrgusel 254.3 (maapind keskel), lõige 2:1, täide 3:1. Muuda neid jaotises Omadused.“

:::warning
Lõpeta klahviga {{key:Enter}}. Topeltklõps lõpetab samuti, kuid selles versioonis eemaldab see topeltklõpsatud nurga. Klõpsa viimast nurka üks kord ja vajuta seejärel {{key:Enter}}.
:::

Platsi piirjoon ei tohi ristuda iseendaga („Platsi piirjoon ristub iseendaga.“).

## Määra kõrgus ja nõlvad

Kui plats on valitud, näitab parem paneel **Plats**:

1. **Nimi**.
2. **Kõrgus**: platsi lame kõrgus.
3. **Lõikenõlv** ja **Täitenõlv** kujul H:V (2 tähendab 2 : 1). Mõlemad peavad olema suuremad kui 0.
4. **Platsi pindala** ja **Nurgad** on näidatud viitena.

Vajuta {{key:Enter}} pärast iga väärtust. Päevavalguse joon, projekteeritud pind ja mahud uuenevad kohe.

Väljade all loeb rida näiteks „Päevavalguse joon: 48 nõlvajoont (20 lõikes, 28 täites), kaugeim 31.20 ft välja.“ Plaanil on päevavalguse joon ja nõlvajooned magenta värvis.

## Kuidas päevavalgus leitakse

- Nõlvajooned lähevad igast servast risti sellele, umbes iga platsi suuruse kahekümnendiku kaupa.
- Väljaspool asuvate nurkade juures laiuvad need iga 10° järel laiali, nii et nõlv keerdub nurga ümber.
- Sissepoole asuvate nurkade juures kulgeb üks joon poolitajal, kus kahe serva nõlvad kohtuvad.
- Iga joon tõuseb lõikenõlva või langeb täitenõlva järgi, kuni jõuab maapinnani.

## Nõlvad külgede kaupa ja tugimüürid

Jaotises **Küljed ja tugimüürid** platsi, platvormi või pervli omadustes saab iga külge planeerida omal moel. Külg 1 kulgeb esimesest nurgast, mille klõpsasid, teiseni; külg 2 teisest kolmandani, ja nii edasi.

- **Kõik küljed**: **Nõlvaga** kasutab ülal toodud lõike- ja täitenõlvu igal küljel; **Vertikaalne: tugimüürid** paneb igale küljele müüri.
- Külgede kaupa: **Ülalpool olevad nõlvad**, **Oma nõlvad** (sisesta selle külje lõike- ja täitenõlv) või **Vertikaalne (tugimüür)**.
- Sisesta nõlv kujul `3` või `3:1` (horisontaalne 1 vertikaalse kohta), `33%` või `18.4°`; see kuvatakse kujul H:1. Platsi enda **Lõikenõlv** ja **Täitenõlv** võtavad sama.
- Vertikaalsel küljel ei ole pengerdust: tugimüür kulgeb mööda serva, platsist alla olemasoleva maapinnani (täites) või maapinnast alla platsini (lõikes). **Müüri paksus** (algselt 0.3 m või 1 ft) on see, kui palju maapind astub platsi servast olemasoleva maapinnani. Lõike- ja täitemahud jätavad välja pengerduse, mida see külg enam ei oma.
- Kus müür kohtub nõlvaga küljega, keerdub nõlv müüri otsa ümber; kaks müüri kohtuvad nurgas vaheteraga nurgana.
- Väljade all: müüride pikkus, väline pind (kõrgus × pikkus), kõrgeim ja keskmine kõrgus.

Plaan joonistab iga müüri välispinna lühikeste sakkidega üle selle ning kõrgused mõlemas otsas ja kõrgeimas kohas (tugimüüride kihil, mis läheb ka DXF- ja DWG-sse). 3D-vaade näitab müüre tahketena (Näita › Tugimüürid) ning GLB-, OBJ- ja USD-eksport kaasab need. Serva läbivad lõiked näitavad astet.

**Hoiatused** (omadustes ja probleemide paneelis): müür, mis on kõrgem kui **Hoiata, kui müüri kõrgus on üle** väärtuse (algselt 1.0 m või 3.3 ft), „võib vajada insenerlahendust või luba; kontrolli kohalikke eeskirju“, ning kui sisestad **Kõige järsem nõlv, mida pinnas peab**, iga külg, mille lõike- või täitenõlv on sellest järsem. Need on hoiatused: planeering ehitatakse ikka valmis. Iga muudatus on üks samm klahvile {{key:Mod+Z}}.

## Nurkade liigutamine

Vali plats ja lohista ruudukujulist haaret nurgal. Iga lohistus on üks tagasivõtmise samm. Nurga lisamine või eemaldamine ei ole veel saadaval: kustuta plats ja joonista uuesti.

## Kui see ei planeeri

Punane kast jaotises **Pinnasetööd** nimetab platsi ja probleemi:

| Teade | Mida teha |
|---|---|
| „3 nõlvajoont jookseb pinnalt välja enne selle kohtumist: plats on liiga pinna serva lähedal või liiga kõrgel/madalal.“ | Liiguta plats pinna servast sisemaale või vii selle kõrgus lähemale maapinnale. |
| „Päevavalguse joon ristub iseendaga (platsi eri külgede nõlvad satuvad üksteisesse). Muuda platsi kuju või nõlvu.“ | Tavaline kitsaste või L-kujuliste platside korral sügavas lõikes või kõrges täites. Laienda plats, vähenda kõrguste vahet või tee nõlvad järsemaks. |
| „Platsi piirjoon ristub iseendaga.“ | Joonista nurgad uuesti platsi ümber järjekorras. |

Probleemiga plats jäetakse projekteeritud pinnast ja mahtudest välja, kuni see on parandatud.

## Vaata tulemust

1. Jaotises **Kuva** määra **Pind** väärtuseks {{ui:Projekteeritud (planeeritud)}}.
   Samakõrgusjooned jooksevad nüüd platsi kohal lamedalt ja järgivad nõlvu kuni päevavalguse joonteni.
2. Liiguta kursor platsi kohale: olekuriba näitab kõrgusi **Maapind** ja **Planeeritud**.
3. Loe lõige ja täide jaotisest **Pinnasetööd**; vt [Pinnasetöömahud](topic:volumes).

Platsid planeeritakse pärast koridore, selles järjekorras, milles need joonistati. Hilisem plats asendab kõik varasema oma päevavalguse joone sees.

## Kustuta plats

Vali see ja vajuta {{key:Delete}} (Macis Fn ja delete) või klõpsa {{ui:Kustuta}}.

## Veel pole valmis

Platsid on lamedad: kaldus platsid, muutuva kaldega tunnusjooned, astmed ning planeerimine kindla kauguse või kõrguse eesmärgini ei ole veel saadaval. Vt [Veel pole valmis](topic:not-built-yet).
