---
title: Úprava terénu pro krajinu
summary: Plošiny, valy, průlehy a volné úpravy s bodovými výškami a vrstevnicemi, které přetahujete; výkop a násyp živě; analýza sklonů, šipky toku a zátopy, to vše v navrhovaném povrchu CivilCraftu.
keywords: opěrná zeď, opěrné zdi, svislá strana, zeď místo svahu, sklon na straně, náspy, úprava terénu, plošina, terasa, val, mohyla, průleh, bodová výška, vrstevnice, upravit vrstevnice, výkop a násyp, zemní práce, analýza sklonů, přístupnost, strmé svahy, šipky toku, odvodnění, zátopy, louže
from: e1559eb9
---

Vše zde se upraví do **navrhovaného povrchu** stejnou úpravou jako plošiny a koridory. **Stávající terén** se nikdy nemění a Zemní práce to všechno počítají. Nabídka Úpravy terénu je ve skupině Krajina.

## Plošiny

{{ui:Úpravy terénu}} › {{ui:Plošina}}, pak klikněte na rohy a stiskněte {{key:Enter}}. Plošina začíná na střední výšce terénu pod ní; zadejte **Výšku**, abyste ji nastavili, nebo ji vyprázdněte, aby zase sledovala terén. **Spád** v % a **Spád směrem k** ve stupních (0 = východ, 90 = sever) ji nakloní. Její strany jsou upraveny do terénu při **Sklonu výkopu** a **Sklonu násypu** (vodorovně k 1).

## Sklony podle strany a opěrné zdi

Ve Vlastnostech plošiny, plošiny nebo valu, pod **Strany a opěrné zdi**, může být každá strana upravena svým vlastním způsobem. Strana 1 vede od prvního bodu, na který jste klikli, ke druhému, strana 2 od druhého ke třetímu, a tak dále.

- **Všechny strany**: **Svah** použije výše uvedené sklony výkopu a násypu na každé straně; **Svisle: opěrné zdi** dá zeď na každou stranu.
- Po jednotlivých stranách: **Svahy výše**, **Vlastní svahy** (zadejte sklon výkopu a násypu pro tuto stranu), nebo **Svisle (opěrná zeď)**.
- Sklon zadejte jako `3` nebo `3:1` (vodorovně k 1 svisle), `33%` nebo `18.4°`; zobrazí se jako H:1. Vlastní **Sklon výkopu** a **Sklon násypu** plošiny přijímají totéž.
- Svislá strana nemá násep: opěrná zeď vede podél hrany, od plošiny dolů ke stávajícímu terénu (v násypu), nebo od terénu dolů k plošině (ve výkopu). **Tloušťka zdi** (zpočátku 0.3 m nebo 1 ft) je, jak daleko terén klesá od hrany plošiny ke stávajícímu terénu. Objemy výkopu a násypu vynechají násep, který ta strana už nemá.
- Kde se zeď setká se šikmou stranou, svah se obtočí kolem konce zdi; dvě zdi se setkají v pokosu.
- Pod poli: délka zdí, odkrytá plocha líce (výška × délka), nejvyšší a průměrná výška.

Půdorys kreslí vnější líc každé zdi krátkými značkami napříč a její výšku na obou koncích a v nejvyšším bodě (na vrstvě opěrných zdí, která jde také do DXF a DWG). 3D zobrazení ukazuje zdi jako tělesa (Zobrazit › Opěrné zdi) a exporty GLB, OBJ a USD je zahrnují. Řezy přes hranu ukazují schod.

**Varování** (ve Vlastnostech i v panelu Problémy): zeď vyšší než **Varovat nad výškou zdi** (zpočátku 1.0 m nebo 3.3 ft) „může být potřeba inženýrská zeď nebo povolení; zkontrolujte místní předpisy“ a když zadáte **Nejstrmější svah, který půda udrží**, každá strana, jejíž sklon výkopu nebo násypu je strmější než to. Jsou to varování: úprava se stále postaví. Každá změna je jeden krok pro {{key:Mod+Z}}.

## Valy

{{ui:Úpravy terénu}} › {{ui:Val}}: násep, jehož vrchol je jeho **Výška** nad středním terénem pod ním, s jeho stranami upravenými do terénu.

## Průlehy

{{ui:Úpravy terénu}} › {{ui:Průleh}}, pak klikněte podél průlehu **ve směru, kterým teče voda**, a stiskněte {{key:Enter}}. Nastavte jeho **Hloubku**, **Šířku dna** (0 pro V) a **Sklon strany**. Bez **Spádu** jeho dno sleduje terén, a to ve hloubce pod ním, a nikdy nevede do kopce; zadáte-li spád, dostane rovnoměrný spád od svého začátku.

## Bodové výšky a vrstevnice

1. {{ui:Úpravy terénu}} › {{ui:Plocha úprav}}: klikněte na obrys oblasti, kterou chcete tvarovat.
2. {{ui:Úpravy terénu}} › {{ui:Výšková kóta}}: klikněte dovnitř oblasti. Zadejte její výšku ve Vlastnostech, nebo použijte tlačítka ▲ ▼.
3. {{ui:Úpravy terénu}} › {{ui:Upravit vrstevnici}}: klikněte na vrstevnici uvnitř oblasti, aby se vzala jako čára, kterou můžete přetvarovat.

Vyberte bod nebo vrstevnici a **přetáhněte** je (nebo jejich body) na půdorysu: povrch se přizpůsobí, až pustíte, jako jeden krok zpět. Uvnitř oblasti se terén znovu vytvoří z jejího okraje (kde se setkává se stávajícím terénem), z bodových výšek a upravených vrstevnic.

## Výkop a násyp živě

Ve Vlastnostech každého objektu úpravy jsou vidět jeho **Výkop** a **Násyp** a celkové hodnoty celé lokality, metodou mřížky, kterou používají Zemní práce, a to hned, jak ho měníte. Problémy (mimo povrch, obrys, který protíná sám sebe) jsou tam vypsány.

## Kontroly úprav

V sekci **Kontroly úprav** vlevo:

- **Analýza sklonů** obarvuje povrch podle sklonu: až po mírný limit, mezi, a strmější než strmý limit (zpočátku 5 % a 33.3 %: obvyklé 1:20 pro bezbariérové trasy a 1:3 pro sekání). Legenda říká, kolik plochy spadá do každé skupiny. Strmé plochy se tisknou i na listy.
- **Šipky toku a zátopy** ukážou, kudy voda teče, a označí každé místo, kde by se zatopila, s její hloubkou; sekce říká, kolik je takových míst, které je nejhlubší a kolik vody drží.

Kontroly čtou navrhovaný povrch, je-li něco upraveno, jinak stávající terén.
