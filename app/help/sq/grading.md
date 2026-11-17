---
title: Nivelo platformën e ndërtesës
summary: Vizato një platformë të sheshtë, vendos lartësinë dhe pjerrësitë e prerjes dhe mbushjes, dhe lëre CivilCraft ta lidhë me terrenin ekzistues dhe ta shtojë në sipërfaqen e propozuar.
keywords: mur mbajtës, mure mbajtëse, mur vertikal, mur në vend të pjerrësisë, pjerrësi për anë, mbushje anësore, nivelim, platformë, platformë ndërtese, vija e ditës, vijë karakteristike, grupi i nivelimit, pjerrësi prerjeje, pjerrësi mbushjeje, nivel përfundimtar, sipërfaqe e propozuar, nivelim i vendit
from: 482319a6
---

Platforma është një zonë e sheshtë në një lartësi. Nga skaji i saj, CivilCraft niveleon jashtë me pjerrësinë tuaj të prerjes aty ku terreni është më i lartë se platforma, dhe me pjerrësinë tuaj të mbushjes aty ku është më i ulët, deri sa pjerrësia të takojë terrenin ekzistues. Ajo vijë takimi është **vija e ditës**. Platforma dhe pjerrësitë e saj zëvendësojnë terrenin ekzistues brenda vijës së ditës për të formuar sipërfaqen e propozuar.

## Vizato platformën

Ju duhet fillimisht një sipërfaqe ekzistuese terreni.

1. Shtyp {{key:G}}, ose kliko {{ui:Platformë}} te grupi **Projektimi**.
   Ndihmëza thotë: "Platformë: kliko këndet e saj. Enter ose dyklikimi përfundon, Backspace heq të fundit, Esc anulon."
2. Kliko këndet e platformës radhazi, në çdo drejtim. Një kontur blu ndjek treguesin.
3. Shtyp {{key:Enter}} pas këndit të fundit (të paktën tre).
   Platforma vizatohet dhe përzgjidhet. Fillon në lartësinë e terrenit në mesin e saj, e rrumbullakosur në 0.1, me pjerrësi prerjeje 2 : 1 dhe pjerrësi mbushjeje 3 : 1. Shiriti i statusit thotë, për shembull, "Platforma 1 në lartësi 254.3 (terreni në mes të saj), prerje 2:1, mbushje 3:1. Ndryshoji te Vetitë."

:::warning
Përfundo me {{key:Enter}}. Dyklikimi gjithashtu përfundon, por në këtë version heq këndin ku dyklikove. Kliko këndin e fundit një herë, pastaj shtyp {{key:Enter}}.
:::

Kontura e platformës nuk duhet të kryqëzohet me veten ("Kontura e platformës kryqëzohet me veten.").

## Vendos lartësinë dhe pjerrësitë

Me platformën të përzgjedhur, paneli i djathtë shfaq **Platformë**:

1. **Emri**.
2. **Lartësia**: lartësia e sheshtë e platformës.
3. **Pjerrësia e prerjes** dhe **Pjerrësia e mbushjes**, si H:V (2 do të thotë 2 : 1). Të dyja duhet të jenë më të mëdha se 0.
4. **Sipërfaqja e platformës** dhe **Këndet** shfaqen për referencë.

Shtyp {{key:Enter}} pas çdo vlere. Vija e ditës, sipërfaqja e propozuar dhe vëllimet përditësohen menjëherë.

Nën fushat, një rresht lexon për shembull "Vija e ditës: 48 vija pjerrësie (20 në prerje, 28 në mbushje), më e largëta 31.20 ft larg." Planimetria shfaq vijën e ditës dhe vijat e pjerrësisë me magjenta.

## Si gjendet vija e ditës

- Vijat e pjerrësisë dalin nga çdo skaj pingul me të, rreth çdo të njëzetën e madhësisë së platformës.
- Te këndet e jashtme ato përhapen çdo 10°, që pjerrësia të mbështjellë këndin.
- Te këndet e brendshme një vijë shkon përgjatë bisektorit, aty ku takohen pjerrësitë nga dy skajet.
- Çdo vijë ngjitet me pjerrësinë e prerjes ose zbret me pjerrësinë e mbushjes derisa arrin terrenin.

## Pjerrësi sipas anës dhe muret mbajtëse

Nën **Anët dhe muret mbajtëse** te Vetitë e një platforme, një sheshi ose një berme, çdo anë mund të nivelohet në mënyrën e vet. Ana 1 shkon nga kënd i parë që klikove deri te i dyti, ana 2 nga i dyti te i treti, e kështu me radhë.

- **Të gjitha anët**: **Me pjerrësi** përdor pjerrësitë e prerjes dhe mbushjes më sipër në çdo anë; **Vertikale: muret mbajtëse** vendos një mur në çdo anë.
- Për çdo anë: **Pjerrësitë më sipër**, **Pjerrësitë e veta** (shkruaj një pjerrësi prerjeje dhe mbushjeje për atë anë) ose **Vertikale (mur mbajtës)**.
- Shkruaj një pjerrësi si `3` ose `3:1` (horizontale me 1 vertikale), `33%` ose `18.4°`; shfaqet si H:1. **Pjerrësia e prerjes** dhe **Pjerrësia e mbushjes** të vetë platformës pranojnë të njëjtat.
- Një anë vertikale nuk ka mbushje anësore: një mur mbajtës shkon përgjatë skajit, nga platforma poshtë në terrenin ekzistues (në mbushje) ose nga terreni poshtë në platformë (në prerje). **Trashësia e murit** (0.3 m ose 1 ft në fillim) është sa larg hapet terreni nga skaji i platformës deri në terrenin ekzistues. Vëllimet e prerjes dhe mbushjes nuk llogarisin mbushjen anësore që ajo anë nuk e ka më.
- Aty ku muri takon një anë me pjerrësi, pjerrësia mbështjellë fundin e murit; dy muret takohen në një mitër.
- Nën fushat: gjatësia e mureve, faqja e ekspozuar (lartësi × gjatësi), lartësia më e lartë dhe mesatare.

Planimetria vizaton faqen e jashtme të çdo muri me vija të shkurtra tërthore dhe lartësinë e tij në të dy skajet dhe në më të lartën (në shtresën e mureve mbajtës, që hyn gjithashtu në DXF dhe DWG). Pamja 3D i tregon muret si trupa të ngurtë (Shfaq › Muret mbajtëse), dhe eksportet GLB, OBJ dhe USD i përfshijnë ato. Prerjet tërthore të skajit tregojnë hapin.

**Paralajmërimet** (te Vetitë, dhe në panelin e Problemeve): një mur më i lartë se **Paralajmëro mbi një lartësi muri prej** (1.0 m ose 3.3 ft në fillim) "mund të kërkojë një mur të projektuar nga inxhinieri ose leje; kontrollo rregullat vendore", dhe, kur shkruan **Pjerrësinë më të madhe që mban toka**, çdo anë pjerrësia e prerjes ose mbushjes së së cilës është më e thiktë se kjo. Ato janë paralajmërime: niveleimi ndërtohet edhe kështu. Çdo ndryshim është një hap për {{key:Mod+Z}}.

## Lëviz këndet

Përzgjidh platformën, pastaj tërhiq një dorezë katrore te një kënd. Çdo tërheqje është një hap zhbërjeje. Shtimi ose heqja e një këndi nuk është ende e disponueshme: fshi platformën dhe vizato-e përsëri.

## Kur nuk niveleon

Një kuti e kuqe nën **Punët e tokës** emëron platformën dhe problemin:

| Mesazhi | Çfarë të bësh |
|---|---|
| "3 vija pjerrësie dalin nga sipërfaqja përpara se ta takojnë: platforma është shumë afër skajit të sipërfaqes ose shumë lart/poshtë." | Zhvendose platformën brenda nga skaji i sipërfaqes, ose sille lartësinë e saj më afër terrenit. |
| "Vija e ditës kryqëzohet me veten (pjerrësitë nga anë të ndryshme të platformës futen në njëra-tjetrën). Ripunoje formën e platformës ose ndrysho pjerrësitë." | Tipike për platforma të ngushta ose në formë L në prerje të thellë ose mbushje të lartë. Zgjero platformën, sheshoje diferencën, ose bëji pjerrësitë më të thikta. |
| "Kontura e platformës kryqëzohet me veten." | Rivizato këndet radhazi rreth platformës. |

Një platformë me problem lihet jashtë sipërfaqes së propozuar dhe vëllimeve deri sa të rregullohet.

## Shiko rezultatin

1. Te **Shfaqja**, vendos **Sipërfaqen** në {{ui:E propozuar (e nivelluar)}}.
   Konturat tani shtrihen të sheshta nëpër platformë dhe ndjekin pjerrësitë deri në vijën e ditës.
2. Lëviz treguesin mbi platformë: shiriti i statusit shfaq lartësitë **Toka** dhe **Të niveluara**.
3. Lexo prerjen dhe mbushjen te **Punët e tokës**; shih [Vëllimet e punës së tokës](topic:volumes).

Platformat niveleohen pas koridoreve, sipas radhës së vizatimit. Një platformë e mëvonshme zëvendëson çdo gjë më herët brenda vijës së vet të ditës.

## Fshi një platformë

Përzgjidhe dhe shtyp {{key:Delete}} (në Mac, Fn dhe delete), ose kliko {{ui:Fshi}}.

## Nuk është ndërtuar ende

Platformat janë të sheshta: platformat me pjerrësi, vijat karakteristike me nivel të ndryshueshëm, banket dhe niveleimi në një distancë ose lartësi të synuar nuk janë ende të disponueshme. Shih [Nuk është ndërtuar ende](topic:not-built-yet).
