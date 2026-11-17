---
title: Zjistit počet hodin slunce na lokalitě
summary: Vyberte den (nebo období) a časové pásmo a zjistěte hodiny přímého slunce na každé stěně každého objemu budovy a na terénu kolem nich, s terénem vykresleným v půdorysu a čísly jako CSV.
keywords: slunce, hodiny slunce, stín, zastínění, solární přístup, hodiny denního světla, fasáda, stěna, období, slunovrat, rovnodennost, časové pásmo, letní čas, zeměpisná šířka, zeměpisná délka, CSV, rastr
from: 4e32a314
---

**Hodiny slunce** počítají hodiny přímého slunce, které dosáhnou na každou stěnu každého objemu budovy a na terén kolem nich, v den, který vyberete, nebo průměrem za období. Objemy a samotný terén vrhají stín; nic jiného ne (žádné stromy, žádní sousedé, které jste nenakreslili). Oblohové světlo, které není přímým sluncem, se nepočítá.

## Před začátkem

Poloha Slunce vychází ze zeměpisné šířky a délky lokality, které pochází ze **souřadnicového systému** projektu. Projekt bez něj se odmítne se zprávou: nejprve jej nastavte (**Souřadnice** ve skupině GIS). Zeměpisnou šířku a délku zadanou ručně by byl odhad, proto pro ně není pole.

## Výpočet

V **Vlastnostech**, pod **Objemy budov**, **Sluneční hodiny**:

1. Zvolte **Den**. Začíná dnem, kdy je Slunce nejníže u vás (21. prosinec, nebo 21. červen na jižní polokouli). Pro období zaškrtněte **Přes období**, zvolte **Poslední den** a kolik dní od sebe vzorkovat.
2. Zadejte **Časové pásmo**: název jako `America/Mexico_City`, nebo posun od UTC jako `-6`. Název sleduje pravidla letního času daného pásma pro ten den; posun, který zadáte, se použije přesně tak, jak je zadán, takže použijte ten platný v daný den. Řádek pod polem vám řekne, jaký posun našel.
3. Vyberte, jak často umístit Slunce (každých 5, 10, 15 nebo 30 minut), pak **Spočítat sluneční hodiny**. Období běží na pozadí; **Zastavit** jej zruší.

## Co dostanete

- Tabulku podle objemu: **nejhorší stěnu**, **průměr** a **nejlepší stěnu**, v hodinách za den, a tabulku všech stěn s jejich orientací a hodinami po podlažích.
- Terén kolem objemů, vykreslený v půdorysu od tmavé (žádné slunce) po žlutou (nejvíc, kolik kterákoli buňka dostane), s legendou. Buňky pod objemem zůstanou prázdné. **Zobrazit terén v půdorysu** jej vypne.
- **Stěny jako CSV** a **Terén jako CSV** uloží čísla.

U období jsou údaje průměrem za den přes vzorkované dny. Nic se neukládá do projektu: výsledek je k prohlédnutí a při novém spuštění se vytvoří znovu.

## Dobré vědět

- Stěna počítá okamžik jako slunečný jen tehdy, když je obrácená ke slunci a nic jí nepřekáží. Stěna odvrácená od slunce nedostane nic.
- Terén se vzorkuje na mřížce, která závisí na velikosti lokality, a poloha Slunce se počítá uprostřed každého časového kroku, takže hodiny jsou správné zhruba na krok, který jste zvolili.
- Poloha Slunce je zveřejněný astronomický vzorec, přesný zhruba na minutu oblouku.
