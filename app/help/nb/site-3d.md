---
title: Vis området i 3D
summary: Åpne 3D-visningen, kretse, panorere og zoome, sett vertikal overdrivelse og farging, velg hva som vises, og klikk veglinjer, byggeplater, formlinjer, bruddlinjer, rør, konstruksjoner og punkter for å velge dem.
keywords: etiketter, 3d-etiketter, billboard, etiketter som vender mot kameraet, profilnummeretiketter, høydekurvetiketter, punktetiketter, drapering, flyfoto, kartlag på terrengmodellen, 3d, tre d, 3d-visning, visningskube, kompass, kretse, perspektiv, parallell, isometrisk, iso, vertikal overdrivelse, terreng, modell, områdemodell, flyr rundt, visualiser, render, rør i 3d, konstruksjoner, kummer, korridor i 3d, vei i 3d, veibane, kjørefelt, kantsteiner, fortau, planter i 3d, trær i 3d, busker, hekker, landskap i 3d, ramper i 3d, trapper, murer, belegning, hardscape 3d
from: a16bafe1
---

3D-visningen viser området som én modell: det eksisterende terrenget og det konstruerte terrenget, høydekurver tegnet på dem, bruddlinjer og terrengkanten, hver veglinje på sitt dimensjoneringsprofil med profilnummermerker, korridorens formlinjer og selve veien (kjørefelt, skuldre, renner, kantsteiner, striper og fortau i egne farger), byggeplater med sine dagslinjer, rørnettet med rør og konstruksjoner i sine virkelige koter, og fra arbeidsområdet Landskap planter, belegning, stier, murer, kantsteiner, ramper og trapper. Den leser samme prosjekt som planen, så hver redigering vises i begge.

## Åpne 3D-visningen

1. Åpne målepunkter (eller en LandXML- eller prosjektfil) slik at det finnes en terrengmodell. Planter, belegning eller ramper alene er nok til å åpne den også.
2. Trykk {{key:D}}, eller klikk {{ui:3D}} i gruppen {{ui:Visning}} på verktøylinjen.
   3D-visningen åpnes over planen og ser på hele området fra sørøst. Første gang tar det et øyeblikk å laste.
3. Trykk {{key:D}} igjen, eller klikk {{ui:3D}} igjen, for å gå tilbake til planen. Å velge et tegneverktøy som {{ui:Veglinje}} eller {{ui:Byggeplate}} går også tilbake til planen, siden tegning skjer der.

## Bevege deg rundt

| For å | Gjør dette |
|---|---|
| Kretse | Dra med venstre eller midtre knapp |
| Panorere | Dra med høyre knapp, eller {{key:Shift}} og dra |
| Zoome | Snu hjulet; det zoomer mot pekeren |
| Kretse på styreflate | Sveip med to fingre ({{key:Shift}} og sveip panorerer) |
| Zoome på styreflate | Klyp |
| Berøring | Én finger kretser; to fingre klyper for å zoome og flytter for å panorere |
| Taster (visningen har fokus) | {{key:Left}} {{key:Right}} {{key:Up}} {{key:Down}} kretser, med {{key:Shift}} panorerer de; {{key:Plus}} og {{key:Minus}} zoomer |

Linjen over visningen har resten:

- Visningslisten: **Iso**, **Topp**, **Bunn**, **Forside** (ser mot nord), **Bak**, **Venstre**, **Høyre**.
- {{ui:Perspektiv}}: trykket er en perspektivvisning; klikk den for en parallell projeksjon (ingen forkorting).
- {{ui:Utstrekning}}: viser alt igjen. {{key:F}} gjør det samme mens 3D-visningen er åpen.

## ViewCube

Visningskuben øverst til høyre dreier seg med visningen. Klikk en side, en kant eller et hjørne for å se området fra der (kameraet dreier jevnt med mindre systemet ditt ber om redusert bevegelse). Dra kuben for å kretse. Kompassringen under den viser nord (rutenettets nord, +Y): dra ringen for å dreie området om vertikalen, eller klikk N, Ø, S eller V for å se fra den siden. {{ui:Hjem}}, det lille huset øverst til venstre, går tilbake til iso-visningen av hele området. Med tastaturet: {{key:Tab}} til kuben, piltastene velger en side, kant eller et hjørne, {{key:Enter}} ser derfra.

I planen viser den samme kuben toppen. Klikk en annen side, kant eller et hjørne (eller dra den) for å åpne 3D-visningen og se derfra: det er raskeste vei til 3D fra en gitt retning. For å bytte kuben mot et lite aksesymbol, eller skjule den, se **Hjørneindikator** i [CivilCraft-innstillinger](topic:settings).

## Overdriv kotene

Områder er vanligvis mye bredere enn de er høye, så kotene strekkes med **2×** til å begynne med. Velg **1×**, **2×**, **3×**, **5×** eller **10×** i listen på linjen, eller under **Vertikal overdrivelse i 3D** i [CivilCraft-innstillinger](topic:settings) (de to er én innstilling). Bare visningen endrer seg: volumer, profiler og eksporter er i sann målestokk.

## Farg flatene

- **Høydebånd**: de samme båndene og fargene som planens høydebånd (antall bånd settes under **Vis** i venstre panel). Hver båndkant kuttes nøyaktig ved sin kote.
- **Én farge**: det eksisterende terrenget og det konstruerte terrenget hver i en ensfarget.
- **Kartlag**: kartlagene som vises under planen (et georeferert bilde, kartfliser eller en karttjeneste; se [Kartlag](topic:map-layers)) legges over flatene som et ark, så et flyfoto vises på åsene. Bilder som fortsatt kommer, fylles inn etter hvert som de ankommer. Uten et synlig kartlag beholder flatene sine høydebånd, og visningen sier det. Bildet er for skjermen: GLB- og OBJ-eksporter tar det ikke med.

Når begge flatene vises, er det eksisterende terrenget gjennomsiktig over det konstruerte terrenget, så du kan se skjæringen (terreng over konstruksjonen) og fyllingen.

## Velg hva som vises

Klikk {{ui:Vis}} på linjen og kryss av eller fjern av:

| Element | Hva det er |
|---|---|
| Eksisterende terreng | Flaten bygget fra målepunktene (eller lest fra LandXML) |
| Konstruert terreng | Det eksisterende terrenget med korridorer og byggeplater konstruert inn (bare når det finnes noen) |
| Trekantkanter | Hver TIN-kant, som linjer |
| Høydekurver | Hovedkurver og hjelpekurver for hver flate som vises, med planens intervall |
| Terrengkant | Den ytre kanten av hver flate som vises, ved dens koter |
| Bruddlinjer | Hver bruddlinje, ved sine koter |
| Veglinjer og profilnumre | Hver veglinje på sitt dimensjoneringsprofil (på terrenget der det ikke finnes noe profil), med merker hver 50 ft eller 20 m |
| Korridorens formlinjer | Kant av kjørebane, skulder og dagslinje på begge sider |
| Veiflater | Veien hver korridor bygger, fra sin oppbygging: kjørefelt, skuldre, renner, kantsteiner, striper og fortau, hver i sin farge, på det konstruerte terrenget |
| Planter | Hver plante, og plantene i bed og hekker, som enkle former dimensjonert fra plantelisten: et tre er en stamme og en rund krone (en kjegle for en bartre, en tust på en høy stamme for en palme), busker, hekkplanter, stauder og markdekke er kupler, gress er tuster, klatreplanter er tynne søyler. De står på det konstruerte terrenget (eller det eksisterende terrenget) i den størrelsen planen viser: moden, eller ved planting |
| Belegning | Belegning og stier med sine fall, murer, kantsteiner, trapper og ramper som stiger i løp med flate avsatser mellom |
| Byggeplater og dagslinje | Hver byggeplateskisse ved sin kote og dens dagslinje |
| Rør og konstruksjoner | Rør som runde rør mellom sine bunner, konstruksjoner fra kum til sump |
| Punkter | En prikk ved hvert punkt med en kote (av til å begynne med) |
| GIS-lag | GIS-lagene som vises i planen, i sine farger: linjer og konturer med egne koter ved disse kotene, andre lagt på det eksisterende terrenget (de følger det nøyaktig); punkter som små kryss. Former uten kote utenfor flaten utelates, og visningen sier hvor mange |
| Etiketter | Navn og verdier som alltid vender mot deg: hver veglinjes navn ved starten og dens profilnummer hver 100 ft (eller 100 m), koten til hver hovedkurve, byggeplater, formlinjer og konstruksjoner med navn, og med **Punkter** avkrysset hvert punkts nummer og kote |

Etiketter beholder samme størrelse og står rett uansett hvordan du dreier eller zoomer, og en høyde foran en etikett skjuler den. Der de ville bli trangt, vises det viktigste og resten venter til du zoomer inn: veglinjer først, deretter konstruksjoner, byggeplater, formlinjer, profilnumre, kurver og punkter, de nærmeste først. De er bare på skjermen; eksporter og plott tar dem ikke med.

Valgene dine, overdrivelsen og fargingen huskes i denne nettleseren.

En vei bygges på det eksisterende terrenget. Med en veglinje og en korridor, men uten målepunkter eller terrengmodell ennå, tegnes veien på flatt erstatningsterreng for nå: på gjennomsnittskoten til dimensjoneringsprofilet, eller vannrett på kote 0 når det heller ikke finnes noe profil. En advarsel nederst i 3D-visningen og i korridorens egenskaper sier det. Det er bare et bilde: ingen volumer eller tverrprofiler kommer fra det. Åpne målepunkter eller en flate, så flytter veien seg til det virkelige terrenget av seg selv.

Den vertikale overdrivelsen strekker terrenget, ikke plantene: de står på det overdrevne terrenget i sin virkelige høyde og utbredelse, så et tre ser ut som et tre ved hvilken som helst innstilling. Planter er enkle former, ikke detaljerte modeller: tusenvis av dem er raske å dreie og zoome.

## Rør og konstruksjoner

- Et rør tegnes med sin bunn innvendig ved bunnene du satte, og toppen innvendig (scheitelen) én innvendig diameter høyere. Diametere er i tommer i et fotprosjekt og millimeter i et meterprosjekt, som i høyre panel.
- En konstruksjon går fra sin kumkant (skrevet inn, eller fra terrengflaten) ned til sin sump (den laveste bunnen minus sumpdybden). Uten noen bunn tegnes den 5 ft (1,5 m) dyp.
- Rør og konstruksjoner med et problem (se nettkontrollen i høyre panel) tegnes i rødt.
- Et rør uten bunner tegnes ikke; en merknad nederst i visningen sier hvor mange.

## Velg fra 3D-visningen

Klikk en veglinje (eller dens vei), en byggeplate, en formlinje, et rør, en konstruksjon, et målepunkt, en plante, en rampe eller annen belegning. Den velges akkurat som om du klikket den i planen: egenskapene åpnes i høyre panel, der du kan redigere dem, og den tegnes i utvalgsfargen over alt annet i 3D. Det du velger i planen markeres også i 3D. Et tips ved siden av pekeren navngir det du klikket, med dets øst, nord og kote. Rør og konstruksjoner kan klikkes der de ligger under bakken; en linje skjult bak en høyde kan ikke klikkes gjennom den.

Klikk en bruddlinje for å se hvilken det er: den markeres, og statuslinjen navngir den (bruddlinjer har ingen egne egenskaper).

Klikk terrenget for å lese øst, nord og kote der i tipset.

## Kjør langs en veglinje

Klikk **Kjør** på 3D-linjen og velg en veglinje. Visningen flytter seg til et førersete: 3,5 ft (1,07 m) over veien, på dimensjoneringsprofilet (på det eksisterende terrenget langs midtlinjen når den ikke har et ennå), og ser fremover langs den.

- **Spill av** eller {{key:Space}} kjører i den farten du velger (10 til 65 mph, eller 15 til 100 km/t); {{key:Space}} igjen setter på pause. Den stopper ved slutten; **Spill av** starter da på nytt fra begynnelsen.
- Glidebryteren hopper til et hvilket som helst profilnummer; {{key:Left}} og {{key:Right}} tar 10 ft (5 m) steg bakover og fremover.
- Å dra i visningen setter på pause og lar deg se deg rundt.
- **Stopp** eller {{key:Esc}} setter visningen tilbake dit den var.

Den vertikale overdrivelsen gjelder også under kjøring: sett den til 1× for å se veien slik den blir.

## Lys fra solen

Åpne **Sol** på 3D-linjen og kryss av **Sollys**. Oppgi en dato, et klokkeslett og dets tidssone (forskjellen fra UTC: sommertid i sommerhalvåret), og områdets breddegrad og lengdegrad. Når prosjektet har et koordinatsystem, fylles de inn fra det.

Området lyses da fra der solen står, med **Skygger** over terrenget, korridoren og byggeplatene; menyen sier solens azimut og hvor høyt den står, eller at den er under horisonten. Posisjonene kommer fra NOAAs solligninger. Skyggene faller riktig ved enhver overdrivelse, men de stopper ved kanten av området: høyder og bygninger utenfor det kaster ingen.

## Eksporter 3D-visningen

Klikk {{ui:GLB}} eller {{ui:OBJ}} på linjen. Det visningen viser lagres i sann målestokk (uten overdrivelse), i meter, med Y opp. Detaljer: [Eksporter området i 3D](topic:export-3d).
