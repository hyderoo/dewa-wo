# Dewa Management API (dewa-wo)

Laravel 12 REST API powering the Dewa Management wedding-services platform.
It serves the [dewa-apk Flutter mobile app](https://github.com/hyderoo/dewa-apk)
(final thesis project for a real stakeholder) and an Inertia-based admin panel.

Production base URL used by the app: `https://dewamanagement.com/api/v1`

## Features

What the code implements:

- Token auth with Laravel Sanctum: register, login, logout, profile management, password change, account deletion
- Wedding-date availability: booked dates, monthly availability, single-date checks
- Service catalog and packages, including custom feature selection
- Orders: standard and custom orders, status flow (cancel, complete), order details, per-status listing
- Payments via Midtrans: virtual accounts and bank transfer, payment notification callback, status checks, payment history
- Reviews submitted against completed orders
- Portfolio gallery with categories, team pages, privacy policy and terms management
- Admin panel controllers for managing banks, virtual accounts, catalogs, services, orders, payments, portfolio, team, users, and legal content

## Tech stack

- PHP 8.2, Laravel 12
- Laravel Sanctum (API tokens)
- Inertia.js (admin panel)
- Midtrans PHP SDK (payments)
- Database migrations for all tables (MySQL-compatible)

## API overview

All app endpoints are versioned under `/api/v1`.

Public endpoints (no auth):

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/booked-dates` | Booked wedding dates |
| GET | `/monthly-availability/{year}/{month}` | Availability calendar for a month |
| GET | `/check-date-availability/{date}` | Check one date |
| POST | `/register`, `/login` | Account creation and login |
| GET | `/catalogs`, `/services`, `/portfolios`, `/team` | Catalog, services, portfolio, team browsing |
| GET | `/privacy-policy`, `/terms-conditions` | Legal content |
| POST | `/payments/notification` | Midtrans payment callback |
| GET | `/reviews`, `/banks`, `/va` | Public reviews, bank and VA lists |

Protected endpoints (`auth:sanctum`):

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET/PUT/DELETE | `/profile` | Profile read, update, delete account |
| PUT | `/profile/password` | Change password |
| POST | `/logout` | Revoke token |
| GET/POST | `/orders`, `/orders/custom` | Create and list orders |
| GET/PUT | `/orders/{id}`, `/orders/{id}/cancel`, `/orders/{id}/complete` | Order detail and status changes |
| POST | `/orders/{id}/review` | Submit a review |
| POST | `/payments/virtual-account`, `/payments/bank-transfer` | Create payments |
| GET | `/payments/order/{orderId}`, `/payments/history/{orderId}`, `/payments/{id}/status` | Payment details and status |

Example - login:

```bash
curl -X POST https://dewamanagement.com/api/v1/login \
  -H "Accept: application/json" \
  -d "email=user@example.com" -d "password=secret"
```

Then call protected endpoints with `Authorization: Bearer <token>`.

## Setup

```bash
composer install
cp .env.example .env
php artisan key:generate
# configure DB_* and Midtrans keys in .env
php artisan migrate
php artisan serve
```

Required environment values: database credentials, `MIDTRANS_SERVER_KEY`,
`MIDTRANS_CLIENT_KEY`, and the Midtrans production/sandbox flag.

## Known limitations

- No automated test suite in this repo yet.
- API documentation is this README; there is no generated OpenAPI spec.
