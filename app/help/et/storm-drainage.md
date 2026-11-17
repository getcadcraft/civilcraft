---
title: Arvuta sademevee vood, torumõõdud ja hüdrauliline gradientjoon
summary: Joonista iga kaevu suunduvad valgalad, liida võrgustiku voolud kokku ratsionaalmeetodiga, määra torude mõõdud Manningi valemi järgi ning vaata, kus hüdrauliline gradientjoon kulgeb täis torus või jõuab pinnani.
keywords: sademevesi, valgala, äravoolupiirkond, ratsionaalmeetod, äravoolutegur, kontsentratsiooniaeg, sademete intensiivsus, idf, manning, torumõõtmine, hüdrauliline gradientjoon, hgl, energiagradientjoon, egl, ülekoormus, üleujutus, järelvesi
from: e44872ec
---

Sademevee äravool töötab [torustikul](topic:pipe-network): joonista kõigepealt torustik, seejärel sinna suunduvad alad. Kui midagi pole valitud, ilmub kõik paremal paneelil jaotisse **Sademevee äravool**.

## Joonista valgala

1. Klõpsa jaotises **Sademevee äravool** nupul **Joonista valgala**.
2. Klõpsa selle ala nurkadele, mis suunab vee ühte kaevu. {{key:Enter}} või topeltklõps lõpetab; {{key:Backspace}} võtab viimase nurga tagasi, {{key:Esc}} katkestab.
3. Valgala suundub kaevu, mis asub selle sees, muidu lähimasse. Avaneb selle **Omadused**: määra nimi, **Äravoolutegur C** (sajust äravoolav osa, 0 kuni 1), **Kontsentratsiooniaeg** minutites ja milline kaev on **Suundub kaevu**.

**Joonista veel üks valgala** selle omadustes alustab järgmist. Valgala valimiseks klõpsa plaanil selle sees; {{key:Delete}} eemaldab selle. Iga muudatus on üks samm: {{key:Mod+Z}} võtab selle tagasi.

## Määra arvutussadu

Sademete intensiivsus on i = a ÷ (tc + b) astendajaga c, tolli tunnis jalgades projektis ja millimeetrit tunnis meetri projektis. Sobita **Intensiivsus a**, **b** ja **c** oma intensiivsus–kestus–sagedus kõverale selle korduvusperioodi jaoks, mida projekteerid.

:::warning
Algne intensiivsuskõver, Manningi n (0.013) ja ühenduskadu (0.5) on kohatäited, mitte standard. Määra need oma sademeandmete ja projekteerimisnõuete järgi.
:::

- **Lühim kontsentratsiooniaeg**: ühtegi toru ei arvutata lühema ajaga (algselt 10 minutit).
- **Manningi n**: torude karedus.
- **Ühenduskadu**: iga kaevu kadu, mis on väljuva toru kiirusõlje V²/2g osa.
- **Vee tase väljavoolus**: järelvesi, kuhu viimane toru tühjeneb. Jäta tühjaks, kui väljavool on vabalt voolav.

## Kuidas vood liituvad

Iga toru kannab kõiki selle kohal olevaid valgalasid. Q = C × i × A, kus C × A liidetakse üle torustiku ja i on intensiivsus saabuva vee pikima kontsentratsiooniaja juures: valgala enda aeg või ülesvoolu valgala aeg pluss läbivoolu aeg torudes (pikkus ÷ täistorus voolamise kiirus). Q on kuupjalga sekundis (A aakrites) või kuupmeetrit sekundis (A hektarites).

## Määra torude mõõdud

Tabel jaotises **Vood ja gradientjooned** näitab iga toru kohta vooluhulka, seda, mida see kannab täistorus oma kaldega voolates, kiirust, hüdraulilist gradienti selle ülemises ja alumises otsas ning seda, kui sügavalt see voolab.

**Määra torud nendele vooludele** annab igale torule väikseima standardmõõdu, mis kannab selle vooluhulka oma kaldel (12 kuni 72 tolli või 300 kuni 1800 mm). See on üks samm. Sisepõhjad jäävad paigale: kui mõõdud muutuvad, kasuta katte säilitamiseks **Sea kõik sisepõhjad reeglite järgi** ja kontrolli tabelit uuesti.

## Loe gradientjooni

Hüdrauliline gradientjoon (HGL) arvutatakse väljavoolust ülesvoolu:

- Osaliselt täis voolava toru HGL on veepinnal: sisepõhi pluss normaalsügavus.
- Kui all olev vesi on kõrgemal kui toru lagi või toru kannab rohkem, kui suudab täistorus voolata, voolab see täis (ülekoormatult) ning selle HGL tõuseb üle pikkuse hõõrdekalde võrra.
- Igas kaevus on HGL väljuva toru ülemine HGL pluss ühenduskadu.
- Energiagradientjoon (EGL) on HGL pluss kiirusõlg.

Täis voolav toru on loendis ja samuti iga kaev, kus HGL on servast kõrgemal: vesi jõuab seal pinnani ja kaev on plaanil punasega ringitud. Vaatamiseks vali toru või kaev; selle **Omadustes** näed vooluhulka, sügavust, kiirust ja mõlemat gradientjoont.

## Arvuta sadu

Ratsionaalmeetod annab igale torule ühe tippvoolu. {{ui:Arvuta sadu}} (tulemuste all torustiku **Omadustes**) arvutab selle asemel kogu sademe: iga valgala äravoolu ajas, mis kantakse torudes alla koos läbivoolu aja ja mahuga ning liidetakse seal, kus need kohtuvad.

1. Jäta {{ui:Sadu kestab}} ja {{ui:Sademe intensiivsus}} tühjaks, et kasutada pikimat kontsentratsiooniaega ja ülal olevat sajukõverat, või sisesta oma.
2. Vajuta {{ui:Arvuta sadu}}. Tabelis on iga toru kohta kõrgeim sisse- ja väljavool, kui palju madalam on väljuv tippvool, kui suure osa toru täisvõimsusest see kasutab ning minut, millal tipp saabub.
3. Igale väljavoolule tuleb väike vooluajagraafik ja {{ui:Laadi hüdrogramm alla (CSV)}}.

Valgala saadab välja sademe, mis on keskmistatud selle kontsentratsiooniaja üle, seega lühem sadu tipneb madalamalt kui C × i × A. Iga toru marsruutitakse Muskingum–Cunge meetodiga, kasutades ratsionaalmeetodi juba leitud voolusügavust. Kaks haru erineva kontsentratsiooniajaga ei tipne koos, seega on nende summa madalam kui nende tippude summa.

See ei mudelda ülekoormust, tagasipaisu, mahtu kaevudes ega üleujutust. Toru, mille marsruditud tipp ületab selle täisvõimsuse, on loendis ning selle vesi edastatakse nii, nagu see mahuks. Kasuta seda ajastuse ja summutuse vaatamiseks, mitte torude mõõtmiseks. See on arvutusabi: selle kontrollib insener.

## Salvestatakse projektiga

Valgalad ja sademe sätted salvestatakse projektifaili. Need ei ole veel PDF-plaanis, DWG-s ega DXF-is ega LandXML-is: vt [Veel valmimata](topic:not-built-yet).
