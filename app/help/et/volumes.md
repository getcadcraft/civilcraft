---
title: Pinnasemahud
summary: Loe kaevise, täite ja netomahud olemasoleva maapinna ja projekteeritud pinna vahel, platvormi ja koridori kaupa ning kokku, ning mõista nende taga olevat ruudustiku meetodit.
keywords: mahud, pinnasetööd, kaevis, täide, neto, kaevis ja täide, kogused, ruudustiku meetod, pinnade võrdlus, mahupind, kuupjardid, kuupmeetrid
from: 299d7bc7
---

Niipea kui platvorm või koridor planeerub ilma probleemideta, võrdleb CivilCraft projekteeritud pinda olemasoleva maapinnaga ja esitab kaevise ja täite. Arvud uuenevad iga muudatusega.

## Kus neid lugeda

- **Pinnasetööd** paremal paneelil, kui ühtegi ei ole valitud (**Projekt** vaade), kui on vähemalt üks platvorm või üks koridor.
- **Pinnasetööd** paremal paneelil, kui platvorm on valitud (sama kogusumma kogu projekti kohta).
- Koridori seadete all olev rida koos selle koridori enda kaevise ja täitega.

**Pinnasetööde** plokk näitab:

- **Kaevis**, **Täide** ja **Neto** (millele järgneb „täide“ või „kaevis“, olenevalt sellest, kumb on suurem)
- rida iga üksuse kohta, kui neid on rohkem kui üks, näiteks „Platvorm 1: kaevis 120.4 cu yd, täide 310.2 cu yd“
- meetodi rida: „Ruudustiku meetod: olemasolev maapind ja planeeritud pind proovitakse iga 0.5 ft järel päevajoonte sees (92,891 lahtrit). Paisumist ega kokkutõmbumist ei rakendatud.“

Mahud on jalgade projektis kuupjardides ja meetrite projektis kuupmeetrites.

## Saada need programmi TakeoffCraft

Pinnasetöö hinnastamiseks vali {{ui:Saada programmi TakeoffCraft}} **Pinnasetööde** ploki all. CivilCraft salvestab koguste faili (`<site>.quantities.json`) kahe kogusega: kaevis ja täide kuupjardides (jalgade projekt) või kuupmeetrites (meetrite projekt), täpselt samade arvudega kui plokis, sajandikeni. Ava see programmis TakeoffCraft nupuga **Ava koguste arvestus** või lohista see sinna: need muutuvad kaheks üksuseks, mida saab hinnastada ([Kaevis ja täide CivilCrafti failist](app:takeoffcraft/earthwork#cut-and-fill-from-civilcraft)). Pärast muudatust saada uuesti ja ava uus fail: samad üksused saavad uued arvud.

Saadetakse ainult kogusummad, nii et midagi ei arvestata kaks korda; faili märkus loetleb iga platvormi ja koridori enda kaevise ja täite.

## Kuidas need arvutatakse

CivilCraft kasutab **ruudustiku meetodit**:

1. Ruudukujuliste lahtrite võrk asetatakse kõigi päevajoonte sees olevale alale.
2. Iga lahtri keskmes proovitakse mõlemad pinnad.
3. Iga lahter loetakse prismana: kõrgusmärkide vahe korrutatud lahtri pindalaga. Kus projekteeritud pind on madalam, on see kaevis; kõrgem, on see täide.
4. Lahtrid liidetakse kokku.

Lahtri suuruse valib CivilCraft sinu eest nii, et planeeritud alasid ümbritsev ristkülik sisaldab umbes 250,000 lahtrit, ümardatuna korraliku väärtuseni (1, 2 või 5 korda kümne aste). Seda ei saa sina veel ise määrata. Meetodi rida ütleb sulle suuruse ja lahtrite arvu. Väiksemad lahtrid on servades täpsemad; tervete lahtrite puhul lamedate tasandite vahel on tulemus täpne.

## Mida tasub teada

- Arvestatakse ainult päevajoonte sees olevat ala. Nende väline maapind jääb muutmata.
- Probleemiga platvorm või koridor ei planeeru sisse ega lisa midagi. Kui plokk ütleb „Mahusid veel ei ole: platvorm peab planeeruma ilma probleemideta.“, otsi selle kohal punast kasti.
- Kus üksused kattuvad, on hilisem asendanud varasema oma päevajoone sees ja kattuvus arvestatakse ühe korra.
- Paisumise ega kokkutõmbumise tegurit ei rakendata. Kui vajad looduslikus, lahtises või tihendatud olekus mahtu, korruta tulemused ise.
- Mullakihi eemaldamine, katte ja aluspinnase sügavused ning TIN-TIN prismade mahud pole veel saadaval.

## Tulemuse kontrollimine

- Lülita **Kuva** all sisse {{ui:Projekteeritud (planeeritud)}} ja vaata päevajoonte sees olevaid samakõrgusjooni.
- Liiguta kursor planeeritud ala kohal: olekuriba näitab **Maapinda** ja **Planeeritud**. Vahe on kaevise või täite sügavus selles kohas.
- Koridori puhul näitab pikiprofiilivaate näit kaevist või täidet telgjoonel igal pikketil.
