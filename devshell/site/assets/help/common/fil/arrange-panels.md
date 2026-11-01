---
title: Ayusin ang mga panel at gumamit ng pangalawang monitor
summary: I-dock ang mga side panel sa kaliwa, kanan o sa ibaba, pagsalansanin sila, pagsamahin bilang tab, i-pin o itago, gawing lumulutang sa ibabaw ng drawing, gawing mas siksik ang layout, piliin kung ilang linya ang gamit ng toolbar, o ilipat sila sa sarili nilang window sa ibang screen.
keywords: panels, dock, float, ilipat ang panel, drag, layout, tabs, tab group, stack, pin, auto-hide, itago ang panel, isara ang panel, compact, density ng layout, siksik, toolbar rows, wrap, 1 row, 2 rows, linya ng toolbar, pangalawang monitor, dalawang screen, dual monitor, maraming monitor, window, pop-up, reset layout
from: 32a8dae2
---

Ang mga panel sa tabi ng drawing ay maaaring ilipat. Ilagay ang mga ito kung saan bagay sa iyo, o bigyan sila ng sariling window sa pangalawang monitor para buo ang una para sa drawing.

:::note
Bawat panel ay may title bar: manipis na bar na may pangalan ng panel, {{ui:⋯}} menu, pin at close button sa itaas ng panel. Ang mga bersyon bago ang 0.7 ay mayroon lamang pangalan at {{ui:⋯}} menu.
:::

## Ilipat ang panel sa window

1. I-drag ang panel gamit ang pangalan nito sa itaas.
2. Habang nagda-drag, may lalabas na naka-outline na bahagi sa kaliwa, kanan at ibaba ng drawing. I-drop ang panel sa isa para i-dock ito doon. Dumidilim ang bahaging nasa ibabaw mo.
3. I-drop ito kahit saan pa sa ibabaw ng drawing para gawin itong lumutang.

Puwedeng magbahagi ng isang gilid ang mga panel: sila ay sinasalansan, at bawat linya sa pagitan ng dalawa ay nada-drag para hatiin ang espasyo (kapag naka-focus ang isang linya, inililipat ito ng arrow keys, at ang double-click dito ay naghahati ng espasyo nang pantay). I-drag ang panloob na gilid ng naka-dock na gilid para gawin itong mas malapad o mas makitid; i-double-click ang gilid para maibalik ito.

Nananatili sa ibabaw ng drawing ang lumulutang na panel. Ilipat ito sa pamamagitan ng pangalan nito, at baguhin ang laki sa pag-drag sa kanang ibabang sulok nito (o mag-tab papunta sa sulok at gamitin ang arrow keys). I-double-click ang pangalan nito para i-dock muli sa dating lugar.

:::touch
I-drag gamit ang isang daliri sa pangalan ng panel. I-drag ang kanang ibabang sulok ng lumulutang na panel gamit ang isang daliri para baguhin ang laki nito, at ganoon din ang gawin sa mga gilid sa pagitan ng naka-dock na panel. Para lumutang o i-dock nang walang pag-drag, gamitin ang {{ui:⋯}} menu.
:::

## Pagsamahin ang mga panel bilang tab

Puwedeng magbahagi ng iisang frame ang dalawang panel at isa lang ang nakikita sa isang pagkakataon. I-drag ang panel sa pamamagitan ng pangalan nito papunta sa title bar ng ibang panel (naka-outline ang bar habang nasa ibabaw ka nito) at bitawan: may tab na ang frame para sa bawat panel, sa title bar nito. I-click ang tab para ipakita ang panel na iyon. Kapag naka-focus ang tab, lumilipat ng tab ang {{key:Left}} at {{key:Right}}, at pumupunta sa una at huli ang {{key:Home}} at {{key:End}}.

Para ilabas ang panel sa grupo, piliin ang {{ui:Move out of the tab group}} sa {{ui:⋯}} menu nito, o i-drag ito sa ibang lugar. Piliin ang {{ui:Tab kasama ang}} at pangalan ng panel para pagsamahin sila nang walang pag-drag.

## I-pin, itago at ibalik

- Ang pin sa title bar ng panel ay ginagawa itong **auto-hide**: aalis ang panel sa dock nito at magiging maliit na tab sa gilid na iyon. Ituro ang tab, i-focus o i-click ito at lalabas ang panel sa ibabaw ng drawing; kapag lumayo ka (o pinindot ang {{key:Esc}}), babalik ito. Pindutin muli ang pin, o piliin ang {{ui:I-unpin}}, para i-dock ito nang tuluyan.
- Ang close button, o ang {{ui:Hide this panel}} sa menu, ay nagtatago ng panel at nagsasara ng dock nito. May tab na may gitling sa gilid na magbabalik nito: i-click ito, o i-focus at pindutin ang {{key:Enter}}.

## Gawing mas siksik ang layout

{{ui:Mga setting}} › {{ui:Pangkalahatan}} › {{ui:Layout density}} ay may dalawang pagpipilian. Ang {{ui:Comfortable}} ang default. Hinihigpitan ng {{ui:Compact}} ang taas ng row, padding ng panel, toolbar button at teksto ng panel ng app na iyon para mas maraming kasya sa screen. Naka-save ito para sa bawat app. Nananatiling malalaki ang button sa touch screen sa parehong opsyon, at sariling layout ang gamit ng phone. Hindi binabago ng {{ui:Reset layout}} ang density na itinakda mo.

## Piliin kung ilang linya ang gamit ng toolbar

{{ui:Mga setting}} › {{ui:Pangkalahatan}} › {{ui:Toolbar rows}} ay may tatlong pagpipilian. Ang {{ui:Wrap}} ang default: lumalabas ang bawat grupo ng tool, sa kung ilang linya man ang kailangan. Pinapanatili ng {{ui:2 rows}} ang toolbar sa dalawang linya at ang {{ui:1 row}} sa isa, para magkaroon ng taas ang drawing; ang mga grupong hindi kasya ay mag-scroll pahalang sa loob ng toolbar (gamitin ang mouse wheel, two-finger swipe, o {{key:Tab}} papunta sa tool). Ang toolbar na kasya na sa dalawang linya ay nananatili ang ayos sa ilalim ng {{ui:2 rows}}, dahil ang grid ay magpapatangkad lang dito. Naka-save ang pinili para sa bawat app. Sariling layout ang gamit ng touch screen at phone. May sariling setting ang CadCraft para sa toolbar nito, sa ilalim ng {{ui:Mga setting}} › {{ui:CadCraft}}.

## Gamitin ang keyboard

Ang {{ui:⋯}} button ng bawat panel ay nagbubukas ng menu: {{ui:Dock on the left}}, {{ui:Dock on the right}}, {{ui:Dock at the bottom}}, {{ui:Float over the drawing}}, {{ui:I-pin sa gilid}}, {{ui:Hide this panel}}, {{ui:Tab kasama ang}} ibang panel, {{ui:Move to a new window}} at {{ui:Put it back}}. Mag-tab papunta sa button, pindutin ang {{key:Enter}}, gumalaw gamit ang arrow keys at pindutin muli ang {{key:Enter}}. Isinasara ng {{key:Esc}} ang menu.

## Ilagay ang mga panel sa pangalawang monitor

1. Piliin ang {{ui:⋯}} sa isang panel, pagkatapos ay {{ui:Move all panels to a new window}}. Puwede mo ring piliin ang {{ui:Move panels to a new window}} sa {{ui:Mga setting}}.
2. May maliit na window na bubukas na may laman na mga panel. I-drag ito sa pangalawang monitor at gawin itong kasing laki ng gusto mo.
3. Magpatuloy sa trabaho: gumagana pa rin ang mga panel sa drawing gaya ng dati, at pumupuno ang drawing sa pangunahing window.

Gumagana pa rin ang mga shortcut habang nasa harap ang panels window: ang mga key na pinindot doon, maliban sa pag-type sa kahon, ay napupunta sa drawing. Ang mga tanong at dialog na itinatanong ng app ay bumubukas pa rin sa pangunahing window, kaya tingnan doon kapag may lumitaw. Sumusunod sa pangunahing window ang tema at laki ng teksto ng panel.

:::chromium
Puwedeng ilagay ng Chrome at Edge ang window sa kabilang screen para sa iyo. Kapag may nakakabit na pangalawang screen, piliin ang {{ui:Put it on my other screen}} sa panels window (o ang {{ui:Put the panels on my other screen}} sa {{ui:⋯}} menu ng panel). Itatanong ng browser minsan kung puwedeng makita ng site na ito ang iyong mga screen; kapag pinayagan mo, bubukas ang panels window sa screen na iyon sa tuwina.
:::

:::firefox safari
I-drag ang panels window sa kabilang monitor nang mag-isa. Doon ito bubukas sa parehong lugar at sa parehong laki sa susunod.
:::

## Higit sa isang panels window

Puwedeng magkaroon ng sariling window ang bawat panel: hanggang apat na panels window, halimbawa isa bawat monitor.

- Sa {{ui:⋯}} menu ng panel, ang {{ui:Move to a new window}} ay nagbubukas ng ibang window para sa panel na iyon, at ang {{ui:Ilipat sa panels window 2}} (at iba pa) ay inililipat ito sa isang bukas na window. Ang pangalawang window ay tinatawag na "panels 2".
- I-drag ang panel sa pangalan nito mula sa isang window papunta sa iba: bitawan sa pangunahing window para i-dock doon (lumalabas ang naka-outline na bahagi habang nasa ibabaw ka nito) o para lumutang, at sa ibang panels window para ilipat doon. Kapag binitawan kahit saan pa, mananatili ito sa dating lugar.
- Ang panels window na wala nang panel ay magsasara nang kusa.

Pagkatapos ng reload, muling iaalok ng app ang iyong mga panels window. Isang window kada click ang binubuksan ng browser, kaya piliin ang {{ui:Buksan ang susunod na isa}} nang isang beses para sa bawat window.

## Ilipat ang dialog

Puwedeng ilipat ang bawat dialog palayo sa drawing: pindutin at i-drag ang title bar nito. Naaalala ng dialog kung saan mo ito iniwan, bawat dialog nang hiwalay, at bumabalik sa lugar na iyon sa susunod na pagbukas. I-double-click ang title bar para ibalik ito sa gitna.

Mula sa keyboard, pindutin ang {{key:Alt}}+{{key:Shift}}+isang arrow key habang nasa loob ng dialog ang focus para ilipat ito ng 16 pixel sa bawat pagkakataon; idagdag ang {{key:Ctrl}} para sa 64. Ibinabalik ang dialog na napunta sa labas ng screen (pagkatapos ng mas maliit na window o screen).

Sa phone, nananatiling buong lapad na sheet ang mga dialog at hindi inililipat.

Sa CadCraft Studio, ang {{ui:Plot sa PDF}} dialog ng CadCraft, na maaari mong iwan nang bukas habang nagtatrabaho, ay may button sa title bar nito: ang {{ui:Open in its own window}}. Lumilipat ang dialog sa sarili nitong window na maaari mong ilagay sa ibang monitor. Ang pagsara sa dialog ay nagsasara sa window, at ang pagsara sa window ay nagsasara sa dialog.

## Ibalik ang mga panel

- Piliin ang {{ui:Put the panels back}} sa panels window, o isara lang ito. Babalik ang mga panel sa dating lugar.
- Ang pagsara o pag-reload ng pangunahing window ay nagsasara rin sa panels window. Kapag muling bumukas ang app, sasabihin nitong nasa sarili nilang window ang iyong mga panel; piliin ang {{ui:Buksan ito}} para ibalik ang window, o ang {{ui:Panatilihin dito}}.
- {{ui:Mga setting}} › {{ui:Pangkalahatan}} › {{ui:Reset layout}} ay ibinabalik ang bawat panel sa lugar kung saan ito nagsimula.

:::tip
Kung walang bumukas kapag inilipat mo ang mga panel sa bagong window, hinarang ng browser ang pop-up. Sinasabi ito ng app at pinananatili ang mga panel sa dating lugar. Payagan ang pop-ups para sa getcadcraft.com, pagkatapos ay subukan ulit.
:::

Naka-save ang layout para sa bawat app sa browser na ito, kasama ng iba mo pang setting.
