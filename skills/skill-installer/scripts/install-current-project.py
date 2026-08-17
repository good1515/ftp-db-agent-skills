#!/usr/bin/env python3
"""Project-local entry point for the one-sentence skill installation flow."""

from pathlib import Path
import runpy


def main() -> None:
    script = Path(__file__).resolve().parent / "install-project-skills.py"
    if not script.is_file():
        raise SystemExit(f"找不到專案安裝器：{script}")
    runpy.run_path(str(script), run_name="__main__")


if __name__ == "__main__":
    main()
