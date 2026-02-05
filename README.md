# Bill Doctor Lite (SDUI)

Application to extract the bill details from the bill text and estimate the saved amount when using solar based energy.
A Server-Driven UI (SDUI) application where the backend drives the frontend flow via a Finite State Machine (FSM).


## TECH STACK
- React
- Typescript
- Vite
- Jest
- Node
- Express
- PostgreSQL


## SDUI API Contract

The frontend fetches UI from `GET /v1/workflows/:id/ui` and posts actions to `POST /v1/workflows/:id/actions`.

### Response Structure
```json
{
  "workflow": { "id": "...", "state": "...", "version": 1 },
  "view": {
    "screen": { "title": "...", "subtitle": "..." },
    "components": [
      { "type": "Banner", "props": { ... } },
      { "type": "Form", "props": { ... } }
    ],
    "actions": [ { "key": "SUBMIT", "label": "Submit", "variant": "primary" } ]
  },
  "allowedActions": ["SUBMIT"]
}
```

## Assumptions
- Bill text is passed as a string(not the file upload) in the payload.
- Bill text is assumed to be  `{"charge_per_unit": "18","total_units_used":"150" }`
- Idempotency is enforced via `idempotency_key` in `workflow_events` table.
- Frontend "Form" component handles state locally and sends the payload on action trigger.
- "DRAFT" state is the initial point of entry which triggers generating new workflow.
