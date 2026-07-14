#!/usr/bin/env bash
# Munro — provision a new customer
# Usage: ./provision.sh <customer-email> <tier> [channel]
#   tier:        solo | business
#   channel:     telegram | imessage | discord | whatsapp (default: telegram)
#
# Required env (set in your shell or .env, never commit):
#   ORGO_API_KEY              — from https://www.orgo.ai/start
#   ORGO_WORKSPACE_ID         — workspace to provision into (must exist; create via POST /api/workspaces once)
#   TELEGRAM_BOT_TOKEN        — when wiring Telegram (optional; can wire later via SSH)
#   MUNRO_OPS_BOT_TOKEN       — Telegram bot token of YOUR ops bot (for the "new customer" DM to you)
#   MUNRO_OPS_CHAT_ID         — Telegram chat ID of YOUR ops DM
#   SUPABASE_URL              — only needed if you want to record the customer (else it'll write to pending_setup.json)
#   SUPABASE_SERVICE_KEY      — service role key, not anon
#
# Notes from the actual Orgo docs (July 2026):
#   - macOS / Mac mini are NOT supported. Orgo serves Linux only.
#     Customer promise on the landing had to soften to "a private cloud
#     computer" not "Apple Silicon Mac mini in the cloud".
#   - Boots in 500ms or under.
#   - The clean install path is via curated templates: pass
#     `template_ref: "system/hermes-agent@1.0.0"` to POST /computers and
#     the box comes up with the Hermes agent pre-installed.
#   - The API base is https://www.orgo.ai/api (NOT api.orgo.ai/v1).
#   - Computers return an `id` AND a stable `instance_id`. We capture
#     both; instance_id is what VNC/terminal URLs use.

set -euo pipefail

CUSTOMER_EMAIL="${1:-}"
TIER="${2:-solo}"
CHANNEL="${3:-telegram}"

if [[ -z "$CUSTOMER_EMAIL" ]]; then
  echo "Usage: $0 <customer-email> <tier> [channel]"
  echo ""
  echo "Example:"
  echo "  $0 julie@example.com solo telegram"
  exit 1
fi

# Sanity: tier enum (the two plans we'll sell via Munro)
case "$TIER" in
  solo|business) ;;
  *) echo "Unknown tier: $TIER (valid: solo, business)"; exit 1 ;;
esac

# Sanity: channel enum
case "$CHANNEL" in
  telegram|imessage|discord|whatsapp) ;;
  *) echo "Unknown channel: $CHANNEL (valid: telegram, imessage, discord, whatsapp)"; exit 1 ;;
esac

# Required env
if [[ -z "${ORGO_API_KEY:-}" ]]; then
  echo "Missing ORGO_API_KEY env var. Get one at https://www.orgo.ai/start"
  exit 1
fi
if [[ -z "${ORGO_WORKSPACE_ID:-}" ]]; then
  echo "Missing ORGO_WORKSPACE_ID. Create one with:"
  echo "  curl -X POST https://www.orgo.ai/api/workspaces \"
  echo "    -H \"Authorization: Bearer \$ORGO_API_KEY\" \"
  echo "    -H \"Content-Type: application/json\" \"
  echo "    -d \"{\\\"name\\\": \\\"munro\\\"}\""
  exit 1
fi

# Tier -> hardware mapping (matches Orgo's cataloged options)
declare -A RAM=([solo]=8 [business]=16)
declare -A CPU=([solo]=2 [business]=4)
declare -A DISK=([solo]=40 [business]=80)

SAFE_NAME=$(echo "$CUSTOMER_EMAIL" | sed 's/[^a-zA-Z0-9]/-/g' | tr '[:upper:]' '[:lower:]')
BOX_NAME="munro-${SAFE_NAME}"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Provisioning Munro for: $CUSTOMER_EMAIL"
echo "  Tier:    $TIER (${CPU[$TIER]}cpu/${RAM[$TIER]}gb/${DISK[$TIER]}gb)"
echo "  Channel: $CHANNEL"
echo "  Box:     $BOX_NAME"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 1. Create the computer using the curated Hermes template.
#    This spins up a Linux box with Hermes pre-installed.
echo ""
echo "→ Step 1: Spinning up Orgo computer from system/hermes-agent@1.0.0..."

ORGO_RESP=$(curl -sS -X POST "https://www.orgo.ai/api/computers" \
  -H "Authorization: Bearer ${ORGO_API_KEY}" \
  -H "Content-Type: application/json" \
  -d "$(printf '{
    "workspace_id": "%s",
    "name": "%s",
    "template_ref": "system/munro-code@1.0.0",
    "ram": %s,
    "cpu": %s,
    "disk_size_gb": %s,
    "auto_stop_minutes": 60
  }' "$ORGO_WORKSPACE_ID" "$BOX_NAME" "${RAM[$TIER]}" "${CPU[$TIER]}" "${DISK[$TIER]}")")

# Capture both ids (id is the computer ref, instance_id is the VM ref)
ORGO_ID=$(echo "$ORGO_RESP" | python3 -c "import sys, json; print(json.load(sys.stdin).get('id',''))")
ORGO_INSTANCE_ID=$(echo "$ORGO_RESP" | python3 -c "import sys, json; print(json.load(sys.stdin).get('instance_id',''))")

if [[ -z "$ORGO_ID" ]]; then
  echo "ERROR: failed to create computer. Orgo response:"
  echo "$ORGO_RESP"
  exit 1
fi

echo "  Computer ID:     $ORGO_ID"
echo "  Instance ID:     $ORGO_INSTANCE_ID"

# 2. Poll status until 'running'
echo ""
echo "→ Step 2: Waiting for box to boot (target <500ms typical, 30s timeout)..."
for i in $(seq 1 30); do
  STATUS=$(curl -sS "https://www.orgo.ai/api/computers/$ORGO_ID" \
    -H "Authorization: Bearer ${ORGO_API_KEY}" \
    | python3 -c "import sys, json; print(json.load(sys.stdin).get('status','unknown'))")
  if [[ "$STATUS" == "running" ]]; then
    echo "  Box is running."
    break
  fi
  sleep 1
done

if [[ "$STATUS" != "running" ]]; then
  echo "ERROR: box did not become running. Last status: $STATUS"
  exit 1
fi

# 3. Channel wiring — each is manual because they all require per-customer
#    tokens (Telegram bot for the customer, iMessage gateway install, etc.)
echo ""
echo "→ Step 3: Channel wiring ($CHANNEL — manual step queued)..."
case "$CHANNEL" in
  telegram)
    if [[ -z "${TELEGRAM_BOT_TOKEN:-}" ]]; then
      echo "  No TELEGRAM_BOT_TOKEN set. SSH in and run:"
      echo "    orgo ssh $BOX_NAME"
      echo "    hermes channels wire telegram --token \"<bot token>\""
    else
      echo "  TELEGRAM_BOT_TOKEN is set — wire inside the box with:"
      echo "    orgo ssh $BOX_NAME -- \\"
      echo "      'hermes channels wire telegram --token \"\$TELEGRAM_BOT_TOKEN\" --customer \"$CUSTOMER_EMAIL\"'"
    fi
    ;;
  imessage)
    echo "  iMessage requires BlueBubbles (https://bluebubbles.app) running inside the box."
    echo "  Manual: ssh in, install, link the customer's Apple ID. Full procedure:"
    echo "    https://docs.bluebubbles.app/installation/"
    ;;
  discord)
    echo "  Discord requires a bot in customer's server. Have them invite it, then:"
    echo "    orgo ssh $BOX_NAME -- 'hermes channels wire discord --customer \"$CUSTOMER_EMAIL\"'"
    ;;
  whatsapp)
    echo "  WhatsApp requires a Twilio sandbox + linked number. After:"
    echo "    orgo ssh $BOX_NAME -- 'hermes channels wire whatsapp --twilio-sid \"X\" --twilio-token \"Y\"'"
    ;;
esac

# 4. Customer record (Supabase REST; falls back to local pending_setup.json)
echo ""
echo "→ Step 4: Saving customer record..."
if [[ -n "${SUPABASE_URL:-}" && -n "${SUPABASE_SERVICE_KEY:-}" ]]; then
  curl -sS -X POST "$SUPABASE_URL/rest/v1/customers" \
    -H "Authorization: Bearer ${SUPABASE_SERVICE_KEY}" \
    -H "apikey: ${SUPABASE_SERVICE_KEY}" \
    -H "Content-Type: application/json" \
    -d "$(printf '{
      "email": "%s",
      "tier": "%s",
      "channel": "%s",
      "orgo_computer_id": "%s",
      "orgo_instance_id": "%s",
      "status": "pending_channel_wiring",
      "created_at": "%s"
    }' "$CUSTOMER_EMAIL" "$TIER" "$CHANNEL" "$ORGO_ID" "$ORGO_INSTANCE_ID" "$(date -u +%Y-%m-%dT%H:%M:%SZ)")" > /dev/null
  echo "  Customer record saved to Supabase."
else
  echo "  No Supabase creds. Saved locally to pending_setup.json:"
  cat >> pending_setup.json <<EOF
{
  "email": "$CUSTOMER_EMAIL",
  "tier": "$TIER",
  "channel": "$CHANNEL",
  "orgo_computer_id": "$ORGO_ID",
  "orgo_instance_id": "$ORGO_INSTANCE_ID",
  "provisioned_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
}
EOF
fi

# 5. DM the operator (you)
echo ""
echo "→ Step 5: Notifying the operator..."
if [[ -n "${MUNRO_OPS_BOT_TOKEN:-}" && -n "${MUNRO_OPS_CHAT_ID:-}" ]]; then
  MSG="New customer! 📦%0A%0A*Email:* $CUSTOMER_EMAIL%0A*Tier:* $TIER%0A*Channel:* $CHANNEL%0A*Computer:* $ORGO_ID%0A*Instance:* $ORGO_INSTANCE_ID%0A%0AComplete the channel wiring, then DM the customer."
  curl -sS "https://api.telegram.org/bot${MUNRO_OPS_BOT_TOKEN}/sendMessage" \
    -d "chat_id=${MUNRO_OPS_CHAT_ID}" \
    -d "text=${MSG}" > /dev/null
  echo "  Notified."
else
  echo "  Set MUNRO_OPS_BOT_TOKEN + MUNRO_OPS_CHAT_ID to get Telegram DM on every new customer."
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✓ Provisioned. Computer ID: $ORGO_ID"
echo "  Next: complete channel wiring, then DM the customer."
echo "  Connect: orgo ssh $BOX_NAME"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
