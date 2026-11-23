---
title: Tegn et lodret længdeprofil
summary: Åbn længdeprofilvisningen, start et projekteret længdeprofil fra terrænet, tilføj og træk PVI'er, angiv lodrette kurvelængder, og læs fald, K-værdier samt høje og lave punkter.
keywords: profil, lodret tracé, pvi, lodret kurve, fald, k-værdi, top, bund, bvc, evc, længdeprofilvisning, færdigt fald, fg, eksisterende terrænprofil, feature-linjer i profilet, krydsninger, projiceret, kantsten, grøft, etiketter
from: dbb1f32d
---

Hvert tracé har ét projekteret længdeprofil: en liste af PVI'er (station og kote) forbundet med rette fald, med en symmetrisk parabolsk lodret kurve ved ethvert indre PVI, der har en længde. Det eksisterende terrænprofil hentes fra overfladen for dig.

## Åbn længdeprofilvisningen

1. Vælg tracéet (klik på det med {{ui:Vælg}}).
2. Tryk {{key:R}}, eller klik på {{ui:Længdeprofil}} i værktøjslinjen, eller {{ui:Længdeprofilvisning}} nederst i højre panel.
   Længdeprofilvisningen åbner under planen med det eksisterende terræn langs tracéet. Med to eller flere tracéer vælges et i listen til venstre i profilbjælken.

Visningen starter med at vise hele tracéet og strækker kotene, så de fylder panelet; overdrivelsen står nederst til venstre, for eksempel »Lodret overdrivelse 10×«.

## Zoom og panorér profilet

- **Zoom:** drej musehjulet (eller klem på et trackpad), og visningen zoomer om markøren. Hold {{key:Shift}} for kun at zoome stationerne, eller {{key:Alt}} for kun at zoome kotene (det ændrer overdrivelsen). Når længdeprofilvisningen har fokus, zoomer plus- og minustasterne om midten.
- **Panorér:** træk med højre eller midterste museknap, eller stryg med to fingre på et trackpad.
- **Tilpas:** dobbeltklik på profilet, eller tryk {{key:F}} for at vise hele tracéet igen.

Redigering af en PVI beholder den zoom, du valgte; den springer ikke tilbage til tilpasning.

Flyt markøren langs profilet: bjælken viser station, terræn- og projekterede koter, fald og afgravning eller opfyld dér, og en prik følger med på tracéet i planen.

## Start det projekterede længdeprofil

1. I højre panel under **Projekteret længdeprofil**, klik på {{ui:Start fra terrænet}}.
   To PVI'er placeres på terrænet i de to ender af tracéet, forbundet med ét rent fald. Statuslinjen siger »Projekteret længdeprofil startet på terrænet i begge ender. Slå Tilføj PVI'er til og klik for at tilføje fald-knæk; angiv dem en kurvelængde i tabellen.«

Hvis tracéet ikke krydser overfladen, får du »Dette tracé har ikke noget terræn under sig at starte fra.« Tilføj så PVI'er ved at klikke i stedet (næste afsnit).

## Tilføj PVI'er

1. Tryk {{key:I}}, eller klik på {{ui:Tilføj PVI'er}} i profilbjælken. Den forbliver trykket.
2. Klik i profilet, hvor du vil have et fald-knæk. Der tilføjes en PVI ved den station og kote, afrundet til 0.01, og den vælges.
3. Tilføj så mange, du har brug for, og tryk derefter {{key:I}} igen for at stoppe.

Et klik, hvor der allerede er en PVI, afvises (»Der er allerede en PVI ved …«). PVI'er står altid i stationsrækkefølge.

## Fang, mens du tilføjer eller trækker

Knappen **Fang** i profilbjælken er slået til fra start. Mens den er til, lander en PVI, du tilføjer eller trækker, på nærmeste PVI, terrænpunkt, PVI-station eller terrænlinjen, og en etiket ved markøren siger hvilken. Hold {{key:Alt}} for et frit punkt, hvor som helst.

## Justér PVI'er

- **Træk** en PVI i profilet for at flytte den. Den kan ikke passere sine naboer. Flytningen er ét fortrydelsestrin.
- **Indtast** præcise værdier i PVI-tabellen i højre panel: **Station**, **Kote**, **Hældning %** og **Kurve L** (lodret kurvelængde). Tryk {{key:Enter}} efter hver.
- **Vælg** en værdi fra profilet: den lille knap ved siden af en PVI's station eller kote venter på ét klik i længdeprofilvisningen og udfylder værdien. Klikket fanger som ved Tilføj PVI'er; hold {{key:Alt}} for et frit punkt; {{key:Esc}} annullerer.
- **Hældning %** er faldet på tangenten, der starter ved den PVI og løber til den næste. Indtastning flytter den **næste** PVI's kote (dens station flytter sig aldrig). Er den næste PVI låst, flytter den forrige PVI's kote i stedet.
- **Lås** en PVI med hængelåsen i enden af dens række. En låst PVI trækkes ikke, og en hældningsredigering flytter den ikke. Er begge ender af en tangent låst, kan dens hældning ikke ændres: statuslinjen siger det, og du låser først den ene ende op. Låsen gemmes i filen.
- **Fjern** en PVI med x'et i enden af dens række, eller vælg den (klik på den) og tryk {{key:Delete}}. Når længdeprofilvisningen har fokus, fjerner {{key:Backspace}} den også.

Den første og sidste PVI får aldrig en kurve.

## Lodrette kurver

1. Skriv en længde i **Kurve L** for en indre PVI, for eksempel 200.
2. Kurven tegnes centreret på PVI'en. Profilet og højre panel viser dens type (top eller bund), L og K, BVC- og EVC-stationerne og -kotene samt dens høje eller lave punkt, når det ligger inde i kurven.

K beregnes ud fra L (K = L divideret med den algebraiske forskel i fald, i procent). Du indtaster L; indtastning af K direkte er endnu ikke tilgængelig.

Hvis en lodret kurve ikke passer, forklarer en rød boks hvorfor: den går tilbage ind i PVI'en eller kurven før den, eller forbi den næste PVI, og hvor meget plads der er på den side (en kurve behøver halvdelen af sin længde på hver side af sin PVI). Dens knap sætter **den længste kurve, der passer**, med dens K, som ét trin ({{key:Mod+Z}} fortryder det). Eller flyt PVI'erne fra hinanden.

## Læs fakta

Under PVI-tabellen lister en liste hvert fald i procent (»Fald 1: +1.25%«) og hver kurve, for eksempel »Top ved 2+00.00: L 200.00, K 85.3, BVC 1+00.00 (253.10), EVC 3+00.00 (252.40)«, derefter »Højt punkt 1+62.40, 254.12«.

Hvis PVI'erne ikke når begge ender af tracéet, siger en note det. En korridor bygges kun, hvor profilet og tracéet overlapper.

## Feature-linjer i profilet

Feature-linjer vises også i længdeprofilvisningen, så du kan se en kantsten, en grøft eller en murtop i forhold til vejens profil.

- Hvor en feature-linje **krydser** tracéet, viser profilet en lille rombe ved den station og kote, mærket med linjens navn og dens kote der (linjens egen kote, beregnet langs det segment, der krydser).
- Indtast en afstand i {{ui:Ved siden af inden for}} for også at tegne de feature-linjer, der **løber ved siden af** tracéet inden for den afstand, som stiplede linjer i deres egne koter. Tom eller 0 viser kun krydsningerne.
- Markeringerne og etiketterne følger hver ændring: flyt et hjørnepunkt, indtast et fald eller hæv linjen, og profilet viser de nye koter med det samme.
- Klik på en krydsnings rombe for at vælge den feature-linje; den valgte linje tegnes i fremhævningsfarven.
- {{ui:Feature-linjer}} i profilbjælken skjuler eller viser dem alle. Begge indstillinger gemmes med projektet.

Se [Feature-linjer](topic:feature-lines).

## Næste

- [Tegn en vejkorridor](topic:corridor) langs tracéet og dette profil.
- Profilet skrives til LandXML sammen med tracéet; se [Udveksling af LandXML](topic:landxml).
