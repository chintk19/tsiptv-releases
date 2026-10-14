"""Refresh the desktop download links in public/releases.json from GitHub Releases.

The installers are Releases of the public repo chintk19/tsiptv-releases (this repo), published by the
app repo's CI (.github/workflows/desktop-release.yml there). The app repo itself is private, so no link
may point at it. RELEASES_REPO overrides the repo; GITHUB_TOKEN or GH_TOKEN, if set, raises the API
rate limit.

Usage:  python scripts/sync_github.py            (writes public/releases.json)
        python scripts/sync_github.py --check    (prints what would change, writes nothing)

Only the "windows" and "macos" entries are touched: for each, the newest published (not draft, not
pre-release) release that has the platform's package. Android, iOS and TV entries are edited by hand.
Standard library only.
"""
import json
import os
import pathlib
import sys
import urllib.request

REPO = os.environ.get("RELEASES_REPO") or "chintk19/tsiptv-releases"
DATA = pathlib.Path(__file__).resolve().parent.parent / "public" / "releases.json"

# platform id -> [(file suffix, link label)], the first suffix decides which release is "newest"
PACKAGES = {
    "windows": [
        ("-Setup.exe", {"vi": "Cài đặt (.exe)", "en": "Installer (.exe)"}),
        ("-Windows-x64.msi", {"vi": "MSI", "en": "MSI"}),
        ("-Windows-x64-portable.zip", {"vi": "Bản portable (.zip)", "en": "Portable (.zip)"}),
    ],
    "macos": [
        ("-macOS-arm64.dmg", {"vi": "Tải .dmg", "en": "Download .dmg"}),
    ],
}


def fetch_releases():
    headers = {"Accept": "application/vnd.github+json", "User-Agent": "tsiptv-releases-sync"}
    token = os.environ.get("GITHUB_TOKEN") or os.environ.get("GH_TOKEN")
    if token:
        headers["Authorization"] = f"Bearer {token}"
    req = urllib.request.Request(f"https://api.github.com/repos/{REPO}/releases?per_page=50", headers=headers)
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.load(resp)


def mb(size):
    return f"{size / 1_000_000:.0f} MB"


def latest_for(releases, packages):
    """Newest release carrying the first package; its links in `packages` order."""
    for rel in releases:  # the API lists newest first
        if rel["draft"] or rel["prerelease"]:
            continue
        assets = rel["assets"]
        if not any(a["name"].endswith(packages[0][0]) for a in assets):
            continue
        links = []
        for suffix, label in packages:
            asset = next((a for a in assets if a["name"].endswith(suffix)), None)
            if asset:
                links.append({"label": label, "url": asset["browser_download_url"], "size": mb(asset["size"])})
        sums = next((a for a in assets if a["name"] == "SHA256SUMS.txt"), None)
        return {
            "version": rel["tag_name"].split("-")[-1],
            "published": rel["published_at"][:10],
            "links": links,
            "checksums": sums["browser_download_url"] if sums else None,
            "notes": rel["html_url"],
        }
    return None


def private_links(data):
    """URLs that still point at the app repo, which is private: they are dead for visitors."""
    found = []
    for platform in data["platforms"]:
        urls = [link["url"] for link in platform.get("links", [])]
        urls += [platform.get("checksums"), platform.get("notes")]
        found += [f"{platform['id']}: {u}" for u in urls if u and "/IPTVMultiplatform/" in u]
    return found


def main():
    check = "--check" in sys.argv
    data = json.loads(DATA.read_text(encoding="utf-8"))
    releases = fetch_releases()
    changed = False
    for platform in data["platforms"]:
        packages = PACKAGES.get(platform["id"])
        if not packages:
            continue
        found = latest_for(releases, packages)
        if not found:
            print(f"{platform['id']}: no release with {packages[0][0]}, left as is")
            continue
        before = {k: platform.get(k) for k in found}
        if before != found:
            changed = True
            print(f"{platform['id']}: {before.get('version')} -> {found['version']}")
            platform.update(found)
            platform["status"] = "live"
        else:
            print(f"{platform['id']}: {found['version']} (unchanged)")
    if changed and not check:
        DATA.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8", newline="\n")
        print(f"wrote {DATA}")
    for line in private_links(data):
        # GitHub Actions shows ::warning:: lines on the run page.
        print(f"::warning::still links to the private app repo (publish this platform to {REPO}): {line}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
