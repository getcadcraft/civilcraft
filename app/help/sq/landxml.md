---
title: Shkëmbe LandXML
summary: Hapni LandXML nga softuer tjetër civil si projekt të ri, eksportoni pikat, sipërfaqet, aksët, profilet dhe rrjetin e tubave si LandXML 1.2, dhe dini çfarë nuk udhëton.
keywords: landxml, xml, import, eksport, shkëmbim, tin, sipërfaqe, aks, profil, rrjet tubash, ndërveprim, shkëmbim të dhënash
from: 870d5ece
---

LandXML është formati i hapur i shkëmbimit që shumica e programeve civile lexojnë dhe shkruajnë. CivilCraft lexon dhe shkruan LandXML 1.2. Nëse keni përdorur Civil 3D, dialogët e tij të importit dhe eksportit LandXML janë më të afërt; këtu nuk ka zgjedhje për të bërë, dhe shënimet ju thonë çfarë është lënë jashtë.

## Hapni një skedar LandXML

1. Klikoni {{ui:Hap}} (ose shtypni {{key:Mod+O}}) dhe zgjidhni skedarin `.xml` ose `.landxml`, ose lëshojeni mbi planimetri.
2. Nëse projekti aktual ka ndryshime të paruajtura, CivilCraft pyet së pari. Zgjidhni {{ui:Ruaj një kopje}}, {{ui:Mos ruaj}} ose {{ui:Anulo}}.
3. Krijohet një **projekt i ri**. Rreshti i gjendjes thotë çfarë u lexua, për shembull "Opened site.xml: 412 points, 2 surfaces, 3 alignments."
4. Shikoni kutinë nën faktet e **Sipërfaqes**. Ajo liston gjithçka që u kalua ose u ndryshua, për shembull:
   - "Only the first surface ("EG") was opened; the file has 1 more."
   - "Alignment "Ramp A" has elements CivilCraft cannot draw yet (not lines, arcs or clothoid spirals); it was skipped."
   - "Pipe network rules were not in the file; the placeholders are in use — set yours under Project."

Çfarë bëhet çfarë:

| Në skedar | Në CivilCraft |
|---|---|
| Njësitë (Imperial ose Metric) | **Njësitë** e projektit (këmbë ose metra) |
| Emri i projektit | **Emri** i projektit |
| CgPoints | Pikat e projektit; përshkrimi (ose kodi) jep grupin |
| Sipërfaqja e parë TIN | Toka ekzistuese, e përdorur siç është ("Surface (from LandXML)") |
| Çdo aks me vija, harqe dhe spirale klotoide | Një aks me PI-të, rreze dhe gjatësi spiralesh të rindërtuara nga kurbat |
| Profili i parë i projektimit të çdo aksi | Profili i tij i projektimit, me kurba vertikale parabolike |
| Rrjeti i parë i tubave | Rrjeti i tubave, me buzat, pusat dhe invertet e tij |
| Vijat karakteristike të vijave dhe harqeve | Vijat karakteristike, harqet e mbajtura; nga një program tjetër nisin si **Vetëm e vizatuar** |

Lista e plotë e elementeve dhe atributeve është te [LandXML: çfarë lexohet dhe shkruhet](topic:landxml-reference).

:::note
Një sipërfaqe e lexuar nga LandXML nuk rindërtohet kur ndryshoni grupet e pikave ose vizatoni vija karakteristike. Klikoni {{ui:Ndërto përsëri sipërfaqen nga pikat}} te seksioni **Sipërfaqe** për ta ndërtuar nga pikat ({{key:Mod+Z}} e kthen sipërfaqen LandXML).
:::

## Eksportoni LandXML

1. Klikoni {{ui:LandXML}} te grupi **Eksport**.
2. Shfletuesi shkarkon `<emri>.xml`. Rreshti i gjendjes thotë çfarë hyri, për shembull "Exported LandXML 1.2: 276 points, 2 surfaces, 1 alignment, the pipe network. Pads are not part of LandXML here; the graded surface is."

Skedari mban:

- **Njësitë**: këmbë të anketës amerikane ose metra.
- **CgPoints**: çdo pikë me numrin si emër, përshkrimin dhe grupin si kod.
- **Sipërfaqet**: toka ekzistuese si TIN, me vijat karakteristike dhe kufirin e jashtëm si të dhëna burimi; dhe, kur platformat ose korridoret nivelohen, një sipërfaqe e dytë TIN e emërtuar "Proposed".
- **Aksët**: vija, harqe dhe spirale klotoide me stacionet e tyre, secili me një profil që mban tokën ekzistuese të marrë përgjatë tij dhe profilin e projektimit (PVI dhe kurba parabolike) kur ka të paktën dy PVI.
- **PipeNetworks**: struktura me buzat, pusat dhe invertin për çdo tub, dhe tubat me diametër, gjatësi dhe pjerrësi.
- **PlanFeatures**: çdo vijë karakteristike si vija dhe harqe, me kotën në çdo skaj, dhe për çfarë përdoret.

## Çfarë nuk udhëton

- Platformat dhe korridoret si objekte. Rezultati i tyre është në sipërfaqen "Proposed".
- Aksët me gabime (për shembull kurba që mbivendosen): lihen jashtë dhe numërohen në mesazhin e gjendjes.
- Tubat pa të dy invertet, dhe rrjetet me më pak se dy struktura.
- Një buzë e marrë nga sipërfaqja shkruhet si buzë fikse. Kur hapet sërish, struktura e mban atë numër edhe nëse sipërfaqja ndryshon.
- Rregullat e rrjetit (pjerrësia më e vogël, mbulesa, rënia): LandXML nuk ka vend për to.
- Cilësimet e shfaqjes dhe zgjedhjet e sipërfaqes së grupeve të pikave: ruani një projekt CivilCraft për to.

Kur hapet, CivilCraft nuk lexon spirale jo-klotoide, rrjete sipërfaqesh, pika që i referohen vetëm pikave të tjera, parcela, spirale në vijat karakteristike, rrugë ose të dhëna rilevimi. Çdo njëra emërtohet në shënime, kurrë nuk merret me hamendje.

## Cikli i plotë

Për t'ia dhënë punën dikujt që përdor softuer tjetër civil dhe për ta marrë përsëri, eksportoni LandXML, lëreni ta ndryshojë, dhe hapeni LandXML-in e tij si projekt të ri. Mbani gjithashtu skedarin tuaj `.civilcraft.json`: është i vetmi që mban gjithçka që di CivilCraft.
