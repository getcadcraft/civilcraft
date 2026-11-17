---
title: Výsadbové plány a rozpisy
summary: Umístění jednotlivých rostlin, záhonů vyplněných rostlinami v jejich rozestupu se směsí podle procent a živých plotů; popisky a počítání v rozpisu rostlin pro tabulku nebo TakeoffCraft.
keywords: výsadbový plán, rozpis rostlin, záhon, hromadná výsadba, živý plot, strom, keř, půdopokryv, rozestup, trojúhelníkový rozestup, počet rostlin, výměry, popisky, koruna, značky rostlin, ifc, výkaz výměr, takeoff
from: ab49eab5
---

## Umístění rostlin

1. Vyberte rostlinu v sekci **Rostliny** vlevo.
2. Klikněte na {{ui:Zasadit}} a pak klikněte na půdorys: každé kliknutí umístí jednu rostlinu. Stisknutím {{key:Esc}} ukončete.

Značka rostliny se kreslí v její šířce v dospělosti; Více › {{ui:Zobrazit ve velikosti při výsadbě}} kreslí každou rostlinu ve velikosti, v jaké se sází. Stromy stojí na terénu pod sebou: když později upravíte terén lokality, sledují ho. Chcete-li místo toho rostlinu pevně umístit do dané kóty, zadejte ji do pole **Kóta** ve Vlastnostech.

## Záhony

1. Vyberte hlavní rostlinu, klikněte na {{ui:Záhon}} a klikněte na rohy záhonu. Stiskněte {{key:Enter}} (nebo znovu klikněte na první roh) pro uzavření.
2. Záhon se vyplní touto rostlinou v jejím rozestupu, v **trojúhelníkovém** vzoru (obvyklém: každá rostlina je stejně daleko od šesti dalších), o polovinu rozestupu od okraje.
3. Ve Vlastnostech **Přidat rostlinu** přimíchá rostlinu vybranou vlevo. Nastavte každé rostlině **Podíl %**: záhon jich přesně tolik vezme, rozprostřené po celé ploše. **Znovu promíchat** zamíchá, kam které půjdou.

Pokud je **Rozestup** prázdný, použije se vlastní rozestup rostlin (vážený jejich podíly); zadejte jeden, aby se použil pro každou rostlinu. **Vzor** může být čtvercový a **Řady pod úhlem** otočí řady.

## Živé ploty

Vyberte rostlinu živého plotu, klikněte na {{ui:Živý plot}}, klikněte podél živého plotu a stiskněte {{key:Enter}}. Rostliny se řadí po čáře v jejich rozestupu, vycentrované tak, aby měly oba konce stejný okraj. Živý plot může být **ve dvou řadách, vystřídaných**, v nastavené vzdálenosti.

## Popisky

Jednotlivé rostliny se označují podle nastavení popisku (ve výchozím stavu `{name}`); vlastní popisek jedné rostliny zadejte ve Vlastnostech. Záhony se označují počtem každé rostliny, živé ploty svým počtem. Více › {{ui:Popisky rostlin}} zapíná a vypíná popisky. Pole popisků: `{name}`, `{botanical}`, `{size}` (kontejner), `{qty}`, `{height}`, `{spread}`, `{container}`.

## Rozpis rostlin

Více › {{ui:Rozpis rostlin…}} spočítá každou rostlinu podle druhu, z jednotlivých rostlin, záhonů a živých plotů dohromady, se svou velikostí při výsadbě. Uložte jej jako **CSV** nebo **XLSX**, nebo **Odeslat do TakeoffCraft**: soubor výměr, který TakeoffCraft otevře a ocení rostliny (vedle něj jsou množství tvrdých povrchů a závlahy).

## IFC

Více › {{ui:Exportovat IFC krajiny}} uloží krajinu jako soubor IFC (IFC 4.3), který může model BIM obsahovat: každá rostlina je `IfcGeographicElement` typu VEGETATION, typovaná podle svého druhu s vlastnostmi rostliny (botanický název, velikosti, mrazuvzdornost, vláha, osvětlení), každý záhon a živý plot jeden prvek se svými počty, na lokalitě. BimCraft jej otevře vedle budovy.
