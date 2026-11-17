---
title: Redaguoti geodezinį tašką
summary: Pakeiskite vieno taško numerį, koordinates, kotą ar aprašymą arba nuvilkite jį į naują vietą plane.
keywords: redaguoti tašką, perkelti tašką, keisti kotą, pervardyti, taško numeris, aprašymas, vilkti, šiaurės koordinatė, rytų koordinatė, pataisyti tašką, klaidingas matavimas
from: 375ae2e9
---

Klaidingas matavimas, neteisingas instrumento aukštis, neteisingai įvestas aprašymas: pataisykite vieną tašką, ir paviršius seka paskui.

## Pakeisti taško reikšmes

1. Su {{ui:Pasirinkti}} spustelėkite tašką plane. **Ypatybėse** jo numeris, rytų koordinatė, šiaurės koordinatė, kota ir aprašymas rodomi laukeliuose.
2. Įveskite naują reikšmę ir paspauskite {{key:Enter}} (arba spustelėkite šalia). Taškui be kotos palikite lauką **Kota** tuščią.
3. Paviršius, horizontalės ir viskas, kas jomis pagrįsta, atsinaujina iš karto.

Kiekvienas pakeitimas – vienas žingsnis: {{key:Mod+Z}} jį anuliuoja, o {{key:Mod+Y}} perdaro. Reikšmė, kurios CivilCraft negali naudoti (skaičius, kurį jau turi kitas taškas, raidės koordinatėje), atmetama: laukelis įrėminamas, o būsenos juosta nurodo priežastį.

Naujas aprašymo kodas sukuria naują taškų grupę, kaip ir importas (žr. [Sukurti paviršių](topic:build-surface)).

## Perkelti tašką plane

1. Pasirinkite tašką (jis gauna žiedą).
2. Vilkite žiedą. Būsenos juosta rodo rytų ir šiaurės koordinates, kur taškas bus.
3. Atleiskite, kad perkeltumėte; jo kota lieka ta pati. Prieš atleisdami paspauskite {{key:Esc}}, kad grąžintumėte tašką atgal.

## Lūžio linijos seka tašką

Lūžio linija, nubrėžta įrankiu {{ui:Lūžio linija}}, nukopijuoja taškus, per kuriuos eina. Kai perkeliate tašką ar keičiate jo kotą, lūžio linijos kampai, esantys ant jo, juda kartu, tuo pačiu žingsniu. Aprašymų sudarytos lūžio linijų grupės visada perkuriamos iš taškų.

:::note
Paviršius, nuskaitytas iš LandXML failo, išlaiko savo trikampius: taškų redagavimai jį pakeičia tik po {{ui:Atkurti paviršių iš taškų}}.
:::
