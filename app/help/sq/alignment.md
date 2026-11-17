---
title: Vendos një aks rrugor horizontal
summary: Vizato një aks sipas PI-ve të tij, cakto rrezet e harkut dhe stacionin e fillimit, zhvendos PI-të dhe lexo të dhënat e harkut, stacionin dhe shmangien.
keywords: aks rrugor, pa zgjidhje, harku nuk përshtatet, rreze më e madhe, rreze më e vogël, rreze minimale, shpejtësia e projektimit, mbivendosje, qendërvijë, pi, hark horizontal, rreze, stacionim, tangjente, krijo aks, vendosje aksi, pc, pt, shmangie stacioni
from: 8c5df4aa
---

Një aks rrugor në CivilCraft është një zinxhir tangjentesh përmes pikave të prerjes (PI), me një hark rrethor në çdo PI të brendshme që ka rreze. Stacionohet nga një stacion fillimi që zgjedh ti. Një projekt mund të mbajë shumë akse.

## Vizato aksin

1. Shtyp {{key:A}}, ose kliko {{ui:Aksi rrugor}} në grupin **Projektimi**.
   Shenja thotë "Aksi rrugor: kliko PI-të me radhë. Enter ose dy klikime përfundojnë, Backspace heq të fundit, Esc anulon."
2. Kliko PI-n e parë (fillimi i aksit).
3. Kliko çdo PI të radhës, me radhë. Një vijë e kuqe e ndjek treguesin dhe tregon gjatësinë dhe drejtimin e tangjentes që po vizaton, për shembull "212.40 ft  N 63°12'05" E".
4. Kliko PI-n e fundit (fundi i aksit).
5. Shtyp {{key:Enter}}.
   Aksi vizatohet me stacionim dhe zgjidhet. Shiriti i gjendjes thotë, për shembull, "Aksi 1: 386.36 ft, harqe me rreze 100 ft aty ku përshtaten. Ndrysho rrezet te Vetitë; Profil gjatësor (R) për të projektuar pjerrësinë e tij."

Ndërsa vizaton: {{key:Backspace}} heq PI-n e fundit, {{key:Esc}} anulon, dhe tërheqja mbi hapësirë bosh lëviz pamjen pa shtuar PI.

:::warning
Përfundo me {{key:Enter}}. Klikimi i dyfishtë gjithashtu përfundon, por në këtë version heq PI-n ku klikove dy herë. Kliko PI-n e fundit një herë, pastaj shtyp {{key:Enter}}.
:::

Çdo PI e brendshme merr një hark prej 100 ft (30 m në një projekt në metra), ose rrezen më të madhe të plotë që futet në gjysmën e secilës tangjente, nëse 100 ft nuk futet. PI shumë të mprehta ose të drejtuara drejt e nuk marrin hark.

## Cakto rrezet dhe koordinatat

Me aksin të zgjedhur, paneli i djathtë shfaq **Aksi rrugor**:

1. **Emri** dhe **Stacioni i fillimit**. Shkruaj një stacion si `10+00` (ft) ose `0+500` (metra), ose si numër të thjeshtë. Shih [Njësitë, stacionet dhe formatet e numrave](topic:units-and-stations).
2. **Gjatësia** dhe **Stacioni i fundit** llogariten për ty.
3. Tabela **PI-të** liston **Lindjen** dhe **Veriun** e çdo PI-je, dhe një **Rrezen** për çdo PI të brendshme. Shkruaj një vlerë të re dhe shtyp {{key:Enter}}.
   - Rreze 0 bën një pikë këndi pa hark.
   - PI-ja e parë dhe e fundit nuk kanë kurrë rreze.
   - Shenja x e vogël në fund të rreshtit heq atë PI (një akset mban të paktën dy).
4. Lexo listën **Harqet**: për çdo hark, stacionet PC dhe PT, rrezen R, devijimin Δ dhe drejtimin (majtas ose djathtas), gjatësinë L, tangjenten T, E-në e jashtme dhe kordën.
5. Rreshti nën harqet jep drejtimin e tangjentes së parë.

## Kur harku nuk përshtatet

Nëse harqet kanë nevojë për më shumë tangjente se sa ka mes PI-ve të tyre, aksi nuk ka zgjidhje: nuk vizatohet saktë derisa ta ndreqësh, dhe nuk përfshihet në eksportet LandXML. Një kuti e kuqe thotë arsyen, me numra, dhe ofron atë që do të përshtatej:

- "Harqet te PI 2 dhe PI 3 kanë nevojë për 240.00 ft tangjente mes tyre (130.00 + 110.00), por PI-të janë 180.00 ft larg njëra-tjetrës." Ose, kur vetëm njëri ka hark: "Harku te PI 2 ka nevojë për 240.00 ft tangjente drejt PI 1 …".
- Një buton për çdo PI vendos **rrezen më të madhe që përshtatet** atje, me harkun tjetër të mbajtur si është (duhet të përshtatet edhe me tangjenten tjetër të PI-së). Kur të dy PI-të kanë harqe, **Both** shkurton dy rrezet në mënyrë proporcionale, që të takohen saktë.
- Kur një hark vetëm është më i gjatë se tangjentja, kutia thotë që asnjë hark te PI tjetër nuk mund të përshtatet ndërsa ai është kaq i madh.
- Një PI që kthehet drejt prapa nuk mund të marrë hark; kutia ofron **Asnjë hark te PI n**.

Çdo buton është një hap: {{key:Mod+Z}} i kthen rrezet. Rrezet e ofruara rrumbullakosen poshtë në 0.01, që gjithmonë të përshtaten.

### Një rreze minimale projektimi

Shkruaj një **Rreze minimale projektimi** (për shembull nga shpejtësia e projektimit) që çdo hark të kontrollohet me të; lëre bosh për asnjë. Një hark nën të listohet me një buton për **rrezen më të vogël që plotëson minimumin**, kur ajo rreze përshtatet. Kur nuk përshtatet, kutia e thotë këtë dhe jep rrezen më të madhe që lejojnë tangjentet, që ta dish se duhet të zhvendosësh një PI ose ta ulësh minimumin.

## Zhvendos PI-të në plan

1. Me {{ui:Përzgjidh}} aktiv, kliko aksin për ta zgjedhur. Dorezat katrore shfaqen te PI-të e tij.
2. Tërhiq një dorezë. Aksi, stacionimi, profili dhe korridori ndjekin.
3. Lësho. Zhvendosja është një hap i vetëm zhbërjeje.

Shtimi i një PI mes dy ekzistuesve nuk është ende i disponueshëm: hiq aksin dhe vizatoje përsëri, ose shkruaj koordinata të reja për PI-të që ke.

## Lexo stacionin dhe shmangien

Lëvize treguesin mbi plan. Shiriti i gjendjes tregon aksin më të afërt (ose të zgjedhurin) me stacionin dhe shmangien, **L** ose **R** duke parë përpara në stacion, për shembull "Aksi 1: Sta 2+15.30, shmangie 18.42 R". Përtej çdo skaji shton "(jashtë fundit)".

## Çfarë vizatohet

Në plan, në DXF dhe në PDF: qendërvija (tangjentet si vija, harqet si harqe të vërteta), një shenjë çdo 50 ft (20 m) me një shenjë më të gjatë dhe një etiketë stacioni çdo 100 njësi, dhe shenjat PC dhe PT me stacionet e tyre.

## Fshi një aks

Zgjidhe dhe shtyp {{key:Delete}}, ose kliko {{ui:Fshi}} në shiritin e veglave ose në fund të panelit të djathtë. Profili dhe korridori i tij shkojnë me të. {{key:Mod+Z}} e kthen.

:::mac
Në tastierën e Mac, tasti i quajtur **delete** është {{key:Backspace}} për shfletuesin dhe nuk fshin një zgjedhje. Shtyp {{key:Delete}} (Fn dhe delete), ose përdor butonin {{ui:Fshi}}.
:::

## Tjetra

- [Projekto një profil vertikal](topic:profile).
## Shpejtësia e projektimit dhe klasa

Nën Vetitë e aksit, **Shpejtësia e projektimit** (km/h ose mph) dhe **Klasa e projektimit** mbahen me aksin, ruhen në projekt dhe shkruhen në IFC (Pset_RoadDesignCriteriaCommon). CivilCraft nuk ka tabelë që lidh një shpejtësi me një rreze minimale, kështu që asgjë nuk kontrollohet nga to: cakto **Rrezen minimale** sipas standardit tënd të projektimit.

## Spiralet

Një hark mund të ketë një spirale klotoide në secilin skaj: tangjente, spirale, hark, spirale, tangjente. Te tabela e PI-ve, shkruaj një gjatësi te **Spirale hyrëse** dhe **Spirale daljeje** për një PI që ka rreze. PI-ja qëndron aty ku është; harku zhvendoset brenda për të bërë vend, kështu që distanca e tangjentes rritet me shmangien e spirales. Dy gjatësitë mund të ndryshojnë, dhe një PI me vetëm një gjatësi merr spirale vetëm në atë skaj.

Lista e harqeve lexohet TS, SC, CS dhe ST (tangjente–spirale, spirale–hark, hark–spirale, spirale–tangjente) me këndin e spiralit θs, distancat e tangjenteve dhe distancën e jashtme. Stacionet shkojnë përgjatë spiraleve si gjithmonë. Spiralet që së bashku kthejnë më shumë se harku refuzohen, me emrin e PI-së të përmendur; një spirale më e gjatë se sa lejon tangjentja është mbivendosje, si për çdo hark. Superelevacioni e përdor spiralen si rampë (shih [Korridori](topic:corridor)).
