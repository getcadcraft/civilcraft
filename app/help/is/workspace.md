---
title: Skjárinn, hluti fyrir hluta
summary: Ferð um hverja stiku og hvert spjald í CivilCraft eftir nafni þess á skjánum, frá tækjastikunni til stöðustikunnar.
keywords: viðmót, skjár, tækjastika, spjöld, eiginleikar, stöðustika, langsniðssýn, skipulag, ferð, notendaviðmót
from: 76272010
---

CivilCraft er með einn skjá. Engir flipar og engin skipulög. Hliðarspjöldin geta færst til, svifið eða farið í sinn eigin glugga: sjá [Raðaðu spjöldunum og notaðu annan skjá](common:arrange-panels). Að ofan og niður, og frá vinstri til hægri:

- **forritastikan** (CadCraft-merkið, heiti forritsins, útgáfa, Um, skjástilling, Hjálp, Vista til notkunar án nettengingar, Pappír og Líkan)
- **tækjastikan** með sjö hópum hnappa
- **vinstra spjaldið**: Svæði, Punktar, Yfirborð, Birting og, þegar þú hefur flutt inn einhver, GIS-lög
- **grunnmyndin** í miðjunni, með **langsniðssýninni** undir henni þegar hún er opin
- **hægra spjaldið**: Eiginleikar þess sem er valið
- **stöðustikan** meðfram neðri brúninni

## Forritastikan

Þunna stikan efst tilheyrir CadCraft-vefsvæðinu, ekki CivilCraft sjálfu.

- Útgáfuvalmyndin sýnir hvaða smíð þú ert að keyra.
- {{ui:Um CivilCraft}} opnar síðu forritsins á vefsvæðinu.
- {{ui:Allur skjárinn}} skiptir á milli skjástillinga: allur skjárinn, síðan allur skjárinn með földum stikum, og svo aftur í venjulegt. {{key:Ctrl+Shift+F}} gerir það sama á öllum stýrikerfum, þar á meðal Mac (þar er það Control-takkinn, ekki Command). Þegar stikurnar eru faldar skaltu færa bendilinn að efri brún til að fá þær aftur.
- {{ui:Hjálp}} (eða {{key:F1}}) opnar þessa hjálp í hliðarspjaldi; {{key:F1}} eða {{key:Esc}} lokar henni.
- {{ui:Vista til notkunar án nettengingar}} geymir CivilCraft í þessum vafra svo það opnist án tengingar; þá sýnir það {{ui:Tilbúið án nettengingar}}. Sjá [Skrár sem þú getur opnað, vistað og flutt út](topic:files#online-and-offline).
- {{ui:Pappír}} og {{ui:Líkan}} skipta á milli ljósrar og dökkrar þemu. Grunnmyndin og langsniðið fylgja þemanu; PDF-skrár eru alltaf prentaðar á hvítt.

## Tækjastikan

Hver hópur hefur lítinn titil fyrir ofan hnappana. Færðu bendilinn yfir hnapp til að sjá skýringu hans og lykil.

| Hópur | Hnappar | Hvað þeir gera |
|---|---|---|
| Skrá | {{ui:Nýtt}}, {{ui:Opna}}, {{ui:Vista}} | Byrja upp á nýtt, opna punktaskrá, LandXML eða verkefni, vista verkefnið sem niðurhal |
| Flytja út | {{ui:LandXML}}, {{ui:DXF}}, {{ui:DWG}}, {{ui:PDF}} | Skrifa LandXML 1.2, R12 DXF eða DWG af grunnmyndinni, eða prenta grunnmyndina í PDF |
| Yfirborð | {{ui:Brotalína}}, {{ui:Mörk}} | Teikna brotlínu í gegnum mælipunkta; teikna ytri mörkin |
| Hönnun | {{ui:Veglína}}, {{ui:Pallur}}, {{ui:Pípur}}, {{ui:Langsnið}} | Teikna veglínu, palla, pípulögn; sýna eða fela langsniðssýnina |
| Breyta | {{ui:Afturkalla}}, {{ui:Endurgera}}, {{ui:Afrita}}, {{ui:Líma}}, {{ui:Meira}} | Afturkalla, endurgera, afrita og líma mælipunkta; {{ui:Meira}} geymir Klippa, Líma á sama stað, Tvöfalda, Eyða, Velja alla punkta og Velja ekkert |
| GIS | {{ui:Hnit}}, {{ui:Flytja inn}}, {{ui:Flytja út}}, {{ui:Kort}} | Stilla hnitakerfið, flytja inn og út GIS-skrár, sýna kortalög undir grunnmyndinni |
| Sýn | {{ui:Velja}}, {{ui:Passa}}, {{ui:3D}} | Velja og færa hluti; aðdráttur til að sýna allt; sýna svæðið í þrívídd ([Skoða svæðið í þrívídd](topic:site-3d)) |

Teikniverkfæri helst niðurtekið meðan það er virkt. Með því að smella aftur á það, ýta á {{key:Esc}} eða ýta á {{key:V}} ferðu aftur í {{ui:Velja}}. {{ui:Afturkalla}}, {{ui:Endurgera}}, {{ui:Afrita}} og atriðin í {{ui:Meira}} eru grá þegar þau geta ekki virkað; skýringin segir af hverju (til dæmis „Veldu mælipunkta fyrst“). Sérhver hnappur er skráður í [Tækjastikuviðmiðun](topic:toolbar).

Á mjórri glugga flettist tækjastikan til hliðar.

## Vinstra spjaldið

### Svæði

- **Heiti**: heiti verkefnisins. Það gefur heiti hverri skrá sem þú vistar eða flytur út og er prentað í titilræmu PDF-skjalsins.
- **Einingar**: {{ui:US-fet}} eða {{ui:Metrar}}. Þetta segir til um hvað tölurnar þýða. Að breyta því umbreytir **ekki** hnitum; sjá [Einingar, stöðvar og talnasnið](topic:units-and-stations).

### Punktar

Ef tómt segir það þér hvernig opna á punktaskrá. Með punktum sýnir það heiti skrárinnar, fjölda punkta og hversu margir hafa hæð, og síðan töflu yfir **punktahópa**: eina línu fyrir hvert fyrsta orð lýsingar (GRD, FL, TBS …), með fjölda og vali á **Yfirborði**:

- {{ui:Punktar}}: punktarnir fara í yfirborðið (sjálfgefið fyrir alla hópa).
- {{ui:Brotalína}}: punktar hópsins eru tengdir, í röð eftir punktanúmeri, í eina brotlínu.
- {{ui:Sleppt}}: hópurinn snertir ekki yfirborðið.

### Yfirborð

Staðreyndir um núverandi land: punktar, þríhyrningar, lægsta og hæsta hæð, meðalhæð, 2D- og 3D-flatarmál, brotlínur og hvort mörk séu til staðar. Undir staðreyndunum sýnir reitur allt sem yfirborðssmiðurinn þurfti að laga eða gat ekki gert. Síðan:

- **Lengsti ytri jaðar**: 0 heldur öllum ytri þríhyrningum; tala klippir langa, mjóa þríhyrninga af að utan.
- Tenglar sem birtast þegar þeir eiga við: {{ui:Fjarlægja afmörkunina}}, {{ui:Fjarlægja teiknaðar brotlínur}} og, fyrir yfirborð sem er lesið úr LandXML, {{ui:Byggja yfirborðið upp aftur úr punktunum}}.

### Birting

- **Yfirborð**: {{ui:Núverandi land}} eða {{ui:Tillaga (mótuð)}}. Hið síðara er í boði þegar pallur eða vegarbelti mótar án vandamála.
- **Hæðarlínur á**, **Aðallínur á** og **Bönd** (fjöldi litabanda).
- Gátreitir: {{ui:Hæðarlínur}}, {{ui:Merkingar hæðarlína}}, {{ui:Þríhyrningar}}, {{ui:Hæðarbil}}, {{ui:Hallaörvar}}, {{ui:Punktar}}, {{ui:Merkingar punkta}}, {{ui:Brotlínur}}, {{ui:Jaðar yfirborðs}}, {{ui:Pípur}}.
- Skýring á hæðum bandanna birtist þegar bönd eru kveikt.

Birtingarstillingar eru vistaðar með verkefninu en eru ekki afturköllunarskref: {{key:Mod+Z}} snýr aldrei gátreit til baka.

## Grunnmyndin

Grunnmyndin sýnir punktana, yfirborðið og allt sem þú hannar, í grunnsýn með norður upp. Skrunaðu hjólinu til að zooma við bendilinn, dragðu tómt rými til að hliðra. Allur listinn er í [Lyklar og mús](topic:keyboard).

- Á tómu verkefni sýnir reitur með titlinum **Byrjaðu með mælipunktum** fyrstu skrefin og býður upp á {{ui:Opna sýnishornssvæði}}.
- Meðan teikniverkfæri er virkt segir ábending efst á grunnmyndinni hvað á að smella á og hvernig á að ljúka.
- Þegar skrá er dregin yfir grunnmyndina birtist „Slepptu punktaskrá, LandXML eða verkefni“.
- Valdir hlutir eru auðkenndir. Valin veglína eða pallur sýnir ferhyrnd handfang við PI-punkta sína eða horn; valið mannvirki sýnir eitt handfang. Dragðu handfang til að færa það.
- Valdir mælipunktar eru með hring. {{key:Shift}} og smellur bætir við eða fjarlægir punkt; {{key:Shift}} og drag teiknar reit (eða, dregið í kringum þá, lasso) sem bætir við punktunum innan hans. Sjá [Velja, afrita og líma mælipunkta](topic:copy-paste-points).

## Langsniðssýn

Ýttu á {{key:R}} eða smelltu á {{ui:Langsnið}} til að opna hana undir grunnmyndinni. Stikan hennar hefur:

- lista yfir veglínur (virkur þegar tvær eða fleiri veglínur eru til)
- {{ui:Bæta við PVI}}: meðan hann er niðurtekinn bætir smellur í langsniðinu við PVI ({{key:I}} kveikir og slekkur á honum)
- lestur á stöð, landi, hönnunarhæð, halla og skurði eða fyllingu undir bendlinum
- lokunarhnapp

Langsniðið sýnir núverandi land, hönnunarlangsniðið, halla á hverjum snertli, stöð og hæð hvers PVI, L og K hvers lóðrétts boga ásamt BVC og EVC hans, há- og lágpunkta og lóðrétta ýkingu. Það passar alltaf við alla veglínuna: það stækkar eða hliðrar ekki. Þegar bendillinn færist eftir því setur punktur á veglínuna á grunnmyndinni.

## Hægra spjaldið: Eiginleikar

Fyrirsögn þess segir hvað það sýnir.

- **Verkefni** (ekkert valið): veglínurnar og pallarnir sem tenglar, reiturinn **Jarðvinna**, og reiturinn **Pípunet** með reglum sínum og vandamálum.
- **Veglína**: heiti, upphafsstöð, lengd, PI-taflan, bogarnir, PVI-taflan og staðreyndir hönnunarlangsniðsins, og stillingar **Vegarbeltis**.
- **Pallur**: heiti, hæð, halla skurðar og fyllingar, flatarmál, staðreyndir um skurðlínu og jarðvinna.
- **Mannvirki** eða **Pípa**: stærðir, brúnir, botnhæðir, halli, yfirlag og öll vandamál.
- **Punktur** og númer hans: hnit punktsins, hæð, lýsing og hópur (aðeins lestur).

Reitir taka gildi þegar þú ýtir á {{key:Enter}} eða yfirgefur reitinn. Gildi sem er ekki samþykkt er merkt sem ógilt og ekkert breytist.

## Stöðustikan

- **E** og **N**: austur- og norðurhnit undir bendlinum.
- **Landhæð** þar (og **Mótað** þar sem pallur eða vegarbelti breytti henni), eða „Utan yfirborðs“.
- Næsta veglína (eða sú valda) með **Stöð** og frávik (**L** eða **R**) undir bendlinum.
- Hægra megin birtast skilaboð: hvað gerðist rétt áðan, eða hvers vegna eitthvað var hafnað. Skilaboð hverfa af sjálfu sér eftir nokkrar sekúndur.

## Gluggar

- **Flytja inn punkta**: opnast með hverri punktaskrá. Sjá [Flytja inn mælipunkta](topic:import-points).
- **Prenta grunnmynd í PDF**: sjá [Prenta grunnmynd í PDF](topic:plot-pdf).
- **Óvistaðar breytingar**: spyr áður en {{ui:Nýtt}} eða opnun verkefnis eða LandXML-skrár hendir óvistuðu verki. {{ui:Vista afrit}} sækir verkefnið fyrst.

## Litlir skjáir

Upp að 760 pixlum á breidd, eins og í síma, heldur grunnmyndin skjánum: tækjastikan er ein lína sem flettist til hliðar, og spjöldin opnast sem blöð úr stiku neðst. {{ui:Verkfæri}} felur tækjastikuna og {{ui:Færa}} setur hana neðst.
