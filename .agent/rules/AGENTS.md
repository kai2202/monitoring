# AGENTS.md --- FleetMonitor Engineering Rules

**Purpose:** Define the mandatory engineering, architecture, security,
and data-integrity rules for AI agents working in the FleetMonitor
repository.

These rules apply to changes made by AI agents. Follow the existing
repository conventions unless they conflict with an approved requirement
or a rule in this document. Prefer the smallest correct change over
unnecessary restructuring.

------------------------------------------------------------------------

## 1. Core Principles

1.  **Accuracy first.** Never invent metrics, OIDs, MIBs, error codes,
    API responses, test results, inventory, telemetry, or system
    capabilities. Clearly distinguish verified facts, assumptions, and
    unknowns.
2.  **Verify before claiming.** Do not claim that functionality, tests,
    migrations, or integrations work unless they have been run or
    otherwise verified. Report completed, partial, blocked, and
    unverified work accurately.
3.  **Keep changes focused.** Modify only files relevant to the task.
    Preserve unrelated behavior and avoid unnecessary refactoring,
    dependency upgrades, duplicate implementations, or restructuring.
4.  **Protect data and operations.** Plan schema changes, data
    migrations, file moves, and deletions. Ask for confirmation before
    high-impact or destructive actions when scope, security, data
    integrity, or recovery is unclear.
5.  **Prefer understandable solutions.** Architecture exists to improve
    maintainability. Do not add abstractions, layers, folders, hooks,
    services, or files solely to satisfy a numeric or stylistic rule.

## 2. Documentation and Source of Truth

Before implementation, inspect the relevant documentation, source code,
configuration, dependencies, and tests. Consult the following references
when they exist and are relevant:

1.  `.agent/rules/AGENTS.md`
2.  `docs/Design/00_overview.MD`, `docs/Design/architecture.md`
3.  `docs/Plan/progress.MD`, `docs/Plan/business_requirements.MD`
4.  `docs/Design/ui_navigation_specs.MD`, `docs/Design/UI/`
5.  `docs/Plan/workflow/`, `docs/snmp-oids/`
6.  `docs/Tasks/`, `docs/Tasks/task_template.MD`
7.  `docs/Test/`

Do not assume a missing file is empty or recreate it automatically. Look
for an equivalent source and report material gaps or conflicts.

Use this precedence when sources disagree:

1.  Current, explicit user instructions.
2.  Approved business requirements and architecture decisions.
3.  Current code and reproducible behavior, for describing what the
    system does today.
4.  Existing project documentation.
5.  External references, when needed to verify vendor or technology
    behavior.

Current code is evidence of current implementation; it does not, by
itself, authorize changing an approved requirement. Report conflicts
rather than silently choosing a new design.

## 3. Engineering Workflow

1.  Understand the request, expected behavior, acceptance criteria,
    affected modules, dependencies, and regression risks.
2.  Inspect the existing implementation and follow established
    repository patterns.
3.  Before editing, provide a concise plan of the important files or
    areas to change and how the result will be verified. Skip the plan
    when the user explicitly requests direct execution and the change is
    straightforward.
4.  Implement focused changes with explicit types, predictable data
    flow, and appropriate error handling.
5.  Inspect the diff. Remove accidental changes, temporary artifacts,
    dead code, placeholders, empty handlers, fake success paths, and
    ignored failures.
6.  Run relevant checks and review their actual output. Fix regressions
    introduced by the change.

Do not expand the task scope merely because an adjacent area could also
be refactored.

## 4. Code Quality and Security

-   Handle errors at the appropriate boundary. Never use empty `catch`
    blocks or convert failed requests into apparently valid data.
-   Inspect existing dependencies and project conventions before adding
    a package. Add dependencies only when they provide a clear benefit
    that cannot reasonably be achieved with the current stack.
-   Never hardcode or expose credentials, SNMP community strings,
    database passwords, access tokens, private keys, or production
    environment files.
-   Validate external input and responses. Handle nullable fields and
    keep frontend/backend API contracts aligned.
-   Use strict TypeScript settings where configured. Avoid `any` unless
    there is a documented, justified boundary.
-   Separate presentation, transport, data access, integration code, and
    business rules according to their responsibilities.
-   Never disable authentication, authorization, validation, or other
    security controls merely to make a test pass.
-   Avoid destructive commands and production-data changes unless
    explicitly authorized and the recovery implications are understood.

## 5. FleetMonitor Data Integrity and Monitoring

**Accuracy is more important than visual completeness.**

### 5.1. Data rules

-   Never fabricate printer inventory, telemetry, page counters, supply
    levels, error states, incidents, or collection results.
-   Do not silently replace unavailable backend or Zabbix data with mock
    data. Mock data is allowed only when explicitly requested or in a
    clearly isolated test/development scenario, and must be visibly
    identified as mock data.
-   Treat `MetricValue` as `number | null` where that is the approved
    contract:
    -   A numeric value must have a verified source, meaning, and unit.
    -   `null` represents missing, unavailable, unsupported, invalid, or
        otherwise unusable data. Preserve the reason separately when the
        contract supports it.
    -   Never replace missing or failed values with `0`.
-   Display unavailable values as `—` or `Chưa có dữ liệu`, with a more
    specific explanation when known.
-   Verify units, counter semantics, and vendor/model behavior before
    transforming or comparing metrics.
-   Do not convert binary states into percentages without an approved
    and documented mapping.
-   Do not assume that different printer models or vendors share the
    same OIDs, units, or metric semantics.
-   **Loại trừ các trạng thái thao tác cơ bản tại chỗ:** Trạng thái mở nắp/cửa máy in (cover/door open status) và trạng thái khay giấy/hết giấy (paper empty / tray level status) không cần thu thập hay báo về backend/hệ thống giám sát. Đây là các vấn đề vận hành cơ bản mà nhân viên văn phòng/kỹ thuật tại chỗ sẽ tự kiểm tra và xử lý thủ công (tự nạp giấy, tự đóng cửa máy). Không tạo item, trigger hay báo alert/incident về hệ thống cho 2 nhóm thông tin này.

### 5.2. State separation

Keep these concepts distinct:

-   **Connectivity:** whether communication with the device is currently
    confirmed.
-   **Data freshness:** whether the latest observation is recent enough
    for the intended use.
-   **Metric validity/support:** whether a metric is supported and its
    value is usable.
-   **Technical severity:** the severity of a verified technical signal.
-   **Work state:** the lifecycle state of an incident, task, or work
    order.

An API or Zabbix failure does not prove that a printer is offline. Stale
data does not prove either failure or recovery. A missing alert does not
prove that a device is healthy when monitoring data is stale,
unavailable, or incomplete.

Distinguish unsupported metrics, collection failures, malformed values,
authorization failures, and timeouts wherever the available evidence
permits.

## 6. Hardware Errors, Alerts, and Incidents

Hardware-error detection is a core FleetMonitor priority.

-   Preserve verified original error codes and descriptions, subsystem,
    severity, device/model, source, detection time, and recovery
    details.
-   Never invent an error description or classify an unknown code as a
    confirmed hardware failure.
-   Validate vendor-specific behavior against reliable vendor
    documentation and OID/MIB evidence. Keep vendor/model-specific rules
    isolated and traceable.
-   Distinguish at least:
    -   Consumable conditions.
    -   Recoverable device errors.
    -   Confirmed hardware failures.
    -   Monitoring/collection failures.
    -   User-reported problems that SNMP cannot independently verify.
-   Do not infer scanner or ADF failure from page counters or unrelated
    telemetry.
-   Do not treat the disappearance of an alert or trigger as automatic
    incident resolution.

Keep the following concepts separate:

-   **Alert:** a technical signal detected by monitoring.
-   **Incident:** a tracked problem requiring investigation or
    resolution.
-   **Task / Work Order:** planned or corrective work assigned to a
    person or team.

Incident closure must follow approved lifecycle rules and retain
supporting evidence and a closure reason. Do not add `actionGuidance`
unless an approved requirement or explicit user instruction requests it.

## 7. Frontend Architecture and UI Standards

### 7.1. General principles

-   Follow the repository's existing React, TypeScript, routing,
    state-management, styling, and component conventions.
-   Keep components focused on presentation and UI interaction. Move
    complex or reusable UI state/effects into custom hooks when that
    improves readability or testability.
-   Keep domain/business rules outside presentational components. Place
    them in an appropriate feature service or domain module.
-   Use feature-based organization where it fits the existing
    application. Keep files that change together close to the feature
    they serve.
-   Avoid both oversized components and excessive fragmentation. Split a
    file when it has multiple responsibilities, is difficult to
    understand or test, or contains independently reusable logic---not
    merely because it crosses a line-count threshold.
-   Keep shared modules limited to genuinely reusable code. Do not use
    `shared/` as a dumping ground for feature-specific components.

### 7.2. File and folder organization

The following are **review signals, not hard limits**:

-   Aim for roughly 150--250 lines for many React components, but do not
    split a cohesive file solely to meet this range.
-   Treat files approaching or exceeding 300 lines as a prompt to review
    responsibilities and complexity. A longer file may be justified for
    cohesive types, schemas, generated code, configuration, or tests.
-   When a folder contains roughly 8--10 direct children, consider
    grouping them by business subdomain. Do not create folders merely to
    meet a minimum or maximum item count.
-   Do not require every folder to contain a minimum number of files.
-   Add an `index.ts` public entry point when it provides a meaningful
    module boundary or stable public API. It is not mandatory for every
    folder.
-   Use colocation for components, hooks, types, tests, and styles that
    belong to the same feature.

A feature may use only the directories it needs. For example:

``` text
features/
└── printers/
    ├── components/
    ├── hooks/
    ├── services/
    ├── types/
    ├── routes.tsx
    └── index.ts
```

This is an illustrative structure, not a mandatory template. Do not
create empty or unnecessary directories. A feature needs `routes.tsx`
only when the routing architecture benefits from a feature-owned route
manifest. A feature needs its own state slice or service only when its
responsibilities require one.

### 7.3. Feature boundaries and shared state

-   Do not import another feature's private implementation files through
    deep paths.
-   When one feature needs functionality from another, prefer a
    deliberately exposed public API, shared contract, or an appropriate
    application-level integration.
-   Use RTK Query `providesTags` and `invalidatesTags` to manage
    API-cache consistency where RTK Query is used.
-   Use Redux for state that genuinely needs application-wide or
    cross-component ownership. Do not use the Redux store as a mandatory
    message bus for every feature interaction.
-   Keep local UI state local when it does not need to be shared.
-   Do not introduce a Redux slice, custom hook, service, or route
    manifest just to satisfy a folder template.

### 7.4. Approved frontend technology

Use the versions and packages already approved and present in the
repository. The intended stack includes:

-   **Core:** React 18, TypeScript, Vite.
-   **Routing:** React Router v6, nested routes, and lazy
    loading/Suspense where appropriate.
-   **State and API cache:** Redux Toolkit and RTK Query where required
    by the application.
-   **UI:** Tailwind CSS and the established shadcn/ui tokens and
    primitives.
-   **Forms:** React Hook Form and Zod where form complexity and
    validation needs justify them.
-   **Tables:** `@tanstack/react-table` and `@tanstack/react-virtual`
    for suitable data-table and virtualization use cases.
-   **Notifications:** `sonner` following the existing notification
    conventions.
-   **Icons:** Use the repository-approved FontAwesome system through
    `@/shared/icons`. Do not add or introduce another icon library
    without explicit approval. Never hand-write or approximate custom
    SVG icon paths inside `Frontend/src/shared/icons/`; always
    re-export genuine `IconDefinition` objects directly from
    `@fortawesome/free-solid-svg-icons` (matching the exact semantic
    context, e.g. `faWrench` for maintenance/repair, never broken or
    ambiguous shapes).

Do not interpret this list as a requirement to use every package in
every feature. Do not add a second implementation of an existing
capability. A mock RTK Query base query, if present, must remain
isolated to an explicitly configured test/development mode and must
never conceal production API failures.

### 7.5. UI behavior and Vietnamese terminology

Use consistent, natural Vietnamese for user-facing labels. Prefer the
approved terms:

-   **Danh sách máy in**
-   **Xu hướng sản lượng in**
-   **Mực in và vật tư tiêu hao**
-   **Lỗi phần cứng**
-   **Sự cố**
-   **Cảnh báo**
-   **Dữ liệu đã cũ**

Preserve technical identifiers where needed. Never rely on color alone
to communicate status.

Handle loading, empty, error, stale, unsupported, and partial-data
states. Avoid displaying missing values as zero, unnecessary animation,
layout shifts, duplicate requests, and avoidable re-renders. Ensure
controls work, errors are visible, destructive actions require
confirmation, and accessibility is considered.

## 8. Backend Architecture and API Standards

### 8.1. Responsibility boundaries

Follow the existing backend structure and maintain clear responsibility
boundaries:

1.  **Routes / Transport --- `Backend/src/routes/`:** Define RESTful
    endpoints under `/api/v1/<domain>` and connect middleware to
    controller methods. Do not place business logic in route
    declarations.
2.  **Middlewares --- `Backend/src/middlewares/`:** Handle cross-cutting
    HTTP concerns such as JWT authentication, RBAC authorization, rate
    limiting, upload handling, and request validation/sanitization, as
    applicable.
3.  **Controllers --- `Backend/src/controllers/`:** Act as HTTP
    adapters. Parse and validate request inputs, call services, and map
    results/errors to HTTP responses. Keep controllers focused; avoid
    complex Prisma queries, business transactions, or direct
    Zabbix/MinIO integration calls in controllers.
4.  **Services --- `Backend/src/services/`:** Implement application and
    domain use cases, business rules, orchestration, and transaction
    boundaries. Keep each service cohesive and avoid turning it into a
    catch-all module.

Supporting modules may be introduced when they solve a real
separation-of-concerns problem:

-   **Repositories / data-access modules:** Encapsulate reusable or
    complex database queries when this improves isolation, testability,
    or maintainability. Do not create a repository wrapper for every
    trivial Prisma call by default.
-   **Integrations / adapters:** Encapsulate external systems such as
    Zabbix and MinIO. Services should depend on these adapters rather
    than duplicating external API details across controllers or
    features.
-   **Core / lib / utils / types:** Hold shared infrastructure clients,
    pure utilities, mappers, validators, DTOs, and common types
    according to their actual responsibilities.

This is a pragmatic layered architecture. Do not add layers or
abstractions without a concrete reason.

### 8.2. Domain organization

Group code by domain when the amount or complexity of code makes
grouping useful. Potential domains include:

-   `printer`: printer operations, page-counter rollups, and consumable
    monitoring.
-   `task`: task lifecycle, approvals, and repair-cost calculations.
-   `incident`: incident lifecycle and resolution.
-   `zabbix`: client integration, synchronization, webhook parsing, and
    verified host/device mapping.
-   `storage`: MinIO client and presigned URL operations.
-   `audit`: security audit logs and decision history.

These names describe likely responsibilities, not a mandate to create
every directory. Preserve the current approved mapping rules (for
example, `zabbixHostId -> IP -> serial`) and verify them against the
implementation and documentation before changing them.

### 8.3. Backend implementation rules

-   Controllers should normally remain small (a target below 150 LOC is
    a useful review guideline, not an absolute validity rule).
-   Keep database transaction boundaries in the service/use-case layer
    when they represent business operations.
-   Keep Zabbix and MinIO communication in dedicated integration modules
    or existing approved clients.
-   Validate request DTOs, query parameters, external responses, and
    database write inputs.
-   Return meaningful, consistent API errors. Do not expose secrets,
    stack traces, or internal implementation details to clients.
-   Maintain API contracts and handle timeouts, authentication failures,
    malformed responses, and unavailable dependencies explicitly.
-   Keep vendor-specific monitoring behavior modular and testable.

## 9. Repository Structure, Integrations, and Data Operations

### 9.1. Repository conventions

-   The intended active application workspaces are `Frontend` and
    `Backend`. Verify the actual repository before assuming a path
    exists or creating a workspace.
-   Do not recreate or reference removed legacy directories such as
    `frontend-old` or `backend-old` unless the user explicitly requests
    a migration or recovery.
-   Do not leave arbitrary temporary, debug, or scratch files in the
    repository root. Put temporary work under an existing `scratch/`
    directory or the designated agent scratch location, and remove it
    when no longer needed.
-   Store task documents under `docs/Tasks/` using the existing
    `task_template.MD`, unique IDs, and established module folders when
    the task-documentation workflow applies. Do not create a task
    document for every trivial code change unless the project workflow
    requires it.

### 9.2. Zabbix and storage integrations

-   Use the configured Zabbix API. The frontend must not send SNMP
    requests directly or query internal Zabbix database tables unless
    explicitly authorized.
-   Handle timeouts, authentication errors, malformed responses,
    unavailable services, and data freshness.
-   Avoid uncontrolled retries. Retry only where the operation and
    failure mode make it safe.
-   The documented in-memory cache target is 60 seconds. Verify the
    current implementation and requirements before changing or claiming
    this behavior.
-   Distinguish cache/read failures from printer connectivity failures.
    Mark unconfirmed observations as stale or unavailable rather than
    presenting them as current.
-   Generate MinIO presigned URLs through the approved backend
    integration. Do not expose storage credentials to the frontend.
-   **Phát hiện mã lỗi / OID mới trên Zabbix:** Khi cấu hình Zabbix
    Template cho máy in, sử dụng **SNMP Low-Level Discovery (LLD)**
    trên bảng `prtAlertTable` (`1.3.6.1.2.1.43.18.1.1`) và bật
    `snmptrap.fallback` để hứng các mã lỗi/OID lạ chưa khai báo trước;
    Backend phải giữ nguyên mã/mô tả lỗi gốc nhận từ Zabbix thay vì bỏ
    qua hoặc tự suy đoán.

### 9.3. Database and migrations

-   Review Prisma schema and migration effects before changing database
    structure.
-   Preserve existing records, relationships, and audit history unless
    deletion or transformation is explicitly approved.
-   Use transactions for multi-step writes that must succeed or fail
    together.
-   Verify persisted results before claiming a write or migration
    succeeded.
-   Do not run destructive migrations or production-data operations
    without explicit authorization and a clear recovery plan.

## 10. Testing, Quality Gates, and Handover

### 10.1. Verification

Inspect the repository's actual scripts and workspace configuration
before running commands. Run the relevant checks for the changed areas.
The project's expected quality gates are:

``` bash
npm run lint:arch
npm run typecheck
npm test
```

Run these commands from the correct workspace or repository root
according to the actual package scripts. Do not assume a script exists
or that a root command covers both workspaces.

For a full handover, run all three where they are available and
applicable. Also run focused tests for the changed behavior and
integration tests when the change affects important boundaries such as
Prisma, Zabbix, authentication, or incident lifecycle.

### 10.2. Interpreting results

-   Report the actual command, scope, and result.
-   Distinguish pre-existing failures from regressions introduced by the
    current change when evidence is available.
-   Fix failures caused by the change and all failures within the task
    scope.
-   Do not silently ignore a failing check or modify unrelated code
    merely to force a green result.
-   If a check cannot run because of missing dependencies, environment,
    credentials, services, or unavailable scripts, state the blocker
    explicitly.
-   Never claim 100% pass unless every required check was actually
    executed and passed.

### 10.3. Handover report

For implementation tasks, report:

1.  **Summary:** What changed and why.
2.  **Files changed:** Paths and a brief description. Include LOC when
    useful or required by the task; LOC is informational, not a quality
    score.
3.  **Verification:** Commands actually run and their results, including
    failures or skipped checks.
4.  **Remaining work / limitations:** Known gaps, assumptions, risks,
    and follow-up work.

## 11. Final Mandate

Prioritize accuracy, data integrity, reliability, security,
maintainability, traceability, and honest reporting.

**Architecture must serve the product and its maintainers.** Choose the
simplest design that satisfies approved requirements, keeps
responsibilities clear, protects operational data, and can be tested. Do
not optimize for folder counts, file counts, line counts, or
architectural ceremony at the expense of correct FleetMonitor behavior.
