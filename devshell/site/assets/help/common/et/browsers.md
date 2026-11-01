---
title: Brauserid ja arvutid
summary: Milliste brauserite sees rakendused töötavad, mis neil erineb ja mida sinu arvuti vajab.
keywords: chrome, edge, firefox, safari, brave, brauser, mac, windows, linux, ipad, tahvelarvuti, webgl, nõuded, mälu
from: a11b09b1
---

Rakendused töötavad veebibrauseri sees. Nad teevad töö sinu enda arvutis: sinu failid avatakse seal ega saadeta meile kunagi (vt [Kuhu failid lähevad](common:your-files)).

## Milline brauser

Kasuta ühte nendest brauseritest uusimas versioonis:

| Brauser | Mootor | Märkused |
|---|---|---|
| Chrome, Edge, Brave, Opera, Vivaldi | Chromium | Kõige täielikum: kausta valimine, salvestamine võrguta kasutamiseks, failide käsitlemine. |
| Firefox | Gecko | Töötab. Terve kausta avamisel kasutatakse lihtsamat valijat. Võrguta salvestamine ei pruugi privaatsetes akendes töötada. |
| Safari | WebKit | Töötab Macis ja iPadis. Terve kausta avamisel kasutatakse lihtsamat valijat. Safari võib kustutada võrguta koopia, mida pole mõne nädala jooksul kasutatud. |

Kõik kolm mootorit sobivad igapäevaseks tööks. Kui rakendus teeb kas midagi ühes neist teisiti, näitab selle abi sinu brauseri samme.

## Mis brauserites erineb

- **Kausta avamine.** Chromiumi brauserid näitavad tõelist kaustavalijat ja saavad kausta otse lugeda. Firefox ja Safari palub valida kausta ning loevad seejärel kõik selles olevad failid, mis suurte projektikaustade puhul võtab kauem aega; kausta lohistamine rakendusse töötab kõigis kolmes.
- **Salvestamine.** Rakendused salvestavad laadides faili alla. Sinu brauser otsustab, kuhu allalaadimised lähevad ja kas ta küsib enne.

:::chromium
Chrome'is või Edge'is lülita sisse „Küsi enne iga faili allalaadimist, kuhu see salvestada“ (sätetes jaotises Allalaadimised), et valida iga kord kaust.
:::

:::firefox
Firefoxis ava Sätted, seejärel Üldine, seejärel Allalaadimised ning vali „Küsi alati, kuhu failid salvestada“, et valida iga kord kaust.
:::

:::safari
Safaris ava Sätted, seejärel Üldine, ja määra „Faili allalaadimise asukoht“ väärtuseks „Küsi iga allalaadimise puhul“, et valida iga kord kaust.
:::

## Mac, Windows ja Linux

Rakendused on igas arvutis samad. Muutub klaviatuur: kiirklahvid on automaatselt kirjutatud sinu arvuti jaoks. Vt [Klahvid, hiired ja puuteplaadid](common:keys).

## Tahvelarvutid ja puutekraanid

Mõned rakendused võtavad vastu puudutusi (üks sõrm joonistab või valib, kaks sõrme nipitsevad suumimiseks ja vaate nihutamiseks). Iga rakenduse abi ütleb, kas ta seda teeb. iPadis kasuta Safarit või Chrome'i. Klaviatuur aitab rakendustega, mis kasutavad kirjutatud käske.

## Vanim brauser ja süsteem

Need versioonid saime 0.7 rakenduste koodist, mitte oletusest: iga fail analüüsiti ja iga kasutatud keelefunktsiooni kontrolliti brauserite avaldatud ühilduvusandmetest. Nendest versioonidest madalamal ei saa rakendused üldse käivituda, sest brauser ei mõista koodi.

| | Vanim versioon, millega rakendused saavad käivituda |
|---|---|
| Chrome, Edge, Brave, Opera, Vivaldi | Chromium 94 |
| Firefox | 93 |
| Safari (Mac, iPad, iPhone) | 16.4 (macOS 13.3, iPadOS ja iOS 16.4) |

CadCraft Studio sisaldab Windowsis oma veebimootorit, seega vajab Windows 10 või 11; Macis kasutab ta süsteemi oma, seega vajab macOS 13.3 või uuemat. Studio jaotis Sätted › Uuendused näitab, millel sinu koopia töötab.

See on vanim versioon, millega rakendused *käivituvad*, loetuna koodist. See ei ole nimekiri vanadest brauseritest, millega rakendusi oleme katsetanud, nii et vanem, mis käivitub, võib ikkagi mõne funktsiooni puudu jätta.

## Mida sinu arvuti vajab

Need on rakenduste kavandatud miinimumid, mitte mõõdetud nõuded:

- 8 GB mälu (suurte ühendatud mudelite jaoks on soovitatav 16 GB).
- Graafikakiip, mis toetab 3D-rakenduste jaoks WebGL 2-d. Kui 3D-vaade jääb tühjaks, kontrolli, kas brauseri sätetes on riistvaraline kiirendus sisse lülitatud.
- Vähemalt 1280 pikslit lai ekraan täielike tööriistaribade jaoks; väiksemad ekraanid mähivad need ridadesse.

Väga suured failid (suured plaanikomplektid, suured mudelid) kasutavad brauseri vahekaardil palju mälu. Sulge teised rasked vahekaardid, kui rakendus aeglustub.
