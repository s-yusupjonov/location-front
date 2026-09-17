# Agrobank — Xodimlar monitoringi

React admin dashboard for tracking Agrobank field employees: live GPS monitoring on Yandex Maps, employee assignment management, reference-data administration and Excel attendance reports.

This repository contains the **complete application** (Part 1 + Part 2). Every user-visible string is Uzbek (Latin script) and centralized in `src/shared/strings.ts`.

## 1. Prerequisites

- Node.js 18 or newer
- npm 9 or newer
- A running instance of the Spring Boot backend (REST + WebSocket) this dashboard consumes
- A Yandex Maps JavaScript API key (https://developer.tech.yandex.ru/)

## 2. Installation

```bash
npm install
```

## 3. `.env` configuration

Copy the example file and fill in your values:

```bash
cp .env.example .env
```

`.env`:

```env
VITE_API_BASE_URL=http://localhost:8082
VITE_WS_URL=ws://localhost:8082/ws
VITE_YANDEX_MAPS_API_KEY=your-yandex-maps-api-key
```

All configuration is read from these Vite environment variables. No backend URL and no API key is hardcoded anywhere in the source.

## 4. Backend URL configuration

`VITE_API_BASE_URL` is the only place the backend origin is defined. It is consumed once, by the shared Axios instance in `src/shared/api/httpClient.ts`, which:

- prefixes every request with the base URL
- attaches the `Authorization: Bearer <token>` header from token storage
- clears the token and redirects to `/login` on `401`

`VITE_WS_URL` is used by `useLiveLocation` for the STOMP live-location subscription.

Components never call Axios directly — all network access goes through feature API modules and TanStack Query hooks.

## 5. Yandex Maps configuration

`VITE_YANDEX_MAPS_API_KEY` is read by `src/shared/map/yandexLoader.ts`, which injects the Yandex Maps JS API script on demand. If the key is missing or invalid, the map surface shows an Uzbek error state instead of failing silently.

Report preview addresses open Yandex Maps in a new tab using the record's own longitude/latitude:

```text
https://yandex.com/maps/?pt={lng},{lat}&z=16&l=map
```

## 6. Development

```bash
npm run dev
```

The app runs on http://localhost:5173.

## 7. Production build

```bash
npm run build
npm run preview
```

`npm run build` runs `tsc -b` (strict type check of every project reference) followed by `vite build`.

## 8. Project architecture

Feature-based structure. Each feature owns its API module, hooks and components; everything cross-cutting lives in `shared/`.

```text
src/
  app/                        App shell, router, theme, layout, global CSS
  features/
    auth/                     Login, token storage, protected/public routes, auth context
    employees/                Xodimlar page, assignment and deactivation
    reference-data/           Ma'lumotnoma CRUD (regions, districts, departments, positions)
    monitoring/               Monitoring page, live tracking, routes and stops
    reports/                  Hisobotlar page, xlsx download, preview adapter
  shared/
    api/                      httpClient (Axios instance), query keys
    components/               EmptyState, ErrorState, LoadingScreen, PageHeader, StatusDot
    hooks/                    useFuzzySearch (shared Fuse.js strategy)
    map/                      Yandex Maps loader and map component
    strings.ts                Every user-visible string (Uzbek, Latin script)
    types/                    API DTOs and UI models
    utils/                    Formatting, date range, file download helpers
```

Conventions:

- one component per file, no code comments
- strict TypeScript, no `any` and no implicit `any`
- TanStack Query owns all server state; mutations invalidate the affected caches
- Fuse.js is never used in a page component — it is wrapped by `useFuzzySearch` and the feature hooks built on it

Data-access hooks:

```text
useEmployees               useRegions            useDistricts
useDepartments             usePositions          useEmployeeAssignment
useEmployeeDeactivation    useEmployeeFuzzySearch
useDepartmentFuzzySearch   useReportDownload     useReportPreview
useEmployeeRoute           useEmployeeStops      useLiveLocation
useEmployeesWithStatus
```

## 9. Implemented pages

### Monitoring

Region selector, fuzzy employee search, online/offline status, date picker, daily route polyline, stop markers with a detail popup, and live location over WebSocket for the current day.

### Xodimlar

Read-only employee table (name, phone, region, district, department, position, status) with Viloyat / Tuman / Departament filters and client-side fuzzy name search.

Name, phone, region and district are owned by the Android application and are not editable here. The only write operations are:

- **Tayinlash** — modal with Departament and Lavozim selects, saved via `PATCH /api/employees/{id}/assignment`
- **Faolsizlantirish** — Uzbek confirmation dialog, then `DELETE /api/employees/{id}`

Both invalidate the employee queries on success and surface Uzbek success/error feedback.

### Ma'lumotnoma

Segmented control over four CRUD sections: Viloyatlar, Tumanlar, Departamentlar, Lavozimlar. Tumanlar is scoped to a region selected above the table. Every section has add / edit / delete with a modal form and a confirmation dialog, plus loading, error and empty states.

### Hisobotlar

Filter card with a `Xodim bo'yicha` / `Departament bo'yicha` segmented control, a fuzzy-searchable employee or department select, and from/to date pickers. One primary action, `Hisobotni yuklab olish`, downloads the `.xlsx` blob as `xodim-{ism}-{from}-{to}.xlsx` or `departament-{nomi}-{from}-{to}.xlsx` (filename parts are sanitized).

Below the card, a preview table shows employee, date, arrival, departure, duration and address. Each address opens Yandex Maps in a new tab with `rel="noopener noreferrer"`.

## 10. API integration overview

| Area | Endpoints |
| --- | --- |
| Auth | `POST /api/auth/login` |
| Regions | `GET/POST/PUT/DELETE /api/regions` |
| Districts | `GET /api/districts?regionId=`, `POST/PUT/DELETE /api/districts` |
| Departments | `GET/POST/PUT/DELETE /api/departments` |
| Positions | `GET/POST/PUT/DELETE /api/positions` |
| Employees | `GET /api/employees?regionId=&districtId=&departmentId=`, `GET /api/employees/{id}`, `PATCH /api/employees/{id}/assignment`, `DELETE /api/employees/{id}` |
| Monitoring | `GET /api/employees/{id}/current-location`, `/route?date=`, `/stops?date=` |
| Reports | `GET /api/reports/employee/{id}?from=&to=`, `GET /api/reports/department/{id}?from=&to=` |
| Live location | STOMP over `VITE_WS_URL` |

### Backend contract notes

1. **`PUT` and `DELETE` on reference-data collections take no path parameter.** As specified, updates send the full entity (including `id`) in the request body, and deletes send `?id={id}` as a query parameter. If the backend expects `/api/regions/{id}` instead, only `src/features/reference-data/api/referenceDataApi.ts` needs to change.

2. **The report endpoints return `.xlsx` only — there is no JSON report endpoint.** The preview is therefore built through an isolated adapter, `src/features/reports/api/reportPreviewAdapter.ts`, which composes the preview rows from the existing stops contract (`GET /api/employees/{id}/stops?date=`) — the same data the Monitoring page already consumes, and the only source in the contract that carries arrival time, departure time, duration, address and coordinates. No records are fabricated: if the source returns nothing for the selected range, the table shows `Bu davr uchun ma'lumot topilmadi.` If the backend later exposes a JSON report endpoint, the adapter is the single file to replace.

3. **Preview volume is capped.** Because the preview is assembled per employee per day, it is limited to 31 days and 150 requests. When the selection exceeds that, an Uzbek warning states that the preview is partial and the full data is in the Excel file. The `.xlsx` download itself is never truncated.

4. **`active` on `EmployeeDto` is optional.** If the backend omits the flag, employees render as `Faol`. Deactivation is performed by `DELETE /api/employees/{id}` as specified.
#   l o c a t i o n - f r o n t  
 