---
title: GIS-kihtide analüüs
summary: Puhverdamine, ülekate (lõikumine, ühend, kustutamine, sulandamine), ruumiline ühendamine, valimine atribuudi järgi ja mõõtmine: projekti GIS-kihid, igaüks uue kihina, mille saab tagasi võtta.
keywords: gis, analüüs, puhver, ülekate, lõikumine, ühend, kustutamine, lõikamine, sulandamine, ruumiline ühendamine, ühendamine, valimine atribuudi järgi, päring, kus, avaldis, statistika, pindala, pikkus, ümbermõõt, mõõtmine, katastriüksused, servituut, ehitusjoon, shapefile, geopackage, atribuuditabel
from: a6b2d3f9
---

Kui projektis on GIS-kihid (vt [GIS-andmete importimine](topic:gis-import)), avab GIS-rühma nupp **Analüüsi** (tippides `GISANALYSIS`, `ANALYZE` või `BUFFER`) paneeli viie vahelehega. See jääb joonise kõrvale avatuks, nii et valitu kuvatakse joonisel, kui töötad.

Iga tööriist, mis midagi loob, **lisab uue kihi** ja jätab loetud kihid täpselt samaks. Iga tegevus on üks tagasivõtmise samm: {{ui:Võta tagasi}} paneelis (või Ctrl+Z) eemaldab uue kihi. Tulemuse ekspordi nagu iga kihi, vt [Ekspordi teostusandmed GIS-i](topic:gis-export), shapefile'ina, GeoJSON'ina või GeoPackage'ina.

Kihi täielik tabel, sorteerimise, muutmise ja väljaarvutajaga, on jaotises [Kihi atribuuditabeliga töötamine](topic:gis-table); väritamine välja järgi on jaotises [Kihi värvimine atribuudi järgi](topic:gis-symbology).

Kõike töötatakse joonisel, projekti ühikutes (jalad või meetrid). Projekt on alati projektsioonis või kohalikus süsteemis, seega 50 vahemaa tähendab 50 jalga või 50 meetrit, mitte kraadi. Kõrgusi (z) tulemustes ei säilitata.

## Puhver

Joonistab iga objekti ümber kindla kaugusega ala uue hulknurkkihina. Punktid muutuvad ringideks, jooned ümarate otstega koridorideks, hulknurgad suurenevad. **Negatiivne** kaugus kahandab hulknurki (100 x 100 ruut, mida kahandatakse 5 võrra, on 90 x 90; 60 võrra kahandatuna ei jää midagi alles ja paneel ütleb seda). Võta kaugus arvväljalt, et igale objektile anda oma, või märgi **Ühenda kõik puhvrid üheks kujundiks**, et need sulandada.

Ümarad osad on joonistatud sirgete lõikudena tõelise kõvera sisse, seega on puhver veidi väiksem täpsest ringist: tavalise sätte korral umbes 0.6 % pindalast, sätte Täpne korral 0.16 %. Mõõtmiseks kasuta alati sätet Täpne.

## Ülekate

| Tööriist | Mida saad |
|---|---|
| Lõikumine | Need osad, kus sisendkiht kohtub ülekatte hulknurkadega, igaüks mõlema kihi väljadega. Jooned ja punktid lõigatakse hulknurkadesse. |
| Ühend | Mõlemad hulknurkkihid lõigatakse teineteise servade järgi: ühised osad kannavad mõlema kihi välju, ülejäänud ühe kihi välju (teise kihi väljad on tühjad). |
| Kustutamine | Sisendi hulknurgad, millest on eemaldatud ülekatte hulknurgad. Väljad jäävad sisendile. Täielikult kustutatud objekt jäetakse välja (paneel loeb need). |
| Sulandamine | Ühendab puudutavad või kattuvad hulknurgad, kõik või ühe kuju iga välja väärtuse kohta. Lisab `COUNT` ja `AREA`. |

Väli, mis mõlemas kihis on, jääb esimese kihi nimega ja teise kihi oma kirjutatakse `_2`-ga. Ühe kihi objektid ei tohiks omavahel kattuda: kui kattuvad, loeb ühend kattuvuse mõlemas.

## Ühendamine

Ruumiline ühendamine kopeerib atribuudid **allika** kihist igale **sihtobjektile**, millega see kohtub, ja annab uue kihi sihtobjekti kujudega. Vali, millal nad kohtuvad: puutuvad või kattuvad, sihtobjekt asub allika hulknurga sees, sihtobjekt sisaldab allika objekti, lähim allika objekt (valikulise piiranguga) või mis tahes allika objekt kindla kauguse piires.

Kui mitu allika objekti sobib, võetakse esimese atribuudid (lähima ühendamise korral lähima; lisatakse `DISTANCE`), või **loendatakse need ja summeeritakse nende arvväljad**: `COUNT` ning iga arvvälja kohta `SUM_`, `MEAN_`, `MIN_`, `MAX_`. Eemalda märkeruut valikult **Säilita sihtobjektid, millele vastet ei leitud**, et need välja jätta. Ühendatud väljad on tühjad seal, kus vastet ei leitud, ja paneel loeb vasteta jäänud objektid.

## Valimine

Sisesta küsimus atribuutide või kuju kohta, vajuta **Vali** ja objektid kuvatakse joonisel koos arvu, tabeli ning kogupindala, -pikkuse või -arvuga. Seejärel saab need muuta eraldi kihiks, suumida nende peale või tühistada valiku.

| Võid kirjutada | Näide |
|---|---|
| Väli nime järgi; kui nimes on tühikuid, kasuta „jutumärke“ või [kantsulge] | `VALUE`, `"Lot Number"` |
| Arvud, 'tekst', true, false, null | `Use_ = 'Res'` |
| `=` `!=` `<>` `<` `<=` `>` `>=` | `VALUE >= 250` |
| `contains` `startswith` `endswith` `like` `ilike` (tekst ei arvesta suurtähti; `like`-is tähistab `%` mis tahes jada ja `_` ühte tähte) | `Notes contains 'corner'` |
| `is null`, `is not null` (tühi väärtus loetakse nulliks) | `Notes is null` |
| `in (…)`, `not in (…)`, `between … and …` | `Use_ in ('Com', 'Ind')` |
| `+ - * /` ja sulud | `VALUE / 2 > 100` |
| `and`, `or`, `not` | `Use_ = 'Res' and VALUE > 200` |
| Kuju väärtused `$area` `$perimeter` `$length` `$x` `$y` `$vertices` | `$area > 5000` |

Poolik küsimus või küsimus, mis nimetab välja, mida kihil pole, lükatakse tagasi lausega, mis ütleb, kus viga on.

## Mõõtmine

Näitab kihi kogupindala ja ümbermõõtu, pikkust või arvu ning **lisab sellele välju**: hulknurkadele `AREA` ja `PERIMETER`, joontele `LENGTH` (joonisepikkus), punktidele `X` ja `Y`. Olemasolevat välja ei kirjutata kunagi üle: uus nimetatakse `AREA_2`-ks. See on üks tagasivõtmise samm. **Statistika** annab arvvälja arvu, summa, keskmise, miinimumi ja maksimumi, valikuliselt iga teise välja väärtuse kohta.

:::note
Nende tööriistade kontrollid on käsitsi läbi tehtud testis (`node bin/test-civilcraft-gisanalysis.mjs`): näiteks krundid 100 x 100 tsooni 100 x 80 all lõikuvad 3,000 pluss 3,000 ulatuses ning 100 pikkune joon, mis on puhvritud 10 võrra, on 2,000 pluss ring.
:::
