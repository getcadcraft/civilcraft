---
title: Sag နှင့် tension
summary: သင့် load cases (အပူချိန်၊ လေ၊ ရေခဲ) နှင့် tension ကန့်သတ်ချက်များ၊ CivilCraft က section တစ်ခုစီ၏ tension ကို မည်သို့ တွက်သလဲ၊ နှင့် stringing tables။
keywords: sag, tension, load case, temperature, wind, ice, asymmetric ice, ruling span, equivalent span, change of state, catenary, stringing table, breaking strength, everyday stress, ဆွဲတင်, အပူချိန်, လေ, ရေခဲ, sag
from: f8876c35
---

## Load cases နှင့် ကန့်သတ်ချက်များ

{{ui:More}} › {{ui:Load cases and limits…}} သည် project ရှိ လိုင်းတိုင်း လိုက်နာရမည့် စည်းမျဉ်းများကို တည်းဖြတ်သည်။

- **Load cases**: အပူချိန်တစ်ခု၊ conductor ပေါ် လေဖိအား (Pa) တစ်ခု၊ နှင့် radial ရေခဲ (mm၊ ၎င်း၏ သိပ်သည်းဆနှင့်အတူ)။ ပထမ case သည် reference ဖြစ်သည်။
- **Tension limits**: conductor ၏ breaking strength ၏ အစိတ်အပိုင်း၊ horizontal tension ပေါ် သို့မဟုတ် support တစ်ခုရှိ အမြင့်ဆုံး tension ပေါ်၊ load case တစ်ခုတွင်။ သို့မဟုတ် horizontal tension ကို ကိုယ်တိုင် ပေးပါ။
- **Clearances**: conductor က မြေပြင်၊ လမ်း၊ အဆောက်အဦ စသည်တို့အပေါ် ထိန်းထားသော clearance။ ထည့်ပါ၊ အမည်ပြောင်းပါ၊ ဖျက်ပါ: ၎င်းတို့သည် သင့်ကိုယ်ပိုင် ဖြစ်သည်။ ၎င်းတို့အောက်တွင် **Landscape plants under a line**၊ **Landscape walls under a line** နှင့် **Underground crossings** အတွက် စည်းမျဉ်းများကို ရွေးပါ။
- **Cases the checks use**: အပူ (hot) အတွက် အကြီးဆုံး sag ပေးသော case၊ insulator swing (လေ)၊ ရေခဲ၊ နှင့် support တစ်ခု၏ တစ်ဘက်တွင် ရေခဲ။
- **Factors**: phase spacing factor k၊ အကြီးဆုံး insulator swing၊ support နှင့် fitting ဝန်များပေါ် factor၊ angle နှင့် dead-end supports ဖြစ်စေသော လှည့်ထောင့်များ၊ မြှုပ်ထားသော ကေဘယ်များ၏ အနည်းဆုံး cover၊ အကြီးဆုံး voltage drop။

## Packs: နိုင်ငံတစ်ခုအတွက် စည်းမျဉ်းများနှင့် စာကြည့်တိုက်

နိုင်ငံ၏ စည်းမျဉ်းများကို CivilCraft တွင် မတည်ဆောက်ထားပါ။ **pack** သည် စည်းမျဉ်းအစုနှင့် စာကြည့်တိုက်ကို ဖိုင်တစ်ခုတည်း (`.cclinepack.json`) တွင် ထိန်းထားသည်၊ နိုင်ငံ၊ ကွန်ယက် အော်ပရေတာ သို့မဟုတ် ကုမ္ပဏီအတွက်:

- {{ui:Load cases and limits…}} ထဲရှိ **Save as a pack…** သည် ပြထားသော စည်းမျဉ်းအစုနှင့် သင့်စာကြည့်တိုက်ကို ရေးသည် (သို့မဟုတ် သင့်စာကြည့်တိုက်တွင် ဘာမှမရှိသေးပါက ဤ project သုံးသော ပစ္စည်းများ)။ အရင်ဆုံး **Country or region** ကို ရိုက်ပါ။
- **Open a rule set or pack…** သည် pack၊ စည်းမျဉ်းဖိုင် သို့မဟုတ် စာကြည့်တိုက်ဖိုင်ကို ဖတ်သည်။ Pack ၏ စည်းမျဉ်းများကို dialog တွင် ပြသည် (အသုံးပြုရန် **Apply** ကို နှိပ်ပါ) နှင့် ၎င်း၏ ပစ္စည်းများသည် သင့်စာကြည့်တိုက်ထဲ ဝင်သည်။
- အခြားသူများ မျှဝေသော packs များကို add-ons စာမျက်နှာ၏ **Power line packs** အောက်တွင် စာရင်းပြုထားသည်။ Example packs နှစ်ခုသည် format ကို ပြသသည်; ၎င်းတို့သည် နိုင်ငံတစ်ခု၏ စည်းမျဉ်း မဟုတ်ပါ။

Pack တိုင်းကို ဖွင့်သည့်အခါ ဖိုင်အားလုံးကဲ့သို့ စစ်ဆေးသည်။ မတည်ဆောက်မီ သက်ဆိုင်သော စံနှုန်းနှင့် တန်ဖိုးတိုင်းကို စစ်ဆေးပါ။

စတင်ရန် ဥပမာ စည်းမျဉ်းအစုနှစ်ခု ရှိသည်: **Example: cold climate** နှင့် **Example: mild climate**။ ၎င်းတို့၏ နံပါတ်များသည် မည်သည့်စံနှုန်းမှမဟုတ်ပါ: သင့်စံနှုန်းပေးသော တန်ဖိုးများကို သတ်မှတ်ပါ။ {{ui:Save rules}} နှင့် {{ui:Open rules…}} တို့သည် စည်းမျဉ်းအစုကို ဖိုင်အဖြစ် မျှဝေသည်။

## Tension ကို မည်သို့ တွက်သလဲ

ဆွဲတင်ချက်များကြား section တိုင်းအတွက်:

1. **ruling span** သည် ၎င်း၏ spans များ၏ √(ΣL³ ÷ ΣL) ဖြစ်သည်။
2. ကန့်သတ်ချက် တစ်ခုစီကို ruling span ပေါ်ရှိ **change-of-state equation** မှတစ်ဆင့် reference case ရှိ horizontal tension အဖြစ် ပြောင်းသည်: H₂²·(H₂ − H₁ + EA·w₁²L²/(24H₁²) + EA·α·(t₂ − t₁)) = EA·w₂²L²/24။ အကန့်အသတ်အများဆုံးက tension ကို သတ်မှတ်သည်။
3. Load case တိုင်း၏ tension သည် ထိုတစ်ခုမှ လိုက်သည်၊ span တစ်ခုစီ၏ ပုံသဏ္ဍာန်သည် ချိတ်ဆက်ချက် အမှတ်နှစ်ခုကို ဖြတ်သော အတိအကျ **catenary** ဖြစ်သည် (ကုန်းပေါ် spans များ အပါအဝင်): chord မှ sag၊ အရှည်နှင့် အဆုံးတစ်ခုစီရှိ tension။

Case တစ်ခုရှိ မီတာတစ်ခုလျှင် ဝန်: အလေးချိန်နှင့် ရေခဲ (ရေခဲဧရိယာ × သိပ်သည်းဆ × g) ဒေါင်လိုက်; လေဖိအား × ရေခဲပါ ဖုံးအုပ်သော diameter ဒေါင်လိုက်မဟုတ်သော အလျားလိုက်။

## Stringing tables

{{ui:More}} › {{ui:Stringing tables…}} သည် section တိုင်းအတွက် horizontal tension နှင့် rule set ၏ အပူချိန်တိုင်း (စတင်ရန် −5 °C မှ 40 °C အထိ 5 °C ခြားနားချက်) တွင် span တစ်ခုစီ၏ sag ကို လေမရှိသော အခြေအနေတွင် စာရင်းပြုသည်။ ၎င်းတို့ကို သိမ်းပါ၊ supports ဇယားနှင့်အတူ CSV အဖြစ်။

ထည့်မတွက်ထားသည်များ: နှစ်များအတွင်း conductor creep၊ conductor အသစ်၏ ဆန့်ထွက်မှု။ သင်ဆွဲတင်သော အပူချိန်များမှတစ်ဆင့် ၎င်းတို့ကို ထည့်ပါ။
