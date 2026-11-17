---
title: Visa tomten i 3D
summary: Öppna 3D-vyn, kretsa, panorera och zooma, välj vertikal överdrift och färgsättning, välj vad som visas och klicka på linjeföringar, byggplattor, funktionslinjer, brytlinjer, ledningar, brunnar och punkter för att markera dem.
keywords: etiketter, 3D-etiketter, etiketter som vetter mot kameran, stationsetiketter, höjdkurvsetiketter, punktetiketter, dra över, flygbild, kartlager på ytan, 3d, tre d, 3D-vy, ViewCube, kompass, kretsa, perspektiv, parallell, isometrisk, iso, vertikal överdrift, terräng, modell, tomtmodell, flyga runt, visualisera, rendera, ledningar i 3D, brunnar, korridor i 3D, väg i 3D, vägyta, körfält, kantsten, gångbanor, växter i 3D, träd i 3D, buskar, häckar, landskap i 3D, ramper i 3D, trappsteg, murar, beläggning, hårdgjorda ytor i 3D
from: a16bafe1
---

3D-vyn visar tomten som en modell: den befintliga marken och den planerade ytan, höjdkurvor dragna över dem, brytlinjer och ytkanten, varje linjeföring på sin projekteringsprofil med stationsmarkeringar, korridorens funktionslinjer och själva vägen (körfält, vägrenar, rännstenar, kantstenar, remsor och gångbanor i egna färger), byggplattor med sina släntkrön, ledningsnätet med ledningar och brunnar på deras verkliga höjder, och från arbetsytan Landskap växterna, beläggningen, gångarna, murarna, kantstenarna, ramperna och trappstegen. Den läser samma projekt som planen, så varje ändring syns i båda.

## Öppna 3D-vyn

1. Öppna mätpunkter (eller en LandXML- eller projektfil) så att det finns en yta. Växter, beläggning eller ramper ensamma räcker också för att öppna den.
2. Tryck på {{key:D}}, eller klicka på {{ui:3D}} i gruppen {{ui:Visa}} på verktygsfältet.
   3D-vyn öppnas över planen och visar hela tomten från sydost. Första gången tar det en stund att läsa in den.
3. Tryck på {{key:D}} igen, eller klicka på {{ui:3D}} igen, för att gå tillbaka till planen. Att välja ett ritverktyg som {{ui:Linjeföring}} eller {{ui:Byggplatta}} går också tillbaka till planen, eftersom ritandet sker där.

## Förflytta dig

| För att | Gör så här |
|---|---|
| Kretsa | Dra med vänster eller mittenknappen |
| Panorera | Dra med högerknappen, eller {{key:Shift}} och dra |
| Zooma | Vrid hjulet; det zoomar mot pekaren |
| Kretsa på en styrplatta | Svep med två fingrar ({{key:Shift}} och svep panorerar) |
| Zooma på en styrplatta | Nyp |
| Touch | Ett finger kretsar; två fingrar nyper för att zooma och förflyttas för att panorera |
| Tangenter (vyn har fokus) | {{key:Left}} {{key:Right}} {{key:Up}} {{key:Down}} kretsar, med {{key:Shift}} panorerar de; {{key:Plus}} och {{key:Minus}} zoomar |

Fältet över vyn har resten:

- Vyllistan: **Iso**, **Uppifrån**, **Underifrån**, **Framifrån** (blickar norrut), **Bakifrån**, **Vänster**, **Höger**.
- {{ui:Perspektiv}}: nedtryckt är en perspektivvy; klicka för en parallellprojektion (ingen förkortning).
- {{ui:Utsträckning}}: visar allt igen. {{key:F}} gör samma sak medan 3D-vyn är öppen.

## ViewCube

ViewCube i det övre högra hörnet vrids med vyn. Klicka på en sida, kant eller hörn för att se tomten från dit (kameran vrids mjukt om inte ditt system ber om reducerad rörelse). Dra kuben för att kretsa runt. Kompassringen under den visar nord (rutnätsnord, +Y): dra ringen för att vrida tomten kring vertikalen, eller klicka på N, Ö, S eller V för att se från den sidan. {{ui:Start}}, det lilla huset uppe till vänster, går tillbaka till isovyn av hela tomten. Med tangentbordet: {{key:Tab}} till kuben, pilarna väljer en sida, kant eller hörn, och {{key:Enter}} ser från dit.

På planen visar samma kub ovansidan. Klicka på någon annan sida, kant eller hörn (eller dra den) för att öppna 3D-vyn och se från dit: det är snabbaste vägen till 3D från en viss riktning. För att byta kuben mot en liten axelikon, eller dölja den, se **Hörnindikator** i [CivilCraft-inställningar](topic:settings).

## Överdriv höjderna

Tomter är oftast mycket bredare än de är höga, så höjderna sträcks ut med **2×** från början. Välj **1×**, **2×**, **3×**, **5×** eller **10×** i listan på fältet, eller under **Vertikal överdrift i 3D** i [CivilCraft-inställningar](topic:settings) (de två är en och samma inställning). Bara vyn ändras: volymer, profiler och exporter förblir i sann skala.

## Färgsätt ytorna

- **Höjdband**: samma band och färger som planens höjdband (antalet band ställs in under **Visa** i vänstra panelen). Varje bandkant skärs exakt vid sin höjd.
- **En färg**: den befintliga marken och den planerade ytan var och en i en enkel färg.
- **Kartlager**: kartlagren som visas under planen (en georefererad bild, kartrutor eller en kartservice; se [Kartlager](topic:map-layers)) läggs över ytorna som ett ark, så att en flygbild syns på kullarna. Bilder som fortfarande laddas fyller i när de kommer. Utan något kartlager som visas behåller ytorna sina höjdband, och vyn säger det. Bilden är för skärmen: GLB- och OBJ-exporter innehåller den inte.

När båda ytorna visas är den befintliga marken genomskinlig över den planerade ytan, så att du kan se schakt (mark ovanför projekteringen) och fyllning.

## Välj vad som visas

Klicka på {{ui:Visa}} i fältet och bocka i eller av:

| Post | Vad det är |
|---|---|
| Befintlig mark | Ytan byggd från mätpunkterna (eller läst från LandXML) |
| Planerad yta | Den befintliga marken med korridorerna och byggplattorna planerade in (endast när det finns några) |
| Triangelkanter | Varje TIN-kant, som linjer |
| Höjdkurvor | Huvud- och underhöjdskurvor för varje visad yta, med planens intervall |
| Ytkant | Ytterkanten av varje visad yta, på dess höjder |
| Brytlinjer | Varje brytlinje, på dess höjder |
| Linjeföringar och stationer | Varje linjeföring på sin projekteringsprofil (på marken där det inte finns någon profil), med markeringar var 50 ft eller 20 m |
| Korridorens funktionslinjer | Beläggningskant, vägren och släntkrön på båda sidor |
| Vägytor | Vägen varje korridor bygger, från dess sektionsuppbyggnad: körfält, vägrenar, rännstenar, kantstenar, remsor och gångbanor, var och en i egen färg, på den planerade ytan |
| Växter | Varje växt, och växterna i bäddar och häckar, som enkla former efter växtlistan: ett träd är en stam och en rund krona (en kon för ett barrträd, en tuva på en hög stam för en palm), buskar, häckväxter, perenner och marktäckare är kupoler, gräs är tuvor och klätterväxter smala pelare. De står på den planerade ytan (eller den befintliga marken) i den storlek planen visar: mogen, eller vid plantering |
| Hårdgjorda ytor | Beläggning och gångar med deras fall, murar, kantstenar, trappsteg och ramper som stiger i sträckor med plana vilplan emellan |
| Byggplattor och släntkrön | Varje byggplattas kontur på dess höjd och dess släntkrön |
| Ledningar och brunnar | Ledningar som runda rör mellan deras bottennivåer, brunnar från brunnslock ner till sumpen |
| Mätpunkter | En prick vid varje punkt med en höjd (av från början) |
| GIS-lager | De GIS-lager som visas på planen, i deras färger: linjer och konturer med egna höjder på dessa höjder, andra läggs på den befintliga marken (de följer den exakt); punkter som små kryss. Former utan höjder utanför ytan utelämnas, och vyn säger hur många |
| Etiketter | Namn och värden som alltid vetter mot dig: varje linjeförings namn vid dess början och dess stationer var 100 ft (eller 100 m), höjden för varje huvudhöjdkurva, byggplattor, funktionslinjer och brunnar med namn, och med **Mätpunkter** ikryssad varje punkts nummer och höjd |

Etiketter står lika stora och upprätta hur du än vrider eller zoomar, och en kulle framför en etikett döljer den. Där de skulle trängas syns de viktigaste och resten väntar tills du zoomar in: linjeföringar först, sedan brunnar, byggplattor, funktionslinjer, stationer, höjdkurvor och punkter, de närmare först. De finns bara på skärmen; exporter och utskrifter utelämnar dem.

Dina val, överdriften och färgsättningen kommer ihåg i den här webbläsaren.

En väg byggs på den befintliga marken. Med en linjeföring och en korridor men inga mätpunkter eller yta än ritas vägen på tillfällig platt mark: på medelhöjden för dess projekteringsprofil, eller jämn på höjd 0 när det inte finns någon profil heller. En varning längst ner i 3D-vyn och i korridorens egenskaper säger det. Det är bara en bild: inga volymer eller sektioner kommer från den. Öppna mätpunkter eller en yta, så flyttar sig vägen till den verkliga marken av sig själv.

Den vertikala överdriften sträcker marken, inte växterna: de står på den överdrivna marken i sin verkliga höjd och spridning, så ett träd ser ut som ett träd vid varje inställning. Växter är enkla former, inte detaljerade modeller: tusentals av dem förblir snabba att vrida och zooma i.

## Ledningar och brunnar

- En ledning ritas med sin botten inuti vid de bottennivåer du anger, och med sin topp inuti (kronan) en innerdiameter högre. Diametrar anges i tum i ett projekt i fot och i millimeter i ett metriskt projekt, som i den högra panelen.
- En brunn går från sitt brunnslock (inskrivet eller från ytan) ner till sin sump (lägsta bottennivå minus sumpdjupet). Utan någon bottennivå ritas den 5 ft (1.5 m) djup.
- Ledningar och brunnar med ett problem (se nätkontrollen i den högra panelen) ritas i rött.
- En ledning utan bottennivåer ritas inte; en notering längst ner i vyn anger hur många.

## Markera från 3D-vyn

Klicka på en linjeföring (eller dess väg), en byggplatta, en funktionslinje, en ledning, en brunn, en mätpunkt, en växt, en rampe eller annan hårdgjord yta. Den markeras precis som om du klickat på den i planen: dess egenskaper öppnas i den högra panelen, där du kan redigera dem, och den ritas i markeringsfärgen överst på allt i 3D. Det du markerar på planen framhävs också i 3D. Ett tips bredvid pekaren anger vad du klickade på, med dess östvärde, nordvärde och höjd. Ledningar och brunnar kan klickas även där de ligger under marken; en linje som döljs bakom en kulle kan inte klickas igenom den.

Klicka på en brytlinje för att se vilken det är: den framhävs, och statusfältet anger namnet (brytlinjer har inga egna egenskaper).

Klicka på marken för att läsa östvärde, nordvärde och höjd där i tipset.

## Kör längs en linjeföring

Klicka på **Kör** i 3D-fältet och välj en linjeföring. Vyn flyttar sig till en förarplats: 3.5 ft (1.07 m) över vägen, på dess projekteringsprofil (på den befintliga marken längs mittlinjen när den ännu inte har någon), och ser framåt längs den.

- **Spela** eller {{key:Space}} kör med den hastighet du väljer (10 till 65 mph, eller 15 till 100 km/h); {{key:Space}} igen pausar. Den stannar vid slutet; **Spela** startar då om från början.
- Reglaget hoppar till vilken station som helst; {{key:Left}} och {{key:Right}} stegar 10 ft (5 m) bakåt och framåt.
- Att dra i vyn pausar och låter dig titta runt.
- **Stoppa** eller {{key:Esc}} återställer vyn till där den var.

Den vertikala överdriften gäller även vid körning: ställ den på 1× för att se vägen som den kommer att bli.

## Ljus från solen

Öppna **Sol** i 3D-fältet och bocka i **Ljus från solen**. Ange ett datum, en klockslag och dess tidszon (förskjutningen från UTC: på sommaren, den sommartid), samt tomtens latitud och longitud. När projektet har ett koordinatsystem fylls de i från det.

Tomten belyses sedan från där solen står, med **Skuggor** över marken, korridoren och byggplattorna; menyn anger solens azimut och hur högt den står, eller att den är under horisonten. Lägena kommer från NOAA:s solekvationer. Skuggorna faller rätt vid vilken överdrift som helst, men de upphör vid tomtens kant: kullar och byggnader bortom den kastar inga.

## Exportera 3D-vyn

Klicka på {{ui:GLB}} eller {{ui:OBJ}} i fältet. Det vyn visar sparas i sann skala (ingen överdrift), i meter, med Y uppåt. Detaljer: [Exportera tomten i 3D](topic:export-3d).
