"""
Simple in-memory rate limiter — no middleware interference.

Why replace slowapi?
  slowapi's middleware intercepts OPTIONS preflight requests and returns 405,
  breaking CORS for credentialed requests. This implementation only runs
  inside the route handler after CORS middleware has already handled OPTIONS.
"""

import time
from collections import defaultdict
from threading import Lock
from fastapi import HTTPException, Request, status


class SimpleRateLimiter:
    """Thread-safe in-memory rate limiter using sliding window."""

    def __init__(self, max_calls: int, window_seconds: int) -> None:
        self.max_calls = max_calls
        self.window = window_seconds
        self._store: dict[str, list[float]] = defaultdict(list)
        self._lock = Lock()

    def check(self, key: str) -> None:
        """
        Raise 429 if the key has exceeded max_calls within the window.
        Called inside the route handler — never touches OPTIONS requests.
        """
        now = time.time()
        with self._lock:
            calls = self._store[key]
            # Remove timestamps outside the window
            self._store[key] = [t for t in calls if now - t < self.window]
            if len(self._store[key]) >= self.max_calls:
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail="Too many login attempts. Please wait and try again.",
                )
            self._store[key].append(now)


# 5 login attempts per minute per IP
login_limiter = SimpleRateLimiter(max_calls=5, window_seconds=60)


def check_login_rate_limit(request: Request) -> None:
    """Call this at the start of the login route handler."""
    client_ip = request.client.host if request.client else "unknown"
    login_limiter.check(client_ip)
