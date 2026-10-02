# API Contract

> Single source of truth for REST endpoints and Socket.IO events between `veyra-client` and `veyra-server`.

## Base URL

```
REST:   {VITE_API_URL}/api/v1
Socket: {VITE_SOCKET_URL}
```

## Authentication

All authenticated endpoints require a Firebase ID token in the `Authorization` header:
```
Authorization: Bearer <firebase-id-token>
```

## Health & Readiness

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/health` | No | Liveness check — returns `{ status: "ok" }` |
| GET | `/ready` | No | Readiness check — verifies DB connection |

## REST Endpoints

### Auth
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/v1/auth/session` | Yes | Bootstrap session, create user on first login |
| GET | `/api/v1/auth/me` | Yes | Get current user |

### Users
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/v1/users/profile` | Yes | Get profile |
| PATCH | `/api/v1/users/profile` | Yes | Update profile |
| GET | `/api/v1/users/check-username/:username` | Yes | Check availability |
| PATCH | `/api/v1/users/settings` | Yes | Update settings |

### Tasks (Daily)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/v1/tasks` | Yes | List recurring tasks |
| POST | `/api/v1/tasks` | Yes | Create task |
| PATCH | `/api/v1/tasks/:id` | Yes | Update task |
| DELETE | `/api/v1/tasks/:id` | Yes | Delete task |
| POST | `/api/v1/tasks/:id/toggle` | Yes | Toggle today's occurrence |
| GET | `/api/v1/tasks/today` | Yes | Get today's occurrences |

### Weekly Plans
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/v1/weekly/current` | Yes | Current week plan |
| POST | `/api/v1/weekly` | Yes | Create/update weekly plan |
| POST | `/api/v1/weekly/plan` | Yes | Sunday planning submission |

### Monthly Goals
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/v1/monthly/current` | Yes | Current month goals |
| POST | `/api/v1/monthly` | Yes | Create/update monthly plan |
| POST | `/api/v1/monthly/lock` | Yes | Lock month & generate snapshot |

### Gamification
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/v1/gamification/stats` | Yes | XP, level, streaks |
| GET | `/api/v1/gamification/achievements` | Yes | User achievements |

### Friends
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/v1/friends` | Yes | List friends |
| POST | `/api/v1/friends/request` | Yes | Send friend request |
| POST | `/api/v1/friends/respond` | Yes | Accept/reject |
| GET | `/api/v1/friends/:id/progress` | Yes | View friend progress (privacy-filtered) |
| PATCH | `/api/v1/friends/:id/privacy` | Yes | Set privacy level for friend |

### Challenges
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/v1/challenges` | Yes | List challenges |
| POST | `/api/v1/challenges` | Yes | Create challenge |
| POST | `/api/v1/challenges/:id/join` | Yes | Join challenge |
| GET | `/api/v1/challenges/:id` | Yes | Challenge detail + participants |

### Leaderboard
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/v1/leaderboard` | Yes | Global/friends leaderboard |

### Notifications
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/v1/notifications` | Yes | List notifications |
| POST | `/api/v1/notifications/read` | Yes | Mark as read |

### Analytics
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/v1/analytics/daily` | Yes | Daily stats |
| GET | `/api/v1/analytics/weekly` | Yes | Weekly stats |
| GET | `/api/v1/analytics/monthly` | Yes | Monthly stats |
| GET | `/api/v1/analytics/heatmap` | Yes | Calendar heatmap data |

### History
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/v1/history/tree` | Yes | Year/month tree |
| GET | `/api/v1/history/:year/:month` | Yes | Month snapshot |

## Socket.IO Events

### Client → Server
| Event | Payload | Description |
|-------|---------|-------------|
| `task:toggle` | `{ taskId, date }` | Real-time task completion |
| `challenge:update` | `{ challengeId }` | Challenge progress sync |

### Server → Client
| Event | Payload | Description |
|-------|---------|-------------|
| `xp:gained` | `{ amount, total, level }` | XP gain notification |
| `achievement:unlocked` | `{ achievement }` | New achievement |
| `streak:updated` | `{ type, count }` | Streak change |
| `friend:progress` | `{ friendId, stats }` | Friend activity |
| `challenge:progress` | `{ challengeId, participants }` | Challenge leaderboard update |
| `notification:new` | `{ notification }` | New notification |

### Rooms
- `user:{userId}` — Personal notifications
- `challenge:{challengeId}` — Challenge participants

## Error Response Format

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable message",
    "details": []
  }
}
```

## Pagination

Query params: `?page=1&limit=20`

Response includes:
```json
{
  "data": [],
  "meta": { "page": 1, "limit": 20, "total": 100, "totalPages": 5 }
}
```
