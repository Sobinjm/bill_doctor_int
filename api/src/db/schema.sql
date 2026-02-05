CREATE TABLE IF NOT EXISTS workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  state VARCHAR(50) NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS workflow_ctx (
  workflow_id UUID REFERENCES workflows(id) ON DELETE CASCADE,
  context JSONB NOT NULL DEFAULT '{}',
  version INTEGER NOT NULL,
  PRIMARY KEY (workflow_id, version)
);

CREATE TABLE IF NOT EXISTS workflow_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID REFERENCES workflows(id) ON DELETE CASCADE,
  action_key VARCHAR(100) NOT NULL,
  idempotency_key VARCHAR(100) UNIQUE NOT NULL,
  payload JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
