# TS IPTV — trang tải về và các bản phát hành

Repo **công khai** `chintk19/tsiptv-releases`. Không có mã app ở đây (repo app `IPTVMultiplatform` là repo
riêng tư). Repo này chứa:

- **GitHub Releases** của bản desktop (`desktop-<v>`: `Setup.exe`, `.msi`, `.zip`, `.dmg`, `SHA256SUMS.txt`).
  CI của repo app build và đăng các bản này (`.github/workflows/desktop-release.yml` và
  `docs/ci-desktop-release.md` bên repo app).
- **Trang tải về** `https://tsiptv-download.web.app/` (Firebase Hosting, site `tsiptv-download` trong project
  `tsiptv-8bdd6`). Dữ liệu duy nhất: [`public/releases.json`](public/releases.json). Trang (`public/index.html` +
  `assets/app.js`) đọc file này và hiển thị song ngữ Việt/Anh; nền tảng của người xem được đưa lên đầu.

Không link nào trên trang được trỏ tới repo app: repo đó riêng tư nên người xem sẽ gặp trang 404.
`scripts/sync_github.py` cảnh báo nếu `releases.json` còn link như vậy.

| Nền tảng | Nguồn link | Cập nhật bằng |
|---|---|---|
| Android | Google Play `tss.t.tsiptv` | Sửa tay |
| iOS | — (`"status": "soon"`) | Sửa tay khi có link App Store |
| macOS | `.dmg` trong Releases của repo này | CI của repo app (hoặc `scripts/sync_github.py`) |
| Windows | `Setup.exe`, `.msi`, `.zip` trong Releases của repo này | CI của repo app (hoặc `scripts/sync_github.py`) |
| Smart TV | — (`"status": "soon"`) | Sửa tay khi có link LG / Samsung |

## Sau mỗi bản phát hành desktop

Thường không phải làm gì: đẩy tag `desktop-<v>` lên repo app, CI build Windows và macOS, tạo Release ở repo
này, chạy `scripts/sync_github.py`, commit `public/releases.json` và deploy trang.

Làm tay (khi CI không deploy được trang, hoặc sau khi sửa Release bằng tay):

```bash
git pull                                 # lấy releases.json mà CI đã commit
python scripts/sync_github.py --check    # xem thay đổi
python scripts/sync_github.py            # ghi public/releases.json
firebase deploy --only hosting
git commit -am "Download page: desktop-<v>" && git push
```

Script lấy bản **đã publish** mới nhất có file của từng nền tảng trong Releases của repo này (Windows và macOS
có thể khác phiên bản). Biến môi trường `RELEASES_REPO` đổi repo nguồn; `GITHUB_TOKEN` (tuỳ chọn) để không bị
giới hạn số lần gọi API.

## Chép một bản cũ từ repo app sang (một lần, trước khi repo app thành riêng tư)

Chỉ cần khi muốn giữ một bản không build lại bằng CI. Cần [GitHub CLI](https://cli.github.com/) đã đăng nhập:

```bash
tag=desktop-1.1.3
gh release download $tag --repo tuandv1405/IPTVMultiplatform --dir tmp/$tag
gh release create $tag tmp/$tag/* --repo chintk19/tsiptv-releases --title "TS IPTV ${tag#desktop-} (desktop)"   --notes "TS IPTV desktop ${tag#desktop-}"
python scripts/sync_github.py
```

## Sửa tay `releases.json`

Mỗi nền tảng:

```json
{
  "id": "ios",                       // android | ios | macos | windows | tv (chọn icon và nhận diện thiết bị)
  "name": "iOS",
  "status": "live",                  // live: hiện nút tải; soon: hiện "Sắp ra mắt"
  "requirements": { "vi": "...", "en": "..." },
  "hint": { "vi": "...", "en": "..." },          // tuỳ chọn, chỉ hiện khi live
  "version": "1.2.0",                // tuỳ chọn
  "links": [ { "label": { "vi": "App Store", "en": "App Store" }, "url": "https://apps.apple.com/..." } ]
}
```

Nút đầu tiên trong `links` được tô màu nhấn. Xem thử trên máy: `firebase serve --only hosting` hoặc
`python -m http.server -d public 8080`.

## Lần đầu (đã làm)

```bash
firebase hosting:sites:create tsiptv-download --project tsiptv-8bdd6
firebase deploy --only hosting
```
