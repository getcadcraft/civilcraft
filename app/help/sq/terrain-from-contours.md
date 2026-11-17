---
title: Terren nga vijat e izoipsave
summary: Krijo sipërfaqen e tokës nga një hartë izoipsash: zgjidh shtresat e vijave, thuaj nga vjen lartësia e çdo vije, kontrollo kryqëzimet dhe dyfishimet, dhe ndërto. Vijat e izoipsave bëhen vija thyerjeje, me trekëndëshat e sheshtë në kreshta dhe lugina të rregulluar. Një hartë e nxjerrë nga një figurë ose PDF mund të shkallëzohet dhe vendoset nga dy pika të njohura.
keywords: izoipsa, vija izoipsash, terren nga izoipsat, sipërfaqe nga izoipsat, hartë topografike, hartë rilevimi, pa koordinata, vija thyerjeje, trekëndësha të sheshtë, kreshtë, luginë, majë kodre, izoipsa që kryqëzohen, izoipsa të dyfishuara, intervali i izoipsave, shkallëzo hartën, dy pika, vendos hartën, DXF, DWG, shapefile
from: e6161653
---

Një gjeodet ndonjëherë të dërgon një hartë izoipsash: vija me lartësi, por pa pika. CivilCraft ndërton tokën ekzistuese nga ato vija.

## Sill izoipsat

Hap hartën si vija vizatimi: një vizatim DXF ose DWG, një shapefile ose GeoJSON (**GIS** › {{ui:Importo}}, ose lëshoje skedarin mbi planimetri). Vijat hyjnë si **shtresa hartash**. Te **Sipërfaqe** › {{ui:Më shumë}}, zgjidh {{ui:Terren nga izoipsat}}.

## Thuaj nga vjen lartësia e çdo vije

Shëno shtresat që mbajnë izoipsa, pastaj zgjidh **Lartësia nga**:

- {{ui:Kotat e vetë vijave}}: një vijë ku të gjitha kulmet kanë të njëjtën lartësi (një polivijë 3D, ose një polivijë me lartësi). Një vijë në 0 është vijë planimetrike dhe nuk ka nivel.
- Një **fushë numrike** e shtresës (për shembull ELEV), kur harta erdhi me një të tillë.
- {{ui:Një fillim dhe një intervale, sipas radhës së listimit të vijave}}: për vija pa asnjë lartësi. Vija e parë e listuar merr **Lartësinë e vijës së parë**, ajo tjetra atë plus **Intervalin e izoipsave**, e kështu me radhë. Listo vijat nga më e ulëta lart (ose rirendit ato në shtresë).

## Kontrollo, pastaj ndërto

{{ui:Kontrollo}} liston çfarë është gabim, me fjalë, përpara se të ndryshojë diçka:

- një vijë **pa lartësi** ose me më pak se dy pika;
- një vijë **e dyfishtë** (e njëjta formë dy herë, edhe e vizatuar në drejtim të kundërt);
- dy vija që **kryqëzohen**, në lartësi të ndryshme ose në të njëjtën lartësi (një vijë që kryqëzon veten gjithashtu), me vendin;
- një lartësi që **nuk është në intervalin** (një gabim shkrimi si 105.5 në një hartë me interval 1 m).

Shëno {{ui:Lër jashtë vijat që kryqëzohen me një tjetër}} për të hequr vijën që kryqëzon më shumë të tjera (pastaj tjetrën, derisa të mos kryqëzohet asnjë): një vijë e gabuar që pret çdo izoipsë është ajo që shkon, jo izoipsat. **Thjeshto vijat brenda** heq kulmet që janë më afër një drejtëze sesa kjo largësi.

{{ui:Ndërto terrenin}} i shton vijat tokës ekzistuese si vija thyerjeje (një hap zhbërjeje), kështu që sipërfaqja kalon saktësisht mbi çdo izoipsë. Me {{ui:Rregullo trekëndëshat e sheshtë te kreshtat, luginat dhe majat}} të shënuar dhe një interval të dhënë, CivilCraft shton gjithashtu një pikë brenda çdo trekëndëshi të sheshtë (një trekëndësh kulmet e të cilit shtrihen të gjitha mbi një izoipsë) në lartësinë ku vazhdon pjerrësia pranë tij, kurrë më shumë se gjysmë interval larg izoipsës. Pa këtë, majat e kreshtave, fundet e luginave dhe majat e kodrave dalin si pllaka të sheshta. Në një kodër provë, gabimi nga sipërfaqja e vërtetë ra me një çerek; në një kreshtë me 40 %.

## Një hartë pa koordinata

Për një hartë izoipsash të nxjerrë nga një figurë ose një PDF, hap **Shkallëzo dhe vendos shtresat nga dy pika të njohura**. Jep dy pika në hartë dhe ku janë në të vërtetë; shtresat e shënuara shkallëzohen, rrotullohen dhe zhvendosen për t'u përshtatur (një hap zhbërjeje; lartësitë nuk ndryshohen). Të njëjtat dy pika japin shkallën (e shfaqur në mesazh) dhe rrotullimin.

Sipërfaqja është aq e mirë sa harta: midis dy izoipsave është një plan, prandaj toka reale midis tyre nuk dihet. Kontrollo rezultatin me kotat e pikave përpara se t'i besosh.
