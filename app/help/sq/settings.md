---
title: Cilësimet e CivilCraft
summary: Zgjidhni renditjen e kolonave për rreshtat e kopjuar dhe të ngjitur të pikave dhe për të hamendësuar kolonat e një skedari, si numërohen pikat e ngjitura, çfarë shfaqin etiketat e pikave, treguesi i qoshes, ekzagjerimi vertikal në 3D, si shfaqen gjerësia dhe gjatësia gjeografike, dhe nëse shtresat e hartës vijnë nga interneti.
keywords: cilësime, preferenca, pnezd, penzd, renditja e kolonave, rreshtat e pikave, rinumërim, numrat e pikave, numri fillestar, etiketat e pikave, etiketa, përshkrim, kota, kub pamjeje, ikona e boshteve, treguesi i qoshes, busulla, ekzagjerimi vertikal, 3d, gjerësi, gjatësi, dms, gradë dhjetore, shtresat e hartës, interneti, privatësia
from: 64b9cb92
---

Hapni {{ui:Settings}} me rrotën te shiriti i aplikacionit ose me {{key:Mod+,}}. Skeda e parë, {{ui:CivilCraft}}, mban cilësimet që i përkasin këtij aplikacioni; {{ui:General}} mban ato që i ndajnë të gjitha aplikacionet CadCraft (tema, shiriti i veglave, panelet). Cilësimet e CivilCraft ekzistojnë vetëm në aplikacion: i ndryshoni këtu, dhe ky shfletues i mban mend. {{ui:Reset CivilCraft settings}} i kthen të gjitha cilësimet në fillimin e tyre.

## Rreshtat e pikave

**P, N, E, Z, D** (fillimi) ose **P, E, N, Z, D**: pika, veriu, lindja, kota, përshkrimi, ose lindja përpara veriut. Përdoret në tre vende:

- **Copy** (Kopjo): rreshtat që CivilCraft i vendos në kujtesën e sistemit për një spreadsheet.
- **Paste** (Ngjit): rreshtat e ngjitur nga një spreadsheet ose skedar tekst që nuk kanë rresht titulli.
- **Import**: hamendësimi në dialogun **Importo pikat** kur një skedar nuk ka rresht titulli (një skedar me katër kolona lexohet si PENZ, me tre si ENZ). Shihni [Formatet e skedarëve të pikave](topic:point-file-formats).

Një rresht titulli që emëron kolonat e veta mbizotëron gjithmonë, dhe po kështu një zgjedhje te lista **Columns** e dialogut të importit.

## Numrat për pikat e ngjitura

- **Keep free numbers** (fillimi): një pikë e ngjitur mban numrin e saj kur asnjë pikë tjetër nuk e ka; vetëm pikat që përplasen marrin numra të rinj.
- **Always new numbers**: çdo pikë e ngjitur merr një numër të ri, edhe nëse numri i saj është i lirë.

**New numbers start at**: lëreni bosh për të numëruar nga një më shumë se numri më i madh në përdorim. Shkruani një numër, për shembull 5000, për t'u dhënë pikave të reja numra nga 5000 e lart; numrat që janë në përdorim kapërcehen. Dy pika nuk ndajnë kurrë të njëjtin numër, në asnjërën nga mënyrat. Shihni [Zgjidhni, kopjoni dhe ngjitni pikat topografike](topic:copy-paste-points#point-numbers-never-clash).

## Etiketat e pikave

Çfarë shfaq një etiketë pike kur {{ui:Point labels}} është i ndezur te **Shfaq**: **Number** (numri), **Number and elevation** (numri dhe kota), ose **Number, elevation and description** (numri, kota dhe përshkrimi) (fillimi). Eksportet DXF, DWG dhe PDF shfaqin të njëjtat etiketa si ekrani.

## Treguesi i qoshes

Çfarë qëndron në qoshen e planit dhe të pamjes 3D: **View cube** (fillimi), **Axis icon** ose **None** (asgjë).

- **View cube** (lart djathtas). Në plan tregon sipërin, me unazën e busullës: N është veriu i rrjetit (lart në plan). Klikoni çdo anë tjetër, skaj ose qoshe të kubit, ose tërhiqeni, dhe [pamja 3D](topic:site-3d) hapet duke parë nga aty. {{ui:Home}} në kubin e planit i përshtat planin.
- Në pamjen 3D kubi kthehet me pamjen: klikoni një anë, skaj ose qoshe për të parë nga aty, tërhiqeni kubin për të rrotulluar, tërhiqeni unazën e busullës për t'u kthyer rreth vertikales, klikoni një shkronjë për të parë nga ajo anë, dhe përdorni {{ui:Home}} për pamjen izometrike të gjithë vendit. Kur shikoni drejt një ane, shigjeta të vogla kalojnë në anën pasuese dhe shigjeta të lakuara e kthejnë pamjen për një çerek rrotullimi.
- **Axis icon** (poshtë majtas): një shenjë e vogël X (lindje) dhe Y (veri) në plan, X, Y dhe Z (lart) në 3D.

## Ekzagjerimi vertikal në 3D

Sa e zgjat pamja 3D kotat: **1×**, **2×** (fillimi), **3×**, **5×** ose **10×**. Lista në shiritin e pamjes 3D është e njëjta cilësim, kështu që ndryshimi i njërës ndryshon edhe tjetrën. Vëllimet, profilet dhe eksportet 3D mbeten në përmasa reale.

## Gjerësia dhe gjatësia gjeografike

Si shfaq shiriti i gjendjes lartësinë dhe gjatësinë gjeografike të treguesit kur projekti ka një sistem koordinatash: **degrees, minutes and seconds** (gradë, minuta dhe sekonda) (fillimi, për shembull `30°18′00.00″ N`) ose **decimal degrees** (gradë dhjetore) (`30.300000° N`). Shihni [Vendosni sistemin koordinativ të projektit](topic:coordinate-systems#latitude-and-longitude-in-the-status-bar).

## Shtresat e hartës nga interneti

**Off** (fillimi, çaktivizuar) ose **On** (aktivizuar). Kur është aktiv, CivilCraft kërkon nga serverat e hartave që keni shtuar foto të zonës në ekran. Vizatimi juaj mbetet në këtë kompjuter; serveri sheh zonën dhe adresën tuaj të internetit. Ndërsa është joaktiv, asnjë server hartash nuk pyetet për asgjë, edhe kur një projekt që hapni emëron një të tillë; një foto e georeferuar nga një skedar funksionon në çdo rast. Shihni [Shfaqni shtresat e hartës nën plan](topic:map-layers).

## Asistentët

**Let AI assistants and scripts use CivilCraft** (fiknjuar në fillim) lejon një asistent në kompjuterin tuaj të arrijë vendin e hapur përmes CadCraft Studio: **Read** përshkruan vendin dhe jep pika, kota sipërfaqeje, stacione, profile, vëllime dhe parcela; **Edit** e lejon të përzgjedhë dhe shtojë pika topografike; **Save** dhe **Export** e lejojnë të ruajë projektin dhe të shkruajë LandXML ose DWG. **Folders it may use** (në Studio) janë ku mund të ruajë dhe eksportojë. **Activity** liston thirrjet e tij. Shihni [Lëreni një asistent AI të punojë me vendin tuaj](topic:assistants).
