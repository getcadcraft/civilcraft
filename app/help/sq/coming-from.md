---
title: Të ardhur nga softueri tjetër civil
summary: Si përshtaten rrjedhat e njohura të projektimit civil me CivilCraft, dhe dallimet që i bëjnë përshtypje përdoruesve me përvojë gjatë orës së parë.
keywords: ndërrim, migrim, i njohur, dallime, rrjedhë pune, komanda, përputhje, cogo, korridor, nivelim, rrjet tubash, stile, rresht komandash
from: feae37d6
---

Nëse ke përdorur Civil 3D, i njeh tashmë idetë e CivilCraft: pikat dhe grupet e pikave, sipërfaqet TIN me vija thyerjeje dhe kufij, aksët sipas PI-ve, profilet sipas PVI-ve, asamblet e shtrira në korridore, nivelimi deri te terreni, rrjetet e tubave me rrjedhje me gravitet, LandXML. Ajo që është ndryshe është pothuajse gjithçka përreth tyre: nuk ka skedar vizatimi, nuk ka rresht komandash (përveç nëse zgjedh stilin e menysë {{ui:Hartim klasik}}), nuk ka stile, nuk ka Prospector dhe nuk ka dialogë cilësimesh. CivilCraft është një vegël e vogël, e fokusuar, në një shfletues, dhe në këtë version bën një pjesë të vogël të asaj që bën një paketë e plotë civile. Kjo faqe lidh atë që di me atë që ka këtu.

:::tip
Nëse të pëlqen shiriti i Civil 3D, zgjidh stilin e menysë {{ui:Shiriti civil}} te {{ui:Cilësimet}} › {{ui:CivilCraft}} › {{ui:Menutë, tastet dhe miu}}: skedat Home, Surfaces, Modify, Geolocation, View dhe Output, butoni i mesit lëviz pamjen, dhe {{key:Shift}} me butonin e mesit rrotullon pamjen 3D. Nëse shkruan komanda, {{ui:Hartim klasik}} shton një rresht komandash (ALIGNMENT, PAD, PROFILE, ZOOM …). Shih [Menutë, tastet dhe miu](topic:menus-keys-and-mouse).
:::

## Harta e rrjedhës së punës

| Çfarë do të bësh | Mënyra e njohur | Në CivilCraft |
|---|---|---|
| Sjell pikat e matjes | Importo pika me një format skedari pikash | {{ui:Hap}}, pastaj kontrollo radhën e kolonave te **Importo pikat** ([Importo pikat e matjes](topic:import-points)) |
| Rendit pikat | Grupe pikash, çelësa përshkrimi | Grupe automatike sipas fjalës së parë të përshkrimit; pa çelësa përshkrimi |
| Redakto një pikë | Redaktori i pikave, dorëza | Kliko dhe shkruaj te Vetitë, ose tërhiqe ([Redakto një pikë matjeje](topic:edit-points)) |
| Ndërto terrenin ekzistues | Krijo një sipërfaqe, shto grupet e pikave si të dhëna | Automatike: sipërfaqja rindërtohet sa herë ndryshojnë hyrjet e saj |
| Shto vija thyerjeje | Shto vija thyerjeje nga polivija ose vija karakteristike | Vendos një grup pikash te {{ui:Vijë thyerjeje}}, ose kliko pika me veglën {{ui:Vijë thyerjeje}} ({{key:B}}) |
| Pri sipërfaqen | Kufi i jashtëm, kufi i fshehur, gjatësia maksimale e trekëndëshit | {{ui:Kufi}} ({{key:O}}, vetëm i jashtëm) dhe **Skaji më i gjatë i jashtëm** |
| Shfaq konturet | Stili i sipërfaqes | **Shfaqja** në panelin e majtë: intervali, çdo e madhe, etiketat, brezat, shigjetat e pjerrësisë |
| Vendos një vijë qendrore | Veglat e krijimit të aksit, cilësimet e harkut dhe spiralit | {{ui:Aksi rrugor}} ({{key:A}}): kliko PI-të, {{key:Enter}}; rrezet dhe gjatësitë e spiraleve te tabela e PI-ve |
| Krijo një pamje profili | Magjistari i pamjes së profilit, brezat | {{ui:Profil gjatësor}} ({{key:R}}): një pamje profili nën plan, gjithmonë e përshtatur |
| Projekto pjerrësinë | Veglat e rregullimit të profilit | {{ui:Nis nga terreni}}, {{ui:Shto PVI-të}} ({{key:I}}), tërhiq PVI-të, shkruaj **Harku L** |
| Ndërto një rrugë | Asamblé, nënasamble, korridor, objektiva, rajone | Vendos shenjën **Shtri një asamble përgjatë profilit të projektimit** nën aksin; një korsi, bark dhe pjerrësi anësore nga çdo anë, ose çdo anë e ndërtuar nga pjesë (kanal, bordurë, trotuar …) |
| Nivelo një platformë | Vija karakteristike, grupe nivelimi, kritere nivelimi | {{ui:Platformë}} ({{key:G}}): një platformë e sheshtë me pjerrësi prerjeje dhe mbushjeje deri te terreni |
| Llogarit punët e dheut | Sipërfaqe vëllimi, panel vëllimesh | **Punimet e dheut** në panelin e djathtë, metoda e rrjetit, përditësohet drejtpërdrejt |
| Shtro kanalizimin ose ujërat e shiut | Rrjet tubash me listë pjesësh, rregulla | {{ui:Tubat}} ({{key:P}}): kliko strukturat poshtë rrjedhës; tre rregulla që vendos ti; kuota të brendshme automatike |
| Shkëmbe me të tjerët | Import dhe eksport LandXML | {{ui:Hap}} një skedar LandXML; {{ui:LandXML}} për eksport ([Shkëmbe LandXML](topic:landxml)) |
| Dërgo vijat në CAD | Eksport në DWG | {{ui:DWG}} (format 2000 deri 2018) ose {{ui:DXF}} (R12) |
| Printo | Layout-e, viewport-e, grupe fletësh | {{ui:PDF}}: një fletë horizontale e planit në një shkallë të zgjedhur; fletët e planit dhe të profilit dhe fletët e prerjeve si PDF |
| Ndaj punën mes skedarëve | Lidhje të dhënash, referenca | Jo e disponueshme: një projekt për skedar |
| Zhbëj | Zhbëj | {{key:Mod+Z}} dhe {{key:Mod+Y}}, 200 hapa; cilësimet e shfaqjes nuk janë hapa zhbërjeje |

## Dallime që i bëjnë përshtypje njerëzve

**Nuk ka rresht komandash** përveç nëse zgjedh stilin e menysë {{ui:Hartim klasik}}. Veglat janë butona të shiritit dhe shkronja të vetme: {{key:A}} aks, {{key:G}} platformë, {{key:P}} tuba, {{key:B}} vijë thyerjeje, {{key:O}} kufi, {{key:R}} profil, {{key:I}} shto PVI-të, {{key:V}} zgjedh, {{key:F}} përshtat. Në stilet e tjera të menysë, shkrimi i një emri komande nuk bën asgjë. Shih [Tastet dhe miu](topic:keyboard).

**Enter përfundon; klikimi i dyfishtë është i rrezikshëm.** Kliko pikën e fundit një herë, pastaj shtyp {{key:Enter}}. Në këtë version një klikim i dyfishtë gjithashtu përfundon, por heq pikën ku klikove dy herë. Klikimi i djathtë nuk përfundon as nuk përsërit; vetëm lëviz pamjen kur tërheq me të.

**Çdo gjë është dinamike, gjithmonë.** Ndrysho një grup pikash, një rreze, një PVI ose pjerrësinë e një platforme, dhe sipërfaqja, konturet, korridori, vijat e prerjes dhe vëllimet përditësohen menjëherë. Nuk ka asgjë për ta rindërtuar dhe asgjë nuk vjetërohet.

**Asgjë nuk është objekt vizatimi.** Plani është një pamje e projektimit, jo një vizatim që mund ta redaktosh me komanda CAD. Nuk mund të shtosh vija ose tekst tuaj, të ndryshosh ngjyrën e një shtrese ose të shpërbësh diçka. Eksporto në DXF dhe përfundo vizatimin në një program CAD.

**Pa stile.** Ngjyrat, trashësitë e vijave, madhësitë e etiketave dhe emrat e shtresave janë fiks (shih [Shtresat e planit](topic:plan-layers)). Paper dhe Model në shiritin e aplikacionit ndërrojnë midis një ekrani të çelët dhe një të errët.

**Një nga çdo gjë.** Një sipërfaqe terreni ekzistuese, një rezultat i niveluar, një rrjet tubash për projekt. Shumë akse dhe platforma janë në rregull.

**Njësitë janë etiketa.** Zgjedhja e {{ui:Këmbë amerikane}} ose {{ui:Metra}} nuk shndërron asgjë. Nuk ka shkallë vizatimi. Një sistem koordinatash është opsional: vendose te {{ui:Koordinatat}} dhe asgjë nuk lëviz, vetëm thotë çfarë do të thonë numrat (shih [Vendos sistemin e koordinatave të projektit](topic:coordinate-systems)). Këmbët shkruhen në LandXML si këmbë amerikane matjeje.

**Grupet e vijave thyerëse bashkohen sipas numrit të pikës.** Një grup i vendosur te {{ui:Vijë thyerjeje}} bëhet një vijë e vetme nëpër të gjitha pikat e tij, sipas radhës së numrave. Kodet e përbashkëta (dy vija rrjedhjeje me kodin "FL") bëjnë një vijë zig-zag; vizato ato me dorë.

**Stacionet duken të njëjta, metrat ndryshojnë.** Këmbët përdorin stacione 100 ft (12+34.56); metrat përdorin stacione 1000 m (1+234.567).

**Fshirja në Mac.** Tasti i quajtur delete në Mac është Backspace për shfletuesin. Përdor Fn dhe delete, ose butonin {{ui:Fshi}}, për të fshirë një zgjedhje.

**Skedarët janë shkarkime.** {{ui:Ruaj}} shkarkon një skedar `.civilcraft.json` çdo herë; nuk ka "ruaj mbi skedarin e hapur". Një kopje rimëkëmbjeje e punës së paruajtur mbahet në këtë shfletues ([Rikthe punën e paruajtur](common:recover)). Hapja e një skedari pikash zëvendëson pikat pa pyetur. Shih [Skedarët që mund t'i hapësh, ruash dhe eksportosh](topic:files).

**Rregullat janë tuajat.** Rregullat e rrjetit të tubave dhe asambleja e korridorit fillojnë me vlera vendmbajtëse që nuk janë standard. Vendos të tuat para se t'i besosh ndonjë kontroll.

**Vëllimet janë të bazuara në rrjet.** Prerja dhe mbushja vijnë nga një rrjet i imët midis dy sipërfaqeve, brenda vijave të prerjes, pa fryrje ose tkurrje. Janë afër, por jo të njëjta me një vëllim TIN-me-TIN.

## Çfarë mungon

Spirale të tjera nga ato klotoide, asamble që ndryshojnë përgjatë rrugës, platforma të pjerrëta, kapacitet hyrjesh dhe retencion, katalogje pjesësh, tuba në profil, shtrirje parcelash dhe madhësi lotesh, rregullim me katrorët më të vegjël dhe baza të dhënash matjesh, hapja e DWG, dhe më shumë. Lista e plotë, me atë që duhet të bësh sot në vend, është te [Të pandërtuara ende](topic:not-built-yet).
