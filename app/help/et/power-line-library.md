---
title: Sinu elektriliinide teek
summary: Tee oma juhtmed, maa-alused kaablid, toed, seadmed ja kaevikutüübid kategooriates, mille nimetad, ning jaga neid failidena.
keywords: teek, juht, kaabel, post, toetus, traavers, isolaator, detail, tõmbetross, trafo, kapp, muff, kaevik, kategooria, csv, import, eksport
from: 88733744
---

Elektriliinide tööruumi jaotis **Teek** sisaldab kõiki kirjeid, mida liin või kaabel võib kasutada. Miski selles ei ole seotud riigi ega tootjaga: sa teed kirjed, millega töötad.

## Kolme liiki kirjed

| Liik | Kus see asub | Kas seda saab muuta? |
|---|---|---|
| **Näidised** | Tulevad koos CivilCraftiga, üldised arvud, mis on tuletatud materjali omadustest | Ei: kõigepealt {{ui:Kopeeri minu teeki}} |
| **Projektis** | Tulid projektifailiga, mille avasid | Ei: kõigepealt {{ui:Kopeeri minu teeki}} |
| **Minu** | Sinu enda kirjed, hoitud selles brauseris | Jah, ja muudatused salvestuvad kohe |

Iga projekt hoiab koopiat igast kasutatavast kirjest, nii et projekt avaneb igas arvutis oma juhtmete ja postidega.

:::warning
Näidiskirjed on näited: kontrolli iga arvu tarnija andmete järgi. Maa-alustel kaablitel ei ole tahtlikult vooluhinnangut, sest see sõltub sellest, kuidas kaabel on paigaldatud.
:::

## Loo kirje

1. Jaotises **Teek** vali **Liik** (õhujuhid, maa-alused kaablid, toed, seadmed või kaevikutüübid).
2. Kliki {{ui:Uus kirje}} või vali näidis ja kliki {{ui:Kopeeri minu teeki}} või {{ui:Dubleeri}}.
3. Täida väljad. Väljad, mis on märgitud `*`-ga, on need, mida kontrollid vajavad; kirje, millelt see puudub, on märgitud `!`-ga ja loetletakse jaotises **Kontrollid**, kui liin seda kasutab.
4. Anna sellele **Kategooria**, tasemete vahel `/`: `Õhuliin/MP/Kimbustatud`, `Toed/Betoon/12 m`. Puu järgib sinu kategooriaid.

Mida iga liik vajab:

| Liik | Vajalik kontrollideks |
|---|---|
| Õhujuht | ristlõige, läbimõõt, mass meetri kohta, purunemistugevus, elastsusmoodul, soojuspaisumine |
| Maa-alune kaabel | südamikud, ristlõige, pinge, läbimõõt, takistus, vooluhinnang |
| Toe | üldpikkus, nimikoormus (võetud punktist allpool tippu), sügavus maapinnas |
| Seade | selle tüüp; nimikoormus traaversitele, kinnitusdetailidele ja tõmbetrossidele; faasivahe ja langus traaversitele; pikkus isolaatoritele; nurk tõmbetrossidele |
| Kaevikutüüp | sügavus, laius, katvus kaablite kohal |

## Jaga seda

- {{ui:Salvesta minu teek}} salvestab kõik sinu kirjed ühe `.cclines.json`-failina; {{ui:Ava teek…}} loeb selle tagasi (sama võtmega kirjed asendatakse).
- {{ui:Salvesta CSV-na}} salvestab liigi, mida vaatad, tabelina; {{ui:Ava teek…}} loeb tagasi sellise liigi CSV-faili. Veerud võivad tulla mis tahes järjekorras; semikoolonitega eraldatud fail võib kasutada komaga eraldatud kümnendkohti.
