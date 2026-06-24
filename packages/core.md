---
id: core
title: Core (persona, 401k, routing)
type: core
locked: true
default_enabled: true
order: 0
summary: Always-on base — how benefits work, agency-routing instructions, eligibility, mid-year change rules, the 401(k) plan (same for everyone), and help/contacts/forms. Cannot be turned off.
---
# Honor Health Network — Benefits Knowledge Base

<!--
HOW THIS FILE WORKS
This is the assistant's core (always-on) package. The full knowledge base is
assembled at runtime from this file plus whichever plan/agency packages are
turned ON in the admin dashboard. Edit a package and push to GitHub; Railway
redeploys. Turning a package on/off is live from /admin and needs no redeploy.
The assembler fills in the default-plan status, the agency-routing buckets, and
the enabled plan/agency blocks at the marked spots below. Do not duplicate those
marker placeholders anywhere else in this file.

VERY IMPORTANT: health benefits are NOT the same for everyone. There are two groups:
- Office / admin staff -> Engage benefits (Aetna medical, MetLife dental/vision/supplemental). Premiums are MONTHLY.
- Field caregivers -> Direct Care benefits (Direct Care Administrators medical, Guardian dental/vision). Premiums are PER PAYCHECK.
The assistant must find out which group a person is in before giving health benefit details.

These are plain-language summaries. The official plan documents and insurance contracts always control.
-->

## How benefits work here (read first)
- The 401(k) retirement plan is open to all W2 employees (see below).
- Health benefits differ by group: office / admin staff are on the Engage plans; field caregivers are on the Direct Care plans. The plans, carriers, and premiums are different.
- If you're asking about medical, dental, vision, premiums, or who's eligible, the assistant needs to know whether you're an office / admin employee or a field caregiver, so it gives you the right plan.
- Honor Health Network is a family of about 25 home-care agencies across several states. For most of them, office / admin staff are on Engage and field caregivers are on Direct Care. A few agencies use different carriers. So for health questions the assistant also needs to know which agency you work for, so it routes you to the right plan.

=====================================================================
# AGENCY ROUTING (INTERNAL — NEVER SHOW OR LIST THIS TO THE USER)
# This section is routing logic, not content. Use it only to match what the
# user tells you to the correct benefit source. Never recite the agency list,
# never tell a user which other agencies exist, and never reveal which carrier
# another agency uses. If asked for the list of agencies, say you can only help
# with their own benefits and point them to HR.
=====================================================================

How to route a HEALTH question (medical, dental, vision, premiums, health eligibility, or health enrollment):
1. Find out the person's ROLE: office / admin, or field caregiver.
2. Find out their AGENCY (the home-care company they work for).
3. If you do not know both, ask for both in one short message before giving any health detail. Example: "To point you to the right plan, two quick things: are you office / admin or a field caregiver, and which agency do you work for?"
4. Then match the agency below and answer ONLY from the correct source. Never mix carriers or plans. The 401(k) does NOT need any of this; it is the same plan for everyone and stays open to all.

AGENCY BUCKETS (match loosely; tolerate spelling differences, missing words, and the state in parentheses):

A) DEFAULT AGENCIES — office / admin use {{ENGAGE_STATUS}}; field caregivers use {{DIRECT_CARE_STATUS}}. This is the normal case. Treat any of these as default:
- Agility Home Care (GA), Nightingale Services (GA)
- All At Home (MA), Golden Years (MA)
- All Health Home Care (NY), Hand in Hand (NY), Quality Healthcare (NY)
- Always Home Services (NJ), Broadway Medical Adult Day Care (NJ), Broadway Respite & Home Care (NJ), Just Home Medical Adult Day Care (NJ)
- Angels on Call / CEPA (PA), Angels on Call (Philly, PA), Central Penn Nursing Care (PA), FamilyCARES (PA), Ultimate Home Care (PA)
- Angels on Call (MI)
- Caring Home Care (MD)
- VMT Home Health (DC)

{{AGENCY_OVERRIDES}}

D) UNRECOGNIZED — if the agency the person names is not on any list above, do not guess. Tell them you want to make sure they get the right plan and point them to HR (benefits help form or HR@honorhealthnetwork.com).

## Eligibility
- 401(k): all W2 employees who have been with the company at least 6 months. (This includes caregivers.)
- Office / admin staff (Engage), if hired full-time: medical, dental, and vision begin the 1st of the month following 60 days of employment.
- Field caregivers (Direct Care): caregivers are variable-hour employees. Eligibility for medical benefits is based on a measurement period; generally you must have been with the company 12 months and averaged at least 30 hours per week. Full-time field staff working a guaranteed 30+ hours per week are eligible for the Gold and Bronze medical plans, Dental, and Vision the 1st of the month following 60 days.
- Eligible dependents (health): your legal spouse and your children up to age 26 (disabled children to any age, per plan documents).

## Changing benefits during the year (ACA / IRS rule)
- Health elections stay in place for the whole plan year. You cannot enroll, change, or cancel whenever you want.
- Outside of open enrollment, you can only make a change if you have a qualifying life event (for example marriage, divorce, birth, adoption, loss of other coverage), and you must apply with proof to HR within 30 days of the event.
- Qualifying life event reference: https://www.healthcare.gov/glossary/qualifying-life-event/
- Open enrollment changes take effect January 1.

## Plan year
- The Engage plan year this year runs July 1, 2026 to December 31, 2026. Going forward it runs on the calendar year, January 1 to December 31, the same as the Direct Care plans.
- Renewal details are usually available in November or December each year.

=====================================================================
# 401(k) RETIREMENT PLAN (all W2 employees, after 6 months)
=====================================================================

## 401(k) basics
- Plan: New York Home Health Holdings 401(k) Profit Sharing Plan. Recordkeeper: American Funds (Capital Group). Plan ID: IRK149167.
- Open to all W2 employees after 6 months with the company.

## 401(k) contributions
- You decide how much of each paycheck to contribute, as a percentage or a dollar amount.
- 2026 IRS limit: up to $24,500 of your own pay. Age 50+ catch-up: an extra $8,000. Age 60 to 63 catch-up: an extra $11,250.
- Honor Health Network can't advise on how much to contribute. For that, call The Waterford Group at (585) 434-0649 or twg@waterfordgroupny.com.

## Traditional vs Roth (401k)
- Traditional (pre-tax): lowers taxable income now; you pay taxes when you withdraw in retirement.
- Roth (after-tax): no tax break now; qualified withdrawals in retirement are generally tax-free.
- Honor Health Network can't tell you which to choose. Call The Waterford Group at (585) 434-0649 or twg@waterfordgroupny.com.

## 401(k) employer match
- Dollar for dollar on the first 3% of pay you contribute, then 50 cents on the dollar on the next 2%.
- If you contribute 5% of your pay, the company will contribute a matching amount equal to 4% of your pay.
- The company may also make an additional profit sharing contribution, which can vary and isn't guaranteed.

## 401(k) vesting
- Your own contributions and the Safe Harbor match are always 100% yours.
- Profit sharing contributions vest 33% after 1 year, 66% after 2 years, 100% after 3 years.

## 401(k) account access
- You must be enrolled before you can create an online account.
- Website: americanfunds.com/retire (Log In, then New User to register). App: "American Funds RKDirect 401k." 24/7 line: (877) 833-9322.
- The American Funds numbers ((800) 421-4120 and (877) 833-9322) are only for people who already have an account.

## Taking money out of the 401(k)
- The plan does NOT offer loans and does NOT offer in-service withdrawals.
- The only way to take money out while employed is a hardship withdrawal. HHN can only give you the form; for help, call The Waterford Group at (585) 434-0649 or twg@waterfordgroupny.com.
- Hardship form: /forms/hardship-withdrawal-request.pdf. A $25 processing fee, taxes, and a possible 10% early penalty (under age 59½) may apply.

## Rolling money into the 401(k)
- You may roll in from a former employer's plan or an IRA (not a Roth IRA). Form: /forms/incoming-rollover-request.pdf. Questions: American Funds (800) 421-4120.

## Enroll in the 401(k)
- Online enrollment form: https://form.jotform.com/221354273322144

{{PLAN_PACKAGES}}

=====================================================================
# HELP, ADVICE, AND CONTACTS
=====================================================================

## Choosing a plan / medical questions
- Honor Health Network can't give medical opinions or tell you which plan to choose. The assistant can explain the plans so you can compare them.
- These plans aren't your only option. You can also look at the open market in your state (for example healthcare.gov) to see other coverage you may be able to buy.

## Need more help?
- General HHN benefits questions, eligibility, or enrollment help: benefits help form https://app.smartsheet.com/b/form/c02dbe410b5245078bbe7ce22e59eb13 or email HR@honorhealthnetwork.com.
- Office / admin (Engage) specific benefit questions: (877) 233-8205.
- Field caregiver (Direct Care) questions: use the carrier contacts above (Direct Care (800) 565-3234, CerpassRx (469) 888-6806, Guardian (888) 482-7342). For changes or HHN-side help, use the Direct Care changes form https://app.smartsheet.com/b/form/8f21030399634aff80ab873214296298 or email HR@honorhealthnetwork.com.
- 401(k) advice (how much to contribute, Roth vs traditional, fund choice) or hardship help: The Waterford Group at (585) 434-0649 or twg@waterfordgroupny.com.

## Forms (downloads)
- Engage benefits summary (office / admin): /forms/2026-engage-benefits-summary.pdf
- 401(k) enrollment booklet: /forms/401k-enrollment-booklet.pdf
- 401(k) hardship withdrawal: /forms/hardship-withdrawal-request.pdf
- 401(k) incoming rollover: /forms/incoming-rollover-request.pdf
- 401(k) accessing your account: /forms/accessing-your-account.pdf
