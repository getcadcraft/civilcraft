---
title: Frá öðrum hugbúnaði fyrir mannvirkjagerð
summary: Hvernig kunnugleg vinnuflæði í mannvirkjahönnun falla að CivilCraft, og muninn sem ruglar reynda notendur í fyrstu klukkustundinni.
keywords: skipti, flutningur, kunnuglegt, munur, vinnuflæði, skipanir, samsvörun, cogo, vegstæði, mótun, lagnakerfi, stílar, skipanalína
from: feae37d6
---

Ef þú hefur notað Civil 3D, þekkirðu hugmyndirnar í CivilCraft nú þegar: punkta og punktahópa, TIN-yfirborð með brotlínum og mörkum, veglínur eftir PI, langsnið eftir PVI, samsetningar sópaðar í vegstæði, mótun að dagsbirtu, þyngdarafls lagnakerfi, LandXML. Það sem er öðruvísi er nánast allt í kringum þær: það er engin teikniskrá, engin skipanalína (nema þú veljir valmyndarstíl {{ui:Klassískt teikniforrit}}), engir stílar, enginn Prospector og engir stillingargluggar. CivilCraft er lítið, einbeitt tól í vafra, og í þessari útgáfu gerir það brot af því sem full mannvirkjahönnunarpakki gerir. Þessi síða kortleggur það sem þú þekkir yfir á það sem er hér.

:::tip
Ef þér líkar borði Civil 3D skaltu velja valmyndarstílinn {{ui:Civil-borði}} í {{ui:Stillingar}} › {{ui:CivilCraft}} › {{ui:Valmyndir, takkar og mús}}: flipana Home, Surfaces, Modify, Geolocation, View og Output, miðhnappurinn færir skjámyndina til, og {{key:Shift}} með miðhnappi snýr þrívíddarskoðuninni. Ef þú skrifar skipanir bætir {{ui:Klassískt teikniforrit}} við skipanalínu (ALIGNMENT, PAD, PROFILE, ZOOM …). Sjá [Valmyndir, takkar og mús](topic:menus-keys-and-mouse).
:::

## Yfirlit vinnuflæðis

| Hvað þú vilt gera | Kunnuglega leiðin | Í CivilCraft |
|---|---|---|
| Flytja inn mælipunkta | Flytja inn punkta úr punktaskrá | {{ui:Opna}}, athugaðu síðan röð dálkanna í **Flytja inn punkta** ([Flytja inn mælipunkta](topic:import-points)) |
| Raða punktum | Punktahópar, lýsingarlyklar | Sjálfvirkir hópar eftir fyrsta orði lýsingarinnar; engir lýsingarlyklar |
| Breyta punkti | Punktaritill, grip | Smelltu á hann og skrifaðu í Eiginleika, eða dragðu hann ([Breyta mælipunkti](topic:edit-points)) |
| Byggja núverandi land | Búa til yfirborð, bæta punktahópum við sem gögnum | Sjálfvirkt: yfirborðið endurbyggist hvenær sem inntök þess breytast |
| Bæta við brotlínum | Bæta brotlínum við úr fjöllínum eða eiginleikalínum | Stilltu punktahóp á {{ui:Brotalína}}, eða smelltu á punkta með tólinu {{ui:Brotalína}} ({{key:B}}) |
| Klippa yfirborðið | Ytri mörk, falin mörk, hámarkslengd þríhyrnings | {{ui:Mörk}} ({{key:O}}, aðeins ytri) og **Lengsta ytri brún** |
| Sýna hæðarlínur | Stíll yfirborðs | **Birting** í vinstra spjaldinu: bil, aðalbil, merkingar, bönd, hallaörvar |
| Teikna miðlínu | Verkfæri til að búa til veglínu, stillingar bogra og spírala | {{ui:Veglína}} ({{key:A}}): smelltu á PI, {{key:Enter}}; radíusar og spírallengdir í PI-töflunni |
| Búa til langsniðsútsýni | Galdrar fyrir langsniðsútsýni, bönd | {{ui:Langsnið}} ({{key:R}}): eitt langsniðsútsýni undir grunnmyndinni, alltaf passað |
| Hanna hallann | Verkfæri fyrir langsniðsskipulag | {{ui:Byrja á landinu}}, {{ui:Bæta við PVI}} ({{key:I}}), draga PVI, skrifa **Curve L** |
| Byggja veg | Samsetning, undirsamsetningar, vegstæði, markmið, svæði | Hakaðu **Sweep an assembly along the design profile** undir veglínunni; akbraut, öxl og hliðarhalli hvorum megin, eða hvor hlið byggð úr hlutum (renna, kantsteinn, gangstétt …) |
| Móta pall | Eiginleikalínur, mótunarhópar, mótunarviðmið | {{ui:Pallur}} ({{key:G}}): flatur pallur með skurð- og fyllingarhalla að dagsbirtu |
| Reikna jarðvinnu | Rúmmálsyfirborð, rúmmálsyfirlit | **Jarðvinna** í hægra spjaldinu, ristaðferð, uppfærist í beinni |
| Leggja regnvatns- eða frárennslislögn | Lagnakerfi með hlutalista, reglum | {{ui:Pípur}} ({{key:P}}): smelltu á mannvirki neðanstraums; þrjár reglur sem þú setur; sjálfvirkar botnhæðir |
| Skiptast á gögnum við aðra | Innflutningur og útflutningur LandXML | {{ui:Opna}} LandXML-skrá; {{ui:LandXML}} til útflutnings ([Skiptast á LandXML](topic:landxml)) |
| Senda línuverk í CAD | Útflutningur í DWG | {{ui:DWG}} (2000 til 2018 snið) eða {{ui:DXF}} (R12) |
| Prenta | Skipulag, glugga, blaðasöfn | {{ui:PDF}}: eitt liggjandi blað af grunnmyndinni í völdum mælikvarða; grunnmynda- og langsniðsblöð og sniðblöð sem PDF |
| Deila vinnu milli skráa | Gagnatenglar, tilvísanir | Ekki í boði: eitt verkefni í hverri skrá |
| Afturkalla | Afturkalla | {{key:Mod+Z}} og {{key:Mod+Y}}, 200 skref; birtingarstillingar eru ekki afturkallsskref |

## Munurinn sem ruglar fólk

**Engin skipanalína** nema þú veljir valmyndarstílinn {{ui:Klassískt teikniforrit}}. Verkfæri eru hnappar á tækjastiku og stakir stafir: {{key:A}} veglína, {{key:G}} pallur, {{key:P}} pípur, {{key:B}} brotlína, {{key:O}} mörk, {{key:R}} langsnið, {{key:I}} bæta við PVI, {{key:V}} velja, {{key:F}} passa. Í hinum valmyndarstílunum gerir það ekkert að skrifa heiti skipana. Sjá [Takkar og mús](topic:keyboard).

**Enter lýkur; tvísmellur er varasamur.** Smelltu einu sinni á síðasta punktinn, og ýttu svo á {{key:Enter}}. Í þessari útgáfu lýkur tvísmellur einnig, en fjarlægir punktinn sem þú tvísmelltir á. Hægri smellur lýkur ekki og endurtekur ekki; hann færir aðeins skjámyndina þegar þú dregur með honum.

**Allt er kraftmikið, alltaf.** Breyttu punktahópi, radíus, PVI eða halla palls, og yfirborðið, hæðarlínur, vegstæðið, dagsbirtulínur og rúmmál uppfærast strax. Það er ekkert að endurbyggja og ekkert úrelt.

**Ekkert er teikniobjekt.** Grunnmyndin er sýn á hönnunina, ekki teikning sem þú getur breytt með CAD-skipunum. Þú getur ekki bætt við eigin línum eða texta, breytt lit lags eða sundrað neinu. Fluttu út í DXF og kláraðu teikninguna í CAD-forriti.

**Engir stílar.** Litir, línubreiddir, stærðir merkinga og heiti laga eru föst (sjá [Lög á grunnmynd](topic:plan-layers)). Blað og Líkan í forritastikunni skipta á milli ljóss og dökks skjás.

**Eitt af hverju.** Eitt núverandi landyfirborð, eitt mótað niðurstaða, eitt lagnakerfi á verkefni. Margar veglínur og pallar eru í lagi.

**Einingar eru merkimiðar.** Að velja {{ui:US-fet}} eða {{ui:Metrar}} breytir engu. Enginn teikningarmælikvarði er til. Hnitakerfi er valfrjálst: stilltu það undir {{ui:Hnit}} og engin tala hreyfist, það segir aðeins hvað tölurnar þýða (sjá [Stilla hnitakerfi verkefnisins](topic:coordinate-systems)). Fet eru meðhöndluð sem bandarísk mælingarfet þegar skrifað er í LandXML.

**Brotlínuhópar tengjast í punktanúmeraröð.** Hópur stilltur á {{ui:Brotalína}} verður ein lína gegnum alla punkta sína, í númeraröð. Sameiginlegir kóðar (tvær flæðilínur sem báðar eru kóðaðar „FL“) búa til eina sikksakk-línu; teiknaðu þær handvirkt.

**Stöðvar líta eins út, metrar eru ólíkir.** Fet nota 100 ft stöðvar (12+34.56); metrar nota 1000 m stöðvar (1+234.567).

**Eyða á Mac.** Mac-takkinn merktur delete er Backspace í vafranum. Notaðu Fn og delete, eða hnappinn {{ui:Eyða}}, til að eyða vali.

**Skrár eru niðurhöl.** {{ui:Vista}} sækir `.civilcraft.json`-skrá í hvert sinn; það er enginn „vista yfir opnu skrána“. Afrit af óvistaðri vinnu er geymt í þessum vafra ([Endurheimta óvistaða vinnu](common:recover)). Að opna punktaskrá skiptir punktunum út án þess að spyrja. Sjá [Skrár sem þú getur opnað, vistað og flutt út](topic:files).

**Reglurnar eru þínar.** Reglur lagnakerfisins og samsetning vegstæðisins byrja með gildum í staðinn sem eru ekki staðall. Stilltu þínar eigin áður en þú treystir einhverri athugun.

**Rúmmál eru byggð á rist.** Skurður og fylling koma úr fínni rist milli yfirborðanna tveggja, innan dagsbirtulínanna, án rýrnunar eða þenslu. Þau eru nálægt en ekki þau sömu og TIN-í-TIN rúmmál.

## Hvað vantar

Sveigjur aðrar en klóþoíð, samsetningar sem breytast eftir veginum, halla pallar, inntaksgeta og geymsla, vörulistar, pípur í langsniði, lóðaskipulag og stærð lóða, minnstu-kvaðrata jöfnun og mæligagnagrunnar, opnun DWG og fleira. Í heild, með því sem þú gerir í staðinn í dag, er í [Ekki smíðað enn](topic:not-built-yet).
