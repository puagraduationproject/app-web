# Window 2: Home: AI chat

> From [technical-structure.md](https://github.com/puagraduationproject/graduationproject/blob/main/technical-structure.md) section 17.2. When the design changes, this page changes with it.

| | |
|-|-|
| Who | Everyone in the business |
| Term | 1 |
| Shown when | always |

## What is in it

Briefing cards, the chat, threads, side panel.

**For now** `HomePage.tsx` is a stand-in, so that the business setup ends on
Home (`/home`) and not on My account (team-handoffs ALL-002 3.1). It greets the
person and links to My account. The setup's first-step buttons open
`/home?start=menu_photo`, `add_product` or `connect_telegram`; the real Home
(FE-004) starts that step in the chat.

## Cards it shows

To write, from [contracts/cards](https://github.com/puagraduationproject/app-backend/tree/main/contracts/cards).

## Tools it calls

To write, from [contracts/tools](https://github.com/puagraduationproject/app-backend/tree/main/contracts/tools). Only through `shared/tools-client`.
