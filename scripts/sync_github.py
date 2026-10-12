"""Refresh the desktop download links in public/releases.json from GitHub Releases.

Usage:  python scripts/sync_github.py            (writes public/releases.json)
        python scripts/sync_github.py --check    (prints what would change, writes nothing)

Only the "windows" and "macos" entries are touched: for each, the newest published (not draft, not
pre-release) release that has the platform's package. Android, iOS and TV entries are edited by hand.
Standard library only.
"""
import json
import pathlib
import sys
import urllib.request

REPO = "tuandv1405/IPTVMultiplatform"
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
    req = urllib.request.Request(
        f"https://api.github.com/repos/{REPO}/releases?per_page=50",
        headers={"Accept": "application/vnd.github+json", "User-Agent": "tsiptv-releases-sync"},
    )
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
    return 0


if __name__ == "__main__":
    sys.exit(main())
