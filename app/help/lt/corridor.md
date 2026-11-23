---
title: Kelio koridorius išilgai trasos
summary: Įjunkite trasos koridorių, nustatykite juostos, pakraščio ir šoninio šlaito reikšmes ir peržiūrėkite skyrius, ribines linijas bei gruntų darbus, kuriuos jis sukuria.
keywords: sankryža, susikirtimas, kelias susitinka su keliu, šoninis kelias, T sankryža, kirtimasis, aikštelės lygis, jungimas, susiejimas, superelevacija, posūkis, išėjimo ruožas, išlyginimo ruožas, nuolydžių lentelė, skersinis nuolydis, pasukimas, koridorius, sudėtis, tipinis skyrius, kelias, juosta, pakraštys, skersinis nuolydis, šoninis šlaitas, ribinė linija, iškasa, įpylimas, skyriai, tikslas, tikslai, pločio tikslas, aukščio tikslas, poslinkio tikslas, platinimas, dangos kraštas, sekti kitą koridorių
from: 6dcb92b3
---

Koridorius išilgai trasos ir jos projektinio profilio nutiesia vieną paprastą tipinį skyrių (sudėtį), suveda jį su esamu gruntu ir įtraukia rezultatą į projektuojamą paviršių. Vienai trasai gali priklausyti keli koridoriai skirtinguose stacionažo ruožuose, o koridorių galima sudaryti iš daugkartinio naudojimo šablonų pagal stacionažą ([Koridoriaus šablonai](topic:corridor-templates)). Toliau aprašyta paprasta sudėtis yra vienoda abiejose pusėse; jei norite, kad kiekviena pusė turėtų savas dalis, žr. [Kiekvieną pusę sudarykite iš dalių](topic:corridor#build-each-side-from-parts).

## Sudėtis

Nuo ašies į išorę, abiejose pusėse:

1. **juosta** nurodyto pločio, nuo kelio skardos krypstanti **juostos nuolydžiu**
2. **pakraštys** nurodyto pločio su **pakraščio nuolydžiu**
3. **šoninis šlaitas** nuo pakraščio krašto iki susikirtimo su gruntu: **iškasos šlaitas**, kai gruntas yra aukščiau, ir **įpylimo šlaitas**, kai jis yra žemiau

Pradinės reikšmės yra vietos rezervuotojai, o ne projektavimo standartas:

| Reikšmė | JAV pėdos | Metrai |
|---|---|---|
| Juostos plotis | 12 ft | 3.6 m |
| Juostos nuolydis | 2% | 2% |
| Pakraščio plotis | 4 ft | 1.2 m |
| Pakraščio nuolydis | 4% | 4% |
| Iškasos šlaitas | 2 : 1 | 2 : 1 |
| Įpylimo šlaitas | 3 : 1 | 3 : 1 |
| Skyrius kas | 10 ft | 5 m |

Šoninių šlaitų nuolydžiai nurodomi horizontaliai ir vertikaliai (H:V): 3 : 1 reiškia 3 horizontaliai už 1 vertikaliai.

## Sukurkite koridorių

Reikia trasos be klaidų ir projektinio profilio, turinčio bent du PVI ir jokių klaidų.

1. Pasirinkite trasą.
2. Dešiniajame skydelyje, skiltyje **Koridorius**, pažymėkite **Nutiesti sudėtį išilgai projektinio profilio**.
   Atsiranda laukai, ir koridorius sukuriamas iš karto. Plane rodomi juostos ir pakraščio kraštai bei ribinės linijos; jei skiltyje **Rodymas** pasirinkta {{ui:Projektuojamas (su nuolydžiais)}}, kontūrai rodo naują gruntą.
3. Pakeiskite bet kurią reikšmę: **Juostos plotis**, **Juostos nuolydis**, **Pakraščio plotis**, **Pakraščio nuolydis**, **Iškasos šlaitas**, **Įpylimo šlaitas**, **Skyrius kas**. Po kiekvienos paspauskite {{key:Enter}}. Iškasos ir įpylimo šlaitų santykiai bei skyrių tarpas turi būti didesni nei 0.
4. Perskaitykite eilutę po laukais, pavyzdžiui: „39 skyriai nuo 0+00.00 iki 3+86.36; iškasa 240.2 cu yd, įpylimas 556.0 cu yd.“

Skyriai pjaunami kas **Skyrius kas** žingsnį, galuose ir kiekvienos horizontaliosios bei vertikaliosios kreivės pradžioje ir pabaigoje. Kiekvienas skyrius ir per juos einančios linijos (ašis, juostų ir pakraščių kraštai, ribinės linijos) tampa projektuojamo paviršiaus lūžio linijomis.

Norėdami išjungti koridorių, panaikinkite langelio pažymėjimą. Jo reikšmės išsaugomos kitam kartui.

## Kai koridorius nesukuriamas

Raudonas langelis po laukais nurodo priežastį:

| Pranešimas | Ką daryti |
|---|---|
| „The corridor needs a design profile without errors.“ (Koridoriui reikalingas projektinis profilis be klaidų.) | Pridėkite PVI arba ištaisykite persidengiančias vertikaliąsias kreives (žr. [Projektuokite vertikalųjį profilį](topic:profile)). |
| „The design profile does not overlap the alignment.“ (Projektinis profilis nesutampa su trasa.) | Perkelkite PVI į trasos stacionažo ruožą. |
| „The corridor needs at least two sections on the surface.“ (Koridoriui paviršiuje reikia bent dviejų skyrių.) | Didžioji koridoriaus dalis yra ne esamame grunte. |
| „4 side slopes run off the surface before meeting the ground.“ (4 šoniniai šlaitai baigiasi paviršiumi, nepasiekę grunto.) | Paviršiaus krašto zonoje šlaitas negali pasiekti grunto. Laikykite kelią toliau nuo krašto arba sumažinkite įpylimo ar iškasos aukštį toje vietoje. |
| „The corridor’s daylight lines cross (sections overlap, for example on the inside of a tight curve). Use a larger radius or narrower assembly.“ (Koridoriaus ribinės linijos kertasi: skyriai persidengia, pavyzdžiui, staraus posūkio vidinėje pusėje. Naudokite didesnį spindulį arba siauresnę sudėtį.) | Staraus posūkio vidinės pusės skyriai persidengia. Padidinkite spindulį arba susiaurinkite sudėtį. |

Koridorius su problema nėra suvedamas į gruntą ir neįskaičiuojamas į gruntų darbus.

## Koridoriai ir aikštelės kartu

Projektuojamas paviršius kuriamas eilės tvarka: pirmiausia visi koridoriai, po to visos aikštelės. Ten, kur aikštelės suvedimas persidengia su koridoriumi, lemia aikštelė. Ten, kur vėlesnis objektas persidengia su keliu, pakeičiama tik ta kelio dalis, kuri yra vėlesnio objekto ribinės linijos viduje; likusi kelio dalis ir visos gruntą kertančios lūžio linijos išlaiko savo formą. Apimtys skaičiuojamos visose ribinėse linijose kartu; žr. [Gruntų darbų apimtys](topic:volumes).

## Superelevacija

Posūkyje kelias gali būti pasvirtas į vidinę pusę, todėl eismas mažiau spaudžiamas į išorę. Trasos **Ypatybėse**, skiltyje **Superelevacija**, pažymėkite **Superelevuoti posūkius**:

- Kiekviena apskritiminė kreivė pagal nuolydžių lentelę gauna reikšmę **e**: pirmoji eilutė, kurios spindulį kreivė pasiekia (eilutė su tuščia reikšme palieka įprastą skardą). Lentelė ir **Didžiausias santykinis nuolydis** (pradžioje 0.5 %) yra vietos rezervuotojai, o ne standartas: nustatykite juos pagal savo projektavimo kriterijus. Eilutes pridėkite arba šalinkite pagal poreikį.
- Juostos sukasi apie ašį. Prieš posūkį išorinė juosta išlyginama per **išėjimo ruožą** (įprasta skarda ÷ e × išlyginimo ruožas), o paskui per **išlyginimo ruožą** (juostos plotis × e ÷ nuolydis) išorinė juosta toliau sukasi, kol visas kelias nuo e nuolydžio krypsta į vidinę pusę; du trečdaliai išlyginimo ruožo yra prieš posūkį, o vienas trečdalis – posūkyje. Po posūkio tas pats vyksta atvirkštine tvarka.
- Žemesnėje pusėje esantis pakraštys niekada nebūna lygesnis už savo juostą; aukštesnėje pusėje jis išlaiko savo nuolydį (nusirita).
- Lentelė po ja nurodo kiekvienos kreivės spindulį, reikšmę, išlyginimo ir išėjimo ruožus bei vietas, kur prasideda ir baigiasi visa superelevacija. **Superelevacijos schema** pagal stacionažus braižo abiejų juostų skersinius nuolydžius (kairioji juosta – ištisine, dešinioji – brūkšnine linija).
- Apie kreivę, per trumpą pasiekti visą superelevaciją, arba apie dvi kreives, kurių pereinamieji ruožai persidengia, pranešama langeliu virš lentelės.

Skyriai, apimtys, 3D rodinys ir lapai visi rodo pasvirusį kelią. Kiekvienas pakeitimas yra vienas žingsnis: {{key:Mod+Z}} jį anuliuoja.

## Tikslai

Tikslas perkelia vieną kelio vienos pusės tašką į liniją: **Dangos kraštą** arba **Pakraščio kraštą**, **kairėje** arba **dešinėje** pusėje. Kiekvienas skyrius susikerta su linija statmenai ašiai, eidamas tik į tą pusę, todėl dešinės pusės tikslas niekada nejudina kairiosios.

| Nustato | Kas nutinka, kai skyrius susikerta su linija |
|---|---|
| **Plotis** | Taškas atsiduria ant linijos: juosta (arba pakraštys) platėja arba siaurėja iki jos, išlaikydama savo skersinį nuolydį. |
| **Aukštis** | Taškas ten įgyja linijos aukštį savo poslinkyje: juostos (arba pakraščio) skersinis nuolydis prisitaiko. |

Linija gali būti charakteristinė linija (kokia būtų jos **Paskirtis**) arba kito koridoriaus linija: jo ašis, dangos kraštai, pakraščių kraštai ar ribinės linijos. Koridoriaus linija seka tą koridorių: pakeiskite kitą kelią – šis seks. CivilCraft pirmiausia sukuria kitą koridorių; du koridoriai, kurie nukreiptų tikslus vienas į kitą ciklu, atmetami vienoje pusėje, o lentelėje nurodoma, kuriame.

1. Pasirinkite trasą ir įjunkite jos koridorių.
2. Skiltyje **Tikslai** spustelėkite {{ui:Pridėti tikslą}}.
3. Pasirinkite **Pusę**, **Tašką**, ką jis **Nustato** ir **Iki linijos**. Kiekvienas pakeitimas – vienas anuliavimo žingsnis.

**Rezultatas** nurodo, prie kiek skyrių pasiekta linija. Skyriai, kurių linija nepasiekia (už jos galų arba už ašies), išlaiko sudėties reikšmes. Ištrynus liniją, koridorius lieka toks, koks buvo prieš tikslą, ir apie tai lentelėje pranešama. Vienoje pusėje kiekvienam taškui gali būti vienas pločio ir vienas aukščio tikslas.

## Kiekvieną pusę sudarykite iš dalių

Koridoriaus nustatymuose įjunkite **Kiekvieną pusę sudaryti iš dalių**. Tada kiekviena pusė turi savo sąrašą nuo ašies į išorę: juostas, pakraštį, lataką, bordiūrą, želdinių juostelę, šaligatvį ir galiausiai šoninį šlaitą iki grunto (su savo iškasos ir įpylimo santykiais). Pradėkite nuo {{ui:Kelias užmiestyje}} arba {{ui:Miesto gatvė}}, pridėkite ir šalinkite dalis, perkelkite jas rodyklėmis ir {{ui:Kopijuoti}} vieną pusę į kitą. Kiekvienas pakeitimas yra vienas anuliavimo žingsnis.

Skersinis nuolydis yra nuolydis nuo kelio, todėl šaligatvis, nukreipiantis vandenį link kelio, turi neigiamą reikšmę. Bordiūras yra nurodyto aukščio sienelė, nurodyto pločio viršus ir pasirinktinis nuokritis gale. Superelevacija pasuka visas juostas pirmoje eilutėje; latakas, bordiūras, juostelė ir šaligatvis kabo nuo juostų krašto, kaip pastatyta. Tikslai vis dar perkelia juostų galą ir paskutinę dalį. Skersiniuose pjūviuose pažymima latako tėkmės linija, bordiūro viršus ir galas bei kita. Kreivėje su spiralėmis išlyginimo ruožas yra spiralė: plokščias skardis TS taške, pilna superelevacija SC taške.

## Dangos sluoksniai

Juosta, pakraštys, latakas, želdinių juostelė ar šaligatvis gali turėti savo konstrukcijos sluoksnius: po dalimi {{ui:Pridėti sluoksnį}} prideda sluoksnį su pavadinimu, medžiaga, storiu ir rūšimi (paviršius, rišamasis, pagrindas, pagrindo sluoksnis, apsauginis sluoksnis ar kita), iš viršaus į apačią. Sluoksniai nekeičia kelio paviršiaus (jo viršus yra projektinis paviršius); kiekvienas guli po savo dalimi, o jo gylis matuojamas tiesiai žemyn. Skersiniuose pjūviuose kiekvieno sluoksnio apatinė riba braižoma brūkšnine linija, o {{ui:Dangos sluoksniai: kiekiai}} išvardija kiekvieno sluoksnio plotą plane ir tūrį (plotas išilgai koridoriaus pagal jo skyrius, tūris = plotas × storis). IFC eksportas kiekvieną sluoksnį įrašo kaip atskirą elementą su storiu ir medžiaga (žr. [IFC eksportas ir importas](topic:ifc)). Įvestas storis yra jūsų: CivilCraft dangos storio nenustato.

## Kur keliai susitinka su keliais, aikštelėmis ir takais

Įjungus {{ui:Sujungti kelius ir aikšteles, su kuriomis jis susikerta}} (kiekvienam koridoriui ji įjungta), CivilCraft sujungia koridorių su tuo, ką jis plane kerta:

- **Kelias, kuris baigiasi ant kito kelio** (jo trasos galas guli ant kito kelio arba maždaug per pusę savo dangos pločio nuo to kelio krašto) yra sankryžos šoninis kelias. Kelias, su kuriuo jis susitinka, atveria savo kraštą šoninio kelio dangai: per žiotis pakraštys, bordiūras, juostelė ir šaligatvis klojami ant juostos skersinio nuolydžio ir braižomi kaip danga. Šoninis kelias klojamas ant pagrindinio kelio paviršiaus ten, kur jie persidengia, ir prijungiamas prie jo pakylant arba nusileidžiant per privažiavimą.
- **Du kryžiuojantys keliai** sujungiami abiejose pusėse tuo pačiu būdu. Pirmasis kelias, išvardytas skiltyje Trasos, yra pravažiuojamasis kelias; kitas seka jo paviršių per sankryžą.
- **Kelias, kuris baigiasi prie aikštelės** (jos viduje arba maždaug per pusę dangos pločio nuo jos krašto), pasiekia aikštelės lygį ir prie jo prijungiamas per privažiavimą.
- **Takas** (Kraštovaizdis › Kietosios dangos) sustoja ties kelio išoriniu kraštu, šaligatvio ar pakraščio lygyje, o ne guli ant kelio. Takas, kertantis kelią, tampa dviem dalimis. Galas, nubrėžtas šiek tiek trumpiau nei iki kelio (per dvigubą tako pločio atstumą), tęsiamas iki jo krašto.

**Ypatybėse** nurodoma, ką kiekvienas koridorius sujungė, kiek jame kelias buvo pakeltas arba nuleistas ir kokiu ilgiu. Tas ilgis yra didesnis iš 10 m (30 ft) ir dvidešimties pokyčių, ir niekada neviršija 45 % koridoriaus. **Projektinis profilis nekeičiamas**: profilio rodinys vis dar rodo nubrėžtą nuolydžio liniją, o skyriai, projektuojamas paviršius, apimtys ir 3D rodinys rodo kelią taip, kaip jis sujungtas. Norėdami, kad sujungimas būtų tikslus pagal projektą, perkelkite paskutinį PVI į lygį, kurį nurodo Ypatybės.

Koridoriaus jungiklį išjunkite, jei norite, kad jis liktų tiksliai toks, kaip nurodyta jo profilyje ir sudėtyje; tada jis nedalyvauja jokioje sankryžoje nei kaip šoninis, nei kaip pravažiuojamasis kelias. Keliai, susitinkantys beveik vienoje tiesėje (mažiau nei apie 20°), paliekami nepakeisti, kaip ir žemės keliai.

Ko sankryža dar nedaro: nėra bordiūrų lankų (kampai statūs), nėra posūkio juostų ar salelių, šoninio kelio galas nupjaunamas statmenai savo trasai, o koridorius, sudarytas iš šablonų, atveria savo kraštą tuo pačiu paprastu būdu (griovys ar siena jo galo sąlygoje išlyginami per žiotis, be pralaidos). Plano bordiūrų lankams, matomumo trikampiams ir ženklinimui žr. [Gruntai, keliai, matavimai, kasyklos ir ryšiai](topic:soils-roads-survey-mines-links).

## Kas dar neįgyvendinta

Ribinio šlaito tikslai dar nepasiekiami. Koridoriui, kuris kinta išilgai kelio, kai kairė ir dešinė pusės atskirtos, naudokite [Koridoriaus šablonai](topic:corridor-templates). Žr. [Dar neįgyvendinta](topic:not-built-yet).
