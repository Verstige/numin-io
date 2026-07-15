#!/usr/bin/env node
/**
 * Intent Router Skill
 * Watches conversation, classifies intent, routes to DevControl
 */

const https = require('https');
const http = require('http');

const DEVCONTROL_URL = process.env.DEVCONTROL_URL || 'http://localhost:3000';

// ─── Intent Classification ────────────────────────────────────────────────────

const INTENT_PATTERNS = {
  task: [
    /\bi need to\b/i,
    /\bremind me to\b/i,
    /\bdon't forget to\b/i,
    /\bi should\b/i,
    /\bwe need to\b/i,
    /\bmake sure\b/i,
    /\btodo\b/i,
    /\btask\b/i,
  ],
  calendar: [
    /\bschedule\b/i,
    /\bmeeting\b/i,
    /\bappointment\b/i,
    /\bcall\b.*\bat\b/i,
    /\bmonday\b|\btuesday\b|\bwednesday\b|\bthursday\b|\bfriday\b|\bsaturday\b|\bsunday\b/i,
    /\bat \d{1,2}:\d{2}\b/,
    /\b\d{1,2}pm\b|\b\d{1,2}am\b/i,
    /\bnext week\b|\bthis week\b|\btomorrow\b|\btonight\b/i,
  ],
  project: [
    /\bworking on\b/i,
    /\bthe \w+ project\b/i,
    /\bupdate.*progress\b/i,
    /\bproject status\b/i,
    /\bfinished\b.*\bproject\b/i,
    /\bcompleted\b.*\bproject\b/i,
  ],
  note: [
    /\bremember that\b/i,
    /\bnote:\b/i,
    /\bfor future reference\b/i,
    /\bimportant:\b/i,
    /\bkeep in mind\b/i,
    /\bfyi\b/i,
  ],
  trading: [
    /\bscan\b.*\bus30|\bnas100|\bxauusd/i,
    /\bwatch\b.*\bus30|\bnas100|\bxauusd/i,
    /\blooks bullish\b|\blooks bearish\b/i,
    /\bsetup on\b/i,
  ],
};

function classifyIntent(text) {
  const detected = [];
  
  for (const [intent, patterns] of Object.entries(INTENT_PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(text)) {
        detected.push(intent);
        break; // One match per intent type is enough
      }
    }
  }
  
  return detected.length > 0 ? detected : null;
}

// ─── Extract Details ──────────────────────────────────────────────────────────

function extractTaskDetails(text) {
  // Remove trigger phrases to get clean task
  let title = text
    .replace(/\bi need to\b/i, '')
    .replace(/\bremind me to\b/i, '')
    .replace(/\bdon't forget to\b/i, '')
    .replace(/\bi should\b/i, '')
    .trim();
  
  // Capitalize first letter
  title = title.charAt(0).toUpperCase() + title.slice(1);
  
  return {
    title: title.slice(0, 100), // Limit length
    description: text,
    column: 'todo',
    priority: 'medium',
  };
}

function extractCalendarDetails(text) {
  // Extract time patterns
  const timeMatch = text.match(/at (\d{1,2}):?(\d{2})?\s*(am|pm)?/i);
  const dayMatch = text.match(/(monday|tuesday|wednesday|thursday|friday|saturday|sunday|tomorrow|tonight)/i);
  
  let start = new Date();
  
  if (dayMatch) {
    const day = dayMatch[1].toLowerCase();
    if (day === 'tomorrow') {
      start.setDate(start.getDate() + 1);
    } else if (day === 'tonight') {
      start.setHours(19, 0, 0, 0);
    } else {
      // Map day name to day of week
      const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const targetDay = days.indexOf(day);
      const currentDay = start.getDay();
      const daysUntil = (targetDay - currentDay + 7) % 7;
      start.setDate(start.getDate() + daysUntil);
    }
  }
  
  if (timeMatch) {
    let hours = parseInt(timeMatch[1]);
    const mins = parseInt(timeMatch[2] || '0');
    const ampm = timeMatch[3]?.toLowerCase();
    
    if (ampm === 'pm' && hours < 12) hours += 12;
    if (ampm === 'am' && hours === 12) hours = 0;
    
    start.setHours(hours, mins, 0, 0);
  }
  
  const end = new Date(start);
  end.setHours(end.getHours() + 1);
  
  return {
    title: text.replace(/at \d{1,2}:?\d{2}?\s*(am|pm)?/i, '').trim().slice(0, 100),
    start: start.toISOString(),
    end: end.toISOString(),
  };
}

function extractProjectDetails(text) {
  const projectMatch = text.match(/the (\w+) project/i);
  const name = projectMatch ? projectMatch[1].charAt(0).toUpperCase() + projectMatch[1].slice(1) : 'Project';
  
  const progressMatch = text.match(/(\d+)%/);
  const progress = progressMatch ? parseInt(progressMatch[1]) : null;
  
  const statusMatch = text.match(/\b(active|completed|paused|planning)\b/i);
  const status = statusMatch ? statusMatch[1].toLowerCase() : 'active';
  
  return {
    name,
    status,
    progress,
    description: text,
  };
}

function extractNoteDetails(text) {
  let title = text
    .replace(/\bremember that\b/i, '')
    .replace(/\bnote:\b/i, '')
    .replace(/\bfor future reference\b/i, '')
    .replace(/\bimportant:\b/i, '')
    .trim();
  
  return {
    title: title.slice(0, 80) || 'Note',
    content: text,
    category: 'general',
  };
}

// ─── API Calls ────────────────────────────────────────────────────────────────

async function postToDevControl(endpoint, data) {
  const url = `${DEVCONTROL_URL}/api/${endpoint}`;
  const body = JSON.stringify(data);
  
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    
    const req = client.request(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch {
          resolve({ ok: true, raw: data });
        }
      });
    });
    
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ─── Main Handler ─────────────────────────────────────────────────────────────

async function routeIntent(text) {
  const intents = classifyIntent(text);
  
  if (!intents || intents.length === 0) {
    return { routed: false, reason: 'No intent detected' };
  }
  
  const results = [];
  
  for (const intent of intents) {
    let result;
    
    switch (intent) {
      case 'task': {
        const details = extractTaskDetails(text);
        result = await postToDevControl('tasks', details);
        break;
      }
      case 'calendar': {
        const details = extractCalendarDetails(text);
        result = await postToDevControl('calendar', details);
        break;
      }
      case 'project': {
        const details = extractProjectDetails(text);
        result = await postToDevControl('projects', details);
        break;
      }
      case 'note': {
        const details = extractNoteDetails(text);
        result = await postToDevControl('notes', details);
        break;
      }
      case 'trading': {
        result = await postToDevControl('trading', { signal: text });
        break;
      }
      default:
        result = { skipped: true, reason: 'Unknown intent' };
    }
    
    results.push({ intent, result });
  }
  
  return { routed: true, intents, results };
}

// ─── Export for OpenClaw ──────────────────────────────────────────────────────

module.exports = {
  routeIntent,
  classifyIntent,
};
