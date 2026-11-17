---
title: Kontrollo masat sipas kufijve të zonizimit që shkruan
summary: Shkruaj prapavijat e një parcele rresht për rresht, një kufi lartësie, një plan ekspozimi ndaj qiellit, një raport sipërfaqe kati dhe një mbulim, shiko mbështjellësin e ndërtueshëm në plan dhe lexo cila masë thyen cilin kufi.
keywords: zonizim, prapavijë, prapavijat, para, anësore, pas, mbështjellës, sipërfaqe e ndërtueshme, kufi lartësie, plan ekspozimi ndaj qiellit, raport sipërfaqe kati, FAR, mbulim, parcelë, lot, rregullore, kontroll kodi
from: 3e267b31
---

**CivilCraft nuk ka brenda asnjë kod zonizimi.** Nuk njeh rregullat e asnjë qyteti dhe nuk ka me vete një bibliotekë të tyre. Çdo numër në këtë faqe është një që shkruan ti, marrë nga rregullorja jote, dhe çdo rezultat thotë se është matur kundrejt kufijve që ke shkruar. Është një mënyrë për të parë si kufijtë e një parcele formojnë një ndërtesë, jo një vendim nëse një projekt lejohet.

## Shkruaj kufijtë

Te **Vetitë**, nën **Masat e ndërtesës**, zgjidh një **Parcelë** (ose zgjidh një masë: kufijtë e parcelës së saj shfaqen nën të). Pastaj plotëso ato që zbatohen; lëre një kuti bosh për "pa kufi":

- **Vija e rrugës**: kufiri i parcelës në rrugë. **Prapavija e para** zbatohet mbi të, **prapavija e pasme** mbi vijën më të kundërt me të, dhe **prapavija anësore** mbi të tjerat.
- **Kufiri i lartësisë**.
- **Plani i qiellit**: fillon nga një lartësi te kufiri i parcelës dhe ngrihet me sasinë që shkruan për çdo 1 njësi largësi brenda, e matur nga vija e rrugës ose nga çdo kufi parcele (2 do të thotë 2 me 1). Lartësia e lejuar mbi një pikë është më e ulëta midis planit dhe kufirit të lartësisë.
- **Raporti i sipërfaqes së katit** (sipërfaqja bruto e masave në parcelë pjesëtuar me sipërfaqen e parcelës) dhe **Mbulimi** (gjurmët e tyre pjesëtuar me sipërfaqen e parcelës, të shkruara në përqindje).

## Mbështjellësi

Shëno **Shfaq mbështjellësin në plan** për ta vizatuar në shtresën `A-MASS-ENVL`. Mbështjellësi është parcela e zvogëluar nga çdo kufi parcele me prapavijën e vet, vijat e zhvendosura që takohen në cepa të prerë me skaj. Një kufi parcele i formuar nga një kurbë merret si segmente të shkurtra brenda 0,01 nga kurba. Parcelat konvekse dhe konkave funksionojnë të dyja. Nëse prapavijat përkulen mbi veten (një prapavijë e thellë në një parcelë të ngushtë ose shumë konkave) nuk ka mbështjellës, dhe Vetitë e thonë këtë; provo distanca më të vogla.

## Rezultati

Nën kutitë, çdo masë dhe çdo kufi merr një rresht, me një shenjë të saktë ose një kryq:

- **prapavijat**: sipërfaqja e masës që shtrihet jashtë mbështjellësit;
- **lartësia**: lartësia e masës krahasuar me lartësinë më të madhe të lejuar mbi gjurmën e saj (një prizëm me një lartësi kufizohet nga lartësia më e ulët e lejuar në çdo cep të tij);
- **raporti i sipërfaqes së katit** dhe **mbulimi**: të gjitha masat në parcelë të mbledhura së bashku.
