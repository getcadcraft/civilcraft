---
title: Vlečné krivky vozidiel
summary: Prejdite vozidlo s až tromi prívesmi pozdĺž prvkovej čiary alebo osi trasy, dopredu alebo cúvaním, a zistite plochu, ktorú zametá, jeho stopy kolies, riadenie a miesto, kde sa zlomí do uhla.
keywords: vlečná krivka, odbočovacia trasa, sledovanie vozidla, šablóna odbočenia, návrhové vozidlo, nákladné auto, autobus, príves, náves, cúvanie, zlomenie do uhla, kĺbovanie, uzamknutie riadenia, vybočenie, stopa kolesa, nakladacia rampa, polomer odbočenia
from: 8caafb8a
---

Vlečná krivka prejde vozidlom pozdĺž čiary a ukáže plochu, ktorú jeho karoséria prejde. Použite ju na overenie, že nákladné auto zvládne roh, dosiahne nakladaciu rampu alebo zacúva prívesom na miesto bez opustenia dlažby.

## Prejdite vozidlo pozdĺž čiary

1. Nakreslite čiaru, ktorou vozidlo pôjde, v smere jazdy: prvkovú čiaru (oblúky sú v poriadku: pri kreslení stlačte {{key:C}}, pozri [Prvkové čiary](topic:feature-lines)), alebo os trasy.
2. Vyberte ju a kliknite na {{ui:Vlečná krivka…}} vo svojich **Vlastnostiach**.
3. Pod **Začať z** vyberte vozidlo a potom nastavte jeho rozmery z vlastného návrhového vozidla: šírku, predný presah, rázvor, zadný presah, rozchod a **Uzamknutie riadenia**. Pridajte až tri prívesy, každý s miestom, kde je zavesený, jeho dĺžkou od závesu po nápravu, jeho presahmi a **Najväčším kĺbovaním**.
4. Vyberte **Jazdu**: dopredu alebo cúvaním. Kliknite na {{ui:Prejsť}}.

:::warning
Vozidlá, z ktorých sa začína, sú zástupné hodnoty, nie norma. Nastavte rozmery z návrhového vozidla, ktoré váš projekt používa.
:::

## Dopredu a cúvaním

| Jazda | Čo ide po čiare | Čo CivilCraft počíta |
|---|---|---|
| **Dopredu** | Stred prednej nápravy | Kam ide zadná náprava a každý príves, uhol riadenia a kĺbovanie |
| **Cúvaním** | Stred poslednej nápravy (zadná časť návesu) | Kam ide každá jednotka pred ním a riadenie, ktoré kabína potrebuje, aby tam príves dostala |

Cúvanie sa overí tak, že určíte, kam má príves ísť; CivilCraft ukáže, či to kabína zvládne.

## Prečítajte výsledok

Vlečná krivka sa kreslí v pôdoryse oranžovo: jej obrys a čiarkovane stopy najvonkajších kolies. Vyberte ju (kliknite dovnútra), aby ste vo **Vlastnostiach** videli:

- **Prejdenú dĺžku**, najväčší uhol **Riadenia** a **Kĺbovania** voči ich limitom a **Zametanú plochu**.
- Akýkoľvek problém pozdĺž čiary s jeho vzdialenosťou: riadenie za uzamknutím, alebo príves, ktorý sa otáča za svoj limit kĺbovania (zlomí sa do uhla).
- **Vozidlo pozdĺž čiary**: posúvajte jazdec, aby ste videli vozidlo v ľubovoľnom bode, s jeho riadením a kĺbovaním tam.

Zmeňte čiaru a vlečná krivka ju nasleduje. {{ui:Upraviť vozidlo…}} mení rozmery; **Jazda** prepína medzi dopredu a cúvaním. Každá zmena je jeden krok: {{key:Mod+Z}} ju vráti späť. {{key:Delete}} zmaže vybranú vlečnú krivku (čiara zostane).

Obrys a stopy kolies idú do PDF, DXF a DWG na vrstvu C-ROAD-SWPT.

## Ako sa to počíta

Každá jednotka sa otáča okolo línie svojej zadnej nápravy a ťahá ju bod pred ňou (predná náprava alebo záves): model pri nízkej rýchlosti bez šmyku, ktorý kontrolujú vlečné krivky. Zametaná plocha je súčet obrysov karosérie vo všetkých polohách. Nemodeluje rýchlosť, šmyk pneumatík, čas, ktorý riadenie potrebuje na otočenie, riadené prívesy ani vôľu pod karosériou.
