#!/usr/bin/env python3
"""Automate Lucky Dice: max dice sum per round; ties -> highest player number (matches challenge.py)."""
import argparse
import os
import re
import sys

from pwn import context, process, remote  # noqa: E402

PLAYER_LINE = re.compile(rb"Player (\d+): ((?:\d+ )*\d+)")


def winner_from_chunk(chunk: bytes) -> str:
    best_p, best_s = -1, -1
    for m in PLAYER_LINE.finditer(chunk):
        p = int(m.group(1))
        s = sum(int(x) for x in m.group(2).split())
        if s > best_s or (s == best_s and p > best_p):
            best_p, best_s = p, s
    if best_p < 0:
        raise ValueError("no Player lines in chunk")
    return str(best_p)


def run(host: str, port: int, local: bool = False) -> None:
    context.log_level = "error"
    if local:
        io = process(
            [sys.executable, "challenge.py"],
            cwd=os.path.dirname(os.path.abspath(__file__)),
        )
        io.timeout = 600
    else:
        io = remote(host, port)
        io.timeout = 120

    io.recvuntil(b"> ")
    io.sendline(b"1")

    for _ in range(100):
        chunk = io.recvuntil(b"Who wins this round?")
        w = winner_from_chunk(chunk)
        io.recvuntil(b"> ")
        io.sendline(w.encode())

    rest = io.recvall(timeout=10)
    sys.stdout.buffer.write(rest)
    if rest:
        sys.stdout.buffer.write(b"\n")


def main() -> None:
    p = argparse.ArgumentParser()
    p.add_argument("--host", default="154.57.164.73")
    p.add_argument("--port", type=int, default=30509)
    p.add_argument("--local", action="store_true", help="Run against local challenge.py")
    args = p.parse_args()
    run(args.host, args.port, local=args.local)


if __name__ == "__main__":
    main()
