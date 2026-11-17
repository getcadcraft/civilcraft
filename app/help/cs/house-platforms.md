---
title: Domovní plošiny na svažitých pozemcích
summary: Vyrovnejte plošinu na svahu: opěrné zdi jako hrany plošiny, mapa výkopu a násypu stínovaná podle hloubky s bodovými výškami (v půdorysu i ve 3D), řez kreslený kdekoli přes terén a návrh a rampy nebo skloněné plošiny pro příjezdové cesty.
keywords: plošina, podložka, domovní plošina, svažitý pozemek, svah, opěrná zeď, výkop a násyp, mapa výkopu a násypu, bodové výšky, volný řez, čára řezu, výkresy pro úřad, příjezdová cesta, rampa, skloněná plošina, úprava, koeficient nabobtnání, zemní práce
from: daa08a3f
---

Domovní plošina je **plošina** (**Návrh** › {{ui:Plošina}}): rovný mnohoúhelník v jedné výšce, vyrovnaný do terénu. Na svahu pomohou čtyři věci.

## Opěrné zdi jako hrany plošiny

Vyberte plošinu a nastavte stranu na {{ui:Svisle (opěrná zeď)}} místo svahu (**Vlastnosti** › {{ui:Strany a opěrné zdi}}, nebo {{ui:Svisle: opěrné zdi}} pro všechny strany najednou). Výška zdi se čte z terénu podél ní: vrchol na terénu, spodek na plošině, zobrazeno na obou koncích a v nejvyšším bodě na půdorysu, s varováním, je-li vyšší než limit, který jste nastavili. Zdi a svahy lze kombinovat vedle sebe.

## Mapa výkopu a násypu

Zaškrtněte {{ui:Mapa výkopu a násypu}} v **Zobrazit**. Půdorys je stínován podle hloubky výkopu nebo násypu v rovnoměrných krocích (výkop teplý, násyp modrý, téměř rovné bledé) s legendou, a **bodové výšky** jsou vytištěny na plošině: změna výšky v bodech mřížky, a nejhlubší výkop a nejvyšší násyp označené ▲. Buňky jsou stejné, jaké používají objemy zemních prací, takže mapa a čísla se vždy shodují.

Ve 3D zobrazení vyberte **Výkop a násyp** ze seznamu barev, aby se stejné barvy přenesly na terén a návrh.

Koeficient nabobtnání nebo smrštění je v nástroji {{ui:Hmotnostní bilance}} (**Návrh** › {{ui:Hmotnostní bilance}}); na objemy plošiny se neuplatňuje.

## Volný řez

V **Povrch** › {{ui:Více}} vyberte {{ui:Volný řez}}, klikněte na body čáry řezu kdekoli (může se lámat) a stiskněte {{key:Enter}}. Dialog nakreslí řez: stávající terén, upravený návrh (čárkovaně) a výkop a násyp mezi nimi, stínované, s jejich plochami (návrh se počítá jen uvnitř plošin a silnic). {{ui:Svislé převýšení}} je ve výchozím stavu nastaveno tak, aby se vešlo do výkresu; {{ui:Uložit jako SVG}} a {{ui:Uložit jako CSV}} vám dají výkres pro úřad a čísla.

## Rampy a skloněné plošiny

V **Povrch** › {{ui:Více}} vyberte {{ui:Rampa nebo skloněná plošina}}, klikněte na nízký konec a pak na vysoký, stiskněte {{key:Enter}} a zadejte šířku, výšku na nízkém konci a sklon. Plošina je pás, jehož rohy nesou tyto výšky (hrana mezi dvěma rohy běží při stálém sklonu), a vyrovnává se do terénu jako každá plošina. Rohy libovolné plošiny mohou mít také vlastní výšky, takže příjezdová cesta, rampa nebo nakloněná terasa je plošina s výškou v každém rohu.
