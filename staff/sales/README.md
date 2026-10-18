# Window 3: Sales screen

> From [technical-structure.md](https://github.com/puagraduationproject/graduationproject/blob/main/technical-structure.md) section 17.2. When the design changes, this page changes with it.

| | |
|-|-|
| Who | Cashier, barista |
| Term | 1 |
| Shown when | pack `sales_screen` is on; the shift and cash count need `shifts_cash` |

## What is in it

Big buttons, cart, payment, shift open and close with the cash count.

## Cards it shows

To write, from [contracts/cards](https://github.com/puagraduationproject/app-backend/tree/main/contracts/cards).

## Tools it calls

To write, from [contracts/tools](https://github.com/puagraduationproject/app-backend/tree/main/contracts/tools). Only through `shared/tools-client`.
