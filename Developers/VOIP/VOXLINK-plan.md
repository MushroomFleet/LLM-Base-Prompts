# VoxLink - Lightweight P2P-Style Voice Chat for Communities

## Description

VoxLink is a minimal-footprint voice communication application designed for hobbyist communities with members on low-bandwidth mobile connections. It provides secure, real-time voice chat for groups of up to 500 users (typically under 50 active) using a server-mediated Selective Forwarding Unit (SFU) architecture that minimizes bandwidth consumption.

The application prioritizes:
- **Zero telemetry** — No tracking, analytics, or data collection
- **Bandwidth efficiency** — Optimized for slow/metered mobile connections
- **End-to-end encryption** — Protection against casual snooping
- **Simplicity** — Voice-only with minimal UI overhead

The target deployment is an Ubuntu server running Apache2, with browser-based clients requiring no installation.

## Functionality

### Core Features

#### F1: Room Management
- Users can create named voice rooms with optional access codes
- Rooms persist until the last user leaves (ephemeral by default)
- Room creator becomes the initial moderator
- Maximum 50 concurrent speakers per room, unlimited listeners
- Room list displays: room name, user count, locked status

#### F2: Voice Communication
- Push-to-talk (PTT) as primary mode — reduces bandwidth dramatically
- Optional voice activation detection (VAD) for accessibility
- Single active speaker model with queue system for fairness
- Visual indicator shows who is currently speaking
- Configurable PTT key (default: spacebar on desktop, hold button on mobile)

#### F3: User Management
- Pseudonymous identity — users choose a display name on join
- No account registration required
- Moderators can mute or remove users from rooms
- Users can self-mute
- Presence indicators: speaking, muted, idle, away

#### F4: Connection Quality Adaptation
- Automatic bitrate adjustment based on connection quality
- Visual connection quality indicator (3-bar style)
- Graceful degradation: reduces quality before dropping
- Reconnection with exponential backoff on disconnect

#### F5: End-to-End Encryption
- All voice data encrypted client-side before transmission
- Server cannot decrypt audio content
- Key exchange via ECDH (Curve25519)
- Per-room symmetric keys rotated on membership change
- Visual security indicator confirming E2E status

### User Interface

#### Layout Structure
```
┌─────────────────────────────────────────────────────────┐
│  VoxLink                          [Connection: ▮▮▮]    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │              ROOM: AI Fine Tuners               │   │
│  │                   🔒 Encrypted                   │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  PARTICIPANTS (12)                              │   │
│  │                                                 │   │
│  │  🎤 Alex [SPEAKING]                             │   │
│  │  ⏸  Jordan [QUEUED - 1]                         │   │
│  │  ⏸  Sam [QUEUED - 2]                            │   │
│  │  🔇 Riley [MUTED]                               │   │
│  │  ●  Casey                                       │   │
│  │  ●  Morgan                                      │   │
│  │  ...                                            │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │                                                 │   │
│  │         [ 🎤 HOLD TO TALK ]                     │   │
│  │                                                 │   │
│  │    [Mute]    [Leave]    [Settings]             │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

#### Screen: Landing/Lobby
- Application title and tagline
- Input field for display name (required, 2-24 characters, alphanumeric + underscore)
- List of active public rooms with join buttons
- "Create Room" button
- "Join by Code" input field for private rooms

#### Screen: Create Room Modal
- Room name input (required, 3-32 characters)
- Access code input (optional, 4-8 alphanumeric)
- "Public" checkbox (if unchecked, room hidden from lobby)
- "Create" and "Cancel" buttons

#### Screen: Active Room
- Room header: name, encryption indicator, participant count
- Participant list with status icons
- Speaking queue display (if multiple users want to speak)
- Large PTT button (touch-friendly, minimum 80x80px)
- Control bar: mute toggle, leave room, settings
- Connection quality indicator

#### Screen: Settings Panel
- Audio input device selector
- PTT key binding (desktop only)
- VAD toggle with sensitivity slider
- Audio output device selector
- Test audio button (plays back mic input)

### User Interactions

#### Joining a Room
1. User enters display name on landing screen
2. User clicks room from list OR enters access code
3. Browser requests microphone permission
4. Client establishes WebSocket connection for signaling
5. Client performs E2E key exchange with room members
6. Client joins Janus AudioBridge
7. UI transitions to active room view

#### Speaking (Push-to-Talk)
1. User presses and holds PTT button/key
2. If no one speaking: user immediately becomes active speaker
3. If someone speaking: user enters queue, visual feedback shows position
4. When user reaches front of queue and current speaker releases: user becomes active
5. Client transmits encrypted audio while PTT held
6. On release: user leaves speaker slot, next in queue activates

#### Leaving a Room
1. User clicks "Leave" button
2. Confirmation dialog: "Leave this room?"
3. On confirm: client sends leave signal, closes connections
4. UI returns to landing/lobby screen
5. If user was last in room: room is destroyed

### Data Models

#### User
```typescript
interface User {
  id: string;              // UUID v4, generated client-side
  displayName: string;     // 2-24 chars, alphanumeric + underscore
  status: 'active' | 'speaking' | 'muted' | 'away';
  joinedAt: number;        // Unix timestamp ms
  isModerator: boolean;
  connectionQuality: 1 | 2 | 3;  // 1=poor, 2=fair, 3=good
}
```

#### Room
```typescript
interface Room {
  id: string;              // UUID v4
  name: string;            // 3-32 chars
  accessCode: string | null;
  isPublic: boolean;
  createdAt: number;       // Unix timestamp ms
  creatorId: string;       // User.id of creator
  participants: User[];
  speakingQueue: string[]; // Array of User.ids
  currentSpeakerId: string | null;
  e2eKeyFingerprint: string;  // For verification display
}
```

#### SignalingMessage
```typescript
type SignalingMessage = 
  | { type: 'join'; roomId: string; user: User; publicKey: string }
  | { type: 'leave'; roomId: string; userId: string }
  | { type: 'offer'; sdp: string; targetUserId: string }
  | { type: 'answer'; sdp: string; targetUserId: string }
  | { type: 'ice-candidate'; candidate: RTCIceCandidate; targetUserId: string }
  | { type: 'ptt-start'; userId: string }
  | { type: 'ptt-end'; userId: string }
  | { type: 'mute'; userId: string; muted: boolean }
  | { type: 'kick'; targetUserId: string; reason?: string }
  | { type: 'key-exchange'; encryptedKey: string; targetUserId: string }
  | { type: 'room-list'; rooms: Room[] }
  | { type: 'room-update'; room: Room }
  | { type: 'error'; code: string; message: string };
```

### Edge Cases and Error Handling

#### Network Failures
| Scenario | Behavior |
|----------|----------|
| WebSocket disconnects | Show "Reconnecting..." overlay, attempt reconnect with exponential backoff (1s, 2s, 4s, 8s, max 30s), preserve room state |
| Media connection fails | Fall back to relay (TURN), if still fails show error and offer retry |
| Timeout joining room | After 10s, show error: "Could not connect to room. Check your connection." |
| Server unreachable | Show "Server offline" message, retry button |

#### Permission Errors
| Scenario | Behavior |
|----------|----------|
| Microphone denied | Show clear message: "Microphone access required for voice chat. Please allow in browser settings." Link to help. |
| Microphone in use | "Microphone is being used by another application. Please close it and retry." |
| No audio devices | "No microphone detected. Please connect one to use voice chat." |

#### User Conflicts
| Scenario | Behavior |
|----------|----------|
| Duplicate display name in room | Append number: "Alex" → "Alex_2" |
| Room at capacity (50 speakers) | Allow join as listener, show message: "Room full. You can listen but cannot speak until someone leaves." |
| Access code wrong | "Invalid access code. Please check and try again." (no hint about correctness) |
| Kicked from room | Return to lobby, show: "You were removed from the room by a moderator." |

#### Audio Issues
| Scenario | Behavior |
|----------|----------|
| Very low input level | Show warning: "Your microphone volume is very low" with link to settings |
| Sustained clipping | Show warning: "Audio distortion detected. Try moving away from microphone." |
| Echo detected | Auto-enable echo cancellation, notify user |

## Technical Implementation

### Architecture Overview

```
┌──────────────────────────────────────────────────────────────────┐
│                        UBUNTU SERVER                              │
│                                                                   │
│  ┌──────────────────┐      ┌─────────────────────────────────┐   │
│  │     Apache2      │      │         Janus Gateway           │   │
│  │                  │      │                                 │   │
│  │  ┌────────────┐  │      │  ┌───────────────────────────┐ │   │
│  │  │ Web Client │  │      │  │    AudioBridge Plugin     │ │   │
│  │  │  (Static)  │  │      │  │                           │ │   │
│  │  └────────────┘  │      │  │  - Room management        │ │   │
│  │                  │      │  │  - Audio forwarding       │ │   │
│  │  ┌────────────┐  │      │  │  - Participant tracking   │ │   │
│  │  │  Signaling │◄─┼──────┼─►│                           │ │   │
│  │  │   (WSS)    │  │      │  └───────────────────────────┘ │   │
│  │  │  Node.js   │  │      │                                 │   │
│  │  └────────────┘  │      │  Ports: 8088 (HTTP API)        │   │
│  │                  │      │         10000-20000 (RTP/UDP)  │   │
│  │  Port: 443      │      │                                 │   │
│  └──────────────────┘      └─────────────────────────────────┘   │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
                              │
                              ▼
            ┌─────────────────────────────────────┐
            │           CLIENTS                   │
            │                                     │
            │  ┌─────────┐  ┌─────────┐          │
            │  │ Browser │  │ Browser │  ...     │
            │  │ (WebRTC)│  │ (WebRTC)│          │
            │  └─────────┘  └─────────┘          │
            └─────────────────────────────────────┘
```

### Component Specifications

#### 1. Apache2 Web Server
**Purpose:** Serve static web client, reverse proxy for signaling

**Configuration Requirements:**
- HTTPS with Let's Encrypt certificate (required for WebRTC)
- WebSocket proxy to Node.js signaling server
- Gzip compression for static assets
- Cache headers for client assets (1 week)
- Security headers: HSTS, X-Frame-Options, CSP

**Virtual Host Structure:**
```
/var/www/voxlink/
├── index.html
├── app.js
├── app.css
├── lib/
│   ├── janus.js          # Janus client library
│   └── tweetnacl.js      # E2E encryption
└── assets/
    └── icons/
```

#### 2. Signaling Server (Node.js)
**Purpose:** WebSocket server for room coordination and presence

**Dependencies:**
- `ws` — WebSocket server
- `uuid` — ID generation

**Responsibilities:**
- Maintain room registry (in-memory)
- Broadcast participant joins/leaves
- Forward PTT state changes
- Relay E2E key exchange messages
- No persistence — all state ephemeral

**WebSocket Protocol:**
- Path: `wss://domain.com/signaling`
- Ping/pong interval: 30 seconds
- Message format: JSON (SignalingMessage type)

#### 3. Janus Gateway
**Purpose:** WebRTC media server (SFU)

**Plugin:** AudioBridge
- Creates audio rooms mapped to VoxLink rooms
- Forwards audio packets without mixing (SFU mode)
- Handles codec negotiation

**Configuration Highlights:**
```ini
# janus.jcfg
general: {
  configs_folder = "/etc/janus"
  plugins_folder = "/usr/lib/janus/plugins"
  log_to_stdout = true
  debug_level = 4
}

media: {
  rtp_port_range = "10000-20000"
}

nat: {
  stun_server = "stun.l.google.com"
  stun_port = 19302
  ice_lite = true
}
```

**AudioBridge Room Settings:**
```json
{
  "room": 1234,
  "permanent": false,
  "description": "AI Fine Tuners",
  "is_private": false,
  "sampling_rate": 16000,
  "spatial_audio": false,
  "audiolevel_event": true,
  "audio_active_packets": 10,
  "audio_level_average": 65
}
```

#### 4. Web Client
**Purpose:** Browser-based UI and WebRTC client

**Technology Stack:**
- Vanilla JavaScript (no framework — minimize bundle size)
- Single HTML file with embedded CSS/JS for simple deployment
- Janus JavaScript client library
- TweetNaCl.js for E2E encryption

**Audio Configuration:**
```javascript
const audioConstraints = {
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
    sampleRate: 16000,
    channelCount: 1
  },
  video: false
};
```

**Opus Codec Settings:**
```javascript
// SDP munging for bandwidth optimization
const opusParams = {
  maxaveragebitrate: 16000,  // 16 kbps
  maxplaybackrate: 16000,
  stereo: 0,
  sprop_stereo: 0,
  useinbandfec: 1,           // Forward error correction
  usedtx: 1                  // Discontinuous transmission
};
```

### End-to-End Encryption Implementation

#### Key Exchange Flow
```
┌─────────┐                    ┌─────────┐                    ┌─────────┐
│ User A  │                    │ Server  │                    │ User B  │
└────┬────┘                    └────┬────┘                    └────┬────┘
     │                              │                              │
     │  1. Generate keypair         │                              │
     │     (Curve25519)             │                              │
     │                              │                              │
     │  2. Join room + public key   │                              │
     │ ─────────────────────────────►                              │
     │                              │                              │
     │                              │  3. Broadcast to room        │
     │                              │ ─────────────────────────────►
     │                              │                              │
     │                              │  4. User B sends public key  │
     │                              │ ◄─────────────────────────────
     │                              │                              │
     │  5. Receive B's public key   │                              │
     │ ◄─────────────────────────────                              │
     │                              │                              │
     │  6. Derive shared secret     │         6. Derive shared     │
     │     (ECDH)                   │            secret (ECDH)     │
     │                              │                              │
     │  7. Encrypt audio with       │         7. Decrypt audio     │
     │     shared secret            │            with shared       │
     │     (XSalsa20-Poly1305)      │            secret            │
     │                              │                              │
```

#### Encryption Details
- **Key Exchange:** X25519 (Curve25519 ECDH)
- **Symmetric Cipher:** XSalsa20-Poly1305 (NaCl secretbox)
- **Nonce:** 24 bytes, incremented per packet
- **Library:** TweetNaCl.js (audited, minimal)

#### Per-Packet Encryption
```javascript
// Encrypt audio frame before sending
function encryptAudioFrame(frame, sharedKey, nonce) {
  const encrypted = nacl.secretbox(frame, nonce, sharedKey);
  incrementNonce(nonce);
  return encrypted;
}

// Decrypt received audio frame
function decryptAudioFrame(encrypted, sharedKey, nonce) {
  const decrypted = nacl.secretbox.open(encrypted, nonce, sharedKey);
  if (!decrypted) throw new Error('Decryption failed');
  incrementNonce(nonce);
  return decrypted;
}
```

### Bandwidth Optimization Strategies

#### 1. Push-to-Talk Priority
- Default mode: PTT
- No audio transmitted when not speaking
- Reduces typical user bandwidth to near-zero when listening

#### 2. Adaptive Bitrate
```javascript
const bitrateProfiles = {
  high:   { bitrate: 32000, sampleRate: 48000 },  // Good connection
  medium: { bitrate: 16000, sampleRate: 16000 },  // Default
  low:    { bitrate: 8000,  sampleRate: 16000 },  // Poor connection
  critical: { bitrate: 6000, sampleRate: 8000 }   // Very poor
};

// Adjust based on packet loss and RTT
function selectBitrateProfile(stats) {
  if (stats.packetLoss > 10 || stats.rtt > 500) return 'critical';
  if (stats.packetLoss > 5 || stats.rtt > 300) return 'low';
  if (stats.packetLoss > 2 || stats.rtt > 150) return 'medium';
  return 'high';
}
```

#### 3. DTX (Discontinuous Transmission)
- Opus DTX enabled: stops sending during silence
- Reduces bandwidth during pauses in speech

#### 4. Minimal Signaling
- Binary WebSocket frames where possible
- Batched presence updates (every 5 seconds, not per-change)
- No heartbeat during active audio (WebRTC handles keepalive)

### File Structure

```
/var/www/voxlink/
├── index.html              # Single-page application
├── manifest.json           # PWA manifest
├── sw.js                   # Service worker (offline caching)
└── lib/
    ├── janus.js            # Janus client (from janus repo)
    └── tweetnacl.min.js    # Encryption library

/opt/voxlink/
├── signaling/
│   ├── package.json
│   ├── server.js           # WebSocket signaling server
│   └── rooms.js            # Room state management
└── config/
    └── janus/
        ├── janus.jcfg
        ├── janus.plugin.audiobridge.jcfg
        └── janus.transport.http.jcfg

/etc/apache2/sites-available/
└── voxlink.conf            # Apache virtual host

/etc/systemd/system/
├── voxlink-signaling.service
└── janus.service
```

### Deployment Process

#### Prerequisites
- Ubuntu 22.04 LTS or newer
- Domain name with DNS pointing to server
- Ports open: 80, 443, 10000-20000/UDP

#### Installation Steps

1. **System packages:**
```bash
apt update && apt install -y \
  apache2 \
  certbot python3-certbot-apache \
  nodejs npm \
  build-essential libmicrohttpd-dev libjansson-dev \
  libssl-dev libsrtp2-dev libsofia-sip-ua-dev \
  libglib2.0-dev libopus-dev libogg-dev libcurl4-openssl-dev \
  libconfig-dev pkg-config libtool automake
```

2. **Build Janus from source:**
```bash
git clone https://github.com/meetecho/janus-gateway.git
cd janus-gateway
./autogen.sh
./configure --prefix=/opt/janus --disable-websockets --disable-data-channels
make && make install
```

3. **Configure Apache:**
```apache
<VirtualHost *:443>
    ServerName voxlink.example.com
    DocumentRoot /var/www/voxlink
    
    SSLEngine on
    SSLCertificateFile /etc/letsencrypt/live/voxlink.example.com/fullchain.pem
    SSLCertificateKeyFile /etc/letsencrypt/live/voxlink.example.com/privkey.pem
    
    # WebSocket proxy for signaling
    ProxyPass /signaling ws://localhost:8080/
    ProxyPassReverse /signaling ws://localhost:8080/
    
    # Proxy Janus HTTP API
    ProxyPass /janus http://localhost:8088/janus
    ProxyPassReverse /janus http://localhost:8088/janus
    
    # Security headers
    Header always set Strict-Transport-Security "max-age=31536000"
    Header always set X-Frame-Options "DENY"
    Header always set X-Content-Type-Options "nosniff"
    
    # Compression
    AddOutputFilterByType DEFLATE text/html text/css application/javascript
</VirtualHost>
```

4. **Create systemd services**

5. **Deploy web client files**

6. **Obtain SSL certificate:**
```bash
certbot --apache -d voxlink.example.com
```

## Style Guide

### Visual Design Principles
- **Dark theme** — Reduces eye strain during long sessions
- **High contrast** — Accessibility for visual impairments
- **Minimal chrome** — Maximum space for participant list
- **Touch-friendly** — All interactive elements minimum 44x44px

### Color Palette
```css
:root {
  --bg-primary: #1a1a2e;      /* Main background */
  --bg-secondary: #16213e;    /* Cards, panels */
  --bg-elevated: #0f3460;     /* Modals, active states */
  --text-primary: #e8e8e8;    /* Main text */
  --text-secondary: #a0a0a0;  /* Muted text */
  --accent-primary: #4ecca3;  /* Buttons, links, speaking indicator */
  --accent-warning: #ff6b6b;  /* Errors, leave button, kick */
  --accent-info: #74b9ff;     /* Info states, queued */
  --border: #2d2d44;          /* Subtle borders */
}
```

### Typography
- **Font family:** System font stack (no external fonts to load)
- **Base size:** 16px
- **Scale:** 1.25 ratio (14, 16, 20, 25, 31px)
- **Line height:** 1.5 for body, 1.2 for headings

### Component Styles

#### PTT Button
```css
.ptt-button {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: var(--bg-elevated);
  border: 3px solid var(--accent-primary);
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}

.ptt-button:active,
.ptt-button.speaking {
  background: var(--accent-primary);
  color: var(--bg-primary);
  transform: scale(0.95);
  box-shadow: 0 0 30px rgba(78, 204, 163, 0.5);
}

.ptt-button.queued {
  border-color: var(--accent-info);
  animation: pulse 1.5s infinite;
}
```

#### Participant List Item
```css
.participant {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 4px;
}

.participant.speaking {
  background: rgba(78, 204, 163, 0.15);
  border-left: 3px solid var(--accent-primary);
}

.participant-name {
  flex: 1;
  font-size: 16px;
  color: var(--text-primary);
}

.participant-status {
  font-size: 12px;
  color: var(--text-secondary);
  text-transform: uppercase;
}
```

### Icons
Use Unicode symbols for minimal payload:
- 🎤 Speaking
- 🔇 Muted
- ⏸ Queued
- 🔒 Encrypted
- ● Active (online)
- ○ Away

## Testing Scenarios

### T1: Basic Voice Communication
1. Open client in two browsers (or devices)
2. Both join same room
3. User A holds PTT, speaks "Testing 1 2 3"
4. **Expected:** User B hears clear audio with <500ms latency

### T2: Push-to-Talk Queue
1. Three users in room
2. User A holds PTT (speaking)
3. User B holds PTT while A speaking
4. User C holds PTT while A speaking
5. **Expected:** B shows "Queued - 1", C shows "Queued - 2"
6. User A releases PTT
7. **Expected:** B immediately becomes speaker, C shows "Queued - 1"

### T3: Low Bandwidth Simulation
1. Use browser DevTools to throttle to "Slow 3G"
2. Join room and speak
3. **Expected:** Audio quality degrades but remains intelligible, connection indicator shows 1 bar

### T4: Reconnection
1. Join room
2. Disable network adapter for 5 seconds
3. Re-enable network
4. **Expected:** Overlay shows "Reconnecting...", automatically rejoins room within 10 seconds

### T5: E2E Encryption Verification
1. Two users join room
2. Use browser console to inspect sent packets
3. **Expected:** Audio payload is encrypted (not readable PCM/Opus)
4. Both clients show 🔒 indicator

### T6: Room Cleanup
1. Create room, join with 2 users
2. Both users leave
3. Refresh lobby
4. **Expected:** Room no longer appears in list

### T7: Moderator Kick
1. User A creates room (becomes moderator)
2. User B joins
3. User A clicks kick on User B
4. **Expected:** User B returned to lobby with message "You were removed from the room by a moderator"

### T8: Mobile Touch PTT
1. Open on mobile device
2. Touch and hold PTT button
3. Speak while holding
4. Release
5. **Expected:** Audio transmits only while touching, no accidental triggers

## Accessibility Requirements

### A1: Keyboard Navigation
- All interactive elements focusable via Tab
- PTT activatable via spacebar (configurable)
- Escape closes modals
- Arrow keys navigate participant list

### A2: Screen Reader Support
- All buttons have aria-labels
- Live region announces: speaker changes, queue position, errors
- Room list is proper `<ul>` with `<li>` items

### A3: Visual
- Minimum contrast ratio 4.5:1 for text
- Focus indicators visible (3px outline)
- No information conveyed by color alone (icons accompany status colors)

### A4: Motor
- PTT button large (120px diameter)
- VAD mode available as PTT alternative
- No time-limited interactions

### A5: Audio Cues
- Optional audio feedback for: PTT activate/deactivate, becoming speaker, error states
- Configurable in settings

## Performance Goals

### Bandwidth
| Scenario | Target Upload | Target Download |
|----------|---------------|-----------------|
| Listening only | <1 kbps | <20 kbps |
| Speaking (PTT) | <20 kbps | <20 kbps |
| 50 users, 1 speaker | N/A | <25 kbps |

### Latency
- Audio end-to-end: <300ms (good connection), <600ms (poor connection)
- PTT response: <100ms to begin transmitting
- Reconnection: <10 seconds

### Client Resources
- Initial page load: <200KB transferred
- Memory usage: <100MB
- CPU (idle): <5%
- CPU (speaking): <15%

### Server Resources (50 concurrent users)
- CPU: <25% single core
- Memory: <500MB
- Network: <5 Mbps

## Extended Features (Future)

### EF1: Persistent Rooms
- Rooms survive server restart
- SQLite storage for room config
- Configurable by room creator

### EF2: Text Chat Sidebar
- Minimal text chat alongside voice
- No history (ephemeral like voice)
- Useful for sharing links during discussion

### EF3: Recording (Local)
- Client-side recording of room audio
- Download as WebM/Opus
- No server-side recording (privacy)

### EF4: Browser Notifications
- Notification when someone speaks in room you're in (if tabbed away)
- Notification when invited to room

### EF5: Native Mobile Apps
- iOS and Android apps for better background audio
- Same protocol, dedicated UI

---

## Appendix: Protocol Reference

### WebSocket Message Examples

**Join Room:**
```json
{
  "type": "join",
  "roomId": "550e8400-e29b-41d4-a716-446655440000",
  "user": {
    "id": "user-uuid",
    "displayName": "Alex",
    "status": "active"
  },
  "publicKey": "base64-encoded-curve25519-public-key"
}
```

**PTT Start:**
```json
{
  "type": "ptt-start",
  "userId": "user-uuid"
}
```

**Room Update (broadcast):**
```json
{
  "type": "room-update",
  "room": {
    "id": "room-uuid",
    "name": "AI Fine Tuners",
    "participants": [...],
    "currentSpeakerId": "user-uuid",
    "speakingQueue": ["other-user-uuid"]
  }
}
```

---

*TINS Specification v1.0 — This README serves as the complete specification for VoxLink. Any capable LLM should be able to generate a working implementation from this document.*
