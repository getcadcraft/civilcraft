---
title: Llogarit rrjedhat e stuhisë, madhësitë e tubave dhe vijën hidraulike të kotës
summary: Vizato zonat e kullimit që derdhen në çdo strukturë, mblidh rrjedhat përgjatë rrjetit me metodën racionale, përcakto madhësinë e tubave me ekuacionin e Manning-ut, dhe shiko ku vija hidraulike e kotës del plot ose arrin sipërfaqen.
keywords: kullim stuhie, zonë kullimi, metoda racionale, koeficienti i rrjedhjes, koha e përqendrimit, intensiteti i reshjeve, idf, manning, madhësia e tubit, vija hidraulike e kotës, hgl, vija e energjisë, egl, mbingarkesë, përmbytje, ujë i poshtëm
from: e44872ec
---

Kullimi i stuhisë punon mbi [rrjetin e tubave](topic:pipe-network): vizato fillimisht rrjetin, pastaj zonat që derdhen në të. Gjithçka shfaqet nën **Kullimi i stuhisë** në panelin e djathtë kur nuk është zgjedhur asgjë.

## Vizato një zonë kullimi

1. Kliko **Vizato një zonë kullimi** nën **Kullimi i stuhisë**.
2. Kliko kulmet e zonës që derdhet në një strukturë. {{key:Enter}} ose një dy-klik e përfundon; {{key:Backspace}} heq kulmin e fundit; {{key:Esc}} ndalon.
3. Zona derdhet në një strukturë brenda saj, përndryshe në atë më të afërt. **Vetitë** e saj hapen: cakto emrin, **Koeficienti i rrjedhjes C** (pjesa e shiut që rrjedh, nga 0 në 1), **Koha e përqendrimit** në minuta, dhe cilën strukturë **Derdhet në**.

**Vizato një zonë tjetër** te Vetitë e saj fillon tjetrën. Kliko brenda një zone në planimetri për ta zgjedhur; {{key:Delete}} e heq. Çdo ndryshim është një hap: {{key:Mod+Z}} e zhbën.

## Cakto stuhinë e projektimit

Intensiteti i reshjeve është i = a ÷ (tc + b) në fuqinë c, në inç për orë për një projekt në fut dhe në milimetra për orë për një projekt në metra. Përshtat **Intensiteti a**, **b** dhe **c** me kurbën tënde të intensitet-kohëzgjatje-frekuencë për periudhën e kthimit për të cilën projekton.

:::warning
Kurba fillestare e intensitetit, Manning n (0.013) dhe humbja në nyje (0.5) janë vlera të përkohshme, jo një standard. Cakto ato nga të dhënat e tua të shiut dhe kriteret e projektimit.
:::

- **Koha më e shkurtër e përqendrimit**: asnjë tub nuk llogaritet me kohë më të shkurtër (10 minuta për fillim).
- **Manning n**: ashpërsia e tubave.
- **Humbja në nyje**: kulla e humbur në çdo strukturë, si pjesë e kullës së shpejtësisë V²/2g të tubit që del prej saj.
- **Niveli i ujit në dalje**: ujë i poshtëm, aty ku mbaron tubi i fundit. Lëre bosh kur dalja është e lirë.

## Si mblidhen rrjedhat

Çdo tub mbart çdo zonë mbi të. Q = C × i × A, ku C × A mblidhet përgjatë rrjetit dhe i është intensiteti në kohën më të gjatë të përqendrimit të ujit që vjen: koha e vetë zonës, ose koha nga një zonë e sipërme plus koha e udhëtimit përmes tubave (gjatësia ÷ shpejtësia kur rrjedh plot). Q është në këmbë kub për sekondë (A në acre) ose metra kub për sekondë (A në hektarë).

## Madhësia e tubave

Tabela nën **Rrjedhat dhe vijat e kotave** tregon për çdo tub rrjedhën, çfarë mban kur rrjedh plot me pjerrësinë e vet, shpejtësinë, kotën hidraulike në majë dhe në bazë, dhe sa thellë rrjedh.

**Përcakto madhësinë e tubave për këto rrjedha** i jep çdo tubi madhësinë standarde më të vogël që mban rrjedhën e vet me pjerrësinë e vet (12 deri 72 in, ose 300 deri 1800 mm). Është një hap. Kotat e fundit mbeten aty ku janë: nëse madhësitë ndryshojnë, përdor **Cakto çdo kotë fundi sipas rregullave** për të ruajtur mbulesën, pastaj kontrollo sërish tabelën.

## Lexo vijat e kotave

Vija hidraulike e kotës (HGL) llogaritet nga dalja drejt lart:

- Një tub që rrjedh pjesërisht plot ka HGL-në në sipërfaqen e ujit: kota e fundit plus thellësia normale.
- Kur uji poshtë është më lart se kurora e tubit, ose ai mban më shumë nga sa mund të mbajë kur rrjedh plot, ai rrjedh plot (mbingarkuar) dhe HGL-ja e tij ngrihet sipas pjerrësisë së fërkimit përgjatë gjatësisë së vet.
- Në çdo strukturë HGL-ja është HGL-ja e kokës së tubit që del, plus humbja në nyje.
- Vija e energjisë (EGL) është HGL plus kulla e shpejtësisë.

Një tub që rrjedh plot listohet, dhe po ashtu çdo strukturë ku HGL-ja është mbi buzë: uji arrin sipërfaqen aty, dhe struktura rrethohet me të kuqe në planimetri. Zgjidh një tub ose strukturë për të parë rrjedhën, thellësinë, shpejtësinë dhe të dy vijat e kotave te Vetitë e saj.

## Dërgo një stuhi

Metoda racionale jep një maksimum për çdo tub. **Dërgo stuhinë** (nën rezultatet, te Vetitë e rrjetit) llogarit gjithë stuhinë: rrjedhën e secilës zonë në kohë, të çuar përmes tubave me kohën e udhëtimit dhe ruajtjen e tyre, dhe të shtuar aty ku takohen.

1. Lëri **Reshjet zgjasin** dhe **Intensiteti i reshjeve** bosh për të përdorur kohën më të gjatë të përqendrimit dhe kurbën e shiut më lart, ose shkruaj vlerat e tua.
2. Shtyp **Dërgo stuhinë**. Tabela liston, për çdo tub, rrjedhën më të lartë hyrëse dhe dalëse, sa më i ulët është maksimumi dalës, sa përdor nga kapaciteti i plotë i tubit, dhe minutën kur arrin kulmin.
3. Çdo dalje merr një grafik të vogël rrjedhë-kohë dhe **Shkarko hidrogramin (CSV)**.

Zona e kullimit nxjerr shiun e mesatarizuar gjatë kohës së vet të përqendrimit, prandaj një stuhi më e shkurtër se ajo arrin një maksimum më të ulët se C × i × A. Çdo tub dërgohet me metodën Muskingum–Cunge, duke përdorur thellësinë e rrjedhës që metoda racionale e gjeti tashmë. Dy degë me kohë të ndryshme përqendrimi nuk arrijnë maksimumin së bashku, prandaj shuma e tyre është më e ulët se shuma e maksimumeve të tyre.

Kjo nuk modelon mbingarkesën, mbrapështimin e ujit, ruajtjen në struktura ose përmbytjen. Një tub, maksimumi i dërguar i të cilit është mbi kapacitetin e tij të plotë, listohet, dhe uji i tij kalon sikur të përshtatej. Përdore për të parë kohën dhe zbutjen, jo për të përcaktuar madhësinë e tubit. Është një mjet llogaritjeje: një inxhinier e kontrollon.

## Ruajtur me projektin

Zonat e kullimit dhe cilësimet e stuhisë ruhen në skedarin e projektit. Ende nuk janë në grafikun PDF, në DWG ose DXF, ose në LandXML: shih [Ende jo të ndërtuara](topic:not-built-yet).
