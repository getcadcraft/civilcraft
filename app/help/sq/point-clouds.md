---
title: Retë e pikave nga një dron ose skaner
summary: Me shtojcën Retë e pikave, hap një skedar LAS ose LAZ me miliona pika, shiko të gjithën, pastroje, rendite në terren, bimësi dhe ndërtesa, dhe nga ai ndërto terrenin, izoliniet dhe vëllimet.
keywords: retë e pikave, las, laz, dron, fotogrametri, recap, lidar, skanim, terren, klasifiko, zhurmë, grumbull, vëllim, prerje dhe mbushje, izoliniet, vijë thyerjeje, eye-dome, ortomozaik, ortho, drapim, shtresë hartore, eksporto las, eksporto laz, kompreso
from: e4a4901f
---

Shumica e njerëzve nuk e kanë kurrë nevojë për këtë, prandaj është shtojcë. Aktivizo {{ui:Retë e pikave}} te Cilësimet › Shtojcat; një skedë {{ui:Retë e pikave}} shfaqet në panelin e djathtë. Skedari lexohet në shfletuesin tuaj dhe ndahet në pllaka që ruhen në hapësirën e vetë shfletuesit (ose në një dosje që zgjidhni ju). **Asgjë nuk ngarkohet.**

:::warning
Gjithçka që raporton kjo skedë është një numër nga të dhënat tuaja, jo një certifikatë. Është testuar në një terren të trilluar, jo ende në një rilevim real me dron: lexo me kujdes rezultatet e para dhe na thuaj çfarë gjen. Inxhinieri i regjistruar vendos se çfarë vlejnë terreni, izoliniet dhe vëllimet.
:::

## Hap një re

Te {{ui:Hap një re}} zgjidh një skedar LAS ose LAZ. Skeda tregon sa pika mban, sistemin e koordinatave dhe njësitë e tij, dhe sa hapësirë i duhet një ndërtimi; shtyp {{ui:Ndërto retën}}. Një ndërtim mund të ndalet dhe vazhdon me {{ui:Vazhdo}} (zgjidh të njëjtin skedar sërish). Skedari nuk ndryshohet kurrë. Një skedar me 100 milionë pika ndërtohet brenda minutash në një stacion pune dhe zë aq hapësirë sa vetë skedari.

Te {{ui:Retë në këtë kompjuter}} hap ose hiq një re. {{ui:Mbaj retë në një dosje…}} (Chrome, Edge dhe aplikacioni Studio) mban pllakat në një dosje që zgjedh ti, për shembull një dosje retësh të CadCraft në Documents, kështu që një re 10 GB nuk duhet të përshtatet në hapësirën e shfletuesit; retë e ndërtuara më parë qëndrojnë aty ku u ndërtuan. Shfletuesi kërkon sërish leje pas një rinisjeje: shtyp {{ui:Përdor sërish dosjen …}}.

## Shiko

{{ui:Shiko në 3D}} vizaton retën nga pllaka të trasha dhe përmirësohet ndërsa afrohesh, pa u shfaqur kurrë më shumë se {{ui:Pikat më të shumta të vizatuara}} njëherësh (2.5 milionë; 500 mijë në telefon). Ngjyros sipas ngjyrës së vetë skedarit, lartësisë, klasës, intensitetit ose mbetjes. {{ui:Ndriçimi eye-dome}} nuancon skajet sipas thellësisë, që forma të lexohet pa normale (fikur në telefon); {{ui:Pikat zvogëlohen me distancën}} i bën më të vogla pikat e largëta dhe më të mëdha ato të afërta; {{ui:Madhësia e pikës}} vendos madhësinë. Planimetria e shfaq retën si raster nën vizatimin tuaj dhe **përmirësohet kur zmadhon** në një pjesë të saj.

## Pastroje

Te {{ui:Pastro}} vizato një lasso, një kuti ose një poligon në planimetri (ose në 3D nga pamja e sipërme: në 3D kontura merret drejt e poshtë, prandaj është e saktë vetëm nga lart). Skeda tregon sa pika janë brenda **përpara** se të aplikosh: {{ui:Fshi këto pika}}, {{ui:Ndrysho klasën e tyre}}, {{ui:Rikthe pikat e fshira}} ose {{ui:Prit sipas këtij kufiri}}. {{ui:Zhbëj}} dhe {{ui:Ribëj}} kalojnë në regjistrin e ndryshimeve; vetë skedari nuk ndryshohet kurrë. {{ui:Filtri i zhurmës…}} shënon pikat e çrregullta si pika të ulëta (klasa 7) ose zhurmë të lartë (klasa 18).

## Rendite

{{ui:Gjej terrenin}} punon pllakë për pllakë dhe shënon terrenin (klasa 2) dhe pikat e ulëta; toleranca është 0.15 m, ose 0.08 m me çelësin e nivelit të rilevimit. Raporton kufijtë e pllakave që nuk përputhen. Më pas {{ui:Klasifiko bimësinë dhe ndërtesat}} shënon bimësinë e ulët, të mesme dhe të lartë, dhe ndërtesat, sipas lartësisë mbi terren dhe sa të sheshta janë rrethinat. Nuk ka mësim makine, prandaj një kasolle me majë të sheshtë nën pemë mund të gabohet: shiko.

## Terreni, izoliniet, vijat e thyerjes

{{ui:Ndërto terrenin}} e bën terrenin ekzistues nga pikat e terrenit dhe e shton në projekt në të njëjtën mënyrë si një import LAS (një hap zhbërjeje). Pastaj krahason pikat me të: mesatarja, RMS, përqindja e 95-të, pjesa brenda tolerancës dhe dhjetë vendet që ndryshojnë më shumë, secila me {{ui:Shko atje}}. Ngjyrosja me {{ui:Mbetja}} tregon ku terreni dhe retë nuk përputhen.

Një **vijë thyerjeje** (një bordurë, kanal ose maja e brigjeve) zgjidhet mbi retë: {{ui:Zgjidh një vijë thyerjeje në re}} te pamja 3D merr pikën më të afërt të vizatuar në çdo klikim, dhe {{ui:Zgjidh një vijë thyerjeje në planimetri}} merr pikën më të afërt të retës (terreni i pari) nën çdo klikim; kliko dy herë ose shtyp Enter për të përfunduar vijën. {{ui:Ndërto terrenin}} i radhës e përdor atë. {{ui:Shfaq izoipsat}} vizaton izoliniet mbi retë në një imazh të vogël dhe cakton intervalin e projektit.

## Vëllimet

{{ui:Vëllimi i grumbullit…}} llogarit vëllimin e sipërfaqes mbi një bazë brenda një kufiri që vizaton. Vizato kufirin në terren të sheshtë rreth grumbullit dhe zgjidh bazën: pikën më të ulët të kufirit, një plan, një bazë të lakuar të lëmuar, një sipërfaqe që kalon nëpër kufi, ose një nivel që shkruan. Në terren me pjerrësi ose të lakuar përdor planin ose bazën e lakuar; pika më e ulët lexohet shumë e lartë. Pikat e kufirit që dalin mbi të tjerat (një pemë mbi vijë) lihen jashtë bazës. {{ui:Fluturim me fluturim}} jep prerjen dhe mbushjen ndërmjet dy retave. Të dyja mund të ruhen si CSV.

## Ortomozaik

Te {{ui:Ortomozaik (foto nga lart)}} zgjidh ortomozaikun e dronit bashkë me skedarin e tij botëror (world file) dhe `.prj` kur i ka: një GeoTIFF, ose një PNG ose JPEG. Bëhet një **shtresë hartore** e projektit, kështu që planimetria e shfaq nën vizatimin tuaj, dhe pamja 3D (me ngjyrën {{ui:Harta}}) e vizaton mbi terrenin që ndërtove, prandaj {{ui:Ndërto terrenin}} së pari. Skeda tregon sa e retës mbulon fotoja, dhe paralajmëron kur nuk mbulon asnjë: shkaku i zakonshëm është një sistem tjetër koordinatash, prandaj jep edhe skedarin `.prj`. Kur s'ka `.prj`, programi pyet ku janë koordinatat. Fotoja mbahet brenda skedarit të projektit; një GeoTIFF mbi 200 MB refuzohet, dhe një mozaik shumë i madh zvogëlohet në 16 megapiksel, prandaj për një rilevim të madh pritni mozaikun në vendin e parë.

## Eksporto

{{ui:Eksporto}} shkruan retën e pastruar dhe të klasifikuar si skedar të ri (të gjitha pikat, klasat e pastra, ose vetëm terreni). Te {{ui:Lloji i skedarit}} zgjidh:

- **LAS 1.4 (pa kompresim)**: formati i pikës 6, ose 7 me ngjyrë.
- **LAZ (i kompresuar)**: të njëjtat pika të kompresuara pa humbje, kështu që çdo pikë kthehet saktësisht. Shkruhet si formati i pikës 0, ose 2 me ngjyrë, në një skedar LAS 1.4. Në terrenin 300 m të trilluar, LAZ ishte rreth një e pesta e madhësisë së skedarit LAS 1.4. Formatet LAZ 0 dhe 2 mbajnë vetëm klasat 0 deri 31: një pikë me klasë më të lartë refuzohet me një mesazh, prandaj eksporto atë re si LAS 1.4.

LAZ shkruhet nga kompresuesi i vetë CadCraft, i bërë nga specifikimi i publikuar i LAZ. Kemi kontrolluar që lexuesi ynë dhe dy lexues të pavarur LAZ (laz-perf, që aplikacioni e përdor për të hapur skedarë LAZ, dhe laspy me lazrs) i lexojnë të gjitha pikat saktësisht, dhe që skedarët LAZ të bërë nga laspy dalin bajt për bajt të njëjtë kur i shkruajmë sërish pikat e tyre. Programe të tjera nuk janë provuar akoma, prandaj nëse një nuk hap një skedar, na thuaj cilin.

Aty ku shfletuesi mund të shkruajë një skedar gjatë punës, zgjedh skedarin para së gjithash dhe një re shumë e madhe shkruhet në të një pllakë në çdo herë, në vend që të mblidhet në memorie; përndryshe skedari mblidhet dhe shkarkohet, gjë që është në rregull deri në disa qindra megabajt.

## Çfarë nuk bën

Lexon vetëm LAS dhe LAZ (E57, PLY dhe PCD nuk janë lidhur akoma me këtë skedë, dhe disa skedarë të një fluturimi nuk bashkohen), nuk ripërcakton një re (sistemi i projektit dhe metrat supozohen), nuk lexon skedarët RCP ose RCS të Autodesk-ut, nuk bën sipërfaqe nga fotografitë, dhe nuk gjen vetë shtylla, bordurat ose tubat.
