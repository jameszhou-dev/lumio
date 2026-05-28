# Lumio Backend

Express + PostgreSQL backend that stores business context (menus, hours, FAQs, etc.) and compiles it into system prompts for Vapi voice agents.

## Setup

```bash
# Start Postgres
docker compose up -d

# Install dependencies
npm install

# Copy env and fill in values
cp .env.example .env

# Generate Prisma client and apply schema
npm run db:migrate

# Start dev server
npm run dev
```

Server runs on `http://localhost:3000` by default.

---

## API Reference

Base URL: `http://localhost:3000/api`

All request and response bodies are JSON. Validation errors return `400` with a `details` field. Missing records return `404`.

---

### Health

#### `GET /health`

Returns server status.

**Response `200`**
```json
{
  "status": "ok",
  "timestamp": "2026-05-28T00:00:00.000Z"
}
```

---

### Businesses

#### `POST /businesses`

Create a new business.

**Request body**
| Field | Type | Required | Notes |
|---|---|---|---|
| `name` | string | yes | max 255 chars |
| `description` | string | no | max 1000 chars |
| `phone` | string | no | max 50 chars |

**Response `201`**
```json
{
  "id": "clx...",
  "name": "Joe's Diner",
  "description": "A family diner in downtown.",
  "phone": "555-123-4567",
  "createdAt": "2026-05-28T00:00:00.000Z",
  "updatedAt": "2026-05-28T00:00:00.000Z"
}
```

---

#### `GET /businesses/:id`

Get a business and all of its context items.

**Response `200`**
```json
{
  "id": "clx...",
  "name": "Joe's Diner",
  "description": "A family diner in downtown.",
  "phone": "555-123-4567",
  "createdAt": "2026-05-28T00:00:00.000Z",
  "updatedAt": "2026-05-28T00:00:00.000Z",
  "contexts": [
    {
      "id": "clx...",
      "businessId": "clx...",
      "type": "HOURS",
      "content": "Mon–Fri 8am–9pm, Sat–Sun 9am–10pm",
      "metadata": null,
      "createdAt": "2026-05-28T00:00:00.000Z",
      "updatedAt": "2026-05-28T00:00:00.000Z"
    }
  ]
}
```

---

#### `GET /businesses/:id/system-prompt`

Generate a Vapi-ready system prompt from all stored context for this business. Context is rendered in priority order: **HOURS → MENU → POLICY → FAQ → CALENDAR → OTHER**.

**Response `200`**
```json
{
  "systemPrompt": "You are a voice assistant for Joe's Diner.\n..."
}
```

---

### Contexts

Context items belong to a business and represent a discrete piece of information the voice agent should know.

**`type` values:** `MENU` | `HOURS` | `FAQ` | `CALENDAR` | `POLICY` | `OTHER`

#### `POST /businesses/:id/contexts`

Add a context item to a business.

**Request body**
| Field | Type | Required | Notes |
|---|---|---|---|
| `type` | string | yes | one of the type values above |
| `content` | string | yes | the text the agent will use |
| `metadata` | object | no | arbitrary key/value pairs |

**Response `201`**
```json
{
  "id": "clx...",
  "businessId": "clx...",
  "type": "HOURS",
  "content": "Mon–Fri 8am–9pm, Sat–Sun 9am–10pm",
  "metadata": null,
  "createdAt": "2026-05-28T00:00:00.000Z",
  "updatedAt": "2026-05-28T00:00:00.000Z"
}
```

---

#### `PUT /businesses/:id/contexts/:contextId`

Update a context item. All fields are optional; only provided fields are changed.

**Request body**
| Field | Type | Required |
|---|---|---|
| `type` | string | no |
| `content` | string | no |
| `metadata` | object | no |

**Response `200`** — returns the updated context object.

---

#### `DELETE /businesses/:id/contexts/:contextId`

Delete a context item.

**Response `204`** — no body.

---

## Error Responses

| Status | Cause |
|---|---|
| `400` | Validation failed (see `details`) or foreign key violation |
| `404` | Business or context not found |
| `500` | Unexpected server error |

**Validation error shape**
```json
{
  "error": "Validation failed",
  "details": {
    "name": ["Name is required"]
  }
}
```

**General error shape**
```json
{
  "error": "Record not found"
}
```

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run compiled output |
| `npm run db:migrate` | Generate client and apply migrations |
| `npm run db:generate` | Generate Prisma client only |
| `npm run db:studio` | Open Prisma Studio |
