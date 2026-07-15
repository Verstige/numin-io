name: "Intent Router"
version: "1.0.0"
description: "Watches conversation, classifies intent, auto-routes items to DevControl (tasks, calendar, projects, notes)"
about: |
  Watches every message in the conversation and classifies the user's intent.
  When it detects a task, calendar event, project update, or note, it automatically
  pushes it to the DevControl API for live UI updates.

  Intent types:
  - task: "I need to...", "Remind me to...", "Don't forget to..."
  - calendar: "Schedule...", "Meeting at...", "Friday at 2pm..."
  - project: "Working on...", "The X project needs...", "Update progress on..."
  - note: "Remember that...", "Note: ...", "For future reference..."
  - trading: "Scan US30", "XAUUSD looks bullish", "Watch NAS100"

triggers:
  - "I need to"
  - "Remind me"
  - "Don't forget"
  - "Schedule"
  - "Meeting"
  - "Working on"
  - "Remember that"
  - "Note:"
