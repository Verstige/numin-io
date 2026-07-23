# Munroe Chat deployment foundation

This folder runs the first Munroe Chat proof of concept on the audited Open WebUI foundation.

## Licensing

Open WebUI's current license restricts removing or replacing its branding above 50 individual end users in a rolling 30-day period unless written permission or an enterprise branding license is obtained. This deployment intentionally preserves upstream attribution behavior.

Do not remove upstream branding or distribute a broadly white-labeled build until Munroe has written rights. Read [`../docs/MUNROE-CHAT.md`](../docs/MUNROE-CHAT.md) before commercial deployment.

## Start locally

Requirements: Docker Desktop or another Docker Compose-compatible engine.

```bash
cd chat
cp .env.example .env
python3 - <<'PY'
from pathlib import Path
import secrets
p = Path('.env')
s = p.read_text()
s = s.replace('replace-with-a-long-random-secret', secrets.token_urlsafe(48))
p.write_text(s)
PY
# Add the approved OpenAI-compatible endpoint and key to .env if required.
docker compose -f compose.yaml config
docker compose -f compose.yaml up -d
```

Open `http://localhost:3000`.

## Verify

```bash
docker compose -f compose.yaml ps
curl -fsS http://localhost:3000/health
```

The first account created in a clean Open WebUI database becomes the administrator. Public signup is disabled by default in `.env.example`; for initial setup, temporarily enable signup, create the administrator, then disable it and restart.

## Stop

```bash
docker compose -f compose.yaml down
```

Data remains in the `munroe-chat-data` Docker volume. To erase the installation completely, run `docker compose -f compose.yaml down -v` only after taking a backup.

## Architecture rule

Munroe Chat is the visual workspace. Munroe Code is the persistent action runtime. Connect them through an authenticated API/tool connector rather than modifying chat internals to execute unrestricted host commands.
