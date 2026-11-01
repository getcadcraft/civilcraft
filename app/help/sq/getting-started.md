---
title: Fillimi me CivilCraft
summary: Çfarë bën CivilCraft, si hapet, dhe dhjetë minutat e para me terrenin shembull, nga pikat te një kurbë nivelit, një rrugë dhe një projekt i ruajtur.
keywords: fillim, nisja e parë, terreni shembull, hyrje, fillim i shpejtë, udhëzues, fillo, projekt i ri
from: c9b6dd8e
---

CivilCraft është aplikacioni i projektimit civil dhe të terrenit i familjes CadCraft. Merr pikat e rilevimit dhe i kthen në një sipërfaqe (një TIN) me izoipsa, pastaj të lejon të vendosësh aksët rrugorë me profile projektimi, të gërmosh një korridor të thjeshtë rruge, të nivelosh platforma ndërtesash deri te linja e ditës, të kontrollosh një rrjet tubash me rrjedhje gravitacionale sipas rregullave të tua dhe të shohësh vëllimet e prerjes dhe mbushjes. Lexon dhe shkruan LandXML, eksporton planimetrinë si DXF dhe e printon në PDF.

Nëse ke punuar me Civil 3D, idetë do të jenë të njohura: pika, grupe pikash, vija thyerjeje, akse rrugorë sipas PI, profile sipas PVI, korridore, nivelim, rrjete tubash. Mënyra e punës është ndryshe, dhe shumë më e thjeshtë: nuk ka rresht komandash, nuk ka stile dhe nuk ka skedar vizatimi. Lexo [Kalimi nga softuerë të tjerë civilë](topic:coming-from) një herë përpara punës së parë reale.

## Çfarë të duhet

- Një shfletues desktop i freskët: Chrome, Edge, Firefox ose Safari. Shih [Shfletuesit](common:browsers).
- Një mi ose trackpad dhe një tastierë, ose një ekran me prekje: vizatimi ka butona në ekran {{ui:Finish}}, {{ui:Undo point}} dhe {{ui:Cancel}} atje (shih [Mi, trackpad dhe prekja](topic:keyboard#mouse-trackpad-and-touch)).
- Planimetria vizatohet në 2D me canvas-in e shfletuesit. [Pamja 3D](topic:site-3d) përdor grafikën WebGL të shfletuesit; nëse nuk mund të nisë, shiriti i gjendjes thotë pse dhe planimetria punon akoma.
- Asnjë llogari dhe asnjë ngarkim. Skedarët hapen në kompjuterin tënd dhe ruhen si shkarkime. Shih [Skedarët e tu](common:your-files).

:::note
CivilCraft sot funksionon si një version i hershëm shfletuesi që ende po ndërtohet. Versionet desktop nuk janë ende të disponueshme, dhe ruajtja në cloud nuk është ende e disponueshme. Gjithçka që krijon qëndron në kompjuterin tënd deri sa ta ruash ose eksportosh.
:::

## Hap CivilCraft

1. Hap CivilCraft në shfletuesin tënd.
2. Prit derisa ekrani të mbushet: një shirit veglash lart, një panel në të majtë, planimetria në mes dhe një panel **Vetitë** në të djathtë.
3. Në një planimetri bosh sheh një kuti me titull **Fillo me pikat e rilevimit**. Ajo liston hapat e parë dhe ka një lidhje, {{ui:Open the sample site}}.

Për të përdorur CivilCraft pa asnjë lidhje më vonë, kliko {{ui:Save for offline}} në shiritin e aplikacionit dhe prit {{ui:Offline ready}}. Përfshin këtë ndihmë, terrenin shembull, dhe bibliotekat 3D dhe GIS. Shih [Jashtë linje](common:offline). Shtyp {{key:F1}} ose kliko {{ui:Help}} në çdo kohë për ta hapur këtë ndihmë pranë aplikacionit.

## Dhjetë minutat e para: terreni shembull

Terreni shembull është një rilevim i vogël në këmbë amerikane: 276 pika në koordinata state plane, një kreshtë, një kanal me një rrjedhë dhe dy buza brezash. Vjen me aplikacionin, kështu që mund ta ndjekësh pa një skedar tënd.

1. Kliko {{ui:Open the sample site}} në kutinë mbi planimetri.
   Hapet dialogu **Importo pikat**. Thotë "276 pika u lexuan si PNEZD (nga rreshti i kokës), të ndara me presje." dhe shfaq rreshtat e parë.
2. Kliko {{ui:Import}}.
   Planimetria mbushet me pika, izoipsa dhe skaj sipërfaqeje. Shiriti i gjendjes poshtë thotë se pikat u importuan dhe sa trekëndësha ka sipërfaqja (546).
3. Shiko në panelin e majtë nën **Pikat**. Pikat grupohen sipas fjalës së parë të përshkrimit të tyre: CP, FL, GRD, RIDGE, TBN, TBS dhe TREE.
4. Në kolonën **Sipërfaqe** të asaj tabele, vendos **FL**, **RIDGE**, **TBN** dhe **TBS** në {{ui:Breakline}}.
   Sipërfaqja rindërtohet menjëherë. Faktet e **Sipërfaqes** tani thonë "Vijat e thyerjes: 4", dhe izoipsat përkulen mprehtë përgjatë vijës së rrjedhës dhe kreshtës në vend që t'i presin.
5. Lëviz treguesin mbi planimetri. Shiriti i gjendjes tregon lindjen dhe veriun nën treguesin dhe kotën e terrenit atje.
6. Nën **Shfaqja**, vendos {{ui:Contours every}} në 0.5 ft dhe ndiz {{ui:Elevation bands}}. Shfaqet një rampë ngjyrash me legjendë nën kutitë. Fik brezat përsëri kur të mbarosh.

Ke tani një sipërfaqe terreni ekzistues. Më pas, një rrugë.

## Vendos një rrugë të shkurtër

1. Shtyp {{key:A}} (ose kliko {{ui:Alignment}} në grupin **Projektim**).
2. Kliko tri pika nëpër terren, një pas tjetrit. Një vijë e kuqe ndjek treguesin dhe tregon gjatësinë dhe drejtimin e tangjentes së ardhshme.
3. Shtyp {{key:Enter}} për të përfunduar.
   Aksi rrugor shfaqet me stacionimin. Paneli i djathtë tregon **Aksin rrugor**: gjatësinë e tij, tabelën e PI-ve dhe lakimin te PI-ja e mesit (rreze 100 ft, ose më e vogël nëse 100 ft nuk përshtatet).
4. Në panelin e djathtë, nën **Profili i projektimit**, kliko {{ui:Start from the ground}}.
   Pamja e profilit hapet nën planimetri me terrenin ekzistues dhe një pjerrësi projektimi të drejtë nga fundi në fund.
5. Shtyp {{key:I}} për të ndezur {{ui:Add PVIs}}, pastaj kliko një herë në pamjen e profilit pranë mesit. Shfaqet një PVI.
6. Në tabelën PVI në të djathtë, shkruaj një gjatësi lakimi (për shembull 100) në kutinë **Lakimi L** të PVI-së së mesit dhe shtyp {{key:Enter}}. Profili tani ka një lakim vertikal, me vlerën K të etiketuar.
7. Nën **Korridori**, vendos shenjë te **Zvarrit një montim përgjatë profilit të projektimit**.
   Rruga gërmohet në terren: korsitë, bërrylat dhe pjerrësitë anësore deri te linja e ditës. Blloku **Punime tokësore** tregon prerjen dhe mbushjen.

Mos u shqetëso për vlerat e sakta. Çdo numër mund të ndryshohet në panelin e djathtë, dhe {{key:Mod+Z}} zhbën ndryshimin e fundit.

## Ruaj punën

1. Shkruaj një emër në **Emri** në krye të panelit të majtë.
2. Shtyp {{key:Mod+S}} (ose kliko {{ui:Save}}).
   Shfletuesi shkarkon një skedar me emrin e vendit, që mbaron me `.civilcraft.json`. Ai mban pikat, cilësimet e sipërfaqes, aksët rrugorë, profilet, korridoret, platformat dhe tubat.
3. Për të vazhduar më vonë, kliko {{ui:Open}} (ose shtyp {{key:Mod+O}}) dhe zgjidh atë skedar, ose lësho në planimetri.

:::warning
Nuk ka ruajtje automatike. Nëse mbyll skedën me ndryshime të paruajtura, shfletuesi pyet nëse do të largohesh; nëse largohesh, ndryshimet humbin. Ruaj shpesh.
:::

## Ku të shkosh më pas

- [Importo pikat e rilevimit](topic:import-points) me skedarët e tu.
- [Ndërto dhe rafino sipërfaqen](topic:build-surface) me vija thyerjeje dhe kufi.
- [Ekrani, pjesë pas pjese](topic:workspace).
- [Tastet dhe miu](topic:keyboard).
