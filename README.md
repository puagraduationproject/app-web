# app-web

The frontend: the chat-first staff app, the shop pages customers see, and the
landing page.

The design is in [technical-structure.md](https://github.com/puagraduationproject/graduationproject/blob/main/technical-structure.md) (section 17 for the app).
Everything the web shows comes from the backend's tools, described in
[app-backend/contracts](https://github.com/puagraduationproject/app-backend/tree/main/contracts). The web never has its own way into the
data; it calls the same tools the AI uses.

The stack is not chosen yet. Folders hold their pages now.

## Structure

```
app-web/
├── README.md
├── shared/
│   ├── cards/          one component per card: used in windows and in AI answers
│   ├── chat/           message list, streaming, input box, + menu, threads, plan and approval cards
│   ├── layout/         sidebar (by role and packs), side panel for opened cards
│   ├── tools-client/   calls the backend's tools; the only way to the data
│   ├── i18n/           Arabic and English, Arabic first, right to left
│   └── tokens/         colours, spacing, fonts
├── staff/              windows 1 to 12
│   ├── setup/  home/  sales/  orders/  menu-stock/  customers/
│   ├── inbox/  approvals/  settings/                       (term 1)
│   └── team/  marketing/  website-search/                  (term 2)
├── shop/               windows 13 and 14
│   ├── shop-page/      the menu and the chat on one page
│   └── order-status/   stage and ready time, from a link
└── landing/            window 15
```

## Windows (15)

| # | Window | Who | Term |
|:-:|--------|-----|:----:|
| 1 | [Sign up and setup](staff/setup/README.md) | New owner | 1 |
| 2 | [Home: AI chat](staff/home/README.md) | Everyone in the business | 1 |
| 3 | [Sales screen](staff/sales/README.md) | Cashier, barista | 1 |
| 4 | [Orders](staff/orders/README.md) | Staff | 1 |
| 5 | [Menu and stock](staff/menu-stock/README.md) | Manager, owner | 1 |
| 6 | [Customers](staff/customers/README.md) | Manager, owner | 1 |
| 7 | [Inbox](staff/inbox/README.md) | Staff | 1 |
| 8 | [Approvals](staff/approvals/README.md) | Owner, manager | 1 |
| 9 | [Settings](staff/settings/README.md) | Owner | 1 |
| 10 | [Team](staff/team/README.md) | Owner, manager, staff (own shifts) | 2 |
| 11 | [Marketing](staff/marketing/README.md) | Owner | 2 |
| 12 | [Website and search](staff/website-search/README.md) | Owner | 1 basic, 2 full |
| 13 | [Shop page](shop/shop-page/README.md) | Customer | 1 |
| 14 | [Order status](shop/order-status/README.md) | Customer | 1 |
| 15 | [Landing page](landing/README.md) | Shop owners | 1 |

## The layout

```
+-------------------+---------------------------------------------------+
| Café Nile    [v]  |                                                   |
| + New request     |   Good morning, Ahmed. 3 things need you today:   |
|                   |   [card] Milk runs out tomorrow  [Approve PO]     |
| Home (to-do)      |   [card] Cash 50 EGP short, evening shift         |
| Sales screen      |   [card] 2 chats waiting for staff                |
| Orders        4   |                                                   |
| Menu & stock      |   +-------------------------------------------+   |
| Customers         |   | Ask or tell me anything...                |   |
| Inbox         2   |   | [+]                    [Ask first v] [mic]|   |
| Approvals     1   |   +-------------------------------------------+   |
| Recent threads    |                                                   |
| Pinned            |   Opened cards and pages show in a side panel:    |
| Settings          |   the orders board, a recipe, a purchase order.   |
| Ahmed - Owner     |                                                   |
+-------------------+---------------------------------------------------+
```

- The sidebar lists the parts of the business, filtered by role and by the
  packs that are on, plus recent threads and pinned items
- The **+** menu: upload a menu photo or an invoice, quick actions (skills),
  channels
- **Ask first / Act alone** sits where a model picker would be. Routing between
  the model tiers is automatic
- Answers stream: text first, cards when tools return
- The AI answers only with the app's own cards (order, item, stock, customer,
  cash, sales, approval, plan, post); an unknown card shows its plain text
- Arabic right-to-left and mobile from day one

## What each role sees (draft; Security decides)

| Window | Owner | Manager | Staff | Viewer |
|--------|:-----:|:-------:|:-----:|:------:|
| Home: AI chat | all tools | most tools | sales, stock and how-to only | read-only answers |
| Sales screen, Orders | yes | yes | yes | view |
| Menu and stock | yes | yes | stock and waste only | view |
| Customers, Inbox | yes | yes | Inbox only | view |
| Approvals | yes | below the owner's limit | no | no |
| Team | yes | yes | own shifts and tasks | no |
| Marketing, Website and search | yes | if allowed | no | view |
| Settings | yes | no | no | no |

## Rules

1. Every call goes through `shared/tools-client`, to the tools in the contracts
2. The same card component shows in a window and in an AI answer
3. A window or sidebar item shows only when its packs are on and the role allows it
4. Error codes from the backend become words here, in the user's language
5. Arabic right to left and mobile from day one

## Never in this repo

No server information: no IP addresses, server names, hosting providers, test
or deploy addresses, server users, folders, ports or setup, and no keys, tokens
or real settings. The full rule is in the
[project README](https://github.com/puagraduationproject/graduationproject#never-in-any-repo).
If one is pushed by mistake, it is removed from the history.
