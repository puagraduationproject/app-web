# Window 1: Sign up and setup

> From [technical-structure.md](https://github.com/puagraduationproject/graduationproject/blob/main/technical-structure.md) section 17.2. When the design changes, this page changes with it.

| | |
|-|-|
| Who | New owner |
| Term | 1 |
| Shown when | always |

## What is in it

Account, business type, name, language; a menu photo becomes items.

**Built** (`SetupPage.tsx`, team-handoffs FE-003 and ALL-002): one question per
screen, in the person's language (Arabic by default, with a switch at the top):

1. Language
2. What should the AI call you? (only when the account has no name)
3. Business name, with the handle made from it, the shop page address and the
   team log-in (`moe@kafeh-elnil`) shown as they type; **Change** to edit it
4. Kind of business: the ones with a template are marked ready; "Something
   else" asks what they sell
5. Where is it? City and area
6. Done: the shop page address, the three first steps, then Home

Back on every step after the first, Log out on every step. One
`POST /api/app/businesses` at the end, with one retry key for the whole setup.

## Cards it shows

To write, from [contracts/cards](https://github.com/puagraduationproject/app-backend/tree/main/contracts/cards).

## Routes it calls

Only through `shared/tools-client`. Described in
[gateway/doors/app](https://github.com/puagraduationproject/app-backend/tree/main/gateway/doors/app/README.md):
`GET /api/app/setup`, `GET /api/app/names`, `GET /api/app/handles/{handle}`,
`POST /api/app/setup/steps`, `POST /api/app/businesses`, and
`POST /api/auth/language` from the Shell.
