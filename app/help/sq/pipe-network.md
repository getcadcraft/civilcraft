---
title: Hartëzo një rrjet tubash gravitacional
summary: Vizato vrapime tubash strukturë për strukturë, vendos rregullat e pjerrësisë, mbulesës dhe rënies, lër CivilCraft të vendosë kotat e fundit, dhe rregullo problemet që liston.
keywords: ndërtuesi i strukturës, lloj strukture, strukturë drejtkëndëshe, pusetë, kapak, trashësi muri, artikull biblioteke, rrjet tubash, ujë shiu, fekale, kanalizim, struktura, pusete, hyrje, kotë fundi, mbulesë, pjerrësi, rënie, buzë, sump, tuba gravitacionalë
from: 10a3c14d
---

Një projekt mban një rrjet tubash gravitacional, ujë shiu ose fekal. Ai përbëhet nga struktura (pusetë, hyrje) dhe tuba të drejtë midis tyre. Rrjedha shkon në drejtimin që vizaton. CivilCraft kontrollon çdo tub dhe strukturë sipas tre rregullave që cakton, dhe mund të vendosë çdo kotë fundi nga ato rregulla.

## Vizato një vrapim

Mund të vizatosh tuba pa sipërfaqe, por buzët, mbulesa dhe kotat automatike kanë nevojë për një.

1. Shtyp {{key:P}}, ose kliko {{ui:Tubat}} te grupi **Projektim**.
   Shenja thotë "Tubat: kliko strukturat nga maja e vrapimit poshtë (kliko një ekzistuese për ta bashkuar). Enter përfundon."
2. Kliko ku shkon struktura e sipërme. Një strukturë vendoset.
3. Kliko çdo strukturë pasardhëse poshtë. Për t'u lidhur me një strukturë që ekziston tashmë, kliko mbi të: shiriti i gjendjes thotë "U bashkua S3."
4. Shtyp {{key:Enter}}.
   Tubat vizatohen, kotat e tyre vendosen sipas rregullave, dhe shiriti i gjendjes thotë, për shembull, "3 tuba u vizatuan, 12 kota u vendosën sipas rregullave; çdo kontroll kalon."

Strukturat e reja emërtohen S1, S2 … me diametër 48 in (1200 mm). Tubat e rinj emërtohen P1, P2 … me diametër 12 in (300 mm). Diametrat janë në inç në një projekt në këmbë dhe në milimetra në një projekt në metra.

Përfundo me {{key:Enter}}. Klikimi dy herë gjithashtu funksionon, por kur klikon dy herë mbi një strukturë ekzistuese për ta mbyllur vrapimin atje, lidhja hiqet: kliko një herë, pastaj shtyp {{key:Enter}}.

## Vendos rregullat e tua

Pa asgjë të zgjedhur, paneli i djathtë (**Projekti**) ka një bllok **Rrjeti i tubave**:

| Cilësimi | Vlera fillestare | Kuptimi |
|---|---|---|
| Lloji | Ujë shiu | {{ui:Ujë shiu}} ose {{ui:Fekale}}; shkruhet në LandXML |
| Pjerrësia minimale | 0.50% | Çdo tub duhet të bjerë të paktën aq |
| Mbulesa minimale | 2 ft (0.6 m) | Toka deri në kurorën e tubit, përgjatë gjithë tubit |
| Rënia në strukturat | 0.10 ft (0.03 m) | Kota e fundit e daljes duhet të jetë të paktën kjo larg nën çdo kotë fundi hyrjeje |

**Këto vlera fillestare janë vende mbajtëse, jo një standard.** Vendos vlerat që kërkon agjencia ose projekti yt. Mbulesa matet nga toka deri në kurorë (kota e fundit plus diametri i brendshëm); trashësia e murit nuk llogaritet. Aty ku platformat ose korridoret niveloheshin, sipërfaqja e niveluar është toka.

## Lër CivilCraft të vendosë kotat e fundit

- {{ui:Cakto çdo kotë fundi sipas rregullave}} (në bllokun **Rrjeti i tubave**) cakton të gjithë tubat.
- {{ui:Cakto kotat e tij sipas rregullave}} (me një tub të zgjedhur) cakton vetëm atë tub.

Duke punuar poshtë, çdo vrapim fillon me të paktën mbulesë në strukturën e vet të sipërme, bie të paktën sa pjerrësia minimale, bie të paktën rënien përmes çdo strukture, dhe zhytet më thellë aty ku toka përgjatë tubit do të linte më pak se mbulesën minimale. Kotat e fundit rrumbullakosen poshtë në 0.01, kurrë lart. Shiriti i gjendjes thotë "Kotat u vendosën: mbulesë minimale në majën e çdo vrapimi, të paktën pjerrësia minimale, të paktën rënia në çdo strukturë." ose emëron atë që nuk arriti të bëjë.

## Përpuno strukturat dhe tubat

Kliko një strukturë ose tub me {{ui:Përzgjidh}} për ta parë në panelin e djathtë.

**Struktura**: **Emri**, **Buza**, **Thellësia e sumpit**, **Diametri**, pastaj **Buza e përdorur**, **Sumpi**, **Lindja** dhe **Veriu**, dhe tubat hyrës e dalës me kotat e tyre.

- Lëre **Buzën** bosh për ta marrë nga sipërfaqja; kutia atëherë tregon vlerën e sipërfaqes me gri. Shkruaj një vlerë për ta fiksuar buzën.
- Tërhiq kapësen e strukturës në planimetri për ta lëvizur. Tubat e saj e ndjekin; kotat e tyre mbeten ashtu si ishin, prandaj kontrollo problemet më pas.

**Lloji**: zgjidh një nga llojet e strukturave të rrjetit (më poshtë), ose asnjë për një strukturë rrethore me diametrin e vet.

**Tubi**: **Emri**, strukturat ndërmjet të cilave shkon, **Diametri**, **Kota e fundit e sipërme**, **Kota e fundit e poshtme**, pastaj **Gjatësia**, **Pjerrësia** dhe **Mbulesa minimale**.

Shtyp {{key:Enter}} pas çdo vlere.

## Lexo dhe rregullo problemet

Blloku **Rrjeti i tubave** liston çdo problem (deri në 40); kliko një për të zgjedhur tubin ose strukturën. Një tub ose strukturë e zgjedhur liston të vetat. Pa asnjë të zgjedhur, shfaq "Çdo tub dhe strukturë kalon rregullat."

| Mesazhi (shembuj) | Çfarë të bësh |
|---|---|
| "P2 rrjedh lart (-0.40%)." ose "… rrjedh e sheshtë …" | Shkëmbe kotat e fundit, ose cakto sipas rregullave. |
| "P2 me 0.30% është më i sheshtë se minimumi 0.50%." | Ul kotën e fundit poshtë, ose ngri atë të sipërmen. |
| "P3 ka 1.40 mbulesë 35 përgjatë tij, më pak se minimumi 2." | Ul tubin; cakto kotat e tij sipas rregullave. |
| "Në S3, P4 del me 245.20, më pak se 0.1 nën P3 që hyn me 245.25." | Ul kotën e sipërme të tubit dalës. |
| "Kurora e P1 është mbi buzën e S1." | Tubi është shumë i lartë për strukturën. |
| "S2 ka 2 tuba që dalin prej saj; një rrjet gravitacional duhet të ketë një dalje nga çdo strukturë." | Hiq një tub dalës, ose riviziato në drejtimin e duhur. |
| "Tubat formojnë një unazë; rrjedha duhet të mbarojë në një dalje." | Një vrapim u vizatua mbi vetveten; fshi një tub. |
| "S5 është jashtë sipërfaqes dhe nuk ka kotë buze." | Shkruaj një buzë, ose zhvendos strukturën mbi sipërfaqe. |
| "P6 shtrihet pjesërisht jashtë sipërfaqes; mbulesa aty është e panjohur." | Zgjero sipërfaqen, ose pranoje që mbulesa nuk kontrollohet aty. |
| "P7 nuk ka ende kota fundi." | Shkruaji, ose cakto sipas rregullave. |

Tubat dhe strukturat me probleme shënohen gjithashtu me të kuqe në planimetri.

## Llojet e strukturave

Një lloj strukture është një strukturë e ndërtuar nga parametrat e saj: një pusetë, hyrje, kuti kryqëzimi ose dalje, **rrethore** (diametri i brendshëm) ose **drejtkëndëshe** (gjerësia dhe gjatësia e brendshme), me **trashësinë e murit**, **pllakën e dyshemesë**, një **sump** nën tubin më të ulët dhe një **kornizë dhe kapak** (hapje rrethore ose drejtkëndëshe, lartësia e kornizës). Llojet i takojnë rrjetit, nën **Llojet e strukturave** në Vetitë e projektit.

1. Kliko {{ui:Lloj i ri strukture}}. Dialogu e vizaton strukturën në planimetri dhe në prerje ndërsa shkruan.
2. Kliko {{ui:Shto llojin}}.
3. Zgjidh një strukturë dhe zgjidh llojin te **Lloji**. Ai merr madhësinë dhe sumpin e llojit; sumpi i vet mund të ndryshohet akoma.

Ndrysho një lloj dhe çdo strukturë e atij lloji ndjek madhësitë e tij. Hiq një lloj dhe strukturat e tij mbeten si struktura rrethore me të njëjtin diametër. Çdo ndryshim është një hap: {{key:Mod+Z}} e zhbën.

Një strukturë drejtkëndëshe vizatohet në planimetri, në DXF, DWG dhe PDF, dhe në 3D si një drejtkëndësh me gjatësinë e saj përgjatë tubit të daljes; tubat fillojnë në murin e saj. LandXML e shkruan si strukturë drejtkëndëshe (`RectStruct`) me trashësinë e murit të saj, dhe i lexon përsëri këto struktura si lloje.

### Ndaj një lloj përmes bibliotekës

{{ui:Ruaj si artikull biblioteke}} e shkruan llojin si artikull të bibliotekës CadCraft (një skedar `.json`): simbolin e tij planimetrik, një trup 3D deri në një thellësi tipike, dhe çdo madhësi. Ngarkoje në bibliotekë për ta ndarë. {{ui:Hap një artikull biblioteke}} lexon mbrapsht një strukturë të ruajtur kështu në rrjet, e konvertuar në njësitë e projektit. Artikujt e bibliotekës që nuk janë strukturat e bëra në CivilCraft refuzohen, me arsyen.

## Fshi

Zgjidh një tub dhe shtyp {{key:Delete}} për ta hequr. Fshirja e një strukture heq edhe tubat e lidhur me të. Në Mac, shtyp Fn dhe Delete, ose kliko {{ui:Delete}}.

## Ende nuk është ndërtuar

Rrjedhat, madhësitë e tubave dhe linja hidraulike e nivelit janë në [Drenazhimi i ujërave të shiut](topic:storm-drainage). Katalogët e tubave, tubat jo rrethorë, tubat në pamjen e profilit, tubat e lakuar dhe më shumë se një rrjet për projekt nuk janë ende të disponueshme. Shih [Ende nuk është ndërtuar](topic:not-built-yet).
