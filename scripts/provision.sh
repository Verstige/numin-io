#!/usr/bin/env bash
# Munro — provision a new customer
# Usage: ./provision.sh <customer-email> <tier> [channel]
#   tier:        solo | pro | business | enterprise
#   channel:     telegram | imessage | discord | whatsapp (default: telegram)
#
# Required env (set in your shell or .env, never commit):
#   ORGO_API_KEY     — from app.orgo.ai
#   TELEGRAM_BOT_TOKEN (when wiring telegram)
#   MUNRO_BASE_IMAGE  — pre-baked Hermes OS image name (you create this once on Orgo)

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

# Sanity: tier enum
case "$TIER" in
  solo|pro|business|enterprise) ;;
  *) echo "Unknown tier: $TIER (valid: solo, pro, business, enterprise)"; exit 1 ;;
esac

# Sanity: channel enum
case "$CHANNEL" in
  telegram|imessage|discord|whatsapp) ;;
  *) echo "Unknown channel: $CHANNEL (valid: telegram, imessage, discord, whatsapp)"; exit 1 ;;
esac

if [[ -z "${ORGO_API_KEY:-}" ]]; then
  echo "Missing ORGO_API_KEY env var. Get one at https://app.orgo.ai"
  exit 1
fi

# Sanitize customer email to a hostname-safe name
SAFE_NAME=$(echo "$CUSTOMER_EMAIL" | sed 's/[^a-zA-Z0-9]/-/g' | tr '[:upper:]' '[:lower:]')
BOX_NAME="munro-${SAFE_NAME}"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Provisioning Munro for: $CUSTOMER_EMAIL"
echo "  Tier:    $TIER"
echo "  Channel: $CHANNEL"
echo "  Box:     $BOX_NAME"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 1. Create Orgo box
echo ""
echo "→ Step 1: Creating Orgo box..."
ORGO_RESP=$(curl -sS -X POST "https://api.orgo.ai/v1/computers" \
  -H "Authorization: Bearer $ORGO_API_KEY" \
  -H "Content-Type: application/json" \
  -d "$(printf '{
    "name": "%s",
    "image": "%s",
    "os": "macos",
    "region": "us-east",
    "tags": ["munro", "tier-%s"]
  }' "$BOX_NAME" "${MUNRO_BASE_IMAGE:-munro-base-v1}" "$TIER")")

ORGO_ID=$(echo "$ORGO_RESP" | python3 -c "import sys, json; print(json.load(sys.stdin)['id'])")
ORGO_URL=$(echo "$ORGO_RESP" | python3 -c "import sys, json; print(json.load(sys.stdin)['url'])")

echo "  Orgo box: $ORGO_ID"
echo "  URL: $ORGO_URL"

# 2. Wait for box to come online
echo ""
echo "→ Step 2: Waiting for box to boot..."
for i in $(seq 1 30); do
  STATUS=$(curl -sS "https://api.orgo.ai/v1/computers/$ORGO_ID" \
    -H "Authorization: Bearer $ORGO_API_KEY" | python3 -c "import sys, json; print(json.load(sys.stdin).get('status','unknown'))")
  if [[ "$STATUS" == "running" ]]; then
    echo "  Box is running."
    break
  fi
  sleep 5
done

# 3. Wire channel (Telegram only for now; iMessage/Discord/WhatsApp require
#    local gateway setup per-customer and are handled by hand)
echo ""
echo "→ Step 3: Wiring channel ($CHANNEL)..."
case "$CHANNEL" in
  telegram)
    if [[ -z "${TELEGRAM_BOT_TOKEN:-}" ]]; then
      echo "  No TELEGRAM_BOT_TOKEN set. Skipping channel wire. (Set it later.)"
    else
      echo "  Telegram bot token configured. (Wire step requires Orgo RDP; do manually.)"
    fi
    ;;
  imessage)
    echo "  iMessage requires BlueBubbles gateway on this box. Provisioning guide:"
    echo "    ssh into $ORGO_URL, install BlueBubbles, link your Mac."
    ;;
  discord)
    echo "  Discord: create bot in Discord dev portal, share token, then:"
    echo "    ssh into $ORGO_URL, paste token into .env/hermes."
    ;;
  whatsapp)
    echo "  WhatsApp: set up Twilio sandbox, link number, then:"
    echo "    ssh into $ORGO_URL, paste Twilio creds into .env/hermes."
    ;;
esac

# 4. Save customer record (uses Supabase REST; expects SUPABASE_URL + SUPABASE_SERVICE_KEY)
echo ""
echo "→ Step 4: Saving customer record..."
if [[ -n "${SUPABASE_URL:-}" && -n "${SUPABASE_SERVICE_KEY:-}" ]]; then
  curl -sS -X POST "$SUPABASE_URL/rest/v1/customers" \
    -H "Authorization: Bearer $SUPABASE_SERVICE_KEY" \
    -H "Content-Type: application/json" \
    -H "apikey: $SUPABASE_SERVICE_KEY" \
    -d "$(printf '{
      "email": "%s",
      "tier": "%s",
      "channel": "%s",
      "orgo_box_id": "%s",
      "orgo_box_url": "%s",
      "status": "pending_channel_wiring",
      "created_at": "%s"
    }' "$CUSTOMER_EMAIL" "$TIER" "$CHANNEL" "$ORGO_ID" "$ORGO_URL" "$(date -u +%Y-%m-%dT%H:%M:%SZ)")" > /dev/null
  echo "  Customer record saved."
else
  echo "  Supabase creds missing. Saved to local pending_setup.json instead."
  cat >> pending_setup.json <<EOF
{
  "email": "$CUSTOMER_EMAIL",
  "tier": "$TIER",
  "channel": "$CHANNEL",
  "orgo_box_id": "$ORGO_ID",
  "orgo_box_url": "$ORGO_URL",
  "provisioned_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
}
EOF
fi

# 5. Notify operator (DM via Telegram bot — set MUNRO_OPS_BOT_TOKEN)
echo ""
echo "→ Step 5: Notifying you (the operator)..."
if [[ -n "${MUNRO_OPS_BOT_TOKEN:-}" && -n "${MUNRO_OPS_CHAT_ID:-}" ]]; then
  MSG="New customer! 📦%0A%0A*Email:* $CUSTOMER_EMAIL%0A*Tier:* $TIER%0A*Channel:* $CHANNEL%0A*Box:* $ORGO_ID%0A*URL:* $ORGO_URL%0A%0AManual next step: complete channel wiring."
  curl -sS "https://api.telegram.org/bot$MUNRO_OPS_BOT_TOKEN/sendMessage" \
    -d "chat_id=$MUNRO_OPS_CHAT_ID" \
    -d "text=$MSG" > /dev/null
  echo "  Notified."
else
  echo "  Set MUNRO_OPS_BOT_TOKEN + MUNRO_OPS_CHAT_ID to get Telegram DM on every new customer."
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✓ Done. Next: complete channel wiring, then DM the customer:"
echo "  'Hey! Your Munro is live. Text it at <channel>.'"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
