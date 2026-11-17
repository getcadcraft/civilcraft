---
title: Sukatin ang distansya, lawak at slope
summary: Sukatin sa plan sa pamamagitan ng pag-click ng mga punto — ang haba at bearing ng bawat gilid, ang kabuuan, ang haba sa ibabaw ng lupa, ang slope, at ang lawak at perimeter ng saradong hugis — at sa pagitan ng dalawang punto sa profile ng power line.
keywords: sukatin, pagsukat, measure, distansya, haba, lawak, perimeter, bearing, slope, grade, ruler, tape, sa ibabaw ng lupa, profile, pagkakaiba ng taas
from: d614eb25
---

{{ui:Surface}} › {{ui:More}} › {{ui:Sukatin}} (makikita rin sa menu na {{ui:More}} ng Power lines workspace, o pindutin ang {{key:M}}) ay nagsusukat nang hindi nagdaragdag ng anuman sa project.

## Sa plan

1. Piliin ang {{ui:Sukatin}}, saka i-click ang mga punto. Ang click malapit sa survey point ay kumukuha sa lugar at elevation nito.
2. Binabasa ng status line ang bilang ng mga punto at ang kabuuang haba, ang haba at bearing ng huling gilid, ang slope nito kapag alam ang lupa sa magkabilang dulo, at ang haba sa ibabaw ng lupa. Sa tabi ng pointer, ang gilid na iginuguhit at ang kabuuan.
3. I-click muli ang unang punto para isara ang hugis: idinadagdag ng status line ang **lawak** at **perimeter** nito. Ang susunod na click ay magsisimula ng bagong sukat.
4. Tinatapos ng {{key:Enter}} ang sukat at pinananatili ang mga bilang nito sa status line; binabawi ng {{key:Backspace}} ang huling punto; binubura ng {{key:Esc}} ito, at muling {{key:Esc}} ay bumabalik sa {{ui:Piliin}}.

Ang mga haba ay nasa unit ng project at ang mga lawak ay nasa square unit nito. Ang slope at ang haba sa ibabaw ng lupa ay gumagamit ng proposed surface kung mayroon, kung wala ay ang umiiral na lupa; kapag nasa labas ng surface, hindi ito isinasama.

## Sa profile ng power line

Sa [line profile](topic:overhead-line#the-line-profile), ang {{ui:Sukatin}} sa bar ng profile ay nangangailangan ng dalawang click at binabasa ang distansya sa pagitan, ang pagkakaiba ng taas, ang tuwid na distansya at ang slope sa pagitan nila. Ang click malapit sa lupa, sa conductor o sa tuktok ng support ay dumidikit dito. I-click muli ang {{ui:Sukatin}} para huminto.
