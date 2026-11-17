---
title: Projektér et jernbanespor
summary: Gør et tracé til et jernbanespor: overgangskurver (klothoide, kubisk parabel, Bloss, Helmert, sinus halvbølge, sinus), overhøjde i hver kurve med ligevægtsoverhøjde, overhøjdemangel og overhøjdeoverskud, grænser for overhøjde og sporgeometri som advarsler, sporskifter og forbindelsesspor efter station, et frirum sweepet langs linjen og et spor med skinner, svellere og ballastlag bygget som korridoren, i plan, snit, længdeprofil, 3D og mængder.
keywords: jernbane, skinne, jernbane, spor, tog, metro, sporvogn, overhøjde, overhøjdemangel, overhøjdeoverskud, ligevægtsoverhøjde, overgang, overgangskurve, klothoide, kubisk parabel, bloss, helmert, sinus halvbølge, cosinus, sporvidde, normalspor, bredspor, meterspor, smalspor, sveller, ballast, underballast, banelegeme, cess, sporafstand, 60E1, 54E1, UIC60, 115RE, 136RE, overhøjdegradient, ændringshastighed for overhøjde, sporskifte, tunge, sporskifte, forbindelsesspor, hjertestykke, hjertenummer, indledning, lukningskurve, afgrenende hastighed, frirum, lysprofil, kinematisk profil, perron, perronåbning, sporafstand, længdefald, lodret kurve, mindste radius, LandXML overhøjde
from: 99de9745
---

Ethvert tracé kan være et jernbanespor. Dets kurver får så overgangskurver og en overhøjde (skinnernes overhøjde), og korridoren bygges som et spor: skinner på svellere på et ballastlag, planeret ned i terrænet som en vej. Sporskifter og forbindelsesspor placeres på det efter station, og et frirum kan sweeppes langs det og kontrolleres mod det, der står ved siden af sporet.

Alle tal nedenfor er **pladsholdere**, ikke standarder. Jernbaner fastsætter deres grænser ud fra linjehastighed, sporType og land; fastsæt dem ud fra din egen banes standard. CivilCraft indeholder ingen nationale tabeller.

## Gør tracéet til en jernbane

1. Vælg tracéet og find **Jernbane** under Egenskaber.
2. Sæt kryds i **Dette tracé er et jernbanespor**. Hver ændring er ét trin i fortryd.
3. Angiv **Dimensionerende hastighed** øverst i tracéets Egenskaber: det er linjehastigheden, overhøjden kontrolleres mod. **Langsomste tog** (i Jernbane-blokken) er den hastighed, overhøjdeoverskuddet kontrolleres mod.

## Overgange

Angiv en spirallængde i hver ende af hver kurve i PI-tabellen (**Overgang ind**, **Overgang ud**), og vælg derefter dens type i kurvetabellen i Jernbane-blokken, eller **Overgang for hver kurve**:

| Type | Krumning langs overgangen |
|---|---|
| Klothoide | vokser jævnt (vejspiralen) |
| Kubisk parabel | y = x³ / (6·R·L), med L målt langs tangenten; selve kurven er en smule længere |
| Bloss | 3u² − 2u³ af den fulde krumning (u = andelen af længden): starter og slutter blidt |
| Helmert | to parabler, 2u² og derefter 1 − 2(1 − u)² |
| Sinus halvbølge | (1 − cos πu) / 2 |
| Sinus | u − sin(2πu) / 2π |

Alle undtagen den kubiske parabel drejer med L / 2R, ligesom klothoiden. Stationer løber langs den reelle længde. LandXML bevarer typen (spiType clothoid, cubicParabola, bloss, biquadratic, cosine, sinusoid).

## Overhøjde

Skriv **Overhøjde** for hver kurve i millimeter. Tabellen viser for hver kurve:

- **Ligevægtsoverhøjde** = G·v² / (g·R), hvor G er afstanden mellem skinnernes centre (**Skinneafstand**, sporvidden plus skinnehovedets bredde, medmindre du skriver den selv). Med G = 1500 mm bliver det den kendte formel 11,8·V² / R (V i km/t, R i m).
- **Overhøjdemangel** = ligevægtsoverhøjde ved linjehastigheden − anvendt overhøjde.
- **Overhøjdeoverskud** = anvendt overhøjde − ligevægtsoverhøjde ved de langsomste togs hastighed.
- **Rampe**: den stejleste overhøjdegradient langs dens rampe, i mm per meter.

Overhøjden stiger over hver overgang og følger dens krumning: lige for en klothoide eller en kubisk parabel, Bloss-formet for Bloss og så videre. En kurveende uden overgang får sin rampe på den lige strækning før den, så lang som grænsen for overhøjdegradienten kræver, og det angives: overhøjden ændrer sig så der, hvor krumningen ikke gør det.

**Overhøjden drejes om** angiver hvilken skinne der bliver på projekteret profil: **den lave skinne** (den sædvanlige), **den indvendige skinne** eller **sporcentret** (hver skinne flytter sig halvdelen af overhøjden). Det projekterede profil er skinnens overkant dér.

**Overhøjdediagrammet** tegner hver skinnes højde over profilet langs stationerne; profilvisningen og plan- og profilark får det samme som et bånd under profilet.

## Grænser og advarsler for overhøjde

**Størst anvendt overhøjde**, **Størst overhøjdemangel**, **Størst overhøjdeoverskud**, **Stejleste overhøjdegradient** og **Hurtigste ændring af overhøjde** (gradienten ved linjehastighed, mm/s) kontrolleres på hver kurve. En værdi over en grænse er en advarsel i Jernbane-blokken og i panelet Problemer, med grænsen og den fundne værdi. Uden dimensionerende hastighed kontrolleres overhøjdemangel og ændringshastigheden ikke (en note siger det).

## Sporet

Angiv **Sporvidde** (standard 1435 mm, bred-, meter- eller smalsporforvalg, eller din egen), **Skinneprofil** (60E1, 54E1, 49E1, 115RE, 136RE: kun deres offentliggjorte mål), antallet af **Spor** og deres **Sporafstand**, og derefter **Svellere og ballast**: svellermateriale, længde, bredde, højde og afstand; ballasthøjde under svelleren (ved den lave skinne), skulder, skråning, hvor langt dens top ligger under svellerne; underballasthøjde, cessen ud over ballastens fod og banelegemets tværfald.

Tryk på **Byg sporet**. Det tænder for tracéets korridor, bygget som et spor langs det projekterede profil: skinner og svellere hælder med overhøjden, banelegemet gør ikke. Skæringsskråninger løber fra cessens kant ved korridorens afgravning og opfyldningsskråninger, og sporet planeres ind i den foreslåede overflade som en vej.

- **Plan**: begge skinner i hvert spor (lag C-RAIL-TRAK) og, med mere end ét spor, hvert sporcenter (C-RAIL-CNTR), på skærmen, i DXF, DWG, PDF og plan- og profilark.
- **Snit**: svellerne, skinnerne, ballastens og underballastens underkant i hvert snit.
- **3D**: skinnerne, hver sveller og ballastlaget (Vis › Spor), også i GLB, OBJ og USD.
- **Mængder**: sporlængde, skinner (begge skinner i hvert spor, langs hvert spors egen linje), svellere, ballastlaget og ballasten minus svellerne, og underballasten, efter gennemsnitlige endeflader mellem snit.

## Kontrol af sporgeometri

Ud over overhøjden kontrollerer Jernbane-blokken selve linjen mod seks andre grænser (alle pladsholdere, alle dine at fastsætte):

- **Stejleste længdefald** i det projekterede profil, i mm per meter.
- **Mindste radius for lodret kurve**, som en faktor k i R ≥ k·V² (R i meter, V i km/t). En parabolsk lodret kurve med længden L mellem to gradienter har en radius på L divideret med gradientændringen.
- **Korteste lodrette kurve**.
- **Mindste kurveradius** i plan (0 slår kontrollen fra).
- **Korteste bue eller lige strækning**, som sekunder køretid ved linjehastighed: en cirkelbue, eller den lige strækning mellem to kurver, der er kortere end den afstand, advares. 1,8 s er den kendte regel »halv hastighed i km/t, i meter«.
- **Ændringshastighed for overhøjdemangel** langs hver overgang, i mm/s ved linjehastighed.

**Sporgeometri** lister det fundne stejleste længdefald og hver lodret kurve med sin radius og den radius, linjehastigheden kræver. En lodret kurve, der ligger på en overgang eller en overhøjderampe, får en note. Uden projekteret profil eller uden dimensionerende hastighed springes de kontroller over, der kræver dem, og en note siger det.

## Sporskifter og forbindelsesspor

Under **Sporskifter og forbindelsesspor** trykkes på **Tilføj et sporskifte**. Det placeres på den længste lige strækning; angiv det i tabellen:

- **Tungestation**: hvor sporskiftet starter på dette tracé.
- **Hjertestykke**: hjertenummeret N (1:N). Hjertevinklen er 2·atan(1 / 2N).
- **Side**: venstre eller højre, set i retning af stigende station.
- **Afstand for forbindelsesspor** i meter: over 0 bliver sporskiftet til et forbindelsesspor til et parallelt spor så langt væk (to sporskifter og den lige strækning mellem dem).

Tabellen viser **Indledning** (tungespids til hjertestykke), lukningskurvens **Radius** og den **Afgrenende hastighed**, som den radius tillader med din grænse for overhøjdemangel og ingen overhøjde. **Lav dets spor** gør den afgrenende rute til et tracé for sig selv (sporskiftet, lukningskurven, derefter lige frem i hjertevinklen) med de samme jernbaneindstillinger, klar til at blive forlænget.

Planen tegner hvert sporskifts to afgrenende skinner, dets centerlinje, et mærke ved tungespidsen og ved hjertestykket og »1:N« (lag C-RAIL-TURN), på skærmen og i DXF, DWG, PDF og ark. 3D-visningen tegner de afgrenende skinner i hovedsporets niveau.

Formen er en **pladsholder**: en lige tunge og én lukningskurve ud fra hjertenummeret. Et bygget sporskifte følger banens standard og producentens tegning. Advarsler: et sporskifte der løber ud over tracéet, ligger på en kurve, en overgang, en overhøjde eller en lodret kurve, eller overlapper et andet; og en note når linjehastigheden er over dets afgrenende hastighed.

## Frirum

Sæt kryds i **Sweep et frirum langs dette spor**. Vælg **Kontur** (to pladsholderformer, eller **Egen kontur** skrevet som ét punkt per linje: afstand fra sporcentret, derefter højde over skinnens overkant, i meter), **Køretøjslængde** og **Boggiecentre** og, hvis der er en, **Perronkant** (side, afstand fra sporcentret, højde over skinnen).

Ved hver station hældes konturen med overhøjden om den lave skinne og gøres bredere af kurven: køretøjets midte flytter sig indad med b² / 8R, dets ender udad med (L² − b²) / 8R (b boggiecentrene, L køretøjslængden, R radius dér, efter overgangen). Blokken tegner snittet på den lige strækning og dér, hvor det er bredest, og lister:

- det **bredeste frirum** og hvor,
- **sporafstandene** sat op mod de afstande, to nabofrirum kræver,
- den plads der er tilbage ved **perronkanten**, eller hvor meget der er indenfor den,
- hver feature-linje, rørkonstruktion og andet jernbanetracé, der findes **indenfor frirummet**.

En feature-linje med koter bedømmes mod konturen i dens højde over skinnen; uden projekteret profil, eller for et punkt uden kote, bedømmes den kun i plan, og listen siger det. Planen viser frirummets to kanter (lag C-RAIL-CLRN) med et kryds ved hver ting indenfor.

De konturer, der tilbydes, er **pladsholdere, ikke nogen banes sporvidde**. Skriv din banes lysprofil, før du stoler på et resultat.

## I andre programmer

- **LandXML**: et jernbanetracé skrives med sine overgange (spiType) og en `Cant`-blok: sporvidden, rotationspunktet, linjehastigheden og en station, hvor hver overhøjderampe starter og slutter, med den anvendte overhøjde, ligevægtsoverhøjden og overhøjdemangel. Når en LandXML-fil med en `Cant`-blok åbnes, bliver det tracé til et jernbanespor med de overhøjder.
- **IFC**: tracéet med sine overhøjdesegmenter, skinnerne, svellerne, ballasten og underballasten.

## Ikke lavet endnu

Sporskifter i IFC-eksporten, sporskiftefamilier ud over den enkelte lukningskurve (buede tunger, svingtunghjerter, slips, diamanter), kinematiske lysprofilregler (frirummet er en fast kontur med kurveudsving), køreledninger og signalering.

**Hvilken standard.** I Jernbane-blokken angiver **Standard der henvises til** enten Ingen eller Europæisk (UIC og EN). Vælges Europæisk, nævnes de dokumenter, et europæisk projekt henviser til (EN 13803 for tracéparametrene, EN 13232 for sporskifter og krydsninger, EN 15273 for lysprofiler, EN 13848 for sporgeometriens kvalitet), og hver grænse får en boks til den paragraf, den stammer fra. Ingen tal fra nogen standard er indbygget: grænserne for overhøjde, overhøjdemangel, overhøjdeoverskud, gradient og ændringshastighed, sporskiftegeometrien og lysprofilet er alle stadig pladsholdere, og vinduet siger det. En jernbaneingeniør kontrollerer hver værdi mod standardens egen tekst og skriver paragraffen ved siden af, før noget bygges. Sydafrika og AREMA-tabellerne er ikke med i denne udgivelse.
