---
title: Objekta skats 3D
summary: Atveriet 3D skatu, orbītu, pārvietojiet un tuviniet, iestatiet vertikālo pārspīlējumu un krāsojumu, izvēlieties, ko rādīt, un noklikšķiniet trasēm, platformām, raksturlīnijām, lūzumlīnijām, caurulēm, būvēm un punktiem, lai tos atlasītu.
keywords: etiķetes, 3d etiķetes, pieskaņotas, etiķetes pret kameru, pikšetu etiķetes, horizontāļu etiķetes, punktu etiķetes, nolaist, aerofotogrāfija, kartes slāņi virsmā, 3d, trīs d, 3d skats, skata kubs, kompass, orbīta, perspektīva, paralēla, izometriska, iso, vertikālais pārspīlējums, reljefs, modelis, objekta modelis, lidot apkārt, vizualizēt, renderēt, caurules 3D, būves, revīzijas akas, koridors 3D, ceļš 3D, brauktuve, joslas, bordiūras, gājēju ceļi, augi 3D, koki 3D, krūmi, dzīvžogi, ainava 3D, rampas 3D, kāpnes, sienas, bruģis, cietās virsmas 3D
from: a16bafe1
---

3D skats parāda objektu kā vienu modeli: esošo zemi un projektēto virsmu, uz tām nolaistas horizontāles, lūzumlīnijas un virsmas mala, katra trase uz tās projektētā profila ar pikšetu atzīmēm, koridora raksturlīnijas un pats ceļš (joslas, pievedceļi, notekas, bordiūras, joslas un ietves savās krāsās), zemesgabali ar savām izrakuma līnijām, caurules tīkls ar caurulēm un būvēm to reālajos augstumos, un no Ainavas darbvietas augi, bruģis, ceļi, sienas, bordiūras, rampas un kāpnes. Tas nolasa to pašu projektu, kas plāns, tāpēc katra izmaiņa redzama abos.

## Atvērt 3D skatu

1. Atveriet uzmērījuma punktus (vai LandXML vai projekta failu), lai būtu virsma. Augi, bruģis vai rampas vien arī ir pietiekami, lai to atvērtu.
2. Nospiediet {{key:D}} vai noklikšķiniet {{ui:3D}} grupā {{ui:Skats}} rīkjoslā.
   3D skats atveras pār plānu, skatot visu objektu no dienvidaustrumiem. Pirmo reizi tas aizņem brīdi, lai ielādētos.
3. Nospiediet {{key:D}} vēlreiz vai noklikšķiniet {{ui:3D}} vēlreiz, lai atgrieztos plānā. Izvēloties zīmēšanas rīku, piemēram, {{ui:Trase}} vai {{ui:Platforma}}, arī atgriežas plānā, jo zīmēšana notiek tur.

## Pārvietošanās

| Lai | Dariet šo |
|---|---|
| Orbītu | Velciet ar kreiso vai vidējo pogu |
| Pārvietot | Velciet ar labo pogu vai {{key:Shift}} un velciet |
| Tuvināt | Griezt ritentiņu; tuvina uz rādītāja pusi |
| Orbītu uz skārienpaliktņa | Velciet ar diviem pirkstiem ({{key:Shift}} un vilkšana pārvieto) |
| Tuvināt uz skārienpaliktņa | Saspiediet |
| Skārienekrāns | Viens pirksts orbīto; divi pirksti saspiež, lai tuvinātu, un pārvieto, lai pārvietotu |
| Taustiņi (skatam ir fokuss) | {{key:Left}} {{key:Right}} {{key:Up}} {{key:Down}} orbīto, ar {{key:Shift}} pārvieto; {{key:Plus}} un {{key:Minus}} tuvina |

Josla virs skata satur pārējo:

- Skata saraksts: **Iso**, **Augša**, **Apakša**, **Priekšā** (skatoties uz ziemeļiem), **Aizmugure**, **Kreisā**, **Labā**.
- {{ui:Perspektīva}}: nospiests ir perspektīvs skats; noklikšķiniet, lai iegūtu paralēlo projekciju (bez saīsināšanas).
- {{ui:Viss}}: parāda visu atkal. {{key:F}} dara to pašu, kamēr 3D skats ir atvērts.

## Skata kubs

Skata kubs augšējā labajā stūrī griežas kopā ar skatu. Noklikšķiniet pusi, malu vai stūri, lai skatītu objektu no turienes (kamera pagriežas vienmērīgi, ja jūsu sistēma nelūdz samazinātu kustību). Velciet kubu, lai orbītu. Zem tā esošais kompasa gredzens rāda ziemeļus (režģa ziemeļus, +Y): velciet gredzenu, lai pagrieztu objektu ap vertikāli, vai noklikšķiniet N, E, S vai W, lai skatītos no tās puses. {{ui:Sākums}}, mazā māja tā augšējā kreisajā stūrī, atgriež visa objekta izometrisko skatu. Ar tastatūru: {{key:Tab}} uz kubu, bultiņas izvēlas pusi, malu vai stūri, {{key:Enter}} skatās no turienes.

Plānā tas pats kubs rāda augšu. Noklikšķiniet jebkuru citu pusi, malu vai stūri (vai velciet to), lai atvērtu 3D skatu, skatoties no turienes: tas ir ātrākais ceļš uz 3D no dotā virziena. Lai nomainītu kubu pret mazu asu ikonu vai to paslēptu, skatiet **Stūra indikators** sadaļā [CivilCraft iestatījumi](topic:settings).

## Pārspīlēt augstuma atzīmes

Objekti parasti ir daudz platāki nekā augstāki, tāpēc augstuma atzīmes sākumā izstieptas ar **2×**. Izvēlieties **1×**, **2×**, **3×**, **5×** vai **10×** joslas sarakstā vai sadaļā **3D vertikālais pārspīlējums** [CivilCraft iestatījumos](topic:settings) (abi ir viens iestatījums). Mainās tikai skats: apjomi, profili un eksporti paliek patiesā mērogā.

## Krāsot virsmas

- **Augstuma joslas**: tās pašas joslas un krāsas kā plāna augstuma joslām (joslu skaits tiek iestatīts sadaļā **Attēlošana** kreisajā panelī). Katra joslas mala ir precīzi nogriezta savā augstumā.
- **Viena krāsa**: esošā zeme un projektētā virsma katra vienkāršā krāsā.
- **Kartes slāņi**: kartes slāņi, kas rādīti zem plāna (georeferencēts attēls, kartes kvadrāti vai kartes serviss; skatiet [Kartes slāņi](topic:map-layers)), uzlikti virsmām kā lapa, tāpēc aerofotogrāfija rādās uz kalniem. Attēli, kas vēl ienāk, aizpildās, kad tie atnāk. Ja nav rādīts neviens kartes slānis, virsmas paliek ar savām augstuma joslām, un skats to saka. Attēls ir ekrānam: GLB un OBJ eksporti to nenes.

Kad rādītas abas virsmas, esošā zeme ir caurspīdīga pāri projektētajai virsmai, lai redzētu izrakumu (zeme virs projekta) un uzbērumu.

## Izvēlieties, ko rādīt

Noklikšķiniet {{ui:Rādīt}} joslā un atzīmējiet vai notīriet:

| Vienums | Kas tas ir |
|---|---|
| Esošā zeme | Virsma, kas veidota no uzmērījuma punktiem (vai nolasīta no LandXML) |
| Projektētā virsma | Esošā zeme ar koridoriem un platformām (tikai ja tādas ir) |
| Trijstūru malas | Katra TIN mala kā līnijas |
| Horizontāles | Katras rādītās virsmas mazās un galvenās horizontāles plāna intervālā |
| Virsmas mala | Katras rādītās virsmas ārējā mala tās augstumos |
| Lūzumlīnijas | Katra lūzumlīnija tās augstumos |
| Trases un pikšeti | Katra trase uz tās projektētā profila (uz zemes, ja profila nav), ar atzīmēm ik pēc 50 ft vai 20 m |
| Koridora raksturlīnijas | Brauktuves mala, pievedceļš un izrakums abās pusēs |
| Ceļa virsmas | Ceļš, ko veido katrs koridors pēc tā sekcijas: joslas, pievedceļi, notekas, bordiūras, joslas un ietves, katra savā krāsā, uz projektētās virsmas |
| Augi | Katrs augs un augi dobēs un dzīvžogos, kā vienkāršas formas pēc augu saraksta: koks ir stumbrs un apaļš vainags (konuss skujkokam, pušķis augstam stumbram palmai), krūmi, dzīvžogu augi, daudzgadīgie un zemsedzes ir kupoli, zāles — pušķi, vīteņaugi — plāni stabi. Tie stāv uz projektētās virsmas (vai esošās zemes) plānā rādītajā izmērā: pieaudzis vai stādīšanas brīdī |
| Cietās virsmas | Bruģis un ceļi ar savām kritumiem, sienas, bordiūras, kāpnes un rampas, kas kāpj posmos ar līmeņa laukumiem starp tiem |
| Zemesgabali un izrakums | Katra zemesgabala kontūra tās augstumā un tās izrakuma līnija |
| Caurules un būves | Caurules kā apaļas caurules starp to iekšējām augstuma atzīmēm, būves no rāmja līdz nogulsnēšanas bedrei |
| Uzmērījuma punkti | Punkts ar augstuma atzīmi (sākumā izslēgts) |
| GIS slāņi | GIS slāņi, kas rādīti plānā, to krāsās: līnijas un kontūras ar savām augstuma atzīmēm tajos augstumos, citi uzlikti uz esošās zemes (tie precīzi seko tai); punkti kā mazi krustiņi. Formas bez augstuma ārpus virsmas tiek izlaistas, un skats saka, cik daudz |
| Uzraksti | Nosaukumi un vērtības, kas vienmēr ir pret jums: katras trases nosaukums sākumā un tās pikšeti ik pēc 100 ft (vai 100 m), katras galvenās horizontāles augstums, zemesgabali, raksturlīnijas un būves pēc nosaukuma, un ar atzīmētiem **Uzmērījuma punktiem** — katra punkta numurs un augstums |

Etiķetes paliek vienādā izmērā un vertikāli neatkarīgi no tā, kā jūs griežat vai tuvināt, un kalns priekšā etiķeti paslēpj. Kur tās sablīvējas, vissvarīgākās rāda, un pārējās gaida, līdz tuvināt: vispirms trases, tad būves, zemesgabali, raksturlīnijas, pikšeti, horizontāles un punkti, tuvākie vispirms. Tās ir tikai ekrānā; eksporti un izdrukas tās neiekļauj.

Jūsu izvēles, pārspīlējums un krāsojums tiek atcerēti šajā pārlūkā.

Ceļš tiek veidots uz esošās zemes. Ar trasi un koridoru, bet bez uzmērījuma punktiem vai virsmas, ceļš tiek zīmēts uz līdzenas aizvietojošas zemes: pie projektētā profila vidējās augstuma atzīmes vai līmenī augstumā 0, ja profila arī nav. Brīdinājums 3D skata apakšā un koridora rekvizītos to saka. Tā ir tikai attēls: no tā nenāk apjomi vai griezumi. Atveriet uzmērījuma punktus vai virsmu, un ceļš pārvietojas uz īsto zemi pats.

Vertikālais pārspīlējums stiepj zemi, nevis augus: tie stāv uz pārspīlētās zemes savā īstajā augstumā un izplatībā, tāpēc koks izskatās kā koks jebkurā iestatījumā. Augi ir vienkāršas formas, nevis detalizēti modeļi: tūkstoši no tiem paliek ātri griežami un tuvināmi.

## Caurules un būves

- Caurule tiek zīmēta ar tās apakšu iekšpusē pie jūsu iestatītajiem iekšējiem augstumiem (invert) un tās augšu iekšpusē (virsotne) par vienu iekšējo diametru augstāk. Diametri ir collās pēdu projektā un milimetros metru projektā, kā labajā panelī.
- Būve iet no savas malas (ierakstītas vai no virsmas) lejup līdz savai nogulsnēšanas bedrei (zemākais invert mīnus nogulsnēšanas dziļums). Bez jebkura invert tā tiek zīmēta 5 ft (1.5 m) dziļa.
- Caurules un būves ar problēmu (skatiet tīkla pārbaudi labajā panelī) tiek zīmētas sarkanas.
- Caurule bez invert netiek zīmēta; skata apakšā piezīme saka, cik daudz.

## Atlasīt no 3D skata

Noklikšķiniet trasi (vai tās ceļu), platformu, raksturlīniju, cauruli, būvi, uzmērījuma punktu, augu, rampu vai citu cieto virsmu. To atlasa tāpat kā noklikšķinot plānā: tās rekvizīti atveras labajā panelī, kur varat tos rediģēt, un tā tiek zīmēta atlases krāsā pāri visam 3D. Viss, ko atlasāt plānā, ir iezīmēts arī 3D. Padoms blakus rādītājam nosauc to, uz ko noklikšķinājāt, ar tā austrumu, ziemeļu un augstuma koordinātām. Caurules un būves var noklikšķināt arī tur, kur tās ir zem zemes; līniju, kas paslēpta aiz kalna, caur to nevar noklikšķināt.

Noklikšķiniet lūzumlīniju, lai redzētu, kura tā ir: tā tiek iezīmēta, un statusa josla to nosauc (lūzumlīnijām pašām nav rekvizītu).

Noklikšķiniet zemi, lai padomā nolasītu austrumu, ziemeļu un augstuma koordinātas tur.

## Braukt pa trasi

Noklikšķiniet **Braukt** 3D joslā un izvēlieties trasi. Skats pārvietojas uz vadītāja sēdekli: 3.5 ft (1.07 m) virs ceļa, uz tā projektētā profila (esošās zemes uz centrālās līnijas, ja tam vēl nav profila), skatoties uz priekšu pa to.

- **Atskaņot** vai {{key:Space}} brauc ar ātrumu, ko izvēlaties (10 līdz 65 mph vai 15 līdz 100 km/h); {{key:Space}} vēlreiz pauzē. Tas apstājas beigās; **Atskaņot** tad sāk no sākuma.
- Slīdnis pārlec uz jebkuru pikšetu; {{key:Left}} un {{key:Right}} soļo 10 ft (5 m) atpakaļ un uz priekšu.
- Vilkšana skatā pauzē un ļauj apskatīties apkārt.
- **Apturēt** vai {{key:Esc}} atgriež skatu tur, kur tas bija.

Vertikālais pārspīlējums attiecas arī braucot: iestatiet to uz 1×, lai redzētu ceļu, kāds tas būs.

## Gaisma no saules

Atveriet **Saule** 3D joslā un atzīmējiet **Gaisma no saules**. Dodiet datumu, pulksteņa laiku un tā laika joslu (nobīde no UTC: vasarā — vasaras laika), kā arī objekta platumu un garumu. Kad projektam ir koordinātu sistēma, tie tiek aizpildīti no tās.

Apvidu tad apgaismo no saules pozīcijas, ar **Ēnām** pāri zemei, koridoram un platformām; izvēlne saka saules azimutu un cik augstu tā ir vai ka tā ir zem horizonta. Pozīcijas nāk no NOAA saules vienādojumiem. Ēnas krīt pareizi jebkurā pārspīlējumā, bet tās apstājas objekta malā: kalni un ēkas aiz tās ēnu nemet.

## 3D skata eksports

Noklikšķiniet {{ui:GLB}} vai {{ui:OBJ}} joslā. Tas, ko rāda skats, tiek saglabāts patiesā mērogā (bez pārspīlējuma), metros, ar Y uz augšu. Sīkāk: [Eksportēt objektu 3D](topic:export-3d).
