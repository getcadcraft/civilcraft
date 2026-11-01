---
title: Začínáme s CivilCraftem
summary: Co CivilCraft umí, jak jej otevřít a prvních deset minut s ukázkovým staveništěm od bodů přes vrstevnice po silnici a uložený projekt.
keywords: start, první spuštění, ukázkové staveniště, úvod, rychlý start, návod, začátek, nový projekt
from: c9b6dd8e
---

CivilCraft je aplikace rodiny CadCraft pro inženýrské stavby a návrh pozemků. Ze zaměřených bodů vytvoří povrch (TIN) s vrstevnicemi, potom Vám umožní vytyčit osy tras s návrhovými profily, protáhnout jednoduchý koridor silnice, upravit plošiny budov až k hranici úprav terénu, zkontrolovat gravitační potrubní síť podle Vašich pravidel a zobrazit objemy výkopů a násypů. Čte a zapisuje LandXML, exportuje půdorys jako DXF a vykresluje jej do PDF.

Pokud jste používali Civil 3D, myšlenky Vám budou povědomé: body, skupiny bodů, lomové hrany, osy podle PI, profily podle PVI, koridory, úpravy terénu, potrubní sítě. Způsob práce je jiný a mnohem menší: není tu příkazový řádek, styly ani soubor výkresu. Před první skutečnou zakázkou si jednou přečtěte téma [Pokud přicházíte z jiného inženýrského softwaru](topic:coming-from).

## Co potřebujete

- Aktuální prohlížeč pro počítač: Chrome, Edge, Firefox nebo Safari. Viz [Prohlížeče](common:browsers).
- Myš nebo trackpad a klávesnici, nebo dotykovou obrazovku: kreslení tam má na obrazovce tlačítka {{ui:Dokončit}}, {{ui:Zpět o bod}} a {{ui:Zrušit}} (viz [Myš, trackpad a dotyk](topic:keyboard#mouse-trackpad-and-touch)).
- Půdorys se kreslí ve 2D na plátno prohlížeče. [3D pohled](topic:site-3d) používá grafiku WebGL prohlížeče; pokud se nespustí, stavový řádek řekne proč a půdorys dál funguje.
- Žádný účet a žádné nahrávání. Soubory se otevírají na Vašem počítači a ukládají se jako stažené soubory. Viz [Vaše soubory](common:your-files).

:::note
CivilCraft dnes běží jako raná verze v prohlížeči, která se stále vyvíjí. Verze pro počítač zatím nejsou k dispozici a ukládání do cloudu také ne. Vše, co vytvoříte, zůstává na Vašem počítači, dokud to neuložíte nebo neexportujete.
:::

## Otevření CivilCraftu

1. Otevřete CivilCraft v prohlížeči.
2. Počkejte, až se obrazovka naplní: nahoře panel nástrojů, vlevo panel, uprostřed půdorys a vpravo panel **Vlastnosti**.
3. Na prázdném půdorysu uvidíte rámeček s názvem **Začněte zaměřovacími body**. Uvádí první kroky a má odkaz {{ui:Otevřít ukázkové staveniště}}.

Chcete-li CivilCraft později používat bez připojení, klikněte v liště aplikace na {{ui:Uložit pro offline}} a počkejte na {{ui:Připraveno offline}}. Součástí je tato nápověda, ukázkové staveniště a knihovny 3D a GIS. Viz [Offline](common:offline). Stiskem {{key:F1}} nebo kliknutím na {{ui:Nápověda}} kdykoli otevřete tuto nápovědu vedle aplikace.

## Prvních deset minut: ukázkové staveniště

Ukázkové staveniště je malé zaměření v amerických stopách: 276 bodů v souřadnicích state plane, hřbet, průleh s tokem a dvě horní hrany svahu. Je součástí aplikace, takže můžete postupovat i bez vlastního souboru.

1. Klikněte v rámečku na půdorysu na {{ui:Otevřít ukázkové staveniště}}.
   Otevře se dialog **Importovat body**. Říká „Přečteno 276 bodů jako PNEZD (podle řádku záhlaví), oddělených čárkami.“ a zobrazí první řádky.
2. Klikněte na {{ui:Importovat}}.
   Půdorys se naplní body, vrstevnicemi a okrajem povrchu. Stavový řádek dole uvádí, že body byly importovány a kolik trojúhelníků povrch má (546).
3. Podívejte se v levém panelu pod **Body**. Body jsou seskupeny podle prvního slova popisu: CP, FL, GRD, RIDGE, TBN, TBS a TREE.
4. Ve sloupci **Povrch** té tabulky nastavte **FL**, **RIDGE**, **TBN** a **TBS** na {{ui:Lomová hrana}}.
   Povrch se okamžitě přestaví. **Povrch** nyní uvádí „Lomové hrany: 4“ a vrstevnice se ostře lámou podél toku a hřbetu místo toho, aby je přetínaly.
5. Přesuňte ukazatel nad půdorys. Stavový řádek zobrazuje východní a severní souřadnici pod ukazatelem a výšku terénu tam.
6. Pod **Zobrazení** nastavte {{ui:Vrstevnice po}} na 0,5 ft a zapněte {{ui:Pásma výšek}}. Pod zaškrtávacími poli se objeví barevná škála s legendou. Až skončíte, pásma znovu vypněte.

Nyní máte povrch stávajícího terénu. Dále silnici.

## Vytyčení krátké silnice

1. Stiskněte {{key:A}} (nebo klikněte na {{ui:Osa trasy}} ve skupině **Návrh**).
2. Klikněte postupně na tři body přes staveniště. Červená čára sleduje ukazatel a ukazuje délku a směrník další tečny.
3. Stiskněte {{key:Enter}} pro dokončení.
   Osa trasy se objeví se staničením. Pravý panel zobrazí **Osa trasy**: její délku, tabulku PI a oblouk ve středním PI (poloměr 100 ft, nebo menší, pokud se 100 ft nevejde).
4. V pravém panelu pod **Návrhový profil** klikněte na {{ui:Začít z terénu}}.
   Pod půdorysem se otevře podélný profil se stávajícím terénem a přímým návrhovým spádem od konce ke konci.
5. Stiskem {{key:I}} zapněte {{ui:Přidat PVI}} a potom jednou klikněte v profilu poblíž středu. Objeví se PVI.
6. V tabulce PVI vpravo napište délku oblouku (například 100) do pole **Oblouk L** středního PVI a stiskněte {{key:Enter}}. Profil má nyní svislý oblouk s popsanou hodnotou K.
7. Pod **Koridor** zaškrtněte **Protáhnout sestavu podél návrhového profilu**.
   Silnice se zasadí do terénu: jízdní pruhy, krajnice a boční svahy až k hranici úprav terénu. Blok **Zemní práce** ukazuje výkop a násyp.

Nedělejte si starosti s přesnými hodnotami. Každé číslo lze v pravém panelu změnit a {{key:Mod+Z}} vrátí poslední změnu.

## Uložení práce

1. Napište název do pole **Název** nahoře v levém panelu.
2. Stiskněte {{key:Mod+S}} (nebo klikněte na {{ui:Uložit}}).
   Prohlížeč stáhne soubor pojmenovaný podle staveniště s příponou `.civilcraft.json`. Obsahuje body, nastavení povrchu, osy tras, profily, koridory, plošiny a potrubí.
3. Chcete-li pokračovat později, klikněte na {{ui:Otevřít}} (nebo stiskněte {{key:Mod+O}}) a zvolte ten soubor, nebo jej přetáhněte na půdorys.

:::warning
Automatické ukládání neexistuje. Pokud zavřete kartu s neuloženými změnami, prohlížeč se zeptá, zda ji opustit; pokud ji opustíte, změny zmizí. Ukládejte často.
:::

## Kam dál

- [Import zaměřených bodů](topic:import-points) z Vašich vlastních souborů.
- [Vytvoření a zpřesnění povrchu](topic:build-surface) pomocí lomových hran a hranice.
- [Obrazovka po částech](topic:workspace).
- [Klávesy a myš](topic:keyboard).
