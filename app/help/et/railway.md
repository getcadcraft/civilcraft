---
title: Raudteerajat projekteerimine
summary: Muuda joondus raudteeks: rööbaste üleminekud (klotoid, kuupparabool, Bloss, Helmert, siinus-poollaine, siinus), iga kõvera ülekallutus koos tasakaalu ülekallutusega, ülekallutuse puudujääk ja liig, ülekallutuse ja rajageomeetria piirangud hoiatustena, vahetused ja ristvahetused jaamade kaupa, mööda joont läbi viidud vabaruumi ümbris ning rada rööbaste, talade ja ballastipeenraga, mis ehitatakse koridorina plaanil, lõigetel, profiilil, 3D-vaates ja kogustes.
keywords: raudtee, rööbas, raudteerada, rada, rong, metroo, tramm, ülekallutus, ülekallutuse puudujääk, ülekallutuse liig, tasakaalu ülekallutus, üleminek, üleminekukõver, klotoid, kuupparabool, bloss, helmert, siinus poollaine, koossinus, rööpavahe, normaalrööpavahe, lairööpavahe, meetrirööpavahe, kitsas rööpavahe, tala, talad, ballast, alusballast, aluspinnas, kõrvalriba, rajatelgede vahe, 60E1, 54E1, UIC60, 115RE, 136RE, ülekallutuse kalle, ülekallutuse muutumise kiirus, vahetus, lüliti, väljasõit, ristvahetus, südamik, südamiku number, eelpikkus, kõverdumiskõver, suunamiskiirus, vabaruum, vabaruumi ümbris, vabaprofiil, veeremi vabaprofiil, perrong, perrooni vahe, rajavahe, kalle, vertikaalkõver, miinimumraadius, LandXML ülekallutus
from: 99de9745
---

Iga joondus võib olla raudteerada. Selle kõverad saavad siis rööbaste üleminekud ja ülekallutuse (rööbaste ülekallutuse), ning selle koridor ehitatakse rajana: rööpad talade peal ja ballastipeenral, maapinna sisse planeeritud nagu tee. Vahetused ja ristvahetused lisatakse jaamade kaupa ning vabaruumi ümbrist saab viia mööda joont ja kontrollida seda rajast kõrvale jäävate objektide suhtes.

Kõik allpool toodud arvud on **kohatäited**, mitte standardid. Raudteed seavad oma piirangud joonkiiruse, raja tüübi ja riigi järgi; seadke need oma raudtee standardi järgi. CivilCraft ei sisalda riiklikku tabelit.

## Muuda joondus raudteeks

1. Vali joondus ja leia omaduste paneelist **Raudtee**.
2. Märgi **See joondus on raudteerada**. Iga muudatus on üks tagasivõtmise samm.
3. Määra joondusega omaduste ülaosas **Projekteerimiskiirus**: see on joonkiirus, mille järgi ülekallutust kontrollitakse. **Aeglasemad rongid** (Raudtee plokis) on kiirus, mille järgi kontrollitakse ülekallutuse liigset osa.

## Üleminekud

Igale kõverale anna PI tabelis mõlemas otsas spiraali pikkus (**Spiraal sisse**, **Spiraal välja**) ning vali Raudteeploki kõvera tabelis selle liik või märgi **Üleminek igale kõverale**:

| Liik | Kõverus üleminekul |
|---|---|
| Klotoid | kasvab ühtlaselt (tee spiraal) |
| Kuupparabool | y = x³ / (6·R·L), kus L on mõõdetud puutuja järgi; kõver ise on veidi pikem |
| Bloss | 3u² − 2u³ täiskõverusest (u = pikkuse osa): algab ja lõpeb pehmelt |
| Helmert | kaks parabooli: esmalt 2u², seejärel 1 − 2(1 − u)² |
| Siinus poollaine | (1 − cos πu) / 2 |
| Siinus | u − sin(2πu) / 2π |

Kõik peale kuupparabooli pöörduvad L / 2R võrra nagu klotoid. Jaamad kulgevad tegeliku pikkuse järgi. LandXML säilitab liigi (spiType klotoid, cubicParabola, bloss, biquadratic, cosine, sinusoid).

## Ülekallutus

Sisesta iga kõvera **Ülekallutus** millimeetrites. Tabelis kuvatakse iga kõvera kohta:

- **Tasakaal** ülekallutus = G·v² / (g·R), kus G on rööpade telgede vahe (**Rööpa telgede vahe**, mis on rööpavahe pluss rööpa pea laius, kui te seda ise ei sisesta). Kui G = 1500 mm, on tulemus tuttav valem 11.8·V² / R (V km/h, R meetrites).
- **Puudujääk** = tasakaal joonkiirusel − rakendatud ülekallutus.
- **Liig** = rakendatud ülekallutus − tasakaal aeglasemate rongide kiirusel.
- **Rambi**: suurim ülekallutuse kalle oma rampidel, mm meetri kohta.

Ülekallutus tõuseb iga ülemineku kohal, kujult nagu selle kõverus: sirgjooneline klotoidi või kuupparabooli puhul, Blossi kuju Bloss-i puhul jne. Kõvera lõpp ilma üleminekuta tõuseb eelneval sirgel nii pikalt, kui ülekallutuse kalde piir nõuab, ning sellest teatatakse: ülekallutus muutub siis seal, kus kõverus ei muutu.

**Ülekallutus pöördub ümber** näitab, milline rööpa jääb projekteerimisprofiilile: **madal rööpa** (tavaline), **sisemine rööpas** või **raja keskkoht** (iga rööpa liigub poole ülekallutusest). Projekteerimisprofiil on seal rööpa pealispind.

**Ülekallutuse diagramm** joonistab iga rööpa kõrguse profiili kohal jaamade kaupa; profiilivaade ning plaani ja profiili lehed saavad sama profiili all ribana.

## Ülekallutuse piirangud ja hoiatused

**Suurim rakendatud ülekallutus**, **Suurim ülekallutuse puudujääk**, **Suurim ülekallutuse liig**, **Suurim ülekallutuse kalle** ja **Kiireim ülekallutuse muutus** (kalle joonkiirusel, mm/s) kontrollitakse igal kõveral. Piirangust suurem väärtus on hoiatus Raudtee plokis ja Probleemide paneelis koos piiri ja leitud väärtusega. Kui projekteerimiskiirust ei ole, siis puudujääki ja muutumise kiirust ei kontrollita (sellest teatab märkus).

## Rada

Määra **Rööpavahe** (standardne 1435 mm, lai-, meetri- või kitsas eelseade või oma väärtus), **Rööpaprofiil** (60E1, 54E1, 49E1, 115RE, 136RE: ainult nende avaldatud mõõtmed), rajade arv **Rajad** ja nende **Rajatelgede vahe**, seejärel **Talad ja ballast**: talade materjal, pikkus, laius, sügavus ja vahe; ballasti sügavus tala all (madala rööpa juures), õlg, kalle ning kui palju selle pealispind jääb talade alla; alusballasti sügavus, kõrvalriba ballasti jala taga ning aluspinnas ristkalle.

Vajuta **Ehita rada**. See lülitub joondusel koridori peale, mis ehitatakse rajana projekteerimisprofiili järgi: rööpad ja talad kallutuvad koos ülekallutusega, aluspinnas aga mitte. Lõike nõlvad kulgevad kõrvalriba servast koridori lõikel ning täite nõlvad, ja rada planeeritakse kavandatud pinnaga nagu tee.

- **Plaan**: mõlemad rööpad igal rajal (kiht C-RAIL-TRAK) ja, kui rajad on mitu, iga raja keskjoon (C-RAIL-CNTR), ekraanil, DXF-is, DWG-s, PDF-is ning plaani ja profiili lehtedel.
- **Lõiked**: talad, rööpad ning ballasti ja alusballasti alumised küljed igas lõikes.
- **3D**: rööpad, iga tala ja ballastipeenar (Näita › Rada), samuti GLB, OBJ ja USD formaadis.
- **Kogused**: raja pikkus, rööpad (kõigi rajade mõlemad rööpad, iga raja enda joone järgi), talad, ballastipeenar ja ballast ilma taladeta ning alusballast, arvutatuna lõikude vahel keskmiste otspindade meetodil.

## Rajageomeetria kontrollid

Lisaks ülekallutusele kontrollib Raudtee plokk joont ennast veel kuue piirangu järgi (kõik kohatäited, kõik teie seatavad):

- **Projekteerimisprofiili suurim kalle**, mm meetri kohta.
- **Vertikaalse kõvera väikseim raadius** kordajana k valemis R ≥ k·V² (R meetrites, V km/h). Parabooli kujuga vertikaalkõveral pikkusega L kahe kalde vahel on raadius L jagatud kalde muutusega.
- **Lühim vertikaalkõver**.
- **Väikseim kõverapiiraadius** plaanil (0 lülitab kontrolli välja).
- **Lühim kaar või sirge**, sekundites sõiduaega joonkiirusel: kui ringkaar või kahe kõvera vaheline sirge on sellest kaugusest lühem, antakse hoiatus. 1.8 s on tuttav „pool kiirusest km/h-s meetrites“.
- **Ülekallutuse puudujäägi muutumise kiirus** igal üleminekul, mm/s joonkiirusel.

**Rajageomeetria** loetleb leitud suurima kalde ja iga vertikaalkõvera koos raadiusega ning raadiusega, mida joonkiirus nõuab. Vertikaalkõver, mis asub ülemineku või ülekallutuse rambi peal, saab märkuse. Kui projekteerimisprofiili või projekteerimiskiirust ei ole, jäetakse kontrollid, mis neid vajavad, vahele ja sellest teatab märkus.

## Vahetused ja ristvahetused

Jaotises **Vahetused ja ristvahetused** vajuta **Lisa vahetus**. See paigutatakse pikimale sirgele; seadke tabelis:

- **Vahetuse algpunkti jaam**: kus vahetus algab sellel joondusel.
- **Südamik**: südamiku number N (1:N). Südamiku nurk on 2·atan(1 / 2N).
- **Pool**: vasak või parem, kui vaadata suunas jaamade kasvu.
- **Ristvahetuse vahe** meetrites: suurem kui 0 muudab vahetuse ristvahetuseks paralleelse raja suhtes sellel kaugusel (kaks vahetust ja nendevaheline sirge).

Tabelis kuvatakse **Eelpikkus** (vahetuse algpunkt kuni südamikuni), sulgemiskõvera **Raadius** ning **Suunamiskiirus**, mille see raadius lubab teie ülekallutuse puudujäägi piiri ja ülekallutuse puudumise korral. **Koosta selle rada** muudab suunatud tee omaette joonduseks (vahetus, sulgemiskõver, seejärel otse südamiku nurga all), millel on samad raudteeseaded ja mis on valmis pikendamiseks.

Plaanil joonistatakse iga vahetuse kaks suunatud rööpa, selle keskjoon, märk vahetuse algpunktis ja südamikul ning „1:N“ (kiht C-RAIL-TURN), ekraanil ning DXF-is, DWG-s, PDF-is ja lehtedel. 3D-vaade joonistab suunatud rööpad põhirada tasandil.

Kuju on **kohatäide**: sirgjooneline vahetus ja üks sulgemiskõver südamiku numbri järgi. Valmis vahetus järgib raudtee standardit ja tootja joonist. Hoiatused: vahetus, mis ulatub joonduse välja, asub kõveral, üleminekul, ülekallutusel või vertikaalkõveral või kattub teisega; ning märkus, kui joonkiirus on suurem kui selle suunamiskiirus.

## Vabaruumi ümbris

Märgi **Joonista vabaruumi ümbris mööda seda rada**. Vali **Kontuur** (kaks kohatäite kuju või **Oma kontuur**, sisestatud ühe punktina rea kohta: kaugus raja keskjoonest, seejärel kõrgus rööpa pealispinnast meetrites), **Veduki pikkus** ja **Tellingute keskmed** ning, kui on, **Perrooni serv** (pool, kaugus raja keskjoonest, kõrgus rööpast).

Igas jaamas kallutatakse kontuur ülekallutusega madala rööpa ümber ja laiendatakse kõvera järgi: veduki keskosa nihkub sissepoole väärtusega b² / 8R, otsad väljapoole väärtusega (L² − b²) / 8R (b tellingute keskmed, L veduki pikkus, R raadius sellel kohal, järgides üleminekut). Plokk joonistab lõigu sirgel ja kohas, kus see on kõige laiem, ning loetleb:

- **laiima ümbrise** ja selle asukoha,
- **raja telgede vahe** võrreldes telgedega, mida vajavad kaks naaberümbrist,
- **perrooni serva** juures jääva ruumi või selle, kui palju see on sees,
- iga joonobjekti, torustiku ja muu raudteejoondusega, mis leitakse **ümbrise sees**.

Kõrgustega joonobjekti hinnatakse kontuuri järgi tema kõrgusel rööpast; ilma projekteerimisprofiilita või punkti puhul, millel kõrgust ei ole, hinnatakse ainult plaanil ning loetelu sellest teatab. Plaanil on ümbrise kaks serva (kiht C-RAIL-CLRN) ning iga sees oleva objekti kohal rist.

Pakutavad kontuurid on **kohatäited, mitte ühegi raudtee rööpavahe**. Enne tulemuse kasutamist sisesta oma raudtee vabaprofiil.

## Muudes programmides

- **LandXML**: raudteejoondus kirjutatakse oma üleminekutega (spiType) ja `Cant` plokiga: rööpavahe, pöördepunkt, joonkiirus ning jaam, kus iga ülekallutuse ramp algab ja lõpeb rakendatud ülekallutuse, tasakaaluülekallutuse ja puudujäägiga. `Cant` plokiga LandXML-faili avamine muudab selle joonduse raudteeks nende ülekallutustega.
- **IFC**: joondus koos ülekallutuse lõikude, rööbaste, talade, ballasti ja alusballastiga.

## Veel pole ehitatud

Vahetused IFC eksportis, vahetuste perekonnad peale ühe sulgemiskõvera (kõverad vahetused, libisevad vahetused, pöörduva ninaga südamikud, ristmikud), kinemaatilise vabaprofiili reeglid (ümbris on kindel kontuur koos kõvera nihkega), õhuliinid ja signalisatsioon.

**Milline standard.** Raudtee plokis võtab „Viidatav standard“ väärtuseks Puudub või Euroopa (UIC ja EN). Euroopa valimine nimetab dokumendid, mida Euroopa projekt viitab (EN 13803 joonduse parameetrite jaoks, EN 13232 vahetuste ja ristmike jaoks, EN 15273 vabaprofiilide jaoks, EN 13848 rajageomeetria kvaliteedi jaoks), ning annab igale piirangule kasti, kuhu kirjutada allika punkt. Ühtegi standardi numbrit ei ole sisse ehitatud: ülekallutuse, puudujäägi, liigu, kalde ja muutumise piirid, vahetuse geomeetria ja vabaprofiil on kõik endiselt kohatäited ning aken sellest teatab. Raudteeinsener kontrollib iga väärtust standardi enda tekstist ja kirjutab selle kõrvale punkti, enne kui midagi ehitatakse. Lõuna-Aafrika ja AREMA tabelid ei ole selles väljaandes.
