---
title: Izračun projektnih pretokov fekalne kanalizacije in preverjanje kanalizacije
summary: Vpišite prebivalce in površino, ki vstopata v vsak jašek fekalnega omrežja; CivilCraft ju sešteje po omrežju navzdol, izračuna konični pretok s faktorjem konice in infiltracijo ter preveri zmogljivost in hitrost vsake cevi.
keywords: fekalna kanalizacija, kanalizacija, odpadna voda, projektni pretok, konični pretok, faktor konice, harmon, babbitt, infiltracija, prebivalstvo, na prebivalca, odstotek zapolnjenosti, samočistilnost, hitrost, dimenzioniranje cevi, projektni list
from: 73ba197a
---

Projektni pretoki fekalne kanalizacije delujejo na [omrežju cevi](topic:pipe-network), kadar je njegova {{ui:Vrsta}} {{ui:Fekalna}}. Če nič ni izbrano, desna plošča nato prikaže **Projektni pretoki fekalne kanalizacije**, kjer omrežje meteornih vod prikaže odvodnjavanje meteornih vod.

## Vpišite, kar prihaja

1. Izberite jašek. Pod **Projektni pretoki fekalne kanalizacije** vpišite {{ui:Ljudje, ki vstopajo tu}} in {{ui:Površina, ki vstopa tu}} (hektarji v projektu v metrih, akri v projektu v čevljih).
2. Za trgovine, pisarne ali industrijo vpišite enakovredne prebivalce: površina krat prebivalci na hektar (ali akr), ki jih uporablja vaša agencija. Površina se v obeh primerih šteje za infiltracijo.
3. Ponovite za vsak jašek, kamor se priklopi ulica ali parcela. Jašek, kamor nič ni priključeno, ostane pri 0 v obeh.

Vsaka cev nosi vse, kar vstopa v njen zgornji jašek in nad njim. Izberite jašek, da vidite, kaj skozenj teče.

## Nastavitve

| Nastavitev | Kaj pomeni |
|---|---|
| {{ui:Pretok na osebo}} | povprečni dnevni pretok ene osebe: litri (projekt v metrih) ali ameriški galoni (projekt v čevljih) |
| {{ui:Infiltracija}} | podtalnica, ki pušča noter: litri na sekundo na hektar ali galoni na dan na akr |
| {{ui:Faktor konice}} | Harmon, 1 + 14 / (4 + √P), ali Babbitt, 5 / P^0.2, kjer je P prebivalstvo v tisočih |
| {{ui:Faktor konice najmanj}} / {{ui:Faktor konice največ}} | faktor ostane med tema dvema mejama |
| {{ui:Manningov n}} | za zmogljivost in hitrost |
| {{ui:Najmanjša hitrost}} / {{ui:Največja hitrost}} | pri globini koničnega pretoka same v cevi |
| {{ui:Največ polne zmogljivosti}} | kako polna sme biti cev pri konici, kot odstotek tega, kar prenese polna |

Začetne vrednosti so okvirne, niso standard. Uporabite vrednosti, ki jih objavi vaša agencija.

## Kaj izračuna

Za vsako cev, po vrstnem redu toka:

- konični pretok = prebivalci × pretok na osebo × faktor konice + površina × infiltracija
- zmogljivost pri polni cevi (Manningova enačba pri naklonu cevi) in kako polna jo naredi konica
- normalna globina koničnega pretoka in hitrost pri njej

Tabela **Rezultati fekalne kanalizacije** navede prebivalce, faktor konice, konični pretok (L/s ali gpm in kubične čevlje na sekundo), odstotek zapolnjenosti in hitrost za vsako cev. Pod njo so navedene težave: cev, ki je bolj polna od meje, počasnejša od najmanjše hitrosti (morda se ne očisti sama), hitrejša od največje ali brez padca. {{ui:Dimenzioniraj cevi za te pretoke}} izbere za vsako cev najmanjšo standardno velikost (200 mm ali 8 palcev in več), ki prenese njen konični pretok znotraj meje; en {{key:Mod+Z}} to razveljavi.

:::note
To je stalni konični pretok, ki ga izračuna projektni list, preverjen z objavljenim projektnim listom do njegovega natisnjenega zaokroževanja. Ni model kanalizacije skozi čas: brez hidrogramov, zadrževanja, črpalk ali preliva. Glejte [Še ni izdelano](topic:not-built-yet).
:::

Hitrosti uporabljajo Manningovo enačbo z istim n pri vsaki globini. Nekateri diagrami za delno polne cevi dopuščajo, da se n spreminja z globino, kar da v cevi, polni od 60 do 70 odstotkov, nekoliko nižjo hitrost (približno 3 odstotke manj).
