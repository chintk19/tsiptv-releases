# TS IPTV — trang tải về

Trang tĩnh liệt kê đường dẫn tải TS IPTV cho từng nền tảng. Không có mã app ở đây: các file cài đặt nằm trên
[GitHub Releases](https://github.com/tuandv1405/IPTVMultiplatform/releases) và Google Play; trang này chỉ trỏ tới.

- URL: `https://tsiptv-download.web.app/` (Firebase Hosting, site `tsiptv-download` trong project `tsiptv-8bdd6`).
- Dữ liệu duy nhất: [`public/releases.json`](public/releases.json). Trang (`public/index.html` + `assets/app.js`)
  đọc file này và hiển thị song ngữ Việt/Anh; nền tảng của người xem được đưa lên đầu.

| Nền tảng | Nguồn link | Cập nhật bằng |
|---|---|---|
| Android | Google Play `tss.t.tsiptv` | Sửa tay |
| iOS | — (`"status": "soon"`) | Sửa tay khi có link App Store |
| macOS | `.dmg` trên GitHub Releases | `scripts/sync_github.py` |
| Windows | `Setup.exe`, `.msi`, `.zip` trên GitHub Releases | `scripts/sync_github.py` |
| Smart TV | — (`"status": "soon"`) | Sửa tay khi có link LG / Samsung |

## Sau mỗi bản phát hành desktop

1. Đăng GitHub Release (tag `desktop-<v>`, kéo thả các file) như trong `docs/desktop-windows-release.md` của
   repo app.
2. Cập nhật link:

   ```bash
   python scripts/sync_github.py --check   # xem thay đổi
   python scripts/sync_github.py           # ghi public/releases.json
   ```

   Script lấy bản **đã publish** mới nhất có file của từng nền tảng (Windows và macOS có thể khác phiên bản).
3. Triển khai: `firebase deploy --only hosting`
4. Commit `public/releases.json`.

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
