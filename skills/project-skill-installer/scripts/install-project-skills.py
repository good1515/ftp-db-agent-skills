#!/usr/bin/env python3
"""Install every Codex skill found in a GitHub repository into a project."""

from __future__ import annotations

import argparse
import os
from pathlib import Path
import re
import shutil
import tempfile
import urllib.parse
import urllib.request
import zipfile


SKILL_NAME_RE = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
EXCLUDED_DIRS = {".git", "node_modules", "__pycache__", ".venv", "dist", "build"}


def parse_github_url(url: str, ref: str) -> tuple[str, str, str]:
    parsed = urllib.parse.urlparse(url)
    if parsed.scheme != "https" or parsed.netloc.lower() != "github.com":
        raise ValueError("只接受 https://github.com/<owner>/<repo> 格式的網址。")
    parts = [part for part in parsed.path.split("/") if part]
    if len(parts) != 2 or parts[1].endswith(".git"):
        raise ValueError("GitHub 網址必須指向 Repository 根目錄。")
    return parts[0], parts[1], ref


def safe_extract(zip_path: Path, destination: Path) -> Path:
    destination.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(zip_path) as archive:
        root = destination.resolve()
        for member in archive.infolist():
            target = (destination / member.filename).resolve()
            if target != root and root not in target.parents:
                raise ValueError("下載的壓縮檔包含不安全的路徑。")
        archive.extractall(destination)
        top_levels = {member.filename.split("/", 1)[0] for member in archive.infolist() if member.filename}
    if len(top_levels) != 1:
        raise ValueError("GitHub Repository 壓縮檔結構不符合預期。")
    return destination / next(iter(top_levels))


def download_repository(owner: str, repo: str, ref: str, temporary: Path) -> Path:
    url = f"https://codeload.github.com/{owner}/{repo}/zip/{urllib.parse.quote(ref)}"
    zip_path = temporary / "repository.zip"
    request = urllib.request.Request(url, headers={"User-Agent": "project-skill-installer"})
    try:
        with urllib.request.urlopen(request, timeout=60) as response, zip_path.open("wb") as output:
            shutil.copyfileobj(response, output)
    except Exception as exc:
        raise RuntimeError(f"下載 GitHub Repository 失敗：{exc}") from exc
    return safe_extract(zip_path, temporary / "repository")


def discover_skills(repository: Path) -> list[Path]:
    root_skill = repository / "SKILL.md"
    if root_skill.is_file():
        return [repository]

    found: list[Path] = []
    for current, directories, files in os.walk(repository):
        directories[:] = [directory for directory in directories if directory not in EXCLUDED_DIRS]
        if "SKILL.md" in files:
            found.append(Path(current))
    return sorted(found)


def skill_name(skill_directory: Path) -> str:
    frontmatter = skill_directory.joinpath("SKILL.md").read_text(encoding="utf-8")[:4000]
    match = re.search(r"^name:\s*([a-z0-9][a-z0-9-]*)\s*$", frontmatter, re.MULTILINE)
    name = match.group(1) if match else skill_directory.name
    if not SKILL_NAME_RE.fullmatch(name):
        raise ValueError(f"Skill 名稱不符合規範：{name}")
    return name


def install(repository: Path, destination: Path) -> tuple[list[tuple[str, Path]], list[str]]:
    skills = discover_skills(repository)
    if not skills:
        raise ValueError("Repository 內找不到 SKILL.md。")

    destination.mkdir(parents=True, exist_ok=True)
    installed: list[tuple[str, Path]] = []
    skipped: list[str] = []
    for source in skills:
        name = skill_name(source)
        target = destination / name
        if target.exists():
            skipped.append(f"{name}（目標已存在：{target}）")
            continue
        shutil.copytree(source, target)
        installed.append((name, target))
    return installed, skipped


def main() -> int:
    parser = argparse.ArgumentParser(description="將 GitHub Repository 內的 skills 安裝到 Codex、Claude Code 或兩者的目前專案。")
    parser.add_argument("--url", required=True, help="GitHub Repository URL")
    parser.add_argument("--ref", default="main", help="Git ref，預設為 main")
    parser.add_argument(
        "--platform",
        choices=["codex", "claude", "both"],
        default="both",
        help="安裝平台，預設為 both",
    )
    parser.add_argument("--dest", help="Codex 目的地，預設為目前目錄的 skills")
    parser.add_argument("--claude-dest", help="Claude Code 目的地，預設為目前目錄的 .claude/skills")
    args = parser.parse_args()

    try:
        owner, repo, ref = parse_github_url(args.url, args.ref)
        destinations: list[tuple[str, Path]] = []
        if args.platform in ("codex", "both"):
            destinations.append(("Codex", Path(args.dest).resolve() if args.dest else Path.cwd() / "skills"))
        if args.platform in ("claude", "both"):
            destinations.append(("Claude Code", Path(args.claude_dest).resolve() if args.claude_dest else Path.cwd() / ".claude" / "skills"))
        with tempfile.TemporaryDirectory(prefix="project-skill-installer-") as temporary_name:
            repository = download_repository(owner, repo, ref, Path(temporary_name))
            results = [(platform, destination, *install(repository, destination)) for platform, destination in destinations]
    except (OSError, ValueError, RuntimeError) as exc:
        print(f"安裝失敗：{exc}")
        return 1

    for platform, destination, installed, skipped in results:
        print(f"{platform} 安裝目的地：{destination}")
        if installed:
            print("已安裝：")
            for name, target in installed:
                print(f"- {name}: {target}")
        else:
            print("沒有新增 skill。")
        if skipped:
            print("已跳過：")
            for item in skipped:
                print(f"- {item}")
    project_root = Path.cwd().resolve()
    env_path = project_root / ".env"
    print(f"目前專案根目錄：{project_root}")
    print(f"請立即編輯完整設定檔路徑：{env_path}")
    print("請填入 FTP 設定：FTP_HOST、FTP_USER、FTP_PASSWORD、FTP_PORT、FTP_SECURE、FTP_REMOTE_DIR。")
    print("請填入資料庫設定：DB_HOST、DB_PORT、DB_USER、DB_PASS、DB_NAME。")
    print("請勿在對話中貼出帳號密碼或其他敏感設定。")
    print("設定完成後，再確認各 skill 的 SKILL.md 與 agents/openai.yaml。")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
