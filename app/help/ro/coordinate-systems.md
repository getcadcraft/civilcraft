---
title: Stabilirea sistemului de coordonate al proiectului
summary: Spuneți în ce sistem de coordonate este măsurătoarea, ca CivilCraft să afișeze latitudinea și longitudinea, să plaseze fișierele GIS și straturile de hartă și să scrie fișiere .prj. Alegeți după cod, după nume, după coordonatele în sine sau dintr-un fișier .prj.
keywords: sistem de coordonate, crs, epsg, srid, state plane, spcs, utm, nad83, wgs 84, proiecție, prj, wkt, datum, latitudine, longitudine, lat long, geografic, grilă, georeferențiere, georeferencing, atribuirea sistemului de coordonate
from: 964250e2
---

Coordonatele unui proiect sunt simple numere până când spuneți ce înseamnă. Stabilirea sistemului de coordonate **nu mută niciodată nimic**: îi spune CivilCraft că, de exemplu, E 6,150,000 N 2,080,000 sunt coordonate state plane din zona 6 California, în US survey feet. Odată ce o știe:

- bara de stare arată latitudinea și longitudinea cursorului,
- fișierele GIS din alte sisteme (shapefile, GeoJSON, GeoPackage, grile de altitudini, LiDAR) sunt convertite în proiect la deschidere,
- straturile de hartă pot fi desenate sub plan ([Afișarea straturilor de hartă sub plan](topic:map-layers)),
- exporturile în formate GIS poartă sistemul (un `.prj` pentru shapefile, codul EPSG pentru GeoPackage și GeoTIFF).

## Alegerea sistemului

1. Alegeți {{ui:Coordonate}} din grupul {{ui:GIS}} al barei de instrumente. Se deschide caseta de dialog **Sistem de coordonate**. Sus scrie în ce este proiectul acum sau **Niciunul — coordonatele sunt doar numere**.
2. Găsiți sistemul într-unul din aceste moduri:
   - **Căutare**: scrieți codul EPSG (`2277`, `EPSG:2277`) sau cuvinte din nume (`texas central`, `utm 14n`, `lambert-93`). Codurile se listează de la cel pe care l-ați scris; cuvintele listează sistemele al căror nume conține toate cuvintele.
   - {{ui:Sisteme în care se potrivesc aceste coordonate}} (când proiectul are puncte sau un model de teren): CivilCraft citește mijlocul proiectului dumneavoastră în fiecare sistem din familia de unități a proiectului și listează pe cele a căror zonă de utilizare îl cuprinde. Coordonatele state plane se potrivesc de obicei doar în câteva zone: un proiect din Texas la E 3,115,000 N 10,070,000 US survey feet se potrivește cu cele patru variante Texas Central (NAD83, NAD83(2011), HARN, NSRS2007). Fiecare intrare arată unde ar cădea mijlocul proiectului.
   - **Aproape de (lat, long)** și {{ui:Sugerare}}: scrieți unde este amplasamentul, de exemplu `30.27, -97.74` sau `30°16′N 97°44′W`, iar CivilCraft listează sistemele proiectate a căror zonă îl cuprinde, întâi cele naționale și de stat.
   - {{ui:Citire fișier .prj…}}: deschideți fișierul `.prj` care a venit cu un shapefile sau cu un desen. CivilCraft îl potrivește cu lista sa după calculele de proiecție (așa că un `.prj` care numește un datum altfel tot găsește sistemul corect) și spune care este; când nimic nu se potrivește exact, se folosește descrierea proprie a fișierului. Puteți trage și un `.prj` pe caseta de dialog sau îl puteți deschide ori trage pe plan singur.
3. Faceți clic pe un sistem din listă. Sub **Ales** apar numele, codul EPSG, unitatea, cât de bine este legat datumul de WGS 84, zona lui de utilizare în latitudine și longitudine și unde cade mijlocul proiectului dumneavoastră în el.
4. Lăsați selectat **Grilă** (pentru majoritatea proiectelor; vezi [Coordonate la sol și locale](topic:ground-and-local-coordinates) pentru celelalte) și alegeți {{ui:Aplicare}}.

Bara de stare arată acum latitudinea și longitudinea cursorului lângă E și N. Stabilirea sistemului este un singur pas de anulare: {{key:Mod+Z}} îl anulează.

:::note
Unitățile trebuie să se potrivească: un proiect în picioare primește sisteme în US survey feet sau în international feet, un proiect în metri primește sisteme în metri. CivilCraft explică un refuz („Proiectul este în picioare, dar acest sistem este în metri…”). Un proiect în picioare cu un sistem în US survey foot folosește survey feet: „ft” al proiectului înseamnă piciorul sistemului. Sistemele geografice (latitudine și longitudine, cum este chiar WGS 84) nu pot fi sistemul unui proiect: desenele au nevoie de coordonate est și nord.
:::

## Schimbarea sau eliminarea sistemului

Deschideți din nou {{ui:Coordonate}}, alegeți alt sistem și alegeți {{ui:Aplicare}}. Când proiectul are puncte sau un proiect de proiectare, CivilCraft întreabă **Coordonatele sunt deja în …?**

- {{ui:Da — nimic nu se mută}}: numerele rămân cum sunt și doar înțelesul lor se schimbă. Folosiți asta când vechiul sistem a fost ales din greșeală.
- {{ui:Nu — convertește-le}}: fiecare punct de măsurare, linie de rupere, limită, PI de traseu, colț de platformă și structură este convertit din vechiul sistem în cel nou, într-un singur pas de anulare. O suprafață citită din LandXML sub formă de triunghiuri nu poate fi convertită; refaceți-o mai întâi din puncte.

{{ui:Eliminare sistem}} scoate sistemul (nimic nu se mută). Straturile GIS deja din proiect rămân unde sunt.

## Latitudinea și longitudinea în bara de stare

Cât timp proiectul are un sistem, bara de stare arată latitudinea și longitudinea cursorului pe WGS 84, de exemplu `30°18′00.00″ N  97°42′00.00″ W`. Alegeți în schimb grade zecimale din {{ui:Setări}}, {{ui:CivilCraft}}, **Latitudine și longitudine** ([Setările CivilCraft](topic:settings)). Cu coordonate la sol sau locale, afișarea trece mai întâi prin acel pas, astfel încât este corectă pentru punctul de sub cursor.

## Cât de bună este deplasarea datumului

Latitudinea, longitudinea, GeoJSON și straturile de hartă sunt toate pe WGS 84. Legătura fiecărui sistem cu WGS 84 este arătată în caseta de dialog:

| Ce spune caseta de dialog | Ce înseamnă |
|---|---|
| WGS 84 în sine | Nicio deplasare. |
| NAD83 este tratat ca WGS 84 | Cele două diferă cu un metru sau două în cea mai mare parte a Americii de Nord, cel mult câțiva metri. Bun pentru straturi de hartă și context al amplasamentului; nu pentru punctele de control topografic. |
| Cunoscut la aproximativ *n* m (cifra EPSG) | O deplasare publicată; straturile de hartă și GeoJSON pot fi greșite cu aproximativ atât. |
| Necunoscut pentru acest datum | Nu există deplasare publicată fără un fișier de grilă: straturile de hartă și GeoJSON pot fi greșite cu sute de metri. |
| Din fișierul de deplasare pe grilă … | Un fișier de deplasare pe grilă este folosit (mai jos): în aproximativ 10 cm față de NAD83 în interiorul grilei. |

Coordonatele proprii ale proiectului nu trec niciodată printr-o deplasare de datum: doar ce este convertit spre sau dinspre latitudine și longitudine. Datumurile verticale și modelele geoidului nu sunt tratate (cotele nu sunt convertite niciodată). Unde cea mai bună deplasare necesită un fișier de grilă, lista conține o deplasare publicată mai grosieră, iar caseta de dialog arată precizia ei (sistemele NAD27, de exemplu, aproximativ 20 m), până adăugați grila.

## Fișiere de deplasare pe grilă

Pentru un sistem NAD27, **Fișier de deplasare pe grilă** din caseta de dialog a sistemului de coordonate pune latitudinea și longitudinea, fișierele GIS și straturile de hartă în aproximativ 10 cm față de NAD83, în loc de aproximativ 20 m:

- **Descărcați** grila pe care o sugerează pentru zona sistemului (NADCON5 pentru partea continentală a Statelor Unite, NADCON pentru Alaska, NTv2 pentru Canada) de la cdn.proj.org, serverul public de grile al PROJ. Se trimite doar numele fișierului grilei.
- Sau **Adăugați un fișier de grilă…** pe care îl aveți deja: NTv2 (`.gsb`) sau o grilă PROJ GeoTIFF (`.tif`), până la 20 MB.

Grila este salvată în fișierul proiectului, deci călătorește cu proiectul. Secțiunea spune dacă mijlocul proiectului se află în interiorul grilei: în afara ei, nu se aplică nicio deplasare, deci folosiți o grilă care acoperă amplasamentul. **Oprirea folosirii grilei** revine la deplasarea grosieră. Fiecare modificare este un pas: {{key:Mod+Z}} o anulează.

Straturile GIS deja din proiect rămân unde sunt când grila se schimbă; importați-le din nou ca să le plasați prin grilă. Coordonatele proprii ale proiectului nu se mută niciodată.

## Ce a fost verificat

- Fiecare conversie a fost comparată cu PROJ (pyproj 3.7.1 cu PROJ 9.5.1), biblioteca de coordonate pe care o folosesc majoritatea programelor GIS, pe peste 330 de sisteme: state plane în US survey feet și feet, UTM nord și sud, Lambert-93, British National Grid, GDA2020 MGA, New Zealand Transverse Mercator și web Mercator printre ele. Estul și nordul coincid până la 1 cm cu aceeași deplasare de datum (majoritatea mult sub 1 mm), iar calculele de proiecție coincid cu definițiile proprii ale PROJ până la 1 cm.
- Fișierele `.prj` scrise de PROJ în ambele forme uzuale (ESRI și OGC) au fost citite înapoi pentru 105 sisteme: 208 din 210 au coincis cu codul EPSG exact, iar celelalte două cu un sistem cu aceleași calcule pe același elipsoid. Fișierele `.prj` scrise de CivilCraft sunt citite de PROJ ca același sistem. Fișierele ESRI `.prj` pentru sistemele stereografice polare (UPS, polar Alaska) nu pot fi citite; alegeți aceste sisteme după cod.
- Latitudinea și longitudinea din bara de stare au coincis cu PROJ până la 0.01″ în browser.
