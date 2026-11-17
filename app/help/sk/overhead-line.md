---
title: Kreslenie nadzemného vedenia
summary: Umiestnite podpery do pôdorysu, nechajte CivilCraft určiť úlohu každej podpery a úseky medzi koncovými podperami a presúvajte podpery v pôdoryse alebo na pozdĺžnom profile vedenia.
keywords: nadzemné vedenie, podpera, stĺp, rozpätie, úsek, koncová podpera, uhol, závesná podpera, profil, výška, traverza, kotva, lano
from: b8e5e272
---

## Kreslenie

1. Musíte mať povrch: terén pod vedením pochádza z neho ([Vytvorenie povrchu](topic:build-surface)). Podpera bez terénu pod sebou je uvedená v **Kontrolách**; zadajte jej namiesto toho **Úroveň terénu** vo Vlastnostiach.
2. Kliknite na {{ui:Line}} v skupine Elektrické vedenia a kliknite na každú podperu v pôdoryse.
3. Dvakrát kliknite na poslednú, alebo stlačte {{key:Enter}}.

Vedenie dostane vodič, podperu a výstroj, ktoré ste naposledy použili na tomto počítači (prvýkrát: príklady z knižnice). Zmeňte ich vo Vlastnostiach.

## Vedenie vo Vlastnostiach

Vyberte vedenie (kliknutím na rozpätie), aby ste nastavili jeho **Vodič**, **Vodiče na obvod**, **Obvody**, **Napätie**, **Pravidlo odstupu**, ktoré musí dodržať nad terénom, a výstroj **Na každej podpere** (traverza, izolátory, príslušenstvo). Tabuľka uvádza jeho **úseky** s rozhodujúcim rozpätím každého, bežným napätím a zaťažovacím stavom, ktorý ho riadi.

## Podpery

Kliknutím na podperu ju vyberte. Vo Vlastnostiach:

- **Podpera**: jej položka knižnice. Keď je príliš slabá, {{ui:Použiť …}} vloží najmenšiu podperu z rovnakého materiálu vo vašej knižnici, ktorá unesie zaťaženie.
- **Úloha**: Automaticky, Závesná, Uhlová alebo Koncová. Automaticky znamená: prvá a posledná podpera sú koncové; otočenie väčšie ako uhol nastavený v pravidle urobí uhlovú podperu, väčšie otočenie koncovú.
- **Výška nad terénom**: prázdne pole ju prevezme z položky knižnice (jej dĺžka mínus hĺbka v zemi).
- **Na tejto podpere tiež**: dodatočná výstroj, napríklad **kotva** (lano). Podpera s kotvou prenáša ťah vedenia do svojej kotvy.
- **Existujúca podpera**: kontroluje sa ako ostatné, ale sa vynechá z množstiev.

{{ui:Support}} pridá podperu na rozpätie najbližšie k vášmu kliknutiu. Potiahnutím podpery v pôdoryse ju presuniete. {{key:Delete}} ju odstráni (vedenie si ponechá aspoň dve).

Úseky idú medzi koncovými podperami: vnútri úseku vodič voľne prechádza cez závesné svorky, takže jedno napätie platí pre celý úsek.

## Pozdĺžny profil vedenia

Kliknite na {{ui:Profile}} (alebo na **Pozdĺžny profil** vo Vlastnostiach vedenia). Panel pod pôdorysom zobrazuje terén pozdĺž vedenia, každú podperu od terénu po jej vrchol, najnižšiu fázu vodiča pri **Zaťažovacom stave**, ktorý vyberiete, a odstup, ktorý musí vedenie dodržať, ako prerušovanú čiaru. Rozpätie, ktoré zlyhá, je červené; číslo pod každým rozpätím je jeho najnižší odstup.

- **Vedenie** vyberie nadzemné vedenie, ktoré sa zobrazí. Výber iného vedenia alebo jednej z jeho podpier v pôdoryse prepne profil na neho.
- Pohyb kurzora nad profilom: vodiaca čiara ho sleduje a popisok ukazuje vzdialenosť pozdĺž vedenia, terén, vodič a odstup v tom mieste (a povie, kedy je odstup pod pravidlom vedenia).
- {{ui:Measure}} v lište profilu: kliknutím na dva body získate vodorovnú vzdialenosť, výškový rozdiel, priamu vzdialenosť a sklon medzi nimi. Kliknutie blízko terénu, vodiča alebo vrcholu podpery sa k nemu prichytí. Na zastavenie znova kliknite na {{ui:Measure}}.
- Prekážky, ktoré vedenie križuje, stoja nad terénom: nakreslené ako pruhy, rastliny z Krajiny ako ich koruna, múry ako pruhy (pozri [Kontroly vedenia](topic:power-line-checks#clearances)). Trasy káblov a potrubia, ktoré vedenie križuje, sú označené pod terénom pri ich vrchole, s názvom.

- Potiahnutím podpery do strany ju presuniete pozdĺž vedenia.
- Potiahnutím jej vrcholu nahor alebo nadol nastavíte jej výšku nad terénom.
