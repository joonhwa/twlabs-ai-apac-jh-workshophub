# LATC-11: Employee can register for an available training session

- **Original card:** LATC-2
- **Working card:** LATC-11
- **Status:** In Progress (workflow has no "In Development" status; chosen as the closest equivalent)
- **Type / Priority:** Story / Medium
- **Kicked off:** 2026-11-18 by Joon Hwa Tan

## Description

_Migrated from WH-2_

### Context

Employees can currently browse training sessions (WH-1). The next step is allowing them to register. Registration is the core transactional action of WorkshopHub — it increments the `registered` count on a session and records the employee's details.

This is a **trainee exercise story**. It is not implemented in the baseline template.

### Story

As an employee, I want to register for an available training session so that I can secure my place before it fills up.

An employee submits their name and email to register. The system confirms the registration and shows the updated capacity. If the session is full, the employee cannot register (see WH-3 for the waitlist).

### Out of scope

- Duplicate registration prevention
- Waitlist behaviour when full (WH-3)
- Cancellation (WH-4)
- Email notification (WH-8)
- Authentication or SSO

### Suggested tests

- `POST /api/training-sessions/1/registrations { name, email }` → 201
- `POST /api/training-sessions/1/registrations {}` → 400, missing fields
- `POST /api/training-sessions/999/registrations` → 404
- `POST` when session is full → 409
- `registered` count increments after successful registration

### Notes

- The `Registration` model will need to be added to the Prisma schema. Consider whether `registered` count is stored on the session row or computed from the registrations table.
- Need to consider the race condition when creating a registration and incrementing the count.

## Acceptance criteria

- A register button or form is visible on each session card (or session detail page)
- The employee provides their name and email to register
- On success, the `registered` count increments by 1
- On success, a confirmation message is shown to the employee
- If `registered >= capacity`, the register button is disabled or hidden
- `POST /api/training-sessions/:id/registrations` accepts `{ name, email }` and returns HTTP 201 with registration details
- Returns HTTP 400 if required fields are missing
- Returns HTTP 409 if the session is full (see WH-3 for waitlist)
- Returns HTTP 404 if the session does not exist

## Clarifications

- **Q:** The Jira workflow has no "In Development" transition. Which transition should the working copy use?
  **A:** In Progress.
