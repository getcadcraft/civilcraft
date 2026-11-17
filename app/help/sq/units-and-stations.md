---
title: Njësitë, stacionet dhe formatet e numrave
summary: Projekte në këmbë dhe metra, si shkruhen dhe shkruhen me dorë stacionet, pjerrësitë, pjerrësitë anësore, drejtimet, sipërfaqet, vëllimet dhe madhësitë e tubave, dhe çfarë bën ndryshimi i njësive.
keywords: shkruaj një gjatësi, aritmetikë, kalkulator, shumë, thyesë, këmbë dhe inç, 4+7/16, njësitë, këmbë, këmbë rilevimi amerikan, metra, metër, metrik, imperial, format stacioni, stacionim, pjerrësi, përqind, pjerrësi anësore, h:v, drejtim, jard kub, diametër
from: 0b9b5b6b
---

## Njësitë e projektit

Një projekt është në **US feet** ose në **metra** (**Njësitë** në panelin e majtë). Çdo koordinatë, kotë, gjatësi dhe stacion në projekt është në atë njësi.

:::warning
Ndryshimi i **Njësive** ndryshon etiketat, formatin e stacioneve, parazgjedhjet dhe mënyrën si shkruhen skedarët. **Nuk** konverton asnjë numër. Një vend i matur në këmbë dhe i ndryshuar në metra mban të njëjtat numra, tani të lexuar si metra. Shiriti i statusit thotë "Njësitë tani janë metra. Koordinatat nuk u konvertuan." Vendos njësitë që përputhen me të dhënat e tua përpara se të projektosh.
:::

Ç’varet nga njësitë:

| | US feet | Metra |
|---|---|---|
| Formati i stacionit | `12+34.56` (stacione 100 ft) | `1+234.567` (stacione 1000 m) |
| Intervalet e izoipsave të ofruara | 0.25 deri në 20 ft | 0.1 deri në 10 m |
| Sipërfaqja | sq ft | sq m |
| Vëllimi | cu yd | cu m |
| Diametri i tubit dhe i strukturës | inches | millimetra |
| Rreze e parazgjedhur e kurbës | 100 ft | 30 m |
| Shenjat e stacionimit në plan | çdo 50 ft, etiketa çdo 100 ft | çdo 20 m, etiketa çdo 100 m |
| Shkallët e printimit | 1" = 5' deri në 1" = 1000' | 1:50 deri në 1:10000 |
| Njësia lineare LandXML | USSurveyFoot | meter |

Një projekt i ri nisët në këmbë, ose në metra kur njësia e gjatësisë me yll në {{ui:Cilësimet}} › {{ui:Të përgjithshme}} › {{ui:Njësitë}} është metrike. Lista **Njësitë** shfaq njësitë e aktivizuara aty, dhe gjithmonë njësitë e vetë projektit. Me një njësi sipërfaqeje ose vëllimi me yll atje (acre, hektarë, acre-feet …), sipërfaqet dhe vëllimet raportohen në të në vend të kolonës së mësipërme. Shih [Njësitë, vlerat e shkruara dhe listat e njësive](common:unit-lists).

Kur hap LandXML, projekti merr njësitë e skedarit. Një skedar në këmbë ndërkombëtare hapet si projekt në këmbë; numrat nuk ndryshohen.

## Shkrimi i gjatësive dhe shumave

Çdo kuti që pranon një gjatësi ose kotë lexon më shumë se një numër të thjeshtë: shtyp {{key:Enter}} dhe kutia shfaq rezultatin në njësitë e projektit.

| Ti shkruan | Në një projekt në këmbë | Në një projekt në metra |
|---|---|---|
| `12.5` | 12.5 ft | 12.5 m |
| `12'6"`, `12' 6 1/2"`, `6"`, `3 ft 6 in` | 12.5 ft, 12.54 ft, 0.5 ft, 3.5 ft | të njëjtat gjatësi në metra |
| `4 7/16`, `4-7/16` | 4.4375 ft | 4.4375 m |
| `450 mm`, `1.2 m`, `90 cm` | në ft | 0.45 m, 1.2 m, 0.9 m |
| `10 US ft`, `3 ch`, `2 rd`, `0.5 mi`, `1 km` | 10 ft, dhe të tjerat në US survey feet | të njëjtat gjatësi në metra |
| `4+7/16`, `12'6" + 3/4"`, `(24'-0")/3`, `2*450mm` | shuma, në ft | shuma, në metra |

Çdo shenjë gjatësie nga tabela e përbashkët e njësive funksionon, me madhësinë e saktë: këmbët e një projekti janë US survey feet, kështu që `10 US ft` është 10 dhe `3 ch` (zinxhiri i këmbës ndërkombëtare) është 197.9996. Përdor `+ - * /` dhe kllapa, dhe `abs`, `round`, `ceil` dhe `floor`. Një vizë e shkruar brenda një gjatësie është pjesë e saj (`24'-6"`, `6-1/2`); me hapësira rreth saj, zbret (`24' - 6"` = 23.5 ft). Një numër i thjeshtë shumëzon ose pjesëton një gjatësi, dhe është gjatësi në njësitë e projektit kur shtohet te një gjatësi. Nëse CivilCraft nuk mund të lexojë atë që shkrove, kutia shënohet dhe shiriti i statusit thotë ku.

Stacionet nuk janë shuma: `10+00` në një kuti stacioni është stacioni 10+00. Pjerrësitë në përqind, numrat e pikave dhe përshkrimet lexohen ashtu siç janë.

## Stacionet

Një stacion është një distancë përgjatë një aksi rrugor, e shkruar me shenjën plus:

- Në këmbë: pjesa para plusit janë qindra këmbë. `12+34.56` është 1,234.56 ft.
- Në metra: pjesa para plusit janë mijëra metra. `1+234.567` është 1,234.567 m.
- Stacionet negative e mbajnë shenjën përpara: `-0+50.00`.

Kudo që shkruan një stacion (**Stacioni i fillimit**, **Stacioni** i një PVI), mund ta shkruash me plus (`12+34.56`) ose si numër të thjeshtë (`1234.56`). Hapësirat injorohen.

## Pjerrësitë dhe pjerrësitë anësore

- **Pjerrësitë** (profilet, tubat, pjerrësitë e korsive dhe të bankinave) janë në përqind: `+1.25%` ngrihet përgjatë stacionit, `-0.50%` zbret.
- **Pjerrësitë anësore** (prerja dhe mbushja e shesheve, prerja dhe mbushja e korridoreve) janë horizontale ndaj vertikales: `3` do të thotë 3 : 1, tre horizontale për një vertikale lart ose poshtë.
- **K** për një kurbë vertikale është gjatësia e saj e pjesëtuar me ndryshimin e pjerrësisë në përqind.

## Drejtimet dhe këndet

Drejtimet janë drejtime kuadrantesh në gradë, minuta dhe sekonda: `N 63°12'05" E`. Devijimet e kurbave (Δ) përdorin të njëjtat gradë, minuta dhe sekonda, me "majtas" ose "djathtas".

## Zhvendosjet

Zhvendosjet nga një aks rrugor janë distanca pingule me të, të shënuara **L** (majtas) ose **R** (djathtas) duke parë përpara sipas stacionit.

## Shfaqja e numrave

- Koordinatat dhe kotat shfaqen me 2 dhjetore në panele dhe në shiritin e statusit (3 për një pikë rilevimi të zgjedhur).
- Sipërfaqet dhe vëllimet grupohen me mijëra: `128,250 sq ft`, `454.9 cu yd`.
- Koordinatat nuk grupohen kurrë, kështu që mund të kopjohen ashtu siç janë.

## Koordinatat

CivilCraft punon në një plan të sheshtë: lindja djathtas, veriu lart. Puna e projektimit bëhet gjithmonë në koordinata të projektuara (state plane, UTM ose një rrjet lokal). Mund t’i tregosh CivilCraft cilit sistem koordinatash i përkasin, dhe nëse janë koordinata rrjeti, terreni ose lokale; atëherë shfaq gjerësinë dhe gjatësinë gjeografike, dhe vendos skedarët GIS dhe shtresat e hartës, por nuk ndryshon kurrë njësitë dhe nuk lëviz koordinatat e tua vetë. Shih [Vendos sistemin e koordinatave të projektit](topic:coordinate-systems) dhe [Koordinatat e terrenit dhe lokale](topic:ground-and-local-coordinates). Vlerat e mëdha të state plane (miliona këmbë) janë në rregull; CivilCraft punon brenda relativisht me vendin për të ruajtur saktësinë.
