
---

## 🚀 Deploy to GitHub Pages (5 minutes)

1. **Create a new repository** on GitHub (e.g. `event-ticket-staff`).
2. **Upload all 5 files** (`index.html`, `style.css`, `script.js`, `verify.html`, `README.md`) to the repository.
3. **Go to repository Settings** → **Pages**.
4. Under **Branch**, select `main` (or `master`) and `/ (root)`.  
   → Click **Save**.
5. After 1–2 minutes, your site will be live at:  
   `https://<your-username>.github.io/event-ticket-staff/`  
   – Staff panel: `index.html`  
   – Verification page: `verify.html`

✅ No build step. No server. Works instantly.

---

## 🧑‍💻 Staff user manual

1. **Select ticket type** – price auto‑fills.
2. **Choose quantity** (1–20).
3. **Apply discount** (optional) – flat ₹ or %.
4. Click **⚡ GENERATE TICKETS** – all tickets appear with unique QR / IDs.
5. **🖨️ PRINT ALL TICKETS** – uses browser print; cut lines, A4 friendly.
6. **📄 SAVE AS PDF** – one PDF with all tickets.
7. **🗑️ CLEAR** removes current tickets.

### 🔐 Verification (anti‑copy)
- Open `verify.html` (staff phone/laptop).
- Enter ticket ID (scan QR or manual).
- First scan → *VALID & marked used*.  
- Second scan → *ALREADY USED*.
- Reset clears all used tickets from localStorage.

---

## 📐 Technical notes

- **Ticket ID format:** `TCK2026-<random>+index` – unique per generation.
- **QR library:** `qrcode-generator` (pure JS, no images).
- **PDF generation:** `html2pdf.js` – exports exactly what you see.
- **Discount distribution:** integer rupees, remainder fairly spread.
- **LocalStorage key:** `usedTickets` – shared only on same device/browser (per‑station).
- **Print styles:** hidden controls, dashed cut lines, page‑break avoidance.
- **Fully responsive** but **optimised for desktop / laptop** (event counter).

---

## 🔒 Legal & anti‑piracy

- This is **100% free, open‑source** code, no obfuscation.
- Intended for **legitimate event staff**.
- Anti‑copy layer (verify.html + localStorage) provides **front‑end deterrence**.
- No backend → zero subscription costs.  
- Use with real paid events – reliable and transparent.

---

## 💡 Customization

- Change **event name** in `script.js` (`EVENT_NAME`, `EVENT_SHORT`).
- Adjust **ticket prices** in `TICKET_PRICES` object.
- Modify **QR code size** in `generateQRCodeCanvas` (cellSize).
- Add more ticket types in dropdown + price object.

---

## 🙋 Support

This system is built for static hosting. No server‑side dependencies.  
If you need multi‑device sync, consider integrating Firebase – but the current version works **out of the box** on GitHub Pages.

---

© 2026 – Piracy‑free, professional event ticket printing.
