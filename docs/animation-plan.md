# Rencana Refactor Animasi (Motion) — Portfolio

Status: tahap 1–8 **selesai**. **Revisi R1–R8 (§4) selesai** (2026-10-26). **Revisi 2 (R9–R14, §5) selesai** (2026-10-26). **Revisi 3 (R15–R20, §6) selesai** (2026-10-27): R15 selesai. R16 dikerjakan lalu **dicabut atas permintaan user**: semua transisi antar-section dihapus dari landing. R17–R20 selesai. Delapan file transisi yang tak terpakai menunggu keputusan hapus/simpan (lihat R16).
Branch kerja: `adjustment-design`.

---

## 0. Hasil studi

### Kondisi codebase sekarang

| Area              | File                                                                                                                         | Animasi sekarang                                                                                                                                |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Entry             | `resources/js/app.ts`                                                                                                        | `MotionConfig` (motion-v) membungkus seluruh app, termasuk admin                                                                                |
| Layout public     | `layouts/LandingPageLayout.vue` → `layouts/app/AppHeaderLayout.vue`                                                          | Tidak persistent: layout di-mount ulang di tiap halaman (Navbar, Splash, FloatingSparks ikut remount)                                           |
| Splash            | `components/ui/landing-page/SplashScreen.vue`, `composables/useSplash.ts`                                                    | motion-v, `setTimeout` 1400 ms, flag `splashDone` dipakai Hero                                                                                  |
| Hero              | `Hero.vue`, `script/landingPage/hero.ts`                                                                                     | Nama diketik per huruf (typewriter + caret), sisanya fade-up motion-v. **Hero tidak punya foto.**                                               |
| Navbar            | `Navbar.vue`                                                                                                                 | Pill aktif pakai `layout-id` motion-v, `IntersectionObserver` untuk section aktif, mobile menu `AnimatePresence`                                |
| About             | `About.vue`, `script/landingPage/about.ts`, `site/Timeline.vue`, `site/IdCard.vue`                                           | Reveal motion-v, count-up stats pakai `animate()` motion-v, timeline zigzag dengan rail statis (gradient), tab Work/Education `AnimatePresence` |
| Projects + Skills | `Projects.vue`, `site/ProjectCard.vue`                                                                                       | Grid bento + Reveal. **Skills ada di dalam section Projects** (tab Hard/Soft, grid tile)                                                        |
| Achievements      | `Achievements.vue`, `site/AchievementCard.vue`                                                                               | Grid 3 kolom + Reveal                                                                                                                           |
| Listing           | `site/ListingShell.vue`, `composables/useListing.ts`                                                                         | `motion.li` stagger tiap ganti halaman/filter (tanpa animasi re-layout)                                                                         |
| Detail            | `site/DetailLayout.vue`                                                                                                      | Reveal berurutan                                                                                                                                |
| Kontak            | `contact/ContactModal.vue` (shadcn Dialog/reka-ui), `ContactBubble.vue`                                                      | Animasi bawaan tw-animate-css, bubble motion-v                                                                                                  |
| Util              | `site/Reveal.vue`, `site/SectionHeading.vue`, `site/SegmentedControl.vue`, `site/ThemeToggle.vue`, `site/FloatingSparks.vue` | Semua motion-v                                                                                                                                  |

Fakta teknis penting:

- **Inertia**: `@inertiajs/vue3` 2.3.29 / core 2.3.18 — **mendukung View Transitions** (`viewTransition` di `router.visit` dan prop `view-transition` di `<Link>`, memanggil `document.startViewTransition`, otomatis fallback ke swap biasa bila browser tidak mendukung). Jadi page transition pakai jalur resmi ini, tanpa hack internal.
- **Code splitting**: halaman di-resolve via `import.meta.glob` (lazy per page). Admin memakai `AppLayout`/`AppSidebarLayout`, public memakai `LandingPageLayout`. Selama GSAP/Lenis hanya di-import dari modul yang dipakai halaman public, Vite menaruhnya di chunk terpisah yang tidak dimuat admin. Akan diverifikasi lewat `public/build/manifest.json`.
- **Field model yang sudah di-append** (tidak perlu ubah backend): `Personal.role_list`, `Project.date_range`/`tech_list`/`start_month`/`end_month`, `Work.date_range`, `Education.date_range`, `Award.date_format`. Landing menerima project `status = 1` (jumlah tak dibatasi) dan skills `{ hardSkills, softSkills }`.
- **Token warna**: `--primary`, `--primary-strong`, `--brand-red`, `--brand-red-strong`, `--background`, `--surface*`. Semua warna turunan baru = `color-mix(in oklab, var(--…) N%, transparent)`. GSAP tidak pernah menulis nilai warna — hanya `transform`, `opacity`, `clip-path`; warna selalu dari class/CSS variable.
- **SSR** (`ssr.ts`) ada: semua kode GSAP/Lenis hanya jalan di `onMounted`, tidak ada akses `window` di level modul.
- `html { scroll-behavior: smooth }` dan `[id] { scroll-margin-top: 6rem }` di `app.css` akan bentrok dengan Lenis → dinonaktifkan saat Lenis aktif (lewat class `html.lenis`).
- Playwright **tidak terpasang** sebagai package (hanya binary browser), jadi screenshot referensi dilewati sesuai brief. Studi referensi dilakukan lewat fetch konten + catatan dari sesi sebelumnya.

### Referensi (andikadevs.space) — apa yang diambil dan apa yang tidak

Diambil (kualitas, bukan bentuk):

- Ritme: entrance tidak serentak, ada jeda bertingkat yang konsisten; satu easing dominan.
- Teks besar masuk per baris/kata dengan mask, bukan sekadar fade.
- Scroll terasa "berat" dan halus (smooth scroll + scrub), section terasa terhubung.
- Navbar tahu diri: hilang saat membaca, muncul saat butuh.

**Tidak** ditiru (dan bagaimana kita berbeda):

| Referensi                                                                             | Portfolio ini                                                                                                                                 |
| ------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Penomoran section `NN / 06`, caption gaya editorial (`Fig. 02 — …`)                   | Tetap eyebrow merah + heading dengan highlight biru yang sudah ada. Tanpa penomoran.                                                          |
| Maskot "Tejo" (huruf logo "a" putih yang terbang + speech bubble), tombol WhatsApp    | Robot visor milik sendiri yang tinggal di hero, tanpa speech bubble; ContactBubble + modal kontak kita (_direvisi R2/R3 dan R18, lihat Keputusan #1_) |
| Carousel project yang di-drag (`01 / 12`)                                             | **Stack layering vertikal** (sticky card bertumpuk), bukan carousel (_direvisi R4/R5, lihat Keputusan #4_)                                     |
| Susunan section About → Selected work → Experience → Hire me → Contact                | Tetap Hero → About (ID card, stats, timeline) → Projects (+ Skills) → Achievements → Footer                                                   |
| Palet, font, footer, efek langit/laut/wordmark tenggelam, curved wipe, horizontal pin | Palet biru `--primary` + brand red, Poppins, footer & ID card & timeline zigzag & floating sparks yang sudah direstore. Tanpa horizontal pin. |
| Gaya transisi halaman referensi                                                       | Shared-element View Transition: gambar card "terbang" ke hero detail                                                                          |

Ciri khas yang **hanya milik kita**: indikator navbar berbasis `clip-path` (pill biru "membuka" ke item aktif), rail timeline yang tergambar biru mengikuti scroll, deck Achievements yang miring selang-seling, highlight kursor berwarna turunan `--primary`. (_Setelah revisi §4: robot rangka "A" dengan dialog HUD, deck kartu lempar/balik dengan panel kontrol, transisi semprotan pilok. Setelah Revisi 2 §5: Abot "A" bersudut bulat, showcase panel info + tumpukan gambar bertirai untuk Projects & Achievements, tumpahan cat Hero → About, transisi "halaman baru" acak per sesi di batas lain, navbar kaca._)

---

## 1. Arsitektur motion

Folder baru `resources/js/motion/` (hanya di-import dari komponen public):

| File                    | Isi                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `motion/gsap.ts`        | Register `ScrollTrigger`, `SplitText`, `Flip`, `CustomEase` sekali; `CustomEase.create('brand', '0.22, 1, 0.36, 1')`; `gsap.defaults({ ease: 'brand', duration: 0.8 })`; konstanta durasi (`DUR.interaction = 0.2`, `DUR.entrance = 0.8`, `STAGGER = 0.06`) dan query `MQ` (`desktop`, `mobile`, `reduce`).                                                                                                                                                                                                                                                                                           |
| `motion/lenis.ts`       | Singleton Lenis dengan reference counting (acquire/release). Sinkron: `lenis.on('scroll', ScrollTrigger.update)`, `gsap.ticker.add(t => lenis.raf(t * 1000))`, `gsap.ticker.lagSmoothing(0)`. Tidak dibuat sama sekali saat `prefers-reduced-motion: reduce` atau `pointer: coarse` di mobile (native scroll lebih baik di touch). Release ditunda satu tick supaya pergantian halaman Inertia (unmount → mount layout) tidak menghancurkan/membuat ulang instance. Ekspor `scrollToSection(id)` yang memakai `lenis.scrollTo(el, { offset: -navbarHeight })`, fallback `scrollIntoView` tanpa Lenis. |
| `motion/useMotion.ts`   | Composable: `useMotion(scopeRef, setup)` → di `onMounted` membuat `gsap.matchMedia(scope)` dan memanggil `setup(mm)`; di `onBeforeUnmount` memanggil `mm.revert()`. Semua komponen wajib lewat sini supaya cleanup tidak bisa terlupa.                                                                                                                                                                                                                                                                                                                                                                |
| `motion/split.ts`       | Helper `splitReveal(el, opts)` → menunggu `document.fonts.ready`, lalu `SplitText.create(el, { type: 'words,lines', mask: 'lines', autoSplit: true, onSplit })`. Return fungsi revert.                                                                                                                                                                                                                                                                                                                                                                                                                |
| `motion/useTilt.ts`     | Tilt 3D maks 4° pakai `gsap.quickTo` (rotateX/rotateY) + elemen highlight bulat yang digeser via `transform` (bukan background-position) — hanya `(pointer: fine)` dan non-reduce.                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `motion/useMagnetic.ts` | Efek magnetic untuk CTA utama (`quickTo` x/y, kekuatan ~0.3, kembali 0.25s). Desktop `(pointer: fine)` saja.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| `motion/intro.ts`       | Penghubung Splash → Hero: satu `gsap.timeline` bersama. Splash menambahkan segmen keluar, Hero menambahkan segmen masuk di posisi `'-=0.25'` sehingga tanpa jeda. Bila splash tidak tampil (sudah dilihat di sesi ini / reduce), Hero memutar segmennya sendiri.                                                                                                                                                                                                                                                                                                                                      |

Aturan matchMedia yang dipakai di semua komponen:

```ts
mm.add(
  { desktop: '(min-width: 768px) and (prefers-reduced-motion: no-preference)',
    mobile:  '(max-width: 767.98px) and (prefers-reduced-motion: no-preference)',
    reduce:  '(prefers-reduced-motion: reduce)' },
  (ctx) => { const { desktop, mobile, reduce } = ctx.conditions!; ... },
);
```

- `reduce`: tidak ada tween, tidak ada pin/sticky stack, tidak ada Lenis. Karena semua animasi memakai `gsap.from`/`fromTo` di dalam matchMedia, konten di DOM sejak awal sudah dalam keadaan akhir → tidak ada elemen tertinggal di `opacity: 0`.
- `mobile`: entrance lebih pendek (y lebih kecil, stagger 0.04), tanpa scrub scale/pin; stack Projects/Achievements jadi list biasa dengan reveal.
- Sticky stack di CSS memakai varian `md:motion-safe:sticky` supaya reduce/mobile otomatis tidak sticky walau JS gagal.

CSS (di `resources/css/app.css`, tanpa mengubah nilai `--primary`/`--primary-foreground`):

- Aturan resmi Lenis (`html.lenis, html.lenis body { height: auto }`, `.lenis.lenis-smooth { scroll-behavior: auto !important }`, dll.).
- `::view-transition-*` untuk durasi/easing (`var(--ease-out-expo)`), dimatikan saat reduce.
- Token turunan baru bila perlu, contoh `--motion-highlight: color-mix(in oklab, var(--primary) 22%, transparent)`.

`motion-v` tetap terpasang selama migrasi. Setelah semua komponen public pindah ke GSAP, `MotionConfig` di `app.ts` tidak dibutuhkan lagi — penghapusan dependency/komponen yang tidak terpakai **ditanyakan dulu** di Tahap 8.

---

## 2. Tahapan

Tiap tahap ditutup dengan: `npm run lint`, `npm run types:check`, `npm run build`; cek `git diff --stat` tidak menyentuh `app/ routes/ database/ config/` dan `git diff resources/css/app.css` tidak mengubah `--primary`/`--primary-foreground`; centang tahap di dokumen ini; **JANGAN `git add`, `git commit`, atau `git push` — user yang commit manual**; berikan ringkasan + usulan pesan commit (`feat(motion): …`); berhenti.

### [x] Tahap 1 — Fondasi

- `npm i gsap lenis`.
- Buat `motion/gsap.ts`, `motion/lenis.ts`, `motion/useMotion.ts`, `motion/split.ts`.
- `AppHeaderLayout.vue`: acquire/release Lenis; listener `router.on('navigate')` → `lenis.scrollTo(0, { immediate: true })` lalu `ScrollTrigger.refresh()` (setelah `nextTick` + gambar di atas fold siap).
- `app.css`: aturan Lenis + pastikan `scroll-behavior: smooth` tidak aktif saat Lenis menyala.
- Port `Reveal.vue` ke GSAP ScrollTrigger (`once: true`) **dengan props yang sama** (`as`, `delay`, `y`, `amount`) supaya semua pemakai lama tetap jalan tanpa diubah.
- Verifikasi bundle: chunk GSAP/Lenis tidak ada di import graph halaman admin (cek `manifest.json`).

File: `package.json`, `package-lock.json`, `resources/js/motion/*` (baru), `layouts/app/AppHeaderLayout.vue`, `components/site/Reveal.vue`, `resources/css/app.css`.

Catatan hasil: link `#hash` di halaman yang sama ditangani handler klik di `motion/lenis.ts` (Lenis menghormati `scroll-margin-top`), CSS Lenis di-import dari `lenis/dist/lenis.css` sehingga ikut chunk public. Terverifikasi di build produksi: Lenis aktif/mati sesuai reduced-motion, tidak ada elemen tertinggal di opacity 0, anchor mendarat 96px di bawah top, instance Lenis bertahan saat navigasi Inertia, GSAP/Lenis hanya dimuat 5 halaman public.

### [x] Tahap 2 — Splash → Hero, Navbar

- `motion/intro.ts` (baru). `SplashScreen.vue` pindah ke GSAP: logo scale-in, progress bar `scaleX`, lalu keluar dengan `clip-path` inset naik + opacity — tetap satu timeline dengan Hero. `useSplash.ts` tetap jadi sumber "sudah tampil di sesi ini".
- `Hero.vue` + `hero.ts`: urutan role fade → nama SplitText per kata dengan mask per line (menggantikan typewriter, `sr-only` nama tetap ada untuk aksesibilitas) → deskripsi fade-up → CTA stagger. Parallax halus konten hero (yPercent kecil, scrub) saat scroll.
- **Maskot robot** `site/HeroBot.vue` (Keputusan #1): ikut timeline intro, idle loop, mata ikut kursor, parallax.
- `Navbar.vue`: hide saat scroll ke bawah / muncul saat scroll ke atas (`ScrollTrigger.create({ onUpdate: self.direction })`, `yPercent -130`, 0.25s; selalu tampil di dekat top dan saat menu mobile terbuka). Indikator aktif pindah dari `layout-id` ke **satu lapisan `clip-path`**: duplikat list nav berwarna `bg-primary text-primary-foreground` yang di-clip `inset(… round 999px)` ke item aktif dan dianimasikan 0.35s. Deteksi section aktif via ScrollTrigger (bukan IntersectionObserver). Link anchor memakai `scrollToSection()` dengan offset tinggi navbar.
- Mobile menu: `AnimatePresence` → `<Transition>` Vue (opacity + translateY + scale, 0.2s).

File: `SplashScreen.vue`, `Hero.vue`, `site/HeroBot.vue` (baru), `script/landingPage/hero.ts`, `Navbar.vue`, `composables/useSplash.ts`, `motion/intro.ts` (baru), `resources/css/app.css` (`--nav-h`, scroll-margin).

Catatan hasil: splash keluar dengan `clip-path: circle()` yang mengecil ke titik robot (`[data-intro-target]`); timeline hero di-nest ke label `reveal` splash lewat `motion/intro.ts`. Lenis kini dibuat di `onBeforeMount` layout supaya splash bisa `stop()` scroll. Navbar menulis `--nav-h`, dan `[id] { scroll-margin-top }` memakainya sehingga anchor via Lenis mendarat tepat di bawah navbar. Terverifikasi di build: tidak ada elemen hero tertinggal di opacity 0 (desktop, mobile, reduce, dan setelah navigasi balik tanpa splash), navbar `yPercent -130` saat scroll turun dan kembali saat scroll naik, indikator clip-path pindah ke item aktif.

### [x] Tahap 3 — Heading section, About, Skills

- `SectionHeading.vue`: eyebrow fade → heading SplitText per kata (mask lines, span highlight ikut ter-split) → deskripsi fade-up. Sekali saja.
- `Timeline.vue`: lapisan rail kedua berwarna `bg-primary` di atas rail gradient lama, `transform-origin: top`, `scaleY` 0 → 1 scrub sepanjang list. Item masuk berurutan via `ScrollTrigger.batch` (kartu dari sisi masing-masing sesuai zigzag, dot `scale` pop, tanggal fade). Re-init saat tab Work/Education berganti.
- `About.vue`: tab panel `AnimatePresence` → `<Transition mode="out-in">`; count-up stats di `about.ts` dari `animate()` motion-v ke `gsap.to` objek angka (dipicu ScrollTrigger sekali).
- **Skills marquee** (`Projects.vue` bagian Skills, atau komponen baru `site/SkillMarquee.vue`): marquee horizontal dari data `hardSkills`/`softSkills` (lihat Keputusan #2), loop `xPercent` dengan konten diduplikasi `aria-hidden`, pause saat `:hover` dan `:focus-within`, reduce → baris statis yang wrap.

File: `SectionHeading.vue`, `Timeline.vue`, `About.vue`, `script/landingPage/about.ts`, `Projects.vue`, `site/SkillMarquee.vue` (baru).

Catatan hasil: SplitText kini dipecah saat reveal dimulai lalu di-revert setelah selesai (`motion/split.ts`: `whenFontsReady` + `splitLines`) — lebih tahan resize daripada `autoSplit` untuk reveal sekali jalan; Hero ikut memakai helper ini. Marquee mengukur lebar baris dan merender salinan secukupnya agar loop tidak bolong pada daftar pendek, kecepatan tetap 45px/detik, wilayahnya bisa difokus (`tabindex="0"`) supaya keyboard juga bisa menghentikannya. Angka stats default-nya nilai akhir (tetap benar tanpa animasi). Terverifikasi di build: rail `scaleY` mengikuti scroll (0 → 0.25 → 0.5 → 0.75 → 1), hover menghentikan marquee, tidak ada elemen tertinggal di opacity 0 (desktop, mobile, reduce), reduce menampilkan skill sebagai daftar terpusat tanpa salinan.

### [x] Tahap 4 — Projects: stack layering

- Grid bento di landing diganti **stack**: tiap card `md:motion-safe:sticky` dengan `top: calc(var(--nav-h) + i * 1.25rem)`, lebar penuh container, rasio lebar (gambar + judul + deskripsi + `tech_list` + `date_range`). Varian baru `variant="stack"` di `ProjectCard.vue` (varian `card` untuk listing tetap).
- Per card i (kecuali terakhir): `ScrollTrigger` dengan `trigger = card[i+1]`, `start: 'top bottom'`, `end: 'top top+=160'`, `scrub: true` → card i `scale 1 → 0.92` (`transform-origin: top center`) dan overlay `bg-background` `opacity 0 → 0.55`.
- Gambar card: `clip-path` reveal saat pertama terlihat.
- Mobile/reduce: list vertikal biasa, tanpa sticky/scrub, hanya reveal (mobile) atau langsung tampil (reduce).

File: `Projects.vue`, `site/ProjectCard.vue`.

Catatan hasil: varian `bento` di `ProjectCard` diganti varian `stack` (kartu lebar, `bg-card` opak supaya tumpukan tidak tembus pandang; tanggal, judul, deskripsi, `tech_list`). Helper `motion/reveal.ts` (`revealMedia`) membuka gambar dari inset `clip-path` + scale 1.08 → 1 pada wrapper `[data-media]` (bukan `<img>`, supaya hover zoom CSS tetap jalan); dipakai lagi di Tahap 5–6. Top sticky = `calc(var(--nav-h) + 1rem + i * 1.25rem)`. Elemen sticky dibatasi content box list (padding tidak berlaku), jadi ada `<li>` spacer 20vh agar kartu terakhir sempat menetap dan tumpukan utuh "diam" sebentar sebelum lewat. Terverifikasi di build (3 kartu): kartu menempel di 90/110/130px, kartu sebelumnya scale 1 → 0.92 dan overlay 0 → 0.55 mengikuti scroll, mobile & reduce `position: static` tanpa scrub, tidak ada elemen tertinggal di opacity 0, light & dark mode.

### [x] Tahap 5 — Achievements: stack "deck"

- Varian `variant="deck"` di `AchievementCard.vue`: lebih kecil (maks ~`max-w-2xl`, terpusat), rotasi dasar selang-seling `+1.5°` / `-1.5°`, top bertingkat lebih rapat (`i * 0.75rem`).
- Saat card berikutnya naik: card sebelumnya `scale → 0.9`, rotasi kembali mendekati 0 dan sedikit `y` naik, overlay `bg-background` `→ 0.55` — terasa seperti kartu yang ditumpuk di meja, beda dari Projects yang "mengecil ke belakang".
- Mobile/reduce sama aturannya dengan Tahap 4.

File: `Achievements.vue`, `site/AchievementCard.vue`.

Catatan hasil: varian `deck` di `AchievementCard` (kompak, `bg-card` opak, badge tipe, issuer, `date_format`, deskripsi); list `max-w-3xl` terpusat, kartu setinggi 20rem, top `calc(var(--nav-h) + 1.5rem + i * 0.75rem)`. Kemiringan dasar diset GSAP (bukan class CSS `rotate`, supaya tidak bentrok dengan transform GSAP) dan hanya di desktop. Terverifikasi di build (3 kartu): miring +1.5° / −1.5° / +1.5°, kartu yang tertutup kembali ke 0°, scale 0.9, naik 12px, overlay 0.55 mengikuti scroll; menempel di 98/110/122px; mobile & reduce `static` tanpa miring; tidak ada elemen tertinggal di opacity 0; light & dark mode.

### [x] Tahap 6 — Transisi halaman, listing & detail

- `<Link view-transition>` di `ProjectCard`/`AchievementCard` dan link detail↔listing. `view-transition-name` unik per item (`project-media-{slug}`, `achievement-media-{slug}`) di gambar card dan di gambar hero `DetailLayout.vue` → gambar "terbang" dari card ke hero detail. Nama hanya dipasang pada elemen yang benar-benar terlihat agar tidak ada duplikat.
- CSS `::view-transition-old/new(root)`: cross-fade + slide kecil; group gambar memakai easing brand. Reduce → animasi VT dimatikan. Browser tanpa View Transitions: Inertia swap biasa, lalu entrance halaman tujuan tetap jalan (tidak ada hack).
- `DetailLayout.vue`: eyebrow → judul SplitText → subtitle → gambar hero (clip-path reveal, **dilewati** kalau halaman dibuka lewat shared-element transition supaya tidak dobel) → sidebar → overview.
- `ListingShell.vue`: filter/search memakai **Flip** — `Flip.getState()` sebelum list berubah (`watch` flush `pre`), `Flip.from()` setelah DOM update dengan `onEnter` (fade + scale 0.96 → 1) dan `<TransitionGroup>` leave-hook GSAP untuk item yang keluar. Ganti halaman pagination: stagger masuk + `scrollToSection` via Lenis.

File: `ProjectCard.vue`, `AchievementCard.vue`, `DetailLayout.vue`, `ListingShell.vue`, `resources/css/app.css`.

Catatan hasil: `<Link>` Inertia menimpa `@click`, jadi nama shared element dipasang lewat hook `@before` (`motion/transition.ts`: `shareElement`, `mediaTransitionName`, `takeSharedArrival`) — hanya pada kartu yang diklik, memakai `id` (bukan slug) agar selalu jadi ident CSS yang valid. `view-transition` juga dipasang di link kembali, `CtaLink`, dan link navbar antar-halaman; header navbar diberi `view-transition-name: site-header` supaya diam saat halaman berganti. Clip-path hero detail memakai `fromTo` dengan inset empat nilai eksplisit (membaca balik nilai `set` memberi bentuk singkat browser yang membuat interpolasi miring). Terverifikasi di build: landing → detail dan listing → detail menjalankan View Transition dengan nama yang sama di kedua sisi (`project-media-1`, `achievement-media-1`) dan hero tidak memutar reveal-nya lagi; detail → listing selesai tanpa error; buka detail langsung → clip `inset(14% 10%)` → `inset(0%)` simetris; Flip search 6 → 2 → 6 → empty state → 6 tanpa elemen tertinggal; reduce tanpa elemen tersembunyi. Pagination belum teruji di runtime karena data lokal ≤ 6 item per listing.

### [x] Tahap 7 — Micro-interaction

- `useTilt` di card stack/deck/listing (desktop, `pointer: fine`): tilt maks 4° + highlight bulat `color-mix(in oklab, var(--primary) 22%, transparent)` mengikuti kursor (digeser via transform).
- `useMagnetic` di CTA utama: "View Projects" (Hero) dan `CtaLink` "See More …".
- `ContactModal.vue`: susun primitive reka-ui (`DialogRoot/Portal/Overlay/Content` dengan `force-mount`) di dalam `<Transition>` Vue — `components/ui/dialog` (dipakai admin) **tidak** diubah. `ContactBubble.vue` dan `ThemeToggle.vue` pindah dari motion-v ke `<Transition>`/CSS.
- `SegmentedControl.vue`: indikator `layout-id` → indikator yang sama teknik `clip-path` dengan navbar.
- Dropdown: halaman public saat ini **tidak punya dropdown**; tidak ada yang dikerjakan kecuali ada yang ditambahkan.
- `FloatingSparks.vue`: port drift ke GSAP (tetap acak, tetap mati saat reduce) supaya public tidak lagi bergantung pada motion-v.

File: `motion/useTilt.ts`, `motion/useMagnetic.ts` (baru), `ProjectCard.vue`, `AchievementCard.vue`, `CtaLink.vue`, `Hero.vue`, `ContactModal.vue`, `ContactBubble.vue`, `ThemeToggle.vue`, `SegmentedControl.vue`, `FloatingSparks.vue`.

Catatan hasil: GSAP menulis `translate/scale/rotate: none` inline pada elemen yang ia transform (CSSPlugin 3.15), jadi hover `translate-*`/`scale-*` Tailwind di elemen yang sama mati. Konsekuensinya: (1) helper `releaseTransforms()` di `motion/gsap.ts` dipanggil setelah intro hero — memperbaiki regresi Tahap 2 (hover lift chip role & CTA sekunder kembali); (2) magnetic `CtaLink` menggerakkan span pembungkus; (3) "View Projects" melepas `hover:-translate-y-0.5` karena magnetic menggantikannya; (4) kartu listing memakai `transition-[translate,box-shadow]` (bukan `transition-all`, yang akan melawan transform per-frame GSAP) — lift CSS tetap berlaku di touch/kecil/reduce, di desktop diganti lift dari `useTilt`. Perspective tilt = `max(900, lebar × 2.5)` agar kartu lebar tidak "melambai". `SegmentedControl` memakai satu pill yang digeser `transform` lewat transisi CSS 250ms (tab selalu sama lebar, jadi teknik clip-path navbar tidak perlu). `ContactBubble`: entrance `animate-in` di wrapper supaya tidak menimpa `animate-soft-pulse` di tombol. Overlay modal tetap `bg-black/80` seperti sebelumnya. Sisa pemakai motion-v: hanya `MotionConfig` di `app.ts` (dibahas di Tahap 8). Terverifikasi di build: tilt maks ±2.8°/2.3° + lift 4px + glare lalu reset; magnetic hero 22.6px dan `CtaLink` 23px lalu kembali 0; chip role hover `translate: 0 -2px`; indikator tab bergeser 219px; modal fade/scale masuk, fokus terkunci, keluar beranimasi, fokus kembali ke tombol bubble; toggle tema jalan; sparks 24 (desktop) / 12 (mobile) / 0 (reduce) dan bergerak; tidak ada error console.

### [x] Tahap 8 — QA

- Jalan manual di browser: light/dark, desktop/mobile (375px, 768px, 1280px), `prefers-reduced-motion` (DevTools emulation) → pastikan tidak ada konten tersisa di opacity 0, tidak ada sticky, Lenis mati.
- Navigasi bolak-balik Landing ↔ All Projects ↔ Detail ↔ back browser: tidak ada ScrollTrigger yatim (`ScrollTrigger.getAll().length` stabil), posisi scroll benar, anchor `/#project` dari halaman lain mendarat tepat di bawah navbar.
- Performa: Performance panel saat scroll stack (target tanpa long task, hanya composite layer); cek `will-change` hanya selama animasi.
- Bundle: pastikan chunk `gsap`/`lenis` tidak dimuat halaman admin/auth/settings.
- `grep` kode baru untuk hex/`rgb(`/`hsl(` baru → harus nol.
- **Tanya dulu** sebelum: uninstall `motion-v` + hapus `MotionConfig` di `app.ts`, dan menghapus file yang jadi tidak terpakai (mis. keyframes `caret-blink` bila typewriter hilang).

Hasil QA (build produksi, Chromium headless):

- **motion-v dihapus** (disetujui user): `MotionConfig` dilepas dari `app.ts`, `pnpm remove motion-v`, `package-lock.json` disinkronkan dengan `npm install --package-lock-only` (tanpa menyentuh `node_modules`). Tidak ada chunk build yang masih memuat motion-v. File komponen tidak ada yang jadi tak terpakai (`Reveal.vue`, `SegmentedControl.vue` masih dipakai), jadi tidak ada file yang dihapus.
- **Matriks tampilan**: 1280 light/dark, 768, 375 light/dark, 1280 & 375 reduce — landing, All Projects, All Achievements, detail: setelah scroll penuh tidak ada elemen tertinggal di opacity 0, tidak ada error console. Reduce: Lenis mati, 0 elemen sticky. 375: 0 sticky. 768+: stack aktif.
- **Navigasi**: 3× putaran landing → list → detail → back → back: jumlah ScrollTrigger stabil (33 / 2 / 2) → tidak ada trigger yatim; hero kembali tanpa elemen tersembunyi. Link navbar `/#achievement` dari halaman lain mendarat 98px (= `--nav-h` 74px + 1.5rem).
- **Bundle**: GSAP/Lenis hanya di chunk `LandingPageLayout` yang dimuat 5 halaman public; `app.ts`, admin, auth, settings bersih; halaman login tidak memuat chunk public.
- **Performa**: CPU normal → median 16.7ms/frame (60fps) saat scroll stack. Dengan throttle CPU 4× hasilnya sangat bervariasi antar-run (1–30 long task) dan mematikan sparks / backdrop blur / glow body / seluruh ScrollTrigger tidak memberi perbaikan konsisten → tidak ada satu bottleneck yang layak dikorbankan. Headless berjalan tanpa GPU, jadi angka ini pesimistis; tetap perlu dicek di HP sungguhan.
- **Warna/font**: dibanding commit sebelum refactor motion (`64d4946`): `--primary`/`--primary-foreground` dan Poppins tidak berubah; tidak ada hex/`rgb()`/`hsl()` baru di kode refactor; `app/ routes/ database/ config/ .env` tidak tersentuh.

Temuan di luar lingkup (belum diubah):

- **SSR Inertia tidak me-render markup**: `config/inertia.php` mengaktifkan SSR, tapi render lewat `bootstrap/ssr/ssr.js` menghasilkan `<div id="app" …>[object Promise]</div>` untuk semua halaman. Penyebabnya di `@inertiajs/vue3` 2.3.29 (`innerHTML: render(vueApp)` tanpa `await`, sedangkan `ssr.ts` memberi `renderToString` yang async) — sudah ada sebelum refactor ini dan tidak bergantung pada kode motion. Situs saat ini tidak terdampak karena server SSR tidak berjalan dan Laravel jatuh ke client rendering. Perlu keputusan terpisah (ubah `ssr.ts` / versi Inertia).
- **Pagination listing** belum teruji di runtime karena data lokal ≤ 6 item per listing.

---

## 3. Keputusan

1. **Hero: maskot robot, bukan foto** (diputuskan 2026-10-26, **direvisi R1–R3**). `site/HeroBot.vue`, SVG inline, semua warna dari class token (tanpa hex).
   - _Sebelum revisi:_ robot kepala-kartu dengan visor, melayang di atas glow thruster, bukan bentuk logo/huruf.
   - _Setelah revisi:_ siluet robot **adalah huruf "A" kapital dari logo** (`resources/js/assets/img/logo.png`): segitiga dalam A = visor bermata LED, palang A = panel bahu dengan lengan yang bisa digerakkan, kaki A = kaki bertelapak (berdiri, tidak melayang). Desktop di kolom kanan hero, mobile di atas teks dan lebih kecil. Splash tetap menutup dengan `clip-path: circle()` ke titik robot di posisi barunya.
   - _Revisi 2 (R10):_ siluet tetap A, tetapi **semua sudut membulat** dengan radius dan tebal stroke yang konsisten (robot/mainan ramah, bukan huruf kaku). Path bentuk A disimpan **satu kali** di `components/site/abotShape.ts` dan dipakai semua tempat yang menggambar A.
   - _Revisi 3 (R15):_ bentuk **chibi/mainan**: lebih pendek & lebar, kaki tebal sedikit menggembung, puncak A jadi kubah kepala, visor kapsul, palang jadi sabuk membulat, telapak bulat. Siluet tetap terbaca A. Varian dipilih user dari `docs/abot-variants.html` (diisi setelah dipilih). Geometri tetap satu sumber (`abotShape.ts`, kini juga titik pivot); SVG dipisah ke `AbotFigure.vue` supaya Abot mini (R18) memakai bentuk yang sama.
   - Nama robot: **Abot**.
   - _Revisi setelah R20 (2026-10-27, permintaan user):_ dialog **bukan lagi panel HUD** melainkan **bubble chat** (sudut sangat bulat, ekor membulat yang menunjuk ke Abot), **tanpa pagination**: kalimat diketik → jeda baca → "…" → kalimat berikutnya, menutup sendiri setelah kalimat terakhir; klik Abot mempercepat. Bubble kecil Abot mini ikut bentuk yang sama. Ini menggantikan "tanpa speech bubble" di bawah.
   - Interaksi: robot = `<button>`; klik/tap/Enter membuka **panel dialog HUD** (bukan speech bubble) berisi perkenalan dari data Personal, teks diketik + kursor kedip, beberapa halaman, menutup sendiri; robot "bicara" (visor berdenyut), gestur per halaman, reaksi klik beruntun, mata ikut kursor. Reduce → robot statis, teks langsung utuh. _R19:_ halaman pertama = sapaan sesuai jam lokal perangkat (Keputusan #13).
   - _Revisi 3 (R18):_ di luar hero muncul **Abot mini** di pojok kanan bawah, tepat di atas ContactBubble, yang sesekali menampilkan bubble HUD kecil (Keputusan #12). Klik membuka dialog lengkap di pojok itu.
   - Beda dari Tejo (andikadevs): Tejo = huruf "a" kecil putih **flat** dengan dua mata, terbang keliling halaman, menyapa lewat speech bubble kartun. Robot kita = **A kapital sebagai rangka mekanis** (visor, panel, lengan, kaki, kedalaman lewat panel & stroke), palet biru-merah token, berbicara lewat panel HUD yang terpisah dari tubuhnya (tanpa ekor gelembung). Robot besar tinggal di hero. ~~Di luar hero hanya versi mini yang muncul di tempat (pop)~~ → **direvisi user setelah R18 (2026-10-27)**: saat robot hero hampir keluar layar, Abot **terbang sekali** (melengkung, mengecil, ±0.9 detik) ke pojok kanan bawah dan mendarat di atas ContactBubble; kembali ke hero → terbang balik. Robot hero disembunyikan selama Abot di pojok, jadi selalu hanya ada satu Abot. Pembeda dari Tejo kini tinggal: bentuk (A kapital rangka mekanis vs huruf "a" flat), tidak mengikuti scroll (sekali terbang, bukan menempel ke posisi gulir), dan bicara lewat panel HUD tanpa ekor.
2. **Skills** (direvisi R7): ~~marquee dua baris~~ → kembali ke **tab Hard/Soft** (`SegmentedControl`) dengan grid tile (hard) dan pill (soft) seperti sebelum Tahap 3; animasi ganti tab stagger singkat. Posisi tetap di bawah Projects. `SkillMarquee.vue` dihapus hanya setelah ditanyakan.
3. **Nama hero**: typewriter diganti SplitText per kata dengan mask per line (lebih ringkas ~0.8s vs ~2s, konsisten dengan heading section). Kepribadian/"fun" dipindah ke robot (R3: termasuk efek ketik di panel dialog, bukan di nama).
4. **Projects & Achievements di landing** (direvisi R4/R5, **direvisi lagi R11/R12**): ~~sticky stack/deck mengikuti scroll~~ → ~~deck kartu interaktif + panel daftar judul; Projects dilempar, Achievements dicerminkan & dibalik 3D~~ → **satu komponen showcase yang sama untuk keduanya**: panel info project/achievement **aktif** di KIRI (judul, deskripsi, Previous/Next, ringkasan data, link detail), **tumpukan gambar saja** di KANAN, tidak dicerminkan. Satu preset animasi transisi (opsi A "tirai terangkat + parallax", dipilih user) yang sadar arah, teks panel berganti tersinkron. Preset `toss`/`flip`, punggung kartu, varian `deck` kartu, dan daftar judul dihapus. Tanpa pin/scroll-hijack/sticky, tanpa counter `01 / 12` (progres = bar kecil). Tetap beda dari referensi: tumpukan kartu, bukan carousel horizontal geser. Halaman All Projects/All Achievements tetap grid + Flip. **Direvisi R17**: ~~tirai terangkat~~ → **lipatan halaman buku**. Kartu depan terangkat dari tepi bebasnya dan berputar di engsel (punggung buku), melengkung lewat strip vertikal bertingkat (`motion/pageFlip.ts`). Maju dan mundur berputar berlawanan arah. Drag kini **mengikuti arah**: tarik ke kiri = maju, ke kanan = mundur, dan halaman mengikuti jari (sebelumnya drag ke arah mana pun = maju). Projects & Achievements tetap identik. **Direvisi lagi (2026-10-27)**: ~~lipatan buku di engsel kiri~~ → **lipatan sudut**: pojok kiri bawah terangkat dan dilipat balik, garis lipat menyapu diagonal ke pojok kanan atas (mundur = kebalikannya); drag dibalik menjadi **tarik ke kanan = maju, ke kiri = mundur**, supaya lipatan mengikuti jari.
5. **Easing**: semua entrance/interaksi memakai `brand`. Pengecualian yang disengaja: loop kontinu (napas/idle robot dan visor "bicara" `sine.inOut`), efek ketik `none` (laju karakter konstan), ~~partikel semprotan~~ (dihapus R13), **tumpahan cat R13** yang tidak di-tween (bentuk digambar dari progres scrub dengan kurva gravitasi: jatuh dipercepat `power2.in`, lelehan lebih cepat dari tepi utama), dan transisi halaman R14 yang memetakan progres scrub lewat **`power2.inOut`** per fase tutup/buka (rencana awal `brand`; kurva expo-out itu membuat layar tertutup ±35% rentang scroll, sedangkan `inOut` hanya di tengah). ~~marquee `none`~~ (marquee dihapus di R7). _Revisi 3:_ lipatan halaman R17 memakai **`power2.inOut`** saat diputar oleh tombol/keyboard (kertas berakselerasi lalu mendarat, seperti halaman sungguhan), dan progres **linear (`none`)** saat digerakkan jari; pop Abot mini R18 tetap `brand`, dua langkah (lewat 1.06 lalu kembali ke 1), tanpa ease `back`.
6. **Package manager**: `node_modules` lokal dikelola pnpm; `pnpm-lock.yaml` baru belum di-commit (menunggu keputusan).
7. **Breakpoint layout 2 kolom** (baru, R1/R4/R5; user memilih `md` bila tanpa risiko): hero, Projects, dan Achievements jadi 2 kolom mulai **`lg`** (1024px). Di 768–1023px tetap bertumpuk (robot ukuran sedang di atas teks; deck di atas baris kontrol ringkas). `md` dinilai berisiko: di 768px kolom teks hero hanya ±375px sehingga nama `text-display` (±48px di lebar itu) pecah jadi 3 baris dan hero melebihi satu layar, sedangkan kolom panel deck ±280px terlalu sempit untuk daftar judul + tombol. Mengecilkan nama khusus di `md` akan mengubah skala tipografi, jadi tidak dipilih. Kondisi motion `desktop` (≥768px) tidak berubah.
8. **Transisi section** (baru, R6/R8, **direvisi R13/R14**): ~~Hero → About = semprotan pilok~~ → **tumpahan cat** `--primary` di `<canvas>` (mengalir dari atas dengan tepi cair bergelombang + lelehan, menutup layar, lalu surut/terkuras ke bawah memperlihatkan About), scrub tanpa pin, warna token dibaca saat runtime dan ulang saat tema berganti. ~~Batas lain: tetesan cat, sapuan roller, stensil "A", percikan (R8)~~ → **transisi "membuka halaman baru"** dengan lembar `--primary` (lipatan `--primary-strong`) dalam empat jenis yang disetujui: lipat sudut, bilah diagonal, iris dari pojok, balik halaman, satu jenis **acak per batas, tetap selama satu sesi** (Keputusan #11), lebih pendek dari Hero → About. Reduce: Hero → About divider statis, batas lain tanpa transisi. **Direvisi R16 ("tahan lalu tukar")**: section berikutnya tidak pernah terlihat sebelum layar tertutup penuh, dan section sebelumnya tidak terlihat lagi setelahnya, ke dua arah scroll. Batas bertransisi kini tinggal tiga: Hero → About (tumpahan cat), About → Projects, dan Projects → Achievements (lembar acak). Projects → Skills dan Achievements → Footer tanpa transisi (disetujui user). Caranya: section lama di-**pin tanpa spacing** selama overlay menutup, section baru di-clip tak terlihat. Tepat saat tertutup penuh keduanya ditukar. Section baru lalu **scroll alami** selama overlay membuka (implementasi R16; rencana awal mem-pin-nya, tetapi itu menggeser semua trigger di dalamnya). Panjang fase buka dibatasi supaya konten sesudahnya belum terlihat. Achievements diberi tinggi minimal satu layar (mode motion saja). Link anchor yang melintasi batas memakai **lompatan tertutup** (bukan glide) dan mendarat di scroll-margin section, dengan overlay disisihkan. Reduce: tanpa pin/overlay, **semua batas** memakai divider statis. Rincian di §6 R16. **Dicabut (2026-10-26, permintaan user setelah R16, "terlalu maksa"): semua transisi antar-section dihapus dari landing**: tumpahan cat Hero → About, lembar halaman acak, dan divider reduce. Batas section kembali biasa (tanpa pin/overlay). File transisi tidak lagi dipakai dan menunggu keputusan hapus.
9. **Plugin GSAP `Draggable`** (baru, R4): dipakai untuk drag/swipe deck (sejak R11/R12 oleh `motion/useShowcase.ts`); didaftarkan di `motion/gsap.ts` sehingga tetap hanya ada di chunk public.
10. **Navbar glass** (baru, R9): di top tetap transparan seperti sekarang; setelah scroll, pill navbar memakai kaca **tidak terlalu bening** dari turunan token (`color-mix` `--background` **85%**, border turunan `--border`, bayangan turunan `--foreground`/`--background` per tema) + `backdrop-filter: blur(20px) saturate(1.6)`. Nilai literal lama `--glass-nav-bg`/`--glass-nav-border` diganti turunan token. `view-transition-name: site-header` ada di `<nav>`, bukan `<header>`: elemen bernama view transition adalah _backdrop root_ dan akan mematikan blur anaknya.
11. **Pilihan acak per sesi** (baru, R14): jenis transisi tiap batas diundi sekali per sesi dan disimpan di `sessionStorage` (dengan versi kunci), batas bersebelahan tidak boleh sama. _R16:_ tinggal 2 batas (About → Projects, Projects → Achievements), kunci `…:v2`. Diundi di `onMounted` (bukan saat render) sehingga markup sama di server/klien; `sessionStorage` diakses dalam `try/catch` (mode privat → undian di memori, tetap konsisten selama halaman hidup).
12. **Bubble Abot mini** (baru, R18): jadwal (**disetujui** 2026-10-26): pertama setelah **8 detik kumulatif** di luar hero, lalu tiap **±40 detik** (35–45 detik acak), tampil **6 detik** (timer dijeda saat hover/fokus), **maksimal 4 kali per sesi**. Ditutup lewat X = tidak muncul lagi di sesi itu. Hitungan disimpan di `sessionStorage` berversi (`try/catch`, pola Keputusan #11). Bubble ditunda selama: ContactModal terbuka, dialog besar/dialog mini terbuka, ada interaksi dengan deck/tab/form (fokus di dalam atau pointer dalam 4 detik terakhir), tab tidak aktif. Isinya bergiliran dari halaman dialog yang sama: sapaan R19 dulu, halaman "menunjuk ke projects" dilewati. Bukan live region.
13. **Sapaan jam lokal** (baru, R19): `new Date().getHours()` dibaca di klien setelah mount dan dibaca ulang tiap dialog dibuka / bubble tampil, bukan di level modul, jadi markup SSR tidak bergantung jam. Sebelum mount, dialog tanpa halaman sapaan. Pembagian jam & kalimat di §6 R19.
14. **Suara Abot** (baru, R20, permintaan user): bunyi "robot" khas disintesis dengan Web Audio (oscillator + envelope, tanpa file audio, tanpa dependency). Bunyi hanya muncul di dialog yang **dibuka pengguna** (hero atau mini), karena browser memblokir audio tanpa gestur. Bubble periodik tetap senyap. ~~Ada tombol bisu di header HUD~~ → tombol bisu kini di **navbar, di samping toggle dark mode** (hanya di landing), pilihannya disimpan di `localStorage` (`try/catch`). Rincian di §6 R20 dan "Revisi setelah R20".

---

## 4. Revisi

Dikerjakan **satu tahap tiap "lanjut"**, urut R1 → R8 (R8 = transisi batas lain yang disetujui setelah rencana awal; R2 sebelum R3 karena dialog butuh bagian tubuh robot; R4 sebelum R5 karena R5 memakai ulang deck R4). Penutup tiap tahap **sama dengan §2**: `npm run lint`, `npm run types:check`, `npm run build`; cek `git diff --stat` tidak menyentuh `app/ routes/ database/ config/ .env` dan `git diff resources/css/app.css` tidak mengubah `--primary`/`--primary-foreground`; centang tahap di dokumen ini; **JANGAN `git add`, `git commit`, atau `git push`**; ringkasan + usulan pesan commit; berhenti.

Aturan yang tetap berlaku di semua tahap revisi:

- **Data tidak berubah**: hanya membaca prop yang sudah dikirim controller (`personal`, `lastRole`, `projects`, `achievements`, `skills`). Tidak ada perubahan backend/model.
- `--primary` / `--primary-foreground` dan Poppins dikunci. **Tidak ada warna literal baru**: SVG memakai class token (`fill-primary`, `fill-brand-red`, `stroke-border`, …), warna turunan memakai `color-mix(in oklab, var(--…) N%, transparent)`, canvas membaca warna token saat runtime.
- GSAP/Lenis hanya di-import lewat `motion/gsap.ts` / `motion/lenis.ts` dari kode public. Semua animasi lewat `useMotion` (cleanup + matchMedia `desktop`/`mobile`/`reduce`).
- Reduce → tidak ada konten tertinggal di `opacity: 0`; semua status akhir sudah benar tanpa JS animasi.

### Benturan dengan rencana lama & penyelesaiannya

| Revisi                 | Bertentangan dengan                                                | Penyelesaian                                                                                                                                                                   |
| ---------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| R2 robot berbentuk "A" | Keputusan #1 lama + tabel §0: "robot kita bukan bentuk logo/huruf" | Keputusan #1 direvisi. Pembeda dari Tejo kini: A kapital sebagai rangka mekanis (bukan huruf flat bermata), punya anggota tubuh & visor, tetap di hero.                        |
| R3 dialog              | Keputusan #1 lama: "tanpa speech bubble"                           | Tetap tanpa speech bubble: panel HUD terpisah dari tubuh robot, sudut bracket, tanpa ekor gelembung.                                                                           |
| R3 gaya "terminal"     | Font dikunci Poppins                                               | **Tidak** memakai font monospace. Kesan terminal dari kursor kedip, header status, label uppercase berjarak, `tabular-nums`, bingkai bracket sudut.                             |
| R4/R5 deck             | Keputusan #4 + Tahap 4–5 (sticky stack), tabel §0 "bukan carousel" | Keputusan #4 direvisi. Sticky, spacer, dan scrub Tahap 4–5 dibuang. Tetap beda dari referensi: tumpukan kartu + panel daftar judul, bukan carousel geser, tanpa `01 / 12`.      |
| R6 transisi            | Tabel §0: "tanpa curved wipe"                                      | Semprotan berbasis partikel canvas, bukan wipe geometris; tanpa pin.                                                                                                           |
| R7 tab Skills          | Keputusan #2 lama (marquee)                                        | Keputusan #2 direvisi. `SkillMarquee.vue` dihapus hanya setelah ditanyakan.                                                                                                    |

### Pertanyaan terbuka — sudah dijawab (2026-10-26)

1. **R2 — palang A.** Logo (`resources/js/assets/img/logo.png`) adalah A **tanpa palang**. → **Disetujui**: palang ditambahkan sebagai panel bahu yang menembus kedua kaki (lengan menggantung di ujungnya), siluet luar tetap A logo.
2. **R3 — kalimat statis.** → **Disetujui** dengan nama robot **"Abot"** (menggantikan "Unit A" di semua teks usulan, termasuk header HUD).
3. **R6 — perilaku warna semprotan.** → **Opsi A**: cat `--primary` (lapisan `--primary-strong`, percikan `--brand-red`) menutup layar, lalu semprotan pengikis menghapus cat dari tengah sehingga About terlihat.
4. **R6 — transisi batas lain.** → **Disetujui** semua usulan; dikerjakan sebagai tahap terpisah **R8** (setelah R7, karena batas Projects → Skills bergantung pada layout Skills final).
5. **Breakpoint 2 kolom.** → User memilih `md` bila tanpa risiko, selain itu `lg`. Dinilai **berisiko** di `md` → tetap **`lg`** (alasan di Keputusan #7).

### [x] R1 — Layout hero

Rencana teknis:

- `Hero.vue`: section jadi grid `lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:gap-12`. Kolom teks rata kiri di `lg` (`lg:items-start lg:text-left`, chip role & CTA `lg:justify-start`); di bawah `lg` tetap terpusat seperti sekarang (Keputusan #7).
- Urutan DOM: **teks dulu, robot kemudian** (h1 tetap elemen pertama untuk pembaca layar, dan robot jadi tombol di R3). Visual mobile/tablet: robot di atas teks lewat `order-first lg:order-none`.
- Ukuran robot via class di wrapper: mobile `h-24`, `sm:h-28`, `md:h-36` (tablet, bertumpuk), `lg:h-72`, `xl:h-80`. Robot diposisikan di tengah kolom kanan.
- Intro tetap **satu timeline** (`motion/intro.ts` tidak berubah). `SplashScreen.introPoint()` sudah membaca posisi `[data-intro-target]` saat segmen `exit` → circle otomatis mengecil ke posisi baru robot. Perbaikan: pindahkan `data-intro-target` dari root robot (yang sedang di-`prepare()` ke `scale 0.4, y 24`) ke wrapper `botWrap` di `Hero.vue`, supaya titik dihitung dari kotak akhir robot, bukan kotak yang sedang di-scale.
- Parallax desktop: teks tetap `yPercent -12`; robot `y -140, rotation -6` dikurangi (± `y -80, rotation -4`) karena robot kini besar di samping teks.
- Scroll hint tetap di tengah bawah.

File: `components/ui/landing-page/Hero.vue`, `components/site/HeroBot.vue` (ukuran, `data-intro-target` dipindah), `SplashScreen.vue` hanya bila titik perlu koreksi.

Risiko:

- HP pendek (≤ 640px tinggi): robot + teks melebihi `100svh` → robot dikecilkan dan `pt-28` dikurangi di mobile; konten boleh sedikit melewati fold, tidak dipotong.
- Titik circle dihitung sebelum gambar/font final → diukur saat `exit` (sudah berjalan begitu); dicek di 375/768/1280.
- `text-left` di `lg` mengubah ritme visual hero; SplitText nama tetap jalan karena split per baris tidak bergantung perataan.

Catatan hasil: section hero jadi `grid` (`content-center`, `lg:grid-cols-[1.15fr_0.85fr]`, `lg:gap-x-12`), teks di DOM lebih dulu, robot `order-first lg:order-none`. Ukuran robot di SVG `HeroBot`: `h-24 sm:h-28 md:h-36 lg:h-72 xl:h-80`. `data-intro-target` dipindah ke wrapper robot di `Hero.vue`; `SplashScreen.vue` dan `motion/intro.ts` tidak perlu diubah. Padding atas mobile `pt-24` (sebelumnya `pt-28`). Parallax robot `y -80, rotation -4`. Terverifikasi di build (Chromium headless, skrip CDP): titik akhir `clip-path: circle()` splash sama dengan pusat robot (selisih < 1px) di 1440, 1280, 1024, 768, 375 light/dark; tidak ada elemen hero tertinggal di opacity 0 (termasuk reduce); tanpa error console. 768px tetap bertumpuk dengan nama satu baris. Di 375×640 hero setinggi 701px (melewati fold 61px; hanya ruang bawah yang terpotong, CTA masih di dalam layar), sesuai risiko yang diterima.

### [x] R2 — Robot berbentuk inisial "A"

Rencana bentuk (satu komponen `HeroBot.vue`, SVG inline, viewBox baru ±200×240):

- **Siluet = A kapital logo**: dua kaki miring bertemu di puncak membulat. **Ruang segitiga di dalam A = visor** (`fill-primary`, sudut membulat, mengisi hampir seluruh lubang A) berisi dua mata LED `fill-primary-foreground` + kilap `stroke-primary-foreground` opacity rendah. Kepala adalah bagian atas rangka A itu sendiri, bukan kepala yang ditempel di atas huruf.
- **Kaki kiri A** = panel `fill-card stroke-border` dengan jalur sirkuit tipis (`stroke-primary`, ujung bulatan) dan hexagon kecil sebagai sendi lutut — mengacu sisi PCB logo. **Kaki kanan A** = slab padat `fill-primary` dengan kedalaman lewat `fill-opacity` bertingkat — mengacu sisi solid logo. Tanpa gradient literal; warna asli logo (ungu/cyan) **tidak** dipakai, tetap token.
- **Palang A** (disetujui, pertanyaan #1) = panel bahu/dada horizontal `fill-card stroke-border` dengan lampu indikator `fill-brand-red`, menonjol keluar dari kedua kaki; di ujungnya engsel bahu tempat **lengan** (grup terpisah, `transformOrigin` di engsel) menggantung.
- **Ujung kaki A = telapak** (pad membulat `fill-primary`): robot **berdiri**; glow thruster diganti bayangan lantai `fill-foreground` opacity rendah.
- **Puncak A**: antena pendek berujung `fill-brand-red` + halo berdenyut (dipertahankan).
- Detail sirkuit disembunyikan di ukuran kecil (mobile `h-24`) supaya siluet tetap terbaca.
- Ref yang disiapkan untuk R3: `visor`, `eyes`, `armLeft`, `armRight`, `body` (hop/lean), `antenna`.

Gerak di tahap ini (sementara, sebelum R3): masuk intro (pop dari titik circle + lambaian), idle "bernapas" (`body` `scaleY 1 → 1.015`, `sine.inOut`) + kedip acak + halo, mata bergeser di dalam visor & badan condong sedikit mengikuti kursor (desktop `pointer: fine`), squint saat hover, klik = hop + lambai. Reduce → statis.

Beda dari maskot referensi (dicek ulang setelah gambar jadi): bukan huruf flat putih bermata — A kapital bervolume dengan panel, visor, lengan, kaki; palet token biru-merah; berdiri di hero, tidak terbang; tidak ada speech bubble.

File: `components/site/HeroBot.vue`.

Risiko:

- Terbaca "huruf + mata" bila visor terlalu kecil → visor mengisi lubang A, lengan & telapak memberi kesan tubuh. Dicek di 3 ukuran (h-24, h-36, h-80).
- Dark mode: panel `fill-card` di atas background gelap bisa tenggelam → `stroke-border` + drop-shadow turunan `--primary` (sudah ada) dicek di dua tema.
- Lengan yang diputar keluar viewBox → `overflow-visible` dipertahankan.

Catatan hasil: viewBox `0 -12 220 240`. Kaki kiri A = path panel `fill-card stroke-border` + 3 jalur sirkuit sejajar kaki (`stroke-primary`, pad bulat; disembunyikan `max-sm`), kaki kanan = slab `fill-primary` yang melewati puncak (seperti logo) dengan garis kilap `stroke-primary-foreground` 25%. Visor = segitiga `fill-primary stroke-primary` dengan `stroke-linejoin: round` (sudut membulat tanpa path rumit), celah ±3–4px ke tepi lubang A. Palang = panel `fill-card` selebar 176 dengan 3 lampu (primary, brand-red, primary 45%); lengan pendek terentang 50° keluar dari ujung palang (pada uji pertama lengan menggantung lurus dan terbaca seperti kaki tambahan). Semua rotasi memakai `svgOrigin` dalam satuan viewBox (`SHOULDER_RIGHT`, `FEET`) supaya pivot tetap benar di ukuran apa pun. Idle: napas `scaleY 1.015` dari telapak, antena bergoyang 4°, halo, kedip; desktop: mata bergeser ±4/±3, visor ±1.5, badan condong ±3°. Ukuran mobile dinaikkan ke `h-28 sm:h-32` (R1 memakai `h-24`): di 96px mata hanya ±3px. Terverifikasi di build: light & dark 1280, 768, 375 (375×640 hero 717px, CTA masih di layar); klik = squint + hop + lambai; reduce statis; tidak ada elemen hero di opacity 0; tanpa error console.

### [x] R3 — Robot interaktif + dialog perkenalan

Rencana teknis:

- **`HeroBot.vue`**: root jadi `<button type="button">` dengan `aria-label` "Talk to Abot", `aria-expanded`, `aria-controls` → panel; `focus-ring`. API gerak yang diekspos: `speak(on)` (visor berdenyut), `gesture('wave' | 'hop' | 'nod' | 'point')`, `react()` (klik beruntun); `prepare()`/`enter()` tetap. Mata tetap mengikuti kursor selama dialog.
- **`site/BotDialog.vue`** (baru): panel `role="dialog" aria-modal="false" aria-labelledby="…"`, berisi:
  - `<p class="sr-only" aria-live="polite">` dengan **teks utuh** halaman aktif (langsung tersedia, tanpa efek ketik).
  - Lapisan visual `aria-hidden="true"`: teks yang diketik + kursor kedip (`animate-caret`, keyframes `caret-blink` yang sudah ada di `app.css`).
  - Header HUD ("ABOT · ONLINE" + titik status); footer: indikator halaman berupa titik (bukan angka), tombol **Next**/**Close**, tombol X berlabel.
  - Gaya: `bg-card/95 backdrop-blur border border-primary/30`, bracket sudut `border-primary`, label uppercase `tracking-wider`, tanpa ekor/pointer gelembung. Font tetap Poppins.
- **`script/landingPage/botDialog.ts`** (baru): `buildDialogPages(name, personal, lastRole)` → `{ text, gesture }[]`; halaman yang datanya kosong dilewati.
- Nama "Muammar Aufar Prasetya" saat ini **hardcoded** di `Hero.vue` (bukan field Personal) → dipindah ke konstanta di `hero.ts` supaya h1 dan dialog memakai sumber yang sama. `lastRole` sudah dikirim ke `LandingPage.vue` → diteruskan ke `Hero` sebagai prop (frontend saja).
- **Efek ketik**: tween GSAP `{ chars: 0 → n }` ease `none`, ±40 karakter/detik, menulis `textContent` satu node (tanpa SplitText). Klik saat mengetik → halaman langsung utuh; klik setelah utuh (robot atau Next) → halaman berikutnya. Halaman terakhir → **menutup sendiri** 5 detik setelah selesai; timer dijeda selama pointer/fokus berada di panel.
- **Bicara**: selama tween ketik, visor `opacity`/`scale` yoyo cepat (`sine.inOut`), berhenti bersamaan dengan teks.
- **Gestur per halaman**: 1 melambai, 2 lompat kecil, 3 mengangguk, 4 menunjuk ke CTA "View Projects" (`lg`: lengan ke kiri-bawah ke arah CTA di kolom kiri; mobile/tablet: ke bawah).
- **Klik beruntun**: ≥ 4 klik dalam 1,2 detik → reaksi "pusing" (badan goyang, mata berputar) + satu baris teks reaksi; input diabaikan 1 detik. Klik ke-2/3 tetap memajukan dialog seperti biasa.
- **Tutup**: Esc (listener `keydown` di `document` hanya selama terbuka), tombol X/Close, otomatis setelah halaman terakhir, dan saat hero keluar viewport (ScrollTrigger `onLeave`). Buka tidak memindahkan fokus (non-modal); tutup lewat Esc/X saat fokus di panel → fokus kembali ke tombol robot.
- **Posisi**: `lg` — di atas/kiri robot di kolom kanan (absolute); mobile/tablet — di bawah robot, selebar container, menimpa awal heading (`z-10`).
- **Masuk/keluar panel**: `<Transition>` + hook GSAP (opacity, `y 8`, `scale 0.98`, `clip-path` inset membuka dari atas, 0.25s).
- **Reduce**: panel muncul/hilang tanpa animasi, teks langsung utuh, tanpa gestur dan tanpa visor berdenyut; navigasi halaman sama.

Kalimat statis (**disetujui 2026-10-26**, nama robot "Abot"; `{…}` = data yang sudah ada):

| #      | Teks                                                                         | Data                                                | Gestur   |
| ------ | ---------------------------------------------------------------------------- | --------------------------------------------------- | -------- |
| 1      | "Hi! I'm Abot, the robot who looks after this portfolio."                    | —                                                   | melambai |
| 2      | "This is {name}. Day to day: {role_list}."                                   | nama (konstanta), `role_list` digabung "A, B and C" | lompat   |
| 3      | "Most recent role: {lastRole}."                                              | `lastRole` (dilewati bila kosong)                   | angguk   |
| 4      | "Want to see the work? The projects are right this way."                     | —                                                   | menunjuk |
| reaksi | "Whoa, easy! My circuits are spinning."                                      | —                                                   | pusing   |
| UI     | label robot "Talk to Abot", tombol "Next" / "Close", header "ABOT · ONLINE"  | —                                                   | —        |

`personal.desc` sudah tampil di hero dan `personal.about` di About, jadi tidak diulang di dialog (bisa ditambahkan bila diinginkan).

File: `components/site/HeroBot.vue`, `components/site/BotDialog.vue` (baru), `script/landingPage/botDialog.ts` (baru), `script/landingPage/hero.ts`, `components/ui/landing-page/Hero.vue`, `pages/LandingPage.vue` (meneruskan `lastRole`).

Risiko:

- Panel menutupi teks hero di mobile → panel ringkas (maks ±3 baris teks), bisa ditutup kapan saja, tutup otomatis saat scroll keluar hero.
- Auto-close vs WCAG 2.2.1 (batas waktu) → timer dijeda saat hover/fokus, dialog bisa dibuka lagi kapan saja, tidak ada informasi yang hilang permanen.
- Live region membaca berulang bila teks berubah per karakter → hanya node `sr-only` yang live dan isinya diganti **sekali** per halaman; lapisan ketik `aria-hidden`.
- Banyak tween kecil (ketik, visor, gestur, mata) di elemen yang sama → tiap gestur memakai timeline sendiri, gestur baru membunuh yang lama (`overwrite: 'auto'`).

Catatan hasil: `HeroBot` jadi `<button aria-label="Talk to Abot">` dengan `aria-expanded` dan `aria-controls` (hanya saat terbuka); klik ditangani `Hero.vue`, sehingga klik hop+lambai dari R2 diganti gestur per halaman. Gestur baru menuntaskan gestur sebelumnya ke posisi istirahat (`progress(1).kill()`), bukan `overwrite`; menunjuk = lengan kiri ke kiri (`lg`) atau ke bawah (di bawah `lg`); pusing = badan goyang ±6° + mata berputar 360°; bicara = visor `scale 1.05` yoyo 0.12s. `BotDialog.vue` memakai `v-model:open`; status (halaman, ketik, interupsi, timer tutup) ada di dialog, sedangkan `Hero.vue` hanya menghubungkan event `page`/`speaking`/`closed` ke robot dan menghitung klik beruntun (≥ 4 dalam 1,2 detik saat terbuka → `react()` + `interrupt(BOT_REACTION)`, input dikunci 1 detik; klik berikutnya kembali ke halaman yang sedang dibuka). Untuk pembaca layar: live region `aria-live="polite"` dibuat **permanen di luar panel** (live region yang baru dipasang bersama isinya sering tidak diumumkan), isinya diganti sekali per halaman; panel `role="dialog" aria-modal="false"` diberi `aria-labelledby` (header) dan `aria-describedby` (salinan teks utuh `sr-only`); lapisan ketik `aria-hidden`. Salinan teks `invisible` di sel grid yang sama menahan tinggi panel agar tidak tumbuh saat mengetik. Nama hero dipindah ke `HERO_NAME` di `hero.ts`; `lastRole` diteruskan dari `LandingPage.vue` (isinya jabatan Work terbaru, mis. "Flutter Developer"). Dialog ditutup ScrollTrigger saat bawah hero melewati 25% atas viewport. Terverifikasi di build (skrip CDP, 1280 light, 375 mobile/touch, 1280 reduce): ketik → klik menyelesaikan → halaman berikutnya; tombol Next/Close; tutup otomatis 5 detik setelah halaman terakhir; reaksi pusing lalu kembali ke halaman; Enter pada robot membuka dialog; Esc dari tombol di dalam panel menutup dan fokus kembali ke robot; scroll keluar hero menutup; reduce menampilkan teks utuh tanpa ketik dan tanpa gestur; panel desktop di atas robot (antena "menembus" tepi bawah panel), mobile di bawah robot menimpa heading; tanpa error console.

### [x] R4 — Projects: panel kiri + deck kanan

Arsitektur (dipakai ulang R5, tanpa duplikasi logika):

- **`motion/useDeck.ts`** (baru, logika saja): state `order` (urutan kartu dari depan), `active`, `next()`, `prev()`, `goTo(i)`, handler keyboard, drag (`Draggable`), dan **preset animasi** lewat opsi `variant: 'toss' | 'flip'` (masing-masing berisi fungsi keluar/masuk untuk maju & mundur). Tata letak slot: kartu 0 di depan, kartu 1–2 di belakang dengan offset `x/y`, `rotation` kecil, `scale` 0.96 / 0.92; kartu ≥ 3 disembunyikan (`autoAlpha 0`) di belakang slot 2. Deck melingkar (Next di kartu terakhir kembali ke pertama). DOM **tidak** di-reorder: urutan visual = `zIndex` + transform, jadi Flip tidak diperlukan.
- **`site/CardDeck.vue`** (baru): grid satu sel (semua kartu `grid-area: 1 / 1` → tinggi deck = kartu tertinggi tanpa ukur JS), slot `#card="{ item, active }"`, prop `variant`, `items`, `label`. `aria-roledescription="carousel"`, `aria-label`, `tabindex="0"`; tiap kartu `role="group" aria-roledescription="slide" aria-label="{judul}"`; kartu non-aktif `inert` (tidak bisa difokus/diklik dan tidak dibaca).
- **`site/DeckPanel.vue`** (baru): daftar judul `<ol>` berisi tombol (`aria-current` pada yang aktif; scroll internal `data-lenis-prevent` bila panjang, item aktif digulir ke tampilan **di dalam list saja**), indikator progres (bar `scaleX = (active + 1) / n` + judul aktif disorot — **tanpa angka "01 / 12"**), tombol Prev/Next berlabel ("Previous project" / "Next project"), slot CTA (`CtaLink` "See More Projects" ke `allProjects()`). Live region `sr-only aria-live="polite"`: "Showing {judul}". Prop `compact` → baris kontrol ringkas (mobile/tablet).

Rencana `Projects.vue`:

- `lg`: `grid-cols-[minmax(0,5fr)_minmax(0,7fr)]` — `DeckPanel` kiri, `CardDeck variant="toss"` kanan. Di bawah `lg`: deck, lalu `DeckPanel compact` (Prev · bar progres · Next · See more) di bawahnya.
- **Animasi toss (maju)**: kartu depan `x ± 110% lebar`, `rotation ± 18°`, `y -20` (0.45s) → `zIndex` pindah ke paling belakang → meluncur masuk ke slot terakhir (0.35s); bersamaan kartu 1 & 2 naik satu slot (0.4s, stagger 0.04). Arah lempar = arah drag; tombol Next melempar ke kiri. **Mundur** = kebalikannya: kartu paling belakang keluar ke samping dari balik tumpukan, berputar balik, mendarat di depan; yang lain turun satu slot. `goTo(k)` dengan jarak > 1: kartu di antaranya dipindah instan di belakang (tak terlihat), lalu satu animasi toss.
- **Drag/swipe**: hanya kartu depan, `Draggable` `type: 'x'`, `allowNativeTouchScrolling: true` (geser vertikal tetap menggulir halaman), kartu ikut berputar `x × 0.05°`; dilepas > 25% lebar atau cepat → toss ke arah itu, selain itu kembali (0.3s). Klik link setelah drag ditahan.
- **Keyboard**: panah kiri/kanan (dan Home/End) saat deck atau isinya fokus.
- **Data kartu tetap utuh**: varian baru `deck` di `ProjectCard.vue` **menggantikan** `stack` — vertikal (gambar 16/10 di atas, `date_range`, judul, deskripsi `line-clamp-3`, `tech_list` lengkap, "View project"); `<Link view-transition>` + `@before` `shareElement` tetap; `useTilt` tetap (di `<a>`, sedangkan GSAP deck menggerakkan pembungkus slot → transform tidak bentrok). Varian `card` (listing) tidak diubah.
- **Entrance** sekali saat section terlihat: kartu naik bertumpuk (stagger) + `revealMedia` kartu depan; panel fade-up.
- **Mobile**: deck sama dan bisa di-swipe, offset slot lebih kecil, rotasi lempar 12°. **Reduce**: tanpa lempar/putar; kartu berganti instan (`set`), slot belakang tanpa rotasi; swipe/keyboard/tombol tetap mengganti kartu secara instan.
- Sticky, spacer `<li>`, scrub `scale/overlay` dari Tahap 4 dihapus.

File: `motion/useDeck.ts` (baru), `motion/gsap.ts` (register `Draggable`), `components/site/CardDeck.vue` (baru), `components/site/DeckPanel.vue` (baru), `components/site/types.ts`, `components/ui/landing-page/Projects.vue`, `components/site/ProjectCard.vue`.

Risiko:

- `Draggable` menambah ukuran chunk public (± 25–30 KB min) → dicek di build; admin tetap bersih.
- View transition dari kartu yang sedang bergerak → hanya kartu depan dalam posisi diam yang bisa diklik (yang lain `inert`), nama shared tetap dipasang di `@before`.
- Satu kartu dengan `tech_list` sangat panjang membuat semua kartu setinggi itu (grid satu sel) → diterima demi "semua data tampil"; dicek dengan data terpanjang.
- Jumlah project tidak dibatasi → semua kartu tetap di DOM; kartu tersembunyi `visibility: hidden`, tidak dianimasikan.
- Fokus keyboard hilang saat kartu lama jadi `inert` → fokus dikembalikan ke kontainer deck.

Catatan hasil: `useDeck` menyimpan `order` (urutan kartu dari depan) dan menonton `active` (`v-model:active` dibagi `CardDeck` dan `DeckPanel`), jadi panel cukup mengubah angka dan deck yang menganimasikan. Arah dihitung dari jarak (maju bila ≤ n/2), kecuali tombol/keyboard/drag memberi `hint`. Pose slot & gerak maju/mundur ada di objek preset (`toss`), siap ditambah `flip` di R5. Penyimpangan dari rencana: (1) **kartu `deck` horizontal di `lg`** (gambar kiri, teks kanan; tegak di bawah `lg`) — versi tegak 16/9 di kolom 7fr setinggi ±700px sehingga terpotong di layar 800px; gambar `absolute` di `lg` supaya screenshot ponsel yang tinggi tidak menentukan tinggi kartu; (2) **tombol Next melempar ke kanan** (`side = 1`, menjauhi panel), bukan ke kiri, supaya kartu tidak menimpa panel; jarak lempar 80% lebar (110% langsung keluar layar sehingga putarannya tak terlihat); (3) **drag ke arah mana pun = maju** (dilempar ke arah drag), seperti tumpukan kartu fisik; mundur lewat tombol, panah kiri, atau daftar judul; (4) `site/types.ts` tidak perlu diubah (tipe generik di komponen). `inert` dipasang langsung (`:inert`), drag hanya aktif di kartu depan dan dimatikan selama animasi, klik yang mengakhiri drag ditelan lewat listener capture (300ms), `<a>`/`<img>` kartu `draggable="false"`. Entrance: 3 kartu terlihat mendarat dari belakang ke depan + `revealMedia` kartu depan. `Draggable` hanya ada di chunk public (35,8 KB min / 13,5 KB gzip). Terverifikasi di build (skrip CDP; 1280 light, 1024 dark, 375 mobile/touch, 1280 reduce): Next/Prev, klik judul ke-3, panah kanan/kiri, Home, drag pendek kembali tanpa navigasi, drag panjang kiri & kanan maju, klik link kartu depan membuka detail; selalu tepat 1 kartu non-`inert`; live region "Showing …" + `aria-current` + bar progres ikut; geser vertikal di atas deck di mobile tetap menggulir halaman (235px, sama dengan area kontrol); reduce berganti instan; tanpa error console.

### [x] R5 — Achievements: pola yang sama, karakter berbeda

Rencana teknis:

- `Achievements.vue`: dicerminkan — `lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]`, `CardDeck variant="flip"` **kiri**, `DeckPanel` **kanan** (CTA "See More Achievements"). Di bawah `lg` sama dengan R4 (deck lalu baris kontrol ringkas).
- **Preset `flip` di `useDeck`** (bukan composable/komponen baru): kartu depan terangkat sedikit (`y -12`, `scale 1.03`), `rotateY 0 → -180°` (0.6s, `transformPerspective 1200`) memperlihatkan **punggung kartu**; tepat di 90° `zIndex` pindah ke paling belakang, lalu turun ke slot terakhir; setelah tertutup kartu lain, `rotateY` di-reset ke 0 (tak terlihat). Mundur: kartu belakang keluar, berbalik `+180° → 0`, mendarat di depan.
- Slot belakang **tanpa rotasi miring** (beda dari Projects): offset `y` + `scale` saja, kesan tumpukan rapi.
- Drag/swipe: pola sama dengan R4, tetapi saat dilepas memicu flip (bukan lempar); selama drag kartu ber-`rotateY` kecil mengikuti `x`.
- **Punggung kartu**: slot `#back` opsional di `CardDeck` dengan default dekoratif `aria-hidden` — `bg-primary`, pola garis rangka "A" (`stroke-primary-foreground` opacity rendah), ikon Award. Dua sisi `backface-visibility: hidden`, pembungkus `transform-style: preserve-3d`.
- `AchievementCard.vue` varian `deck` dibuat vertikal (gambar di atas, badge tipe, judul, issuer, `date_format`, deskripsi); link detail + `shareElement` + `useTilt` tetap.
- Aturan data, mobile, reduce (kartu berganti instan, tanpa balik), dan aksesibilitas (carousel/slide, live region, tombol "Previous achievement"/"Next achievement") sama dengan R4.

File: `components/ui/landing-page/Achievements.vue`, `components/site/AchievementCard.vue`, `components/site/CardDeck.vue`, `motion/useDeck.ts`.

Risiko:

- `backface-visibility` + `overflow: hidden` + `rounded-3xl` berkedip di Safari → `preserve-3d` di pembungkus slot (bukan di `<a>` yang `overflow-hidden`), kedua sisi punya radius sendiri.
- `useTilt` (rotateX/Y) dan flip (rotateY) di elemen berbeda (tilt di `<a>`, flip di pembungkus) → tidak saling menimpa; tilt dinonaktifkan selama flip.
- Kedip saat `zIndex` berpindah di tengah putaran → pindah tepat di 90° (kartu tampak setipis garis).

Catatan hasil: preset `flip` ditambahkan ke `useDeck` (tanpa composable/komponen baru); preset kini juga punya `othersAt` (kapan kartu lain bergeser; `flip` mundur menunggu 0.35s sampai kartu datang sudah di atas) dan `dragPose` (`toss`: `rotation`, `flip`: `rotateY` ±25°). Gerak maju: kartu terangkat, berbalik ke **tertelungkup** (−180°, 0.45s, sempat diam sejenak sehingga punggung kartu terbaca), lanjut ke −270° (tegak lurus, tak terlihat), di situ `zIndex` pindah ke belakang dan sudut diganti ke 90° (tampak identik), lalu berputar ke 0° sambil turun ke slot belakang — **tidak pernah ada lompatan sudut yang terlihat**, jadi reset `rotateY` setelah tertutup (rencana awal) tidak diperlukan. Mundur = kebalikannya. `CardDeck` varian `flip`: pembungkus `transform-3d`, sisi depan `backface-hidden`, punggung kartu `rotate-y-180 backface-hidden` (slot `#back`, default `bg-primary` + garis rangka "A" robot `stroke-primary-foreground` 35%). `AchievementCard` varian `deck`: tetap horizontal mulai `sm` (rencana menyebut tegak), gambar `absolute` dari `sm` supaya sertifikat tinggi tidak menentukan tinggi kartu, `draggable="false"`. Bug yang ditemukan & diperbaiki di `useDeck`: langkah preset tanpa posisi eksplisit ditambahkan ke akhir timeline utama (sesudah tween kartu lain), sehingga kartu yang bergerak terlambat (`flip` mundur ±0.45s, `toss` ±0.13s); gerak kartu kini dibangun di sub-timeline sendiri lalu `add(move, 0)`. `useTilt` tidak dimatikan selama flip (tilt ada di `<a>`, flip di pembungkus, dan tilt hanya aktif saat kursor di atas kartu). Terverifikasi di build (skrip CDP; Projects & Achievements; 1280 light, 375 mobile dark, 1280 reduce): seluruh skenario R4 (Next/Prev, judul, panah, Home, drag pendek/panjang, klik link) lolos di kedua deck, selalu tepat 1 kartu non-`inert`; rangkaian frame menunjukkan punggung kartu tampil saat maju (kartu tertelungkup di atas tumpukan) dan saat mundur (muncul tertelungkup lalu berbalik); reduce berganti instan tanpa balik; tanpa error console.

### [x] R6 — Transisi antar section

**Hero → About: semprotan pilok** (dikerjakan di tahap ini):

- **`motion/paintColors.ts`** (baru): membaca warna token saat runtime lewat elemen probe tersembunyi (`probe.style.color = 'var(--primary)'` → `getComputedStyle(probe).color`), sehingga hasilnya selalu string warna yang bisa dipakai canvas (juga bila token memakai `color-mix`). Dibaca ulang lewat `MutationObserver` pada atribut `class` di `<html>` (toggle `.dark` oleh `useAppearance`) dan perubahan `prefers-color-scheme`.
- **`motion/sprayPaint.ts`** (baru, mesin tanpa Vue): partikel dibuat sekali dengan PRNG ber-seed → **deterministik**, scrub mundur menghasilkan gambar yang sama. Tiap semprotan = nozzle yang menyapu viewport (jalur zig-zag), memancarkan titik dengan sebaran Gaussian (inti padat, percikan kecil jauh, beberapa tetesan besar). Tiap partikel punya ambang progres `t`. Progres naik → gambar hanya partikel baru (inkremental); progres turun → bersihkan dan gambar ulang sampai `t ≤ p`. Gambar hanya di `gsap.ticker` saat progres berubah. Alpha lewat `globalAlpha` (tanpa `rgba()` literal). DPR dibatasi 1.5 (desktop) / 1 (mobile).
- **`site/SprayTransition.vue`** (baru): canvas `fixed inset-0 pointer-events-none`, di bawah navbar, `aria-hidden`; elemen penanda di batas Hero/About (`LandingPage.vue`) jadi trigger. ScrollTrigger `scrub: true`, `start`: bawah hero di 85% viewport, `end`: atas About di atas viewport (± satu tinggi viewport scroll, **tanpa pin**).
  - `0 → 0.55`: semprotan menutup layar (opsi A, disetujui: `--primary`, lapisan `--primary-strong`, percikan `--brand-red`).
  - `0.55 → 1`: semprotan pengikis (`globalCompositeOperation: 'destination-out'`) menghapus cat dari tengah ke luar, About terlihat.
  - Canvas dan loop ticker hanya hidup selama trigger aktif (`onToggle`); di luar itu canvas dikosongkan, `visibility: hidden`, ticker dilepas → **tidak ada kerja saat di luar viewport**. Resize → ukuran canvas & jalur dibuat ulang (debounce).
- **Mobile**: partikel ± 35% dari desktop, tanpa tetesan besar, DPR 1. **Reduce**: canvas animasi tidak dibuat; diganti **divider statis** — pita bertepi semprotan di batas section yang digambar sekali (mesin yang sama, `p = 1`, tanpa ticker) dan digambar ulang hanya saat tema berganti.
- Target performa: tanpa long task saat scroll; menggambar ≤ 4 ms/frame (Performance panel, CPU 4×). Anggaran awal ± 2.500 partikel desktop.

Transisi batas lain **disetujui** dan dikerjakan terpisah di **R8** (setelah R7).

File: `motion/paintColors.ts` (baru), `motion/sprayPaint.ts` (baru), `components/site/SprayTransition.vue` (baru), `pages/LandingPage.vue`.

Risiko:

- Overlay menutupi konten sesaat (pengguna menggulir tanpa melihat konten ± 0.2 viewport) → jendela tutup penuh dibuat sempit.
- Klik navbar `#about` / `#project` melompati transisi lewat Lenis `scrollTo` → progres tetap tergambar cepat; bila terasa mengganggu, overlay di-skip selama scroll terprogram.
- Overdraw di layar besar/4K → DPR cap + jumlah partikel diskalakan dengan luas viewport.
- Ganti tema saat transisi aktif → satu kali gambar ulang penuh.
- Cat solid di atas aurora background body: dengan usulan A tidak masalah (cat dihapus kembali), dengan B terlihat sebagai tambalan.

Catatan hasil: `SprayTransition.vue` dipasang di `LandingPage.vue` antara Hero dan About; elemen penanda (tinggi 0) jadi trigger, kanvas overlay di-`Teleport` ke `<body>` (`fixed inset-0 z-30`, di bawah bubble kontak `z-40` dan navbar `z-50`) supaya tidak terpengaruh transform leluhur. Rentang: penanda dari 80% viewport sampai atas viewport (±0.8 tinggi layar, tanpa pin); progres diambil dari `onUpdate` ScrollTrigger (setara scrub) dan digambar di `gsap.ticker` hanya bila berubah; `onToggle` menggambar ujung rentang (kosong) lalu menyembunyikan kanvas dan melepas ticker. Mesin (`sprayPaint.ts`): 0–0.5 sapuan nozzle per baris (±160px) berisi titik lunak + speckle (12% `--brand-red`) + tetesan (desktop), 0.51–0.55 lapisan menebal sampai solid, 0.55–0.88 semprotan pengikis (`destination-out`) dari tengah, disebar merata per luas dan dijadwalkan menurut jarak, lalu kanvas memudar (`opacity`) 0.88–0.97 dan dikosongkan di 0.97. Penyesuaian setelah melihat hasil: titik lingkaran keras terbaca seperti gelembung → titik lunak dari **sprite** (16 lingkaran konsentris beralpha rendah, warna token) dicap dengan `drawImage`; pengikis awal terlalu jarang di tepi (cat masih 76% di 0.95 lalu hilang mendadak) → sebaran per luas + fade. `paintColors.ts` membaca token lewat probe; `onThemeChange` hanya bereaksi saat kelas `.dark` berubah (Lenis juga mengubah kelas `<html>` tiap scroll). Catatan: `--primary` sama di kedua tema, jadi pergantian tema terlihat lewat `--primary-strong` (25% titik). Mobile: kepadatan 0.35, tanpa tetesan, DPR 1. Reduce: kanvas overlay tak dipakai; divider statis `h-16` (`motion-reduce:block`) digambar sekali dan ulang saat resize/ganti tema. Terverifikasi di build (skrip CDP; 1280 light/dark, 375 mobile dark, reduce 1280/375): kanvas tersembunyi & kosong sebelum dan sesudah rentang; layar tertutup penuh di 0.56; About muncul bertahap; gambar sama saat scroll mundur (hash identik pada versi lingkaran; pada versi sprite coverage & piksel identik, hash berbeda tipis karena `getImageData` pengujian memindahkan kanvas dari GPU ke CPU); ganti tema saat aktif menggambar ulang; sapuan scroll cepat: **0 long task**, jeda frame maks 17–20ms (p95 17ms); kode semprotan hanya di chunk `LandingPage`; tanpa error console.

### [x] R7 — Skills kembali ke tab bar

Rencana teknis:

- `Projects.vue`: `SegmentedControl` (`id="skills-tabs"`, Hard Skills ikon `Wrench`, Soft Skills ikon `Brain`) + panel `role="tabpanel"` `aria-labelledby`. Hard = grid tile (ikon + nama, `grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7`), soft = pill wrap — markup mengikuti versi sebelum marquee (`64d4946`), tanpa motion-v.
- **Ganti tab**: `<Transition mode="out-in">` dengan hook GSAP — keluar 0.15s (opacity, `y -8`), masuk stagger tile (opacity, `y 12`, `scale 0.96 → 1`, 0.3s, stagger 0.02, total stagger maks 0.3s), lalu `releaseTransforms` supaya hover lift CSS tile kembali. **Flip tidak dipakai**: isi kedua tab berbeda, tidak ada elemen bersama yang bisa di-Flip.
- Entrance pertama sekali saat terlihat (ScrollTrigger `once`). Setelah tinggi panel berubah → `ScrollTrigger.refresh()` supaya trigger di bawahnya (Achievements, transisi R6) tetap tepat.
- **Reduce**: ganti tab instan.
- `SkillMarquee.vue` jadi tidak terpakai → **ditanyakan dulu** sebelum dihapus.

File: `components/ui/landing-page/Projects.vue`, (`components/site/SkillMarquee.vue` dihapus setelah disetujui).

Risiko:

- Tinggi panel berbeda antar tab → layout shift di bawahnya; `min-h` panel + refresh ScrollTrigger.
- Hover `translate` tile mati bila transform GSAP tertinggal → `releaseTransforms` setelah stagger (pola Tahap 7).

Catatan hasil: markup tab mengikuti versi `64d4946` (grid tile hard, pill soft, "No skills data"), `AnimatePresence`/`motion.li` diganti `<Transition mode="out-in" :css="false">` dengan hook GSAP. Satu helper `showSkills` dipakai untuk entrance pertama (ScrollTrigger `once`, `top 85%`) dan untuk tab baru; stagger `min(0.02, 0.3 / n)`. Kelas transisi tile diubah dari `transition-all` ke `transition-[translate,box-shadow,border-color]` (pill: `translate,border-color,color`) supaya CSS tidak ikut menganimasikan `opacity`/`transform` yang dipegang GSAP. Setelah tab baru masuk: `ScrollTrigger.refresh()`. Bug yang ditemukan & diperbaiki: di reduce, `done()` sinkron di hook `leave` dengan `mode="out-in"` membuat Vue error (`parentNode` null) dan panel hilang → `queueMicrotask(done)`. `SkillMarquee.vue` kini tidak dipakai di mana pun (tidak ada CSS khusus di `app.css`) — **dihapus setelah disetujui user** (awal R8), build tetap lolos. Terverifikasi di build (skrip CDP; 1280 light, 375 mobile dark, 1280 reduce): entrance pertama selesai tanpa tile di opacity 0 dan tanpa transform inline tersisa; klik Soft → panel `skills-tabs-panel-soft` dengan `aria-labelledby` yang valid, tab terpilih & fokus ikut; panah kanan kembali ke Hard; hover tile `translate: 0 -4px` jalan; reduce berganti instan tanpa error; deck Achievements di bawahnya tetap muncul setelah tinggi panel berubah; tanpa error console.

### [x] R8 — Transisi batas section lain (disetujui 2026-10-26)

Dikerjakan setelah R7 karena batas Projects → Skills bergantung pada layout Skills final. Semua memakai `motion/paintColors.ts` dari R6 (warna token runtime, ikut tema), aturan mobile (versi ringan) dan reduce (divider statis tanpa animasi) yang sama, serta canvas/ticker yang hanya hidup selama trigger aktif.

| Batas                 | Transisi                                                                                                                     | Teknik                                                                   |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| About → Projects      | **Tetesan cat**: beberapa alur cat `--primary` menetes dari tepi bawah About, panjang berbeda, ujung bulat, mengikuti scroll | SVG path `scaleY` scrub (ringan, warna dari class `fill-primary`)        |
| Projects → Skills     | **Sapuan roller**: pita cat lebar bertepi kasar melintas horizontal lalu terbuka memperlihatkan blok Skills                  | `clip-path` pada pita + tekstur tepi digambar sekali di canvas statis    |
| Skills → Achievements | **Stensil**: bentuk "A" (logo) tersemprot lewat stensil, lalu stensil "diangkat" membuka Achievements                        | mesin `sprayPaint` dengan masker bentuk A (clip path canvas), scrub      |
| Achievements → Footer | **Percikan**: cipratan kecil `--brand-red` / `--primary` muncul di tepi atas footer saat masuk                               | canvas statis kecil, digambar sekali saat masuk (tanpa scrub)            |

File: `motion/sprayPaint.ts` (mode masker & percikan), `components/site/SprayTransition.vue` (opsi `kind`) atau komponen kecil per jenis bila logikanya terlalu berbeda, `components/site/PaintDrip.vue` (baru, SVG), `pages/LandingPage.vue`, `components/ui/landing-page/Projects.vue` (penanda batas Projects → Skills), `layouts/app/AppHeaderLayout.vue` atau footer (penanda batas footer).

Risiko:

- Lima transisi di satu halaman → total ScrollTrigger & canvas bertambah; hanya satu canvas aktif dalam satu waktu (yang lain dilepas), dicek `ScrollTrigger.getAll()` stabil saat navigasi.
- Efek berulang terasa berlebihan → durasi/jarak scroll batas lain lebih pendek dari Hero → About; Hero → About tetap jadi momen utama.
- Stensil "A" memakai bentuk siluet robot/logo dari path SVG yang sama dengan R2 supaya konsisten (path diekspor sekali, tidak digambar ulang).

Catatan hasil: empat komponen kecil (logikanya terlalu berbeda untuk satu `SprayTransition` ber-`kind`), semuanya `aria-hidden`, lewat `useMotion`, warna token: **`PaintDrip.vue`** (About → Projects; tepi gelombang `fill-primary` + 14 tetesan `bg-primary rounded-b-full`, posisi dari PRNG ber-seed agar sama tiap render; scrub `top 85%` → `top 35%`: tepi dibuka kiri→kanan lalu tiap tetesan dibuka dari atas dengan `clip-path` sehingga ujung bulatnya tidak gepeng; mobile setengah tetesan; reduce/no-JS: tetesan penuh statis), **`PaintRoller.vue`** (di dalam `Projects.vue` sebelum Skills; pita kanvas statis `drawRollerStripe` — tepi kasar, serat, bagian kering — dibuka `clip-path` sambil kepala roller bergerak ikut, lalu memudar; reduce: pita saja), **`PaintStencil.vue`** + `motion/stencil.ts` (Skills → Achievements; lapisan cat offscreen digambar per progres lalu dikomposit ke dua kanvas: dinding = cat `source-in` bentuk A, pelat = kartu `--card`/`--border` berlubang A + overspray `source-atop`; 65% pertama scrub menyemprot, 35% sisanya pelat terangkat `y -48, rotate -10°, autoAlpha 0`; A = kedua kaki robot + palang di antaranya; mobile kepadatan 0.6; reduce: huruf jadi tanpa pelat), **`PaintSplash.vue`** (Achievements → Footer; kanvas `drawSplash` sekali, margin negatif = margin atas footer sehingga duduk tepat di garis footer, muncul `scale 0.6 → 1` sekali; reduce: tanpa pop). Kanvas statis digambar ulang pada event `refresh` ScrollTrigger (bukan `resize` mentah, agar perubahan bilah URL mobile tidak memicu) dan saat tema berganti. `paintColors` kini juga membaca `--card` dan `--border`; `random`/`gaussian`/`sprite`/`fitCanvas` dibagi dari `sprayPaint.ts`. Perbaikan setelah melihat hasil: tepi gelombang tetesan bolong karena perintah `T` (titik kontrol terpantul melewati y=0 dan path berpotongan sendiri) → segmen `Q` eksplisit dengan kontrol di bawah. Terverifikasi di build (skrip CDP; 1280 light/dark, 375 mobile, 1280 reduce): keempat transisi tampil pada progres 0.2–1 sesuai urutan; pelat stensil digambar ulang saat tema berganti; percikan berjarak 0px dari tepi atas footer; sapuan seluruh halaman **0 long task**, p95 frame 17ms (jeda tunggal 200–600ms muncul acak antar-run, juga di reduce yang nyaris tanpa animasi, dan hilang di run lain → artefak Chromium headless tanpa GPU, perlu dicek di perangkat nyata); kode transisi hanya di chunk `LandingPage`; tanpa error console.

---

## 5. Revisi 2

Dikerjakan **satu tahap tiap "lanjut"**, urut R9 → R14. R10 sebelum R12/R14 karena path A dipusatkan dulu; R11 sebelum R12 karena R12 memakai ulang komponen R11; R13 sebelum R14 karena helper canvas bersama dipindah di R13 sebelum sisa kode cat R8 dihapus di R14. Penutup tiap tahap **sama dengan §2**: `npm run lint`, `npm run types:check`, `npm run build`; cek `git diff --stat` tidak menyentuh `app/ routes/ database/ config/ .env` dan `git diff resources/css/app.css` tidak mengubah `--primary`/`--primary-foreground`; centang tahap di dokumen ini; **JANGAN `git add`, `git commit`, atau `git push`**; ringkasan + usulan pesan commit; berhenti.

Semua aturan §4 tetap berlaku: data tidak berubah (hanya prop yang sudah dikirim controller), `--primary`/`--primary-foreground` & Poppins dikunci, **tidak ada warna literal baru** (class token, `color-mix(in oklab, var(--…) N%, transparent)`, canvas membaca token saat runtime lewat `motion/paintColors.ts`), GSAP/Lenis hanya lewat `motion/gsap.ts`/`motion/lenis.ts` di kode public, semua animasi lewat `useMotion` (matchMedia `desktop`/`mobile`/`reduce`), reduce tanpa konten tertinggal di `opacity: 0`. File yang jadi tidak terpakai **dihapus di tahapnya** (disetujui user, lihat pertanyaan #4 di bawah), setelah dicek dengan `grep` tidak ada lagi yang mengimpornya.

### Benturan dengan rencana/keputusan lama & penyelesaiannya

| Revisi                | Bertentangan dengan                                                                          | Penyelesaian                                                                                                                                                                                                |
| --------------------- | -------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R9 glass              | `--glass-nav-bg`/`--glass-nav-border` sekarang berisi `hsl()` literal                         | Bukan warna baru: utility `glass-nav` diganti ke turunan token; dua variabel lama dihapus dari `app.css` (hanya dipakai `glass-nav`).                                                                        |
| R11/R12 layout        | Keputusan #4 (daftar judul sebagai pembeda dari referensi; Achievements dicerminkan + flip)  | Keputusan #4 direvisi. Pembeda dari carousel `01 / 12` referensi tetap: tumpukan kartu (bukan geser horizontal), tanpa counter, teks panel berganti dengan mask reveal tersinkron.                           |
| R11 kartu gambar saja | "Data kartu tetap utuh" (R4)                                                                  | Data pindah ke panel kiri: judul, deskripsi, `date_range`, `tech_list` (Projects) / badge tipe, issuer, `date_format` (Achievements), link detail. Tidak ada field yang hilang dari landing.                |
| R13 tumpahan cat      | §0 "curved wipe tidak ditiru"                                                                 | Bukan kurva geometris tunggal yang menyapu: tepi cair tidak beraturan (gelombang berlapis + lelehan jari yang mendahului), fase surut dengan sisa lelehan menggantung, kesan gravitasi.                    |
| R14 transisi halaman  | §0 "curved wipe tidak ditiru"                                                                 | Semua jenis bertepi lurus/sudut atau berbasis lipatan/engsel; iris berpusat di **pojok** (bukan pita lengkung melintang). Keempat jenis disetujui.                                                         |
| R14 acak              | Determinisme R6/R8 (gambar sama tiap render)                                                  | Acak hanya saat memilih jenis (sekali per sesi, disimpan); gerak tiap jenis tetap deterministik terhadap progres scrub → scroll bolak-balik identik.                                                         |

### Pertanyaan terbuka — sudah dijawab (2026-10-26)

1. **R11 — animasi transisi kartu** → **Opsi A** (tirai terangkat + parallax).
2. **R14 — jenis transisi** → **keempatnya disetujui** (lipat sudut, bilah diagonal, iris dari pojok, balik halaman) dan semuanya masuk undian.
3. **R14 — warna lembar halaman** → **(a)** `--primary`, dengan sisi belakang/lipatan `--primary-strong`.
4. **Penghapusan file** → **disetujui**: file yang jadi tidak terpakai langsung dihapus di tahapnya, tanpa ditanyakan lagi. Daftarnya: R13 → `components/site/SprayTransition.vue`; R14 → `components/site/PaintDrip.vue`, `PaintRoller.vue`, `PaintStencil.vue`, `PaintSplash.vue`, `motion/stencil.ts`, `motion/sprayPaint.ts`; R11/R12 → file apa pun yang ternyata tidak terpakai lagi setelah pembersihan. Sebelum menghapus, tiap file dicek dulu dengan `grep` untuk memastikan tidak ada lagi yang mengimpornya, dan yang dihapus dicatat di catatan hasil tahap.

### [x] R9 — Navbar glass

Kondisi sekarang: `Navbar.vue` memasang `glass-nav` pada pill `<nav>` saat `isScrolled` (`y > 24` atau menu terbuka), selain itu `border-transparent bg-transparent`; transisi `transition-all duration-500`. `glass-nav` (`app.css`) = `--glass-nav-bg` (putih 2%, praktis bening) + border 6% + `blur(12px)`.

Rencana teknis:

- `app.css` — utility `glass-nav` diganti:
  - `background-color: color-mix(in oklab, var(--background) 80%, transparent)` (light & dark memakai rumus yang sama, ikut tema otomatis).
  - `border: 1px solid color-mix(in oklab, var(--border) 70%, transparent)`.
  - `box-shadow: 0 10px 30px -14px color-mix(in oklab, var(--foreground) 22%, transparent), inset 0 1px 0 color-mix(in oklab, var(--background) 60%, transparent)` (bayangan halus + kilap tepi atas kaca).
  - `backdrop-filter: blur(20px) saturate(1.6)` (+ `-webkit-`).
  - `@supports not (backdrop-filter: blur(1px))` → background naik ke 92% supaya tetap terbaca tanpa blur.
  - Variabel `--glass-nav-bg`/`--glass-nav-border` dihapus (hanya dipakai utility ini).
- `Navbar.vue` — `transition-all duration-500` → `transition-[background-color,border-color,box-shadow,backdrop-filter] duration-250 ease-out-expo` (±0.25s; tidak lagi ikut menganimasikan properti lain). Kondisi di top tidak berubah. Mobile menu ikut memakai `glass-nav` baru (lebih terbaca dari sebelumnya).
- Pill aktif `bg-primary text-primary-foreground` (clip-path) tidak berubah.

File: `resources/css/app.css` (utility `glass-nav`, hapus 2 variabel lama di light & dark), `components/ui/landing-page/Navbar.vue`.

Verifikasi: kontras `text-muted-foreground`/`text-foreground` di atas kaca (target ≥ 4.5:1) pada light & dark saat di atas hero, kartu, gambar terang/gelap, dan di atas tumpahan cat `--primary` (overlay `z-30` di bawah navbar `z-50`); transisi masuk/keluar saat melewati `y = 24`; tidak ada perubahan saat di top; halaman listing/detail ikut.

Risiko:

- `backdrop-filter` blur besar di elemen `fixed` yang di-transform (hide/show `yPercent`) → biaya repaint; area pill kecil (maks `max-w-5xl` × ±56px), dicek di Performance panel.
- Menganimasikan `backdrop-filter` bisa patah-patah di Safari → bila terlihat, hanya `background-color`/`border`/`shadow` yang ditransisikan dan blur langsung aktif.
- Kaca 80% di atas gambar sangat kontras (mis. screenshot gelap di light mode) → bila kontras < 4.5:1 di kasus terburuk, naikkan ke 85%.

Catatan hasil: **blur navbar ternyata tidak pernah aktif sejak Tahap 6.** `view-transition-name: site-header` di `<header>` membuat header menjadi _backdrop root_, sehingga `backdrop-filter` pada pill `<nav>` di dalamnya hanya mem-blur isi header (kosong). Yang terlihat selama ini cuma tint 2%, dan dengan kaca baru teks di belakang navbar masih tajam. Perbaikannya: nama view transition dipindah ke `<nav>` (komentar di `Navbar.vue`). View transition antar-halaman tetap jalan: landing → All Projects → landing menangkap `NAV:site-header`, tanpa error. Penyimpangan dari rencana: (1) **opasitas kaca 85%**, bukan 80%. Dengan blur aktif, 80% masih memberi 3.5:1 di kasus terburuk (teks `muted` light mode di atas gambar kartu); 85% memberi ≥ 4.5:1 di semua posisi. (2) Variabel `--glass-nav-bg`/`--glass-nav-border` **tidak dihapus**, melainkan diisi ulang dengan turunan token, ditambah `--glass-nav-shadow` dan `--glass-nav-sheen`. Di dark mode bayangan memakai turunan `--background` (bukan `--foreground`, yang akan jadi pendar terang) dan kilap tepi memakai `--foreground` 8%. Build menambahkan fallback otomatis untuk browser tanpa `color-mix`. Hasil uji di build (skrip CDP; 1280 light/dark, 375 mobile light/dark):
- Di top tetap transparan (`backdrop-filter: none`, tanpa border/bayangan).
- Melewati `y = 24`, background dan blur beranimasi lalu selesai di ±0.25–0.3s; perilaku sama di halaman listing.
- Kontras **minimum per piksel** latar di area pill (teks disembunyikan saat sampling) di atas hero, semprotan cat penuh, About, gambar kartu Projects, kartu Achievements, dan footer: teks `muted` 4.52–5.6 (light) / 5.25–7.8 (dark); teks `foreground` ≥ 11.8.
- Kasus terendah 4.52 = light mode di atas cat `--primary` penuh.
- Tanpa error console.

### [x] R10 — Abot: A dengan sudut membulat

Kondisi sekarang: siluet A di `HeroBot.vue` = dua path kaki bersudut tajam (`M98 40 L110 62 L39 204 L16 204 Z`, kaki kanan dengan puncak `Q`), visor segitiga bersudut lunak hanya lewat `stroke-linejoin: round`, palang `rect rx=13`, telapak `rect rx=5.5`. Path A yang sama **disalin** di `motion/stencil.ts` (`A_SHAPES`, stensil R8) dan di punggung kartu `CardDeck.vue` (R5).

Rencana teknis:

- **`components/site/abotShape.ts`** (baru): titik-titik sudut A (kaki kiri, kaki kanan + puncak, lubang/visor, palang) + helper murni `roundedPath(points, radius)` yang membulatkan **setiap** sudut poligon dengan busur beradius sama (sudut lancip seperti puncak & ujung kaki memakai radius efektif yang dibatasi panjang sisi agar tidak terpotong). Diekspor sebagai string path konstan (dihitung sekali saat modul dimuat): `A_LEG_LEFT`, `A_LEG_RIGHT`, `A_VISOR`, `A_CROSSBAR`, plus `A_VIEWBOX`.
- Radius & stroke konsisten: sudut luar r ≈ 8, sudut dalam (lubang A/visor) r ≈ 6, semua panel `stroke-width 2`; palang & telapak berbentuk kapsul (`rx` = setengah tinggi). Puncak A jadi kubah membulat; ujung kaki melebur ke telapak membulat; visor jadi segitiga lunak; sambungan palang–kaki membulat (palang kapsul menembus kaki).
- `HeroBot.vue` memakai path dari `abotShape.ts`. **Titik pivot tidak dipindah**: `SHOULDER_LEFT/RIGHT`, `FEET`, pivot antena (`110 26`) tetap; bila puncak membulat menggeser dasar antena, antena digeser bersama pivot-nya sehingga `svgOrigin` tetap tepat. Ref (`visor`, `eyes`, `armLeft`, `armRight`, `body`, `antenna`, `halo`, `shadow`) dan seluruh logika R2–R3 (dialog HUD, gestur, mata ikut kursor, pusing, bicara) tidak diubah. Sendi lutut hexagon ikut dibulatkan dengan helper yang sama.
- Jalur sirkuit kaki kiri disesuaikan agar tetap di dalam kaki yang kini membulat.
- `data-intro-target` tetap di wrapper `Hero.vue` → titik `clip-path: circle()` splash tidak berubah.
- Pemakai lain: `motion/stencil.ts` dan punggung kartu `CardDeck.vue` mengimpor path dari `abotShape.ts` (tidak menyalin) sehingga tetap konsisten sampai keduanya dihapus di R12/R14.

File: `components/site/abotShape.ts` (baru), `components/site/HeroBot.vue`, `motion/stencil.ts`, `components/site/CardDeck.vue`.

Verifikasi: siluet terbaca sebagai A di `h-28`, `md:h-36`, `xl:h-80`, light & dark; gestur wave/hop/nod/point/pusing berputar di pivot yang benar; titik akhir circle splash = pusat robot (< 1px) di 1280/768/375; dialog jalan; reduce statis.

Risiko:

- Sudut terlalu bulat → terbaca seperti "Λ" lunak/tenda, bukan A → radius puncak dibatasi, palang tetap tegas; dicek visual di 3 ukuran.
- Stroke panel `fill-card stroke-border` tampak menebal di sudut lancip → `stroke-linejoin: round` + radius minimal per sudut.

Catatan hasil:
- **Siluet**: kedua kaki kini **satu siluet** `A_SILHOUETTE` (puncak, kaki kanan, celah di antara kaki, kaki kiri). Logo memang tidak punya palang, jadi "lubang" A adalah celah terbuka di antara kaki. Siluet dibulatkan `roundedPath` dengan busur `A` sungguhan: sudut luar r 8 (sudut kaki lancip otomatis dibatasi ±7 karena sisi telapak hanya 23), ujung celah r 6 sebagai fillet (sudut refleks, arah busur dari tanda perkalian silang).
- **Warna dua kaki**: panel `fill-card stroke-border` di kiri dan slab `fill-primary` di kanan didapat dari siluet yang sama, di-clip dua sisi garis sambungan (`A_SPLIT_LEFT`/`A_SPLIT_RIGHT`, id clip dari `useId`).
- **Penyimpangan kecil dari rencana**: garis sambungan tidak langsung turun dari ujung celah. Pada uji pertama, fillet terbelah vertikal (separuh panel, separuh biru) dan terlihat sebagai takik di ukuran mobile. Garis kini menyusuri tepi dalam kaki kanan sampai titik singgung fillet, baru turun lewat celah, sehingga fillet seluruhnya milik panel.
- **Visor**: kini segitiga `A_VISOR` r 8 (fill saja), bukan segitiga + stroke 10. Lutut hexagon r 2. Palang dan telapak sudah berbentuk kapsul; palang kini memakai `A_CROSSBAR` bersama.
- **Tidak berubah**: semua pivot (`SHOULDER_*`, `FEET`, antena `110 26`). Kubah puncak (y ≈ 26) jatuh tepat di dasar antena. Jalur sirkuit tetap di dalam kaki tanpa perlu digeser.
- **Pemakai lain**: `motion/stencil.ts` (siluet + palang) dan punggung kartu `CardDeck.vue` (siluet, visor, palang) mengimpor dari `abotShape.ts`.
- **Hasil uji di build** (skrip CDP):
  - Robot di 1280 light/dark, 768, dan 375 dark terbaca sebagai A membulat.
  - Titik akhir `circle()` splash = pusat robot (selisih ≤ 0.5px) di ketiga lebar.
  - Klik membuka dialog dan lambaian berputar di bahu.
  - Stensil R8 menggambar A baru; bbox path punggung kartu valid.
  - Reduce dan mobile tanpa elemen hero di opacity 0; tanpa error console.

### [x] R11 — Projects: panel info kiri + tumpukan gambar kanan

Arsitektur (dipakai persis sama oleh R12):

- **`site/DeckShowcase.vue`** (baru): pemilik layout & sinkronisasi. Props `items`, `label`, `itemLabel` ("project"); slot `#media="{ item }"` (isi kartu gambar), `#info="{ item }"` (isi panel per item), `#cta`. Memegang `active` dan memanggil `useDeck` dengan **dua** ref (tumpukan + panel) sehingga gerak gambar dan teks ada di **satu timeline** → tersinkron.
  - `lg`: `grid-cols-[minmax(0,5fr)_minmax(0,7fr)]`, panel **kiri**, tumpukan **kanan** (urutan DOM: panel dulu, supaya judul aktif terbaca sebelum gambar).
  - Di bawah `lg`: tumpukan gambar di atas (`order-first`), panel info + tombol di bawahnya.
- **`site/CardDeck.vue`**: hanya tumpukan gambar — slot `#media`, tanpa `side`. Atribut aksesibilitas R4 tetap (`carousel`/`slide`, `inert`, `tabindex`, keyboard). Varian `flip` + punggung kartu tetap ada sampai R12 karena Achievements masih memakainya di antara R11 dan R12.
- **`site/DeckPanel.vue`** (ditulis ulang): **daftar judul dihapus**. Isi: semua blok info item ditumpuk di satu sel grid (tinggi panel = item tertinggi, tanpa ukur JS, tidak ada layout shift saat ganti); hanya blok aktif yang terlihat, blok lain `invisible` + `inert`. Di bawahnya: bar progres tipis `scaleX = (active + 1) / n` (tanpa angka), tombol **Previous project / Next project**, slot CTA ("See More Projects"), live region `sr-only aria-live="polite"` "Showing {judul}" (pola R4).
- **`site/DeckMedia.vue`** (baru): kartu gambar saja — `rounded-3xl overflow-hidden bg-muted`, rasio tetap (`aspect-[4/3]` di `lg`, `aspect-[16/10]` di bawahnya), `<img>` di dalam pembungkus `[data-parallax]` yang di-`scale` ±1.12 (ruang untuk parallax), `object-cover`. Kartu adalah `<Link view-transition>` ke detail dengan `tabindex="-1"` + `aria-hidden="true"` (link utama yang bisa difokus ada di panel, jadi tidak ada link ganda bagi keyboard/pembaca layar), `draggable="false"`; elemen `[data-media]` dipakai `shareElement`.
- Isi panel Projects (slot `#info`): `date_range` (eyebrow kecil), **judul** (`h3`), **deskripsi** (utuh), `tech_list` (chip ringkas, wrap), link **"View project"** (`<Link view-transition>`; `@before` memanggil `shareElement` pada `[data-media]` kartu depan → gambar tetap "terbang" ke hero detail).
- `useTilt` dilepas dari kartu deck (parallax di dalam kartu menggantikannya; listing tetap memakai tilt). Varian `deck` di `ProjectCard.vue` dihapus (varian `card` listing tidak berubah).

**Opsi animasi transisi kartu** — semua: sadar arah, 0.8–0.95s, ease `brand`, satu timeline dengan teks panel. Pose tumpukan untuk semua opsi: kartu belakang bergeser **ke atas** (`y -14 / -28px`), `scale 0.95 / 0.90`, tanpa rotasi, sedikit diredupkan overlay `bg-background` 0.15 / 0.3.

- **A — Tirai terangkat + parallax** _(**dipilih user**, 2026-10-26)_. Maju: kartu depan "ditarik" ke atas — `clip-path inset(0 0 0% 0)` → `inset(0 0 100% 0)` (tepi bawah naik), sementara gambar di dalamnya bergerak lebih lambat ke atas (`yPercent 0 → -10`, `scale 1.12 → 1.18`) sehingga terasa ada kedalaman; bersamaan kartu kedua maju ke slot depan (`y`, `scale` → 1, overlay → 0) dan gambarnya turun pelan ke posisi (`yPercent 6 → 0`). Setelah tertutup penuh, kartu lama dipindah ke slot belakang (zIndex, `clip` dikembalikan saat tak terlihat). Mundur: kartu paling belakang dipindah ke depan dalam keadaan tertutup lalu tirai **turun** `inset(0 0 100% 0)` → `inset(0)`, gambarnya bergerak `yPercent -10 → 0`; kartu depan lama mundur satu slot. Teks: baris judul & deskripsi keluar ke **atas** dengan mask (`yPercent 0 → -105`, stagger 0.03, 0.35s), baris baru masuk dari **bawah** (mulai saat tirai ±40%); meta (`date_range`, chip, link) fade + `y 8` stagger. Mundur: arah teks dibalik. Kesan: editorial, berat, rapi; hanya `clip-path` + `transform`.
- **B — Dorongan kedalaman (dolly)**. Maju: kartu depan bergerak ke arah pengguna (`scale 1 → 1.12`, `y +3%`, `autoAlpha → 0`) seolah lewat di samping kamera, tumpukan naik satu slot, gambar kartu baru `scale 1.2 → 1.12` (counter-zoom). Mundur: kartu datang dari depan kamera (`scale 1.12 → 1`, `autoAlpha 0 → 1`) dan mendarat di tumpukan; yang lain mundur. Teks: mask line seperti A, judul `scale 1.03 → 1`. Kesan: sinematik, tetapi mengandalkan fade gambar besar sehingga kurang "berbobot" dibanding A.
- **C — Geser & selip**. Maju: kartu depan meluncur ke kiri (`x -55%`, `rotation -3°`) sementara gambarnya bergeser berlawanan (`xPercent +12`, parallax), lalu menyelip di belakang tumpukan ke slot terakhir; mundur dari kanan. Teks: mask line horizontal (keluar ke kiri/masuk dari kanan, dibalik saat mundur). Kesan: paling "fisik", tetapi paling mirip toss R4, dan geser horizontal mendekati carousel referensi.

Perilaku yang dipertahankan dari R4: drag/swipe hanya kartu depan (`Draggable type: 'x'`, `allowNativeTouchScrolling`), kartu mengikuti jari (gambar ikut bergeser kecil); dilepas > 25% lebar atau cepat → **maju** (drag ke mana pun = maju, seperti R4), selain itu kembali 0.3s; klik setelah drag ditelan. Keyboard: panah kiri/kanan, Home/End. `inert` pada kartu & blok info non-aktif; tepat satu kartu interaktif. Live region di panel. Input selama transisi: mengikuti R4. Reduce: ganti instan (`set`), tanpa clip/parallax/mask; konten akhir sudah benar tanpa JS.

Teks tersinkron: `splitLines` (`motion/split.ts`) dipanggil pada blok lama & baru saat transisi dimulai lalu di-revert setelah selesai (pola Tahap 3/R3, tahan resize). Entrance pertama (sekali saat section terlihat): kartu mendarat bertumpuk + `revealMedia` kartu depan; panel: baris judul/deskripsi mask reveal + meta fade-up. Parallax scroll kecil pada gambar kartu depan (`yPercent ±4`, scrub, desktop saja).

Mobile/tablet: tumpukan di atas, panel di bawah; durasi 0.6s, parallax & offset slot lebih kecil.

`useDeck.ts`: preset `toss` dihapus, preset baru `curtain` (opsi A) ditambahkan dengan langkah teks (`panel` opsional di opsi `useDeck`). Preset `flip` tetap sampai R12.

File: `components/site/DeckShowcase.vue` (baru), `components/site/DeckMedia.vue` (baru), `components/site/CardDeck.vue`, `components/site/DeckPanel.vue`, `motion/useDeck.ts`, `components/site/ProjectCard.vue` (hapus varian `deck`), `components/ui/landing-page/Projects.vue`. Diperkirakan tidak ada file yang dihapus; kalau ternyata ada yang tidak terpakai, langsung dihapus (disetujui).

Risiko:

- Deskripsi panjang → panel kiri lebih tinggi dari tumpukan; tinggi sel grid mengikuti item terpanjang (stabil, tanpa shift). Bila terlalu tinggi di `lg`, usulan `line-clamp` ditanyakan dulu (tidak diputuskan sepihak karena menyembunyikan data).
- `SplitText` pada blok yang `invisible` tetap mengukur baris dengan benar karena sel grid punya lebar; diverifikasi.
- Gambar screenshot ponsel (portrait) ter-crop di rasio 4/3 → `object-position: top`; dicek dengan data nyata.
- Shared-element dari link di panel: nama dipasang ke `[data-media]` kartu depan di `@before`, bukan ke elemen panel; link di panel `inert` selama transisi sehingga kartu depan selalu diam saat diklik.
- `clip-path` + `will-change: transform` pada gambar besar: `will-change` hanya selama timeline.

Catatan hasil:

- **Arsitektur, menyimpang dari rencana**: `CardDeck`/`DeckPanel` **tidak** ditulis ulang. Achievements masih memakainya (flip) sampai R12, jadi showcase dibuat sebagai komponen baru:
  - **`DeckShowcase.vue`**: layout, panel, tumpukan, tombol, bar progres, live region.
  - **`DeckMedia.vue`**: kartu gambar saja.
  - **`motion/useShowcase.ts`**: tirai + teks dalam **satu timeline**, drag, keyboard.

  `useDeck.ts` kini hanya berisi `flip` (preset `toss` dihapus). R12 memindahkan Achievements ke `DeckShowcase` lalu menghapus `CardDeck.vue`, `DeckPanel.vue`, dan `useDeck.ts`. Varian `deck` di `ProjectCard.vue` dihapus (prop `variant` ikut hilang; listing tidak berubah).
- **Sinkronisasi teks**: blok info semua item ditumpuk di satu sel grid. Watcher `active` (flush `pre`) berjalan sebelum Vue memindahkan class `invisible`, sehingga blok lama ditahan terlihat lewat inline `visibility` selama keluar, dan baris blok baru sudah diset di bawah mask sebelum frame pertama. Split di-revert di akhir timeline; bila transisi baru menyela, timeline lama `progress(1)` sehingga revert tetap jalan.
- **Tirai**:
  - Clip memakai px dengan margin 48px (`inset(-48px … tinggi+48px …)`) supaya bayangan kartu tidak terpotong.
  - Bug yang ditemukan & diperbaiki: `set` lalu `to` pada clip membaca balik bentuk singkat browser (`inset(-48px)`), sehingga sisi kiri ikut bergerak. Sekarang selalu `fromTo` dengan kedua nilai eksplisit (pelajaran Tahap 6).
  - Gambar di-zoom 1.08 di dalam kartu sebagai ruang parallax: keluar `yPercent → -6`, kartu yang maju `4 → 0`, kartu yang turun saat mundur `-6 → 0`. Saat drag, gambar tertinggal sedikit (`xPercent` ±4).
- **Penyesuaian setelah melihat hasil**:
  1. Rasio kartu **16/10 di semua ukuran**. Dengan 4/3 di `lg`, kartu ±507px terpotong di layar 800px.
  2. **Di bawah `lg` tombol Prev/Next ada tepat di bawah tumpukan**, di atas teks. Tinggi panel mengikuti item terpanjang, jadi item pendek meninggalkan ruang kosong besar sebelum tombol.
  3. **Parallax scroll dihilangkan**. Ditambah parallax transisi, ruang zoom 1.08 tidak cukup (tepi gambar terlihat); parallax transisi sudah memenuhi permintaan.
  4. "Link `inert` selama transisi" diganti `settle()`: klik "View project" menuntaskan timeline lebih dulu, baru memberi nama shared element.
- **Kartu gambar**: tetap bisa diklik (`tabindex="-1"`, `aria-hidden`). Link "View project" di panel punya teks `sr-only` judul supaya namanya unik.
- **Hasil uji di build** (skrip CDP; 1280 light/dark, 768 dark, 375 mobile light/dark, 1280 reduce):
  - Lolos di semua view: Next, Prev, panah kiri/kanan, End, Home, drag pendek kembali, drag panjang kiri & kanan maju, dua klik Next cepat.
  - Di tiap langkah: tepat 1 kartu non-`inert`, blok info yang terlihat cocok dengan kartu depan, live region "Showing …" dan bar progres ikut, tanpa teks tertinggal di opacity 0.
  - Frame tengah transisi: tirai naik saat maju dan turun saat mundur, baris lama keluar ke atas (maju) atau masuk dari atas (mundur).
  - "View project" maupun klik gambar membuka detail dengan `project-media-{id}` di kedua sisi view transition.
  - Reduce berganti instan.
  - Sapuan seluruh halaman: tidak ada elemen di opacity 0, tanpa error console. Jeda frame tunggal 1–1.5s muncul acak di semua view, **termasuk reduce**, jadi bukan dari animasi (artefak headless, lihat R8).

### [x] R12 — Achievements: sama persis dengan Projects

Rencana teknis:

- `Achievements.vue` memakai `DeckShowcase` + `DeckMedia` yang sama (panel **kiri**, tumpukan gambar **kanan**, tidak dicerminkan; mobile: gambar di atas, panel di bawah) dan preset animasi yang sama dengan R11. `itemLabel="achievement"` → tombol "Previous achievement" / "Next achievement", CTA "See More Achievements".
- Isi panel (slot `#info`): badge tipe (`item.type` → "Certification"/"Award", ikon sama dengan kartu sekarang), **judul**, issuer, `date_format`, **deskripsi**, link "View achievement" ke detail (`shareElement` → `achievement-media-{id}`).
- Pembersihan (diperbarui setelah R11): `CardDeck.vue` (preset flip, punggung kartu, path A), `DeckPanel.vue` (daftar judul), dan `motion/useDeck.ts` tidak dipakai lagi setelah Achievements pindah → **file dihapus** (disetujui). Varian `deck` di `AchievementCard.vue` dihapus (varian `card` listing tetap). Utility `transform-3d`/`backface-hidden`/`rotate-y-180` adalah bawaan Tailwind (bukan CSS kustom), jadi tidak ada yang dihapus dari `app.css`.

File: `components/ui/landing-page/Achievements.vue`, `components/site/AchievementCard.vue`; dihapus: `components/site/CardDeck.vue`, `components/site/DeckPanel.vue`, `motion/useDeck.ts`.

Risiko:

- Sertifikat (landscape/portrait campuran) ter-crop di rasio tetap → `object-position: top`; bila bagian penting terpotong, usulan `object-contain` di atas `bg-muted` khusus achievements ditanyakan (menyimpang dari "sama persis").
- Projects & Achievements kini identik → karakter berbeda dari R5 hilang; sesuai permintaan.

Catatan hasil:
- **Struktur**: `Achievements.vue` memakai `DeckShowcase` + `DeckMedia` dengan isi slot sejajar Projects. Panel kiri: badge tipe (ikon `FileBadge`/`Award` + "Certification"/"Award"), judul, issuer + `date_format` (ikon sama dengan kartu listing), deskripsi utuh, link "View achievement" (+ judul `sr-only`, `shareMedia` → `achievement-media-{id}`). Kartu gambar tanpa foto memakai ikon tipe yang sama sebagai fallback. Animasi, layout, dan perilaku 100% dari komponen R11, tanpa opsi atau varian.
- **Dihapus** (disetujui; `grep` memastikan tidak ada lagi yang mengimpor): `components/site/CardDeck.vue`, `components/site/DeckPanel.vue`, `motion/useDeck.ts`. Varian `deck` dan prop `variant` dihapus dari `AchievementCard.vue`; ikon yang tersisa masih dipakai kartu listing. Tidak ada CSS kustom flip di `app.css` (utility 3D adalah bawaan Tailwind). Path A punggung kartu ikut hilang bersama `CardDeck.vue`.
- **Rasio gambar**: sertifikat landscape dengan `object-top` terbaca baik di rasio 16/10, jadi `object-contain` tidak diperlukan.
- **Hasil uji di build** (skrip CDP R11 pada `#achievement`; 1280 light, 375 mobile dark, 1280 reduce):
  - Semua skenario R11 lolos: tepat 1 kartu aktif, blok info cocok, live region & bar progres ikut, tirai naik/turun sesuai arah.
  - Navigasi ke detail memakai `achievement-media-2` di kedua sisi.
  - Satu run mobile sempat macet saat tiga Chromium dijalankan paralel (port acak skrip bertabrakan); dijalankan sendiri lolos.
  - Sapuan seluruh landing (1280 dark, 375 light, reduce) serta halaman All Projects / All Achievements: tidak ada elemen di opacity 0, tanpa error console.

### [x] R13 — Hero → About: tumpahan cat

Rencana teknis:

- **`motion/canvas.ts`** (baru): `fitCanvas` (DPR cap) dan PRNG `random(seed)` dipindah dari `sprayPaint.ts` (dipakai pour; `sprayPaint.ts` mengimpor balik sampai dihapus di R14).
- **`motion/liquidPour.ts`** (baru, mesin tanpa Vue): `createPour(canvas, { seed, mobile })` → `render(p)`. Bentuk dihitung **murni dari progres** `p` (tanpa waktu) → scrub mundur identik.
  - **Tuang** `0 → 0.5`: tepi depan `y(x) = H · g(p) + gelombang(x, p) + Σ lelehan(x, p)`. `g` dipercepat (gravitasi, kurva `power2.in`); gelombang = 3 sinus berlapis (amplitudo & fase dari seed, fase bergeser pelan dengan `p` sehingga tepi "mengalir"); lelehan = 6–8 jari (mobile 3–4) berbentuk lonceng sempit berujung membulat yang memanjang **lebih cepat** dari tepi utama lalu tersusul. Path = polyline ±1 titik per 8px yang dihaluskan dengan kurva kuadrat titik-tengah. Layar tertutup penuh di `p ≈ 0.5`.
  - **Tahan** `0.5 → 0.56` (jendela tertutup sempit).
  - **Surut** `0.56 → 1`: tepi belakang (atas) cat turun dipercepat dan bergelombang; beberapa "tirai lelehan" tertinggal menggantung dari atas (lobus terbalik yang menipis lalu tersusul); cat keluar dari bawah layar → About terlihat; kanvas kosong di `p = 1`.
  - Lapisan: isi `--primary`; pita meniskus di tepi depan/belakang `--primary-strong` (`globalAlpha` ±0.5, offset beberapa px) untuk volume; garis kilap tipis `--primary-foreground` (`globalAlpha` ±0.18) sedikit di dalam tepi. Tanpa filter SVG (`feTurbulence`/gooey), tanpa partikel.
- **`site/PourTransition.vue`** (baru, menggantikan `SprayTransition.vue`, siklus hidup sama dengan R6): penanda tinggi 0 di batas Hero/About, kanvas `fixed inset-0 z-30` di-`Teleport` ke `<body>`, `aria-hidden`; ScrollTrigger tanpa pin, rentang penanda 80% → top (±0.8 viewport), progres dari `onUpdate`, gambar di `gsap.ticker` hanya bila berubah; `onToggle` mengosongkan kanvas, `visibility: hidden`, ticker dilepas. Warna dari `readPaintColors()`, digambar ulang saat tema berganti (`onThemeChange`) dan saat `refresh`.
- **MorphSVG tidak dipakai**: bentuk tumpahan parametris (tepi + lelehan dihitung dari `p`), jadi tidak butuh keyframe path yang titiknya harus dicocokkan; canvas juga memakai ulang infrastruktur R6. (MorphSVG tersedia di gsap 3.15 bila nanti dibutuhkan.)
- **Mobile**: lelehan lebih sedikit, titik tepi tiap 14px, tanpa garis kilap, DPR 1. **Reduce**: kanvas overlay tidak dibuat; **divider statis** `h-16` = tepi cat bergelombang + 4–5 lelehan pendek, digambar sekali (mesin yang sama pada pose beku), ulang saat resize/tema.
- `LandingPage.vue`: `SprayTransition` → `PourTransition`. `createSpray`/`drawSprayBand` dihapus dari `sprayPaint.ts`; sisanya (`gaussian`, `sprite`, `drawRollerStripe`, `drawSplash`) tetap sampai R14 karena masih dipakai komponen R8.
- **Hapus file** `components/site/SprayTransition.vue` (disetujui).

File: `motion/canvas.ts` (baru), `motion/liquidPour.ts` (baru), `components/site/PourTransition.vue` (baru), `motion/sprayPaint.ts`, `pages/LandingPage.vue`, `components/site/SprayTransition.vue` (dihapus).

Verifikasi: layar tertutup penuh di sekitar `p 0.5–0.56`; tepi tidak berpotongan sendiri (pelajaran R8: titik kontrol kuadrat dijaga di sisi yang benar); scrub mundur menghasilkan bentuk sama; 0 long task, menggambar ≤ 4 ms/frame (CPU 4×); light/dark; navbar glass (R9) terbaca di atas cat; reduce = divider statis, tanpa elemen di opacity 0.

Risiko:

- Isi path selayar per frame di DPR 1.5 pada layar besar → biaya fill; DPR cap + gambar hanya saat progres berubah; bila perlu kanvas dirender di 0.75× resolusi (tepi cair tetap halus karena bentuknya lunak).
- Gelombang yang hanya bergantung pada `p` terasa "beku" saat scroll berhenti → fase gelombang ikut `p`; riak kecil berbasis waktu hanya dipertimbangkan setelah melihat hasil (default: tanpa waktu, demi determinisme).
- Tetap terasa seperti "wipe" bila lelehan terlalu teratur → jarak, lebar, dan kecepatan lelehan dari PRNG dengan variasi besar.

Catatan hasil:
- **Mesin** `motion/liquidPour.ts`: tepi cat adalah height-map yang dihitung murni dari `p`:
  - tepi utama `lerp(…, p^1.7)` (jatuh dipercepat)
  - tiga gelombang berlapis (amplitudo 22/11/5px desktop, 14/7/3 mobile) yang fasenya mengalir dengan `p`
  - lobus: 7 lelehan saat menuang (mobile 4), tumbuh `^1.6` lebih cepat dari tepi; 5 tali saat surut (mobile 3), tertinggal di atas tepi atas lalu tergelincir terakhir

  Satu `fill` `--primary`, lalu di-clip ke cat: pita `--primary-strong` (16px, 50%) dan garis kilap `--primary-foreground` (20%, desktop saja). Tanpa partikel, filter, atau MorphSVG (bentuk parametris tidak butuh keyframe path).
- **Penyesuaian setelah melihat hasil**: profil lobus semula `exp(-d^2.6)` sehingga lelehan panjang tampak seperti paku/gigi. Diganti super-Gaussian `exp(-d^4)` (sisi tegak, ujung bulat) dan sedikit dilebarkan.
- **Struktur kode**:
  - `motion/canvas.ts` (baru): `random` dan `fitCanvas` dipindah dari `sprayPaint.ts`; `PaintDrip`/`stencil` mengimpor dari sini.
  - `sprayPaint.ts` kini hanya berisi `gaussian`, `sprite`, `drawRollerStripe`, `drawSplash` untuk R8, dan dihapus di R14.
  - `paintColors.ts` ditambah token `primary-foreground`.
  - `PourTransition.vue` menggantikan `SprayTransition.vue` dengan siklus hidup yang sama: rentang 80% → top, ticker hanya saat aktif, reduce = divider `h-16`. Tidak ada lagi pembaruan inkremental, karena tiap frame adalah satu path.
  - **`SprayTransition.vue` dihapus** (disetujui; tidak ada importir lain).
- **Hasil uji di build** (skrip CDP; 1280 light/dark, 375 mobile, 1280 reduce dark):
  - Cakupan per progres: 0.1 → 3%, 0.2 → 20%, 0.3 → 45%, 0.4 → 75%, 0.48 → 99%, **0.53 → 100%**, 0.6 → 100%, 0.7 → 87% (bagian atas sudah kosong), 0.8 → 58%, 0.9 → 18%, 0.97 → 0.2%.
  - Di luar rentang kanvas `hidden` & kosong.
  - Scrub mundur dan masuk-ulang dari kedua ujung memberi cakupan per baris identik.
  - Reduce: divider tergambar (33% piksel), overlay tidak dipakai.
  - Tanpa error console.
- **Performa**: sapuan cepat pertama (desktop, Lenis) tanpa jeda frame > 34ms. Pengukuran berikutnya **tidak representatif**: sebuah game sedang berjalan di mesin yang sama, build naik dari ±20s ke 6m38s, dan halaman headless sampai 15 detik memproses satu scroll. Target ≤ 4ms/frame belum terukur ulang, perlu dicek di perangkat nyata. (Saat beban itu, uji mobile sempat menunjukkan kanvas tidak muncul saat masuk ulang; setelah skrip menunggu event `scroll` benar-benar diproses, hasilnya benar, jadi bukan bug.)

### [x] R14 — Transisi batas section "membuka halaman baru"

Rencana teknis:

- **Hapus transisi R8**: `PaintDrip` (About → Projects), `PaintRoller` (Projects → Skills, di `Projects.vue`), `PaintStencil` (Skills → Achievements), `PaintSplash` (Achievements → Footer) dilepas dari markup. File `PaintDrip.vue`, `PaintRoller.vue`, `PaintStencil.vue`, `PaintSplash.vue`, `motion/stencil.ts`, `motion/sprayPaint.ts` (sisa) dihapus (disetujui).
- **Konsep**: satu **lembar halaman** overlay `fixed inset-0 z-30` (`Teleport` ke `<body>`, `aria-hidden`, `pointer-events-none`, `visibility: hidden` di luar rentang) yang **menutup** layar lalu **membuka** memperlihatkan section berikutnya, digerakkan scrub tanpa pin. Fase: tutup `0 → 0.45`, tertutup penuh `0.45 → 0.55` (sempit), buka `0.55 → 1`; tiap fase dipetakan lewat ease `brand`. Rentang ±0.45 viewport (Hero → About ±0.8) → lebih pendek. Hanya DOM + `transform`/`clip-path` (tanpa canvas, tanpa filter).
- **Jenis transisi** (keempatnya **disetujui** dan masuk undian). Lembar halaman berwarna `--primary`; sisi belakang, flap, dan lipatan berwarna `--primary-strong` (pertanyaan #3 → a):
  1. **Lipat sudut (corner peel)** — tutup: lembar "diletakkan" dari pojok, garis lipat diagonal bergerak dari pojok kanan-bawah ke kiri-atas; buka: pojok kiri-atas terkelupas — bagian di luar garis lipat hilang dari lembar dan tampil sebagai **flap** (sisi belakang, segitiga cermin) dengan gradasi bayangan turunan `--foreground` di sepanjang lipatan, sampai seluruh lembar terlipat lepas. Teknik: dua elemen `clip-path: polygon()` (lembar & flap) yang titiknya dihitung dari progres.
  2. **Bilah diagonal (diagonal blinds)** — 6 bilah (mobile 4) miring ±20° menutup berurutan dari satu sisi (`scaleX 0 → 1`, stagger), lalu membuka berurutan ke sisi lain (`scaleX 1 → 0` dengan `transform-origin` berlawanan), seperti kisi yang berputar membuka halaman. Teknik: `transform` saja (paling ringan, composited).
  3. **Iris dari pojok** — tutup: lingkaran tumbuh dari satu pojok (`clip-path: circle()`, radius → diagonal layar); buka: **lubang** lingkaran membuka dari pojok berlawanan (`clip-path: path(evenodd, …)` = persegi layar dikurangi lingkaran) sampai lembar habis. Pusat di pojok, bukan pita melintang.
  4. **Balik halaman (page turn)** — tutup: lembar naik dari bawah (`yPercent 100 → 0`) dengan tepi atas sedikit tertinggal (`rotateX` kecil); buka: lembar berputar pada engsel kiri `rotateY 0 → -100°` (`transformPerspective`) seperti halaman buku dibalik, sisi belakang terlihat sesaat, gradasi bayangan di dekat engsel. Teknik: `transform` 3D (composited).
- **Undian per sesi** (`motion/sectionTransitions.ts`, baru): daftar jenis yang disetujui; kunci `sessionStorage` `portfolio:section-transitions:v1` berisi 4 jenis berurutan (About→Projects, Projects→Skills, Skills→Achievements, Achievements→Footer). Bila tidak ada/tidak valid (jenis tak dikenal, panjang salah, dua batas bersebelahan sama) → undi ulang: tiap batas memilih acak dari jenis yang ≠ batas sebelumnya, lalu simpan. Diakses dalam `try/catch`; gagal → undian disimpan di modul (tetap konsisten selama halaman hidup).
- **`site/PageTransition.vue`** (baru, satu komponen untuk semua jenis): prop `boundary` (indeks 0–3); di `onMounted` membaca jenisnya lalu merender elemen lembar yang dibutuhkan (`v-if` setelah mount → markup server/klien sama) dan memasang ScrollTrigger lewat `useMotion`. Penanda di `LandingPage.vue` (About→Projects, Skills→Achievements, Achievements→Footer — yang terakhir di akhir konten landing, tepat di atas footer layout) dan di `Projects.vue` (Projects→Skills, menggantikan `PaintRoller`).
- **Mobile**: rentang lebih pendek, bilah lebih sedikit, tanpa gradasi bayangan & tanpa perspektif 3D (page turn jadi geser `xPercent`). **Reduce**: komponen tidak merender apa pun (batas section biasa), tidak ada ScrollTrigger.
- Navigasi navbar (`scrollToSection` via Lenis) melewati beberapa batas sekaligus → lembar disembunyikan selama scroll terprogram (flag dari `motion/lenis.ts`) supaya tidak berkedip berurutan.

File: `motion/sectionTransitions.ts` (baru), `components/site/PageTransition.vue` (baru), `pages/LandingPage.vue`, `components/ui/landing-page/Projects.vue`, `motion/lenis.ts` (flag scroll terprogram), `motion/paintColors.ts` (hapus token yang tak terpakai lagi bila ada); `PaintDrip.vue`, `PaintRoller.vue`, `PaintStencil.vue`, `PaintSplash.vue`, `motion/stencil.ts`, `motion/sprayPaint.ts` (dihapus).

Verifikasi: hapus kunci `sessionStorage` lalu muat ulang beberapa kali → jenis berubah antar sesi, tidak pernah sama untuk batas bersebelahan, dan tetap sama saat scroll bolak-balik/navigasi Inertia dalam sesi yang sama; tiap jenis tertutup penuh di `0.45–0.55` dan bersih di luar rentang; `ScrollTrigger.getAll()` stabil saat navigasi; sapuan seluruh halaman 0 long task; reduce: tidak ada overlay & tidak ada elemen di opacity 0; light/dark.

Risiko:

- Lima momen layar tertutup dalam satu halaman → bisa terasa melelahkan; jendela tertutup penuh dibuat sempit (10% progres) dan rentang pendek. Bila tetap berat, alternatif: lembar hanya menutup **sebagian** (mis. 70% layar) — diputuskan setelah melihat hasil.
- `clip-path: path()` (iris buka) di layar besar → repaint per frame; hanya satu overlay aktif, dicek di Performance panel; fallback `mask` radial bertoken bila lambat.
- Perspektif 3D page turn vs `backdrop-filter` navbar di Safari (urutan layer) → navbar tetap `z-50` di luar konteks 3D lembar; dicek.
- Undian tersimpan dari versi dengan daftar jenis berbeda → kunci berversi + validasi, undi ulang bila tidak cocok.

Catatan hasil:
- **Implementasi, lebih sederhana dari rencana**: tiap jenis adalah **timeline GSAP ber-pause (panjang 1)** yang digerakkan ScrollTrigger `animation` + `scrub: true` (`motion/pageTransitions.ts`), jadi deterministik tanpa ticker manual. Lipat sudut dan iris menulis `clip-path` dari objek proxy di `onUpdate`; bilah dan balik halaman hanya `transform`. `PageTransition.vue` merender **semua** bagian (tersembunyi) dan memilih jenis di `useMotion` (sisi klien), sehingga markup tidak bergantung pada undian. Marker memakai `inheritAttrs: false` + `v-bind="$attrs"` (komponen punya dua root karena `Teleport`) dan `data-page-transition`.
- **Risiko yang tidak ada di rencana, sudah ditangani**: batas Achievements → Footer ada di dekat dasar halaman, sehingga rentang tetap (75% → 30%) tidak terjangkau dan lembar akan tertahan setengah menutup. Rentang semua batas kini fungsi: `end = min(marker − 30% layar, maxScroll)`, `start = end − 0.45` layar (mobile 0.35), dihitung ulang tiap refresh.
- **Penyesuaian setelah melihat hasil**:
  1. **Easing `power2.inOut`, bukan `brand`**. Kurva `brand` (expo-out) membuat layar sudah tertutup penuh di progres 0.2, sehingga tertutup ±35% rentang. Dengan `inOut`, cakupan di 0.2 dan 0.8 sekitar 20–40%, tertutup penuh hanya di tengah. Keputusan #5 diperbarui.
  2. **Lipat sudut**: semula seluruh bagian di luar garis lipat dicerminkan, sehingga flap menutupi hampir semuanya. Kini hanya pita ≤ 18% diagonal di dekat lipatan yang terlipat; sisanya dianggap terangkat. Flap memakai `color-mix(--primary-strong 75%, --primary-foreground)` supaya sisi belakang terbaca (di light mode `--primary-strong` = `--primary`), dengan bayangan `--foreground` 25% di-clip ke lembar (desktop saja).
  3. Bug sendiri yang tertangkap sebelum uji: menampilkan bagian dengan `display: 'block'` akan merusak `flex` wadah bilah, jadi diganti `''`.
- **Detail jenis**:
  - Lipat sudut: diletakkan dari pojok kanan-bawah, dikelupas dari pojok kanan-atas.
  - Bilah: 7 bilah miring −20° (`w-[180vw]`, `-skew-x`), selang-seling `--primary`/`--primary-strong`.
  - Iris: pojok awal bergantung indeks batas; lubang membuka dari pojok berlawanan (`clip-path: path(evenodd, …)`).
  - Balik halaman: naik dari bawah, lalu `rotationY −100°` pada engsel kiri (perspektif 1800, bayangan gradasi); di mobile geser `xPercent −100`.
- **Glide navbar**: `motion/lenis.ts` kini punya `glide()` + `isAutoScrolling()` (dibersihkan di `onComplete`, batas 3s), dipakai link anchor dan `scrollToTarget`; lembar disembunyikan selama glide.
- **Dihapus** (disetujui; `grep` memastikan tak ada importir): `PaintDrip.vue`, `PaintRoller.vue`, `PaintStencil.vue`, `PaintSplash.vue`, `motion/stencil.ts`, `motion/sprayPaint.ts`. `paintColors.ts` kini hanya `primary`, `primary-strong`, `primary-foreground`.
- **Hasil uji di build** (skrip CDP; keempat jenis dipaksa lewat `sessionStorage`; 1280 light/dark, 375 mobile dark, 1280 reduce):
  - Tiap jenis tersembunyi di luar rentang, tertutup penuh di tengah, bertahap di 0.2/0.8, dan identik saat scrub mundur.
  - Di dasar halaman semua lembar terbuka & tersembunyi.
  - Glide navbar dari atas ke `#achievement` tidak memunculkan satu lembar pun.
  - Reduce: tidak ada lembar dan tidak ada jenis yang dipilih.
  - **Undian**: 6 sesi baru memberi 6 urutan berbeda, semua valid tanpa jenis yang sama bersebelahan, sama setelah reload, dan nilai rusak di storage diundi ulang dengan valid.
  - Navigasi landing ↔ All Projects 3× bolak-balik: overlay dibuat & dibersihkan (4 lembar + 1 kanvas tumpahan di landing, 0 di listing), jenis tetap.
  - Sapuan seluruh halaman: tanpa elemen di opacity 0, tanpa error console. Jeda frame tunggal masih muncul acak (artefak headless; mesin juga sedang berbeban), perlu dicek di perangkat nyata.

---

## 6. Revisi 3

Dikerjakan **satu tahap tiap "lanjut"**, urut R15 → R20 (R20 = suara Abot, ditambahkan user saat menjawab pertanyaan #5). R15 lebih dulu karena memisahkan SVG Abot ke `AbotFigure.vue` yang dipakai R18. (R16 dicabut setelah dikerjakan; R18 tidak lagi bergantung padanya.) R19 terakhir: sapaan ditambahkan ke `buildDialogPages`, jadi dialog besar, dialog mini, dan bubble (yang mengambil teks dari fungsi yang sama) ikut mendapatkannya sekaligus. Penutup tiap tahap **sama dengan §2**: `npm run lint`, `npm run types:check`, `npm run build`; cek `git diff --stat` tidak menyentuh `app/ routes/ database/ config/ .env` dan `git diff resources/css/app.css` tidak mengubah `--primary`/`--primary-foreground`; centang tahap di dokumen ini; **JANGAN `git add`, `git commit`, atau `git push`**; ringkasan + usulan pesan commit; berhenti.

Semua aturan §4/§5 tetap berlaku: data tidak berubah (hanya prop yang sudah dikirim controller), `--primary`/`--primary-foreground` & Poppins dikunci, **tidak ada warna literal baru** (class token, `color-mix(in oklab, var(--…) N%, transparent)`, canvas membaca token lewat `motion/paintColors.ts`), GSAP/Lenis hanya lewat `motion/gsap.ts`/`motion/lenis.ts` di kode public, semua animasi lewat `useMotion` (matchMedia `desktop`/`mobile`/`reduce`), reduce tanpa konten tertinggal di `opacity: 0`. File yang jadi tidak terpakai dihapus di tahapnya setelah dicek `grep` (disetujui, §5 pertanyaan #4).

### Benturan dengan rencana/keputusan lama & penyelesaiannya

| Revisi                        | Bertentangan dengan                                                                   | Penyelesaian                                                                                                                                                                                    |
| ----------------------------- | ------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R15 bentuk chibi              | R2/R10: siluet = A kapital logo dengan proporsi huruf                                  | Keputusan #1 direvisi. Tetap terbaca A: kubah = puncak, celah kaki = lubang A, sabuk = palang. Proporsi dipilih user dari 3 varian.                                                              |
| R15 `docs/abot-variants.html` | "Tidak ada warna literal baru"                                                         | File pratinjau statis di `docs/`, tidak di-import dan tidak di-build. Nilai token light & dark **disalin apa adanya** dari `app.css` ke variabel CSS file itu. Kode aplikasi tetap tanpa literal. |
| R16 pin                       | Keputusan #8 & R6/R13/R14: "scrub tanpa pin"                                           | Keputusan #8 direvisi. Pin hanya di batas section dan hanya selama transisi. Pin vertikal; "tanpa horizontal pin" di §0 tetap berlaku.                                                         |
| R16 divider statis            | R14 reduce: batas lain "tidak merender apa pun"                                        | Reduce kini menampilkan divider statis di **semua** batas.                                                                                                                                     |
| R16 jumlah batas              | R14: empat batas bertransisi (termasuk Projects → Skills dan Achievements → Footer)    | Disetujui (pertanyaan #1–#2): Projects → Skills dan Achievements → Footer tanpa transisi. Undian R14 untuk 2 batas, kunci `…:v2`.                                                              |
| R16 tinggi minimal scene      | Spacing section yang ada                                                               | Hanya Achievements, hanya di mode motion (`motion-safe:`); reduce & tanpa JS tetap seperti sekarang.                                                                                           |
| R20 suara                     | Belum ada audio di situs; kebijakan autoplay browser                                    | Suara disintesis Web Audio (tanpa file), hanya setelah gestur pengguna (membuka dialog), bisa dibisukan; bubble periodik tetap senyap.                                                         |
| R17 lipatan buku              | Keputusan #4: opsi A "tirai terangkat" (dipilih user di R11); drag ke mana pun = maju   | Keputusan #4 direvisi. Tirai diganti; arah drag kini bermakna (kiri maju, kanan mundur).                                                                                                       |
| R17 rotasi 3D                 | R12 menghapus preset `flip` (`useDeck.ts`)                                             | Bukan preset lama (kartu utuh berbalik memperlihatkan punggung). Ini lembar yang melengkung dari engsel, dibuat dari strip bertingkat di modul baru `motion/pageFlip.ts`.                      |
| R18 Abot di luar hero         | Keputusan #1 & §0: robot "tetap di hero" sebagai pembeda dari Tejo                      | ~~Pop di tempat~~ → **terbang sekali** hero → pojok (diminta user setelah R18, setelah diingatkan bahwa ini melawan aturan R18 sendiri). Pembeda yang tersisa di Keputusan #1.                  |
| R18 bubble periodik           | Keputusan #1: "tanpa speech bubble"                                                     | Bubble bergaya panel HUD yang sama (bracket sudut, tanpa ekor gelembung), terpisah dari tubuh robot.                                                                                           |
| R19 jam lokal                 | Markup SSR harus deterministik                                                          | Jam dibaca di `onMounted` / saat dibuka, tidak saat render (Keputusan #13).                                                                                                                    |

### Pertanyaan terbuka — sudah dijawab (2026-10-26)

1. **R16 — batas Achievements → Footer.** Aturan "tidak bocor" tidak bisa dipenuhi secara geometris di batas terakhir, karena footer lebih pendek dari layar. → **(A) disetujui**: batas ini **tanpa transisi**. Footer muncul alami setelah Achievements, dan Achievements diberi tinggi minimal satu layar (mode motion) supaya footer tidak mengintip selama transisi yang masuk ke Achievements.
2. **R16 — tinggi minimal scene / batas Projects → Skills.** → **Skills tetap ada, batas Projects → Skills tanpa transisi.** Blok Projects (judul + showcase) dan Skills menjadi **satu scene** `#project`. Hasilnya tinggal tiga batas bertransisi: Hero → About (tumpahan cat), About → Projects, dan Projects → Achievements (lembar R14, diundi dari 2 batas, kunci storage `…:v2`). `min-h-svh` hanya untuk Achievements.
3. **R16 — anchor yang melintasi batas** → **lompatan tertutup** disetujui.
4. **R17 — engsel** → selalu di **tepi kiri** (punggung buku) disetujui, termasuk halaman yang sempat melintasi panel info di `lg`.
5. **R18 — klik Abot mini** → membuka `BotDialog` lengkap di pojok, disetujui. **Tambahan dari user:** Abot punya **suara robot khas**. Dikerjakan sebagai tahap tersendiri **R20** (Keputusan #14), setelah kedua dialog dan sapaan R19 ada.
6. **R18 — mobile di dasar halaman** → Abot mini disembunyikan di bawah `md` selama footer terlihat, disetujui.
7. **R19 — kalimat sapaan** → **disetujui** sesuai tabel R19.
8. **R18 — jadwal bubble** → **disetujui** (Keputusan #12).

### [x] R15 — Abot: bentuk lebih membulat (chibi)

**Langkah 1 (lalu BERHENTI menunggu pilihan):** `docs/abot-variants.html`, HTML statis yang bisa dibuka langsung di browser:

- `:root` berisi nilai token **light** dan `.dark` nilai token **dark**, disalin apa adanya dari `resources/css/app.css` (`--primary`, `--primary-strong`, `--primary-foreground`, `--brand-red`, `--card`, `--border`, `--foreground`, `--background`). Ada class kecil yang meniru utility Tailwind (`.fill-primary { fill: var(--primary) }`, `.stroke-border`, …), sehingga markup SVG varian yang dipilih bisa dipindah ke Vue nyaris tanpa diubah.
- 3 varian siluet, masing-masing di **3 ukuran**: kecil **56px** (ukuran Abot mini R18), sedang **144px** (`md:h-36`, tablet), besar **320px** (`xl:h-80`). Masing-masing tampil di panel light dan dark berdampingan. Tiap varian diberi keterangan singkat dan proporsi lebar : tinggi.
- Semua varian memakai tata bahasa yang sama: kubah kepala = puncak A dengan antena + halo, visor kapsul berisi dua mata LED, sabuk membulat = palang A dengan lampu `brand-red` dan lengan di ujungnya, kaki kiri panel sirkuit `fill-card stroke-border` + kaki kanan solid `fill-primary` (ciri logo, disederhanakan di ukuran kecil), telapak bulat, bayangan lantai. Usulan karakter tiap varian:
  - **V1 "Gumdrop"**: kaki tebal dengan tepi luar **cembung** (menggembung seperti permen jeli), celah kaki berbentuk lengkung pintu pendek, kubah kepala besar menyatu dengan kaki, visor kapsul horizontal. Proporsi ±1.1 : 1.
  - **V2 "Lonceng"**: siluet montok seperti lonceng/tenda. Kubah melebar ke "rok" tebal, kaki sangat pendek dengan celah sempit, visor lebar seperti kacamata ski tepat di atas sabuk, telapak oval besar mencuat ke samping. Paling "mainan". Proporsi ±1.2 : 1.
  - **V3 "Langkah"**: kubah kepala sedikit terpisah (lekuk leher tipis di bawah kubah), kaki tebal sedikit mengangkang dengan lekuk lutut ke dalam, visor kapsul mengikuti lengkung kubah, telapak bulat besar seperti sepatu bot. Paling jelas terbaca sebagai A. Proporsi ±1 : 1.

**Setelah varian dipilih** (rencana teknis):

- **`components/site/abotShape.ts`** ditulis ulang: siluet berupa path kubik yang ditulis tangan (konstanta string, bukan poligon), dengan nama ekspor yang sama sejauh masih relevan (`A_SILHOUETTE`, `A_SPLIT_LEFT/RIGHT`, `A_VISOR`, `A_CROSSBAR`/sabuk, `A_KNEE` bila tetap ada). `roundedPath` tetap dipakai untuk bagian poligon kecil (lutut) atau dihapus bila tak terpakai. **Titik pivot pindah ke file ini** (`SHOULDER_LEFT`, `SHOULDER_RIGHT`, `FEET`, `ANTENNA_BASE`, `VIEWBOX`) dan disesuaikan ke sendi baru, sehingga semua `svgOrigin` tetap tepat di ukuran apa pun.
- **`components/site/AbotFigure.vue`** (baru): SVG Abot saja, tanpa gerak dan tanpa `<button>`. Prop `detail: 'full' | 'mini'` (mini menyembunyikan jalur sirkuit, lutut, dan kilap). Elemen bagian tubuh (`body`, `visor`, `eyes`, `eyeLeft/Right`, `armLeft/Right`, `antenna`, `halo`, `shadow`) diekspos lewat `defineExpose`. Id clip kaki tetap dari `useId`.
- **`HeroBot.vue`** memakai `AbotFigure`. Logika R2–R3 tidak diubah: `prepare`/`enter`, idle, kedip, mata ikut kursor, squint, `gesture()`, `react()`, `speak()`, `focus()`, `aria-*`. Yang berubah hanya sumber ref dan konstanta pivot. Kelas ukuran disesuaikan dengan proporsi baru (lebar naik kalau varian lebih lebar dari tinggi) supaya kolom hero dan `BotDialog` tetap pas.
- `data-intro-target` tetap di wrapper `Hero.vue` → titik `clip-path: circle()` splash otomatis mengikuti kotak robot baru.
- Panel `BotDialog` di `lg` (di atas robot) dan mobile (di bawah robot) dicek ulang terhadap tinggi robot yang baru.
- `docs/abot-variants.html` tetap disimpan di `docs/` sebagai arsip keputusan (bukan kode, tidak ikut build).

File: `docs/abot-variants.html` (baru), `components/site/abotShape.ts`, `components/site/AbotFigure.vue` (baru), `components/site/HeroBot.vue`, `components/ui/landing-page/Hero.vue` (ukuran/posisi bila perlu).

Verifikasi: siluet terbaca A di `h-28`, `md:h-36`, `xl:h-80` dan di 56px (mini), light & dark; wave/hop/nod/point/pusing berputar di pivot yang benar; mata ikut kursor tetap di dalam visor kapsul; titik akhir circle splash = pusat robot (< 1px) di 1280/768/375; dialog jalan (ketik, Next/Close, Esc, tutup otomatis); reduce statis tanpa elemen hero di opacity 0.

Risiko:

- Terlalu bulat → terbaca seperti tetesan/hantu, bukan A. Itu sebabnya celah kaki (lubang A) dan sabuk (palang) dibuat tegas di ketiga varian, dan dicek di 56px.
- Mata yang bergeser ±4/±3 bisa keluar dari visor kapsul yang lebih pipih → batas gerak mata diturunkan dari ukuran visor baru.
- Lengan di ujung sabuk yang lebih pendek bisa menabrak kaki yang menggembung saat `wave`/`point` → sudut istirahat lengan disesuaikan, `overflow-visible` tetap.
- Klip dua warna kaki pada kaki yang melengkung: garis sambungan harus tetap di dalam celah (pelajaran R10 soal takik di fillet).

Catatan hasil:

- **Pilihan user**: **V2 "Lonceng"**, dengan kepala yang **benar-benar melengkung**. Kubah kini setengah lingkaran sungguhan (busur `A66`, pusat 120,100), bukan lengkung tenda. Badan lalu melebar ke "rok" tebal dengan kaki pendek dan celah sempit. `docs/abot-variants.html` diperbarui ke versi terpilih dan ditandai "dipilih".
- **`abotShape.ts`**: siluet ditulis tangan sebagai path (busur + kubik), dengan viewBox `0 -6 240 222` (lebih lebar dari tinggi). Isinya:
  - garis sambungan dua warna (dari kiri puncak kubah ke puncak celah);
  - kilap, visor kapsul, sabuk, telapak oval, dan lutut heksagon (masih memakai `roundedPath`);
  - **pivot**: `SHOULDER_LEFT 40 129`, `SHOULDER_RIGHT 200 129`, `FEET 120 200`, `ANTENNA_BASE 120 34`.

  Konstanta lama `A_RADIUS`/`A_RADIUS_INNER` dihapus karena tidak dipakai lagi.
- **`AbotFigure.vue`** (baru): SVG saja, prop `detail: 'full' | 'mini'` (mini tanpa sirkuit, lutut, kilap, pipi). Bagian yang bergerak diekspos lewat `defineExpose`. Visor diberi tepi `stroke-card` 5px supaya tetap terbaca di atas sisi biru.
- **`HeroBot.vue`**: SVG inline diganti `AbotFigure`. Ref bagian tubuh menjadi `computed` dari instance figure, jadi seluruh logika R2–R3 (intro, idle, kedip, mata ikut kursor, squint, gestur, pusing, bicara) **tidak diubah**. Pivot diambil dari `abotShape.ts`.
- **Ukuran**: proporsi baru lebih lebar, jadi tinggi desktop diturunkan supaya luas visual setara: `h-28 sm:h-32 md:h-36 lg:h-64 xl:h-72` (sebelumnya `lg:h-72 xl:h-80`). `Hero.vue` tidak perlu diubah.
- **Hasil uji di build** (skrip CDP; 1280 light/dark, 768 light, 375 mobile dark, 1280 reduce):
  - Titik akhir `circle()` splash = pusat robot (selisih < 0.5px) di semua lebar.
  - Lambaian berputar di ujung sabuk, lompat mengangkat badan dari bayangan, dan pusing berputar di kaki dengan mata berputar.
  - Dialog terbuka di atas robot (`lg`) dan di bawahnya (mobile/tablet), dengan teks halaman pertama.
  - Hero 375×667 setinggi 717px (sama dengan sebelumnya).
  - Tidak ada elemen hero di opacity 0 (termasuk reduce), dan tanpa error console.
- **Catatan**: di dark mode sisi kiri (`--card` + `stroke-border`) masih tipis kontrasnya terhadap latar, sama seperti robot sebelumnya. Tidak diubah karena belum diminta; bisa dipertegas lewat garis tepi turunan token bila diinginkan.

### [x] R16 — Transisi section: section berikutnya tidak boleh bocor (dicabut)

Masalah sekarang: transisi Hero → About (pour) dan batas R14 berjalan **tanpa pin**, dengan rentang mulai saat batas di 80% (pour) atau `end − 0.45` layar (lembar). Jadi ekor section lama dan kepala section baru selalu terlihat bersamaan di sekitar batas sebelum dan sesudah overlay menutup.

**Teknik yang dipilih: "tahan lalu tukar"** (kombinasi pin + sembunyikan). Pada tiap batas, scene lama **S** dan scene baru **T** bersebelahan, sehingga konten harus berpindah ±satu layar di antara "bawah S di dasar layar" dan "atas T di atas layar". Perpindahan itu dibuat tak terlihat:

1. **Fase tutup** `[a, b)`: dari `a` = bawah S tepat di dasar viewport, sampai `b` = atas T di `top + offset`, dengan `offset` = `scroll-margin-top` (`--nav-h` + 1.5rem, sama dengan titik mendarat anchor). Panjangnya intrinsik ±(1 layar − offset), **tidak menambah tinggi halaman**.
   - S di-pin dengan ScrollTrigger `pin: S, pinSpacing: false`: S diam, kontennya tetap utuh di layar.
   - T di-clip tak terlihat (`clip-path: inset(0 0 100% 0)`, bukan `visibility`, supaya tetap bisa difokus).
   - Overlay menutup dan sudah penuh di ±90% fase. Sisa 10% adalah toleransi.
2. **Tukar** di `b`, saat layar tertutup penuh: pin S lepas lalu S disembunyikan (`clip-path`), dan clip T dilepas.
3. **Fase buka** `[b, c)`: T di-pin di `top top+=offset` dengan `pinSpacing: true` sepanjang `D` (desktop 40vh, mobile 30vh; Hero → About 60vh / 40vh), sehingga T diam saat overlay membuka. Spacing ini satu-satunya tambahan tinggi halaman (±0.4 layar per batas).
4. Setelah `c`: scroll normal, dan clip S dilepas (S sudah di atas viewport).

Semua status adalah fungsi dari posisi scroll (scrub, ScrollTrigger), jadi **scroll mundur otomatis simetris**. Dari `c` ke `b` overlay menutup di atas T yang diam. Di `b` keduanya ditukar kembali. Dari `b` ke `a` overlay membuka di atas S yang diam, sementara T sudah tersembunyi lagi. Section sebelumnya tidak pernah bocor saat kembali.

Pemetaan overlay: timeline jenis R14 (tutup 0 → 0.45, penuh 0.45–0.55, buka 0.55 → 1) dipetakan ke **fase tutup → 0…0.5** dan **fase buka → 0.5…1**, sehingga titik tukar `b` selalu jatuh di jendela tertutup penuh, dengan cadangan 5% di tiap sisi. Pour Hero → About dipetakan sama: tuang 0 → 0.5, tahan, lalu surut 0.56 → 1.

Rincian:

- **`motion/sceneSwap.ts`** (baru, logika tanpa Vue): `createSceneSwap({ from, to, overlay: (p) => void, open, mobile })` membuat dua ScrollTrigger (fase tutup dan fase buka) dan mengelola clip/pin. Ia juga mendaftarkan **titik aman** batas ke registri kecil: `anchorFor(el)` → posisi scroll `c` untuk T, dan `a` untuk S. Dipakai oleh `PourTransition.vue` dan `PageTransition.vue`, sehingga keduanya hanya menyediakan fungsi gambar/timeline overlay.
- **Scene** ditandai `data-scene` di markup. Komponen batas mencari scene sebelum dan sesudah penandanya di urutan dokumen. Scene: Hero, About, Projects (judul + showcase + Skills, satu scene), Achievements. Achievements diberi `motion-safe:min-h-svh` dengan isi di tengah vertikal, supaya footer tidak terlihat di bawahnya selama fase buka. Projects + Skills dicek lebih tinggi dari layar di 1280×800 dan 375×640; kalau ternyata tidak, scene itu diberi aturan yang sama.
- **Batas yang dihapus** (pertanyaan #1–#2): `PageTransition :boundary="1"` di `Projects.vue` (Projects → Skills) dan `:boundary="3"` di `LandingPage.vue` (Achievements → Footer) dilepas. `PageTransition :boundary="2"` menjadi `:boundary="1"`. `motion/sectionTransitions.ts`: `BOUNDARY_COUNT = 2`, kunci `portfolio:section-transitions:v2`, dan komentar urutan batas diperbarui. Spacing `mt-20 md:mt-24` yang semula milik penanda Projects → Skills dipindah ke blok Skills supaya jarak visual tetap sama.
- **Anchor/navigasi**:
  - `motion/lenis.ts`: `scrollToTarget`/handler `#hash` menyelesaikan target lewat `anchorFor()`, sehingga mendarat di `c` (overlay terbuka penuh, T diam di bawah navbar). Kalau perjalanannya melintasi ≥ 1 batas, dipakai **lompatan tertutup** (pertanyaan #3); kalau tidak, tetap glide.
  - `/#project` dari halaman lain (Tahap 8) memakai jalur yang sama setelah `ScrollTrigger.refresh()`.
  - Scroll hint hero (`href="#about"`) ikut jalur ini.
- **Fokus keyboard**: `focusin` di scene yang sedang di-clip (T saat fase tutup, S saat fase buka) → lompatan tertutup ke titik aman scene itu. Elemen fokus tidak pernah berada di bagian yang tak terlihat.
- **Dialog hero** (`Hero.vue`): sekarang tertutup saat bawah hero melewati 25% atas, padahal hero kini diam di-pin. Diganti menjadi tertutup saat fase tutup Hero → About melewati ±15%.
- **Mobile**: mekanisme sama (itulah yang menjamin tidak bocor), versi ringan: `D` lebih pendek, overlay versi mobile yang sudah ada (pour lebih sedikit lelehan, lembar tanpa 3D/bayangan). Pin memakai `anticipatePin: 1`, tinggi scene memakai `svh`, dan `ScrollTrigger.config({ ignoreMobileResize: true })` supaya bilah URL tidak memicu refresh.
- **Reduce**: tidak ada ScrollTrigger pin/clip, tidak ada overlay, tidak ada `min-h` (`motion-safe:`). Hero → About tetap divider statis R13. `PageTransition.vue` kini merender **divider statis** di reduce (sebelumnya kosong): garis rambut gradasi `color-mix(--primary 45%, transparent)` dengan kapsul kecil `bg-primary` di tengah, `aria-hidden`.

File: `motion/sceneSwap.ts` (baru), `components/site/PourTransition.vue`, `components/site/PageTransition.vue`, `motion/pageTransitions.ts` (bila pemetaan fase butuh penyesuaian), `motion/sectionTransitions.ts` (2 batas, kunci `v2`), `motion/lenis.ts` (resolusi anchor + lompatan tertutup), `pages/LandingPage.vue`, `components/ui/landing-page/Hero.vue`, `About.vue`, `Projects.vue` (`data-scene`, penanda Projects → Skills dilepas), `Achievements.vue` (`data-scene`, `min-h`).

Verifikasi (skrip CDP, 1280 light/dark, 375 mobile, 1280 reduce):

- Di setiap posisi scroll pada tiap batas (sampel tiap 2% rentang, maju dan mundur), piksel konten T **tidak pernah terlihat** sebelum cakupan overlay 100%, dan S tidak terlihat sesudahnya. Diuji dengan menyembunyikan overlay lalu membaca `getBoundingClientRect` + status clip.
- Overlay tertutup penuh di sekitar `b`.
- Anchor dari navbar dan dari halaman lain mendarat dengan overlay tersembunyi dan konten terlihat.
- Tab dari elemen terakhir S → fokus terlihat di T.
- `ScrollTrigger.getAll()` stabil setelah 3× navigasi; sapuan seluruh halaman tanpa elemen di opacity 0 dan tanpa error console.
- Reduce: tanpa pin/overlay, divider tampil di semua batas.

Risiko:

- **Lebih banyak scroll "diam"**: S diam ±1 layar dan T diam ±0.4 layar di tiap batas. Ini konsekuensi langsung dari aturan tidak bocor. Kalau terasa berat, `D` diperkecil; fase tutup tidak bisa diperpendek tanpa memperlihatkan T.
- ScrollTrigger lain di dalam scene yang di-pin (rail Timeline, entrance showcase, parallax hero) → pin `pinSpacing: false` tidak menggeser layout. Trigger yang rentangnya beririsan dengan fase pin diberi `pinnedContainer`. Pin dibuat berurutan dari atas (`refreshPriority`) supaya spacer fase buka dihitung dengan benar.
- Pin dengan `position: fixed` di dalam leluhur yang di-transform akan rusak → scene adalah anak langsung konten (tanpa transform leluhur); dicek.
- `clip-path` pada section besar memicu repaint satu kali saat tukar, bukan per frame.
- iOS Safari: lompatan kecil saat pin mulai di scroll native → `anticipatePin`; perlu dicek di perangkat nyata.
- Splash/intro hero tidak terpengaruh: fase tutup Hero → About baru bergerak setelah scroll pertama.

**Dicabut (2026-10-26).** Setelah melihat hasilnya user menilai transisi antar-section "terlalu maksa" dan meminta semuanya dihapus dulu. Yang dilakukan:
- `PourTransition` dan kedua `PageTransition` dilepas dari `LandingPage.vue`, penanda `data-scene` dan `min-h` Achievements dihapus, dan dialog hero kembali tertutup di `bottom 25%`.
- `lenis.ts` dikembalikan ke versi sebelum R16, **kecuali dua perbaikan bug** yang ditemukan saat uji R16 (berlaku tanpa transisi): `landOnHash()` (buka langsung `/#section` kini mendarat, juga setelah splash) dan `lenis.resize()` sebelum lompat setelah navigasi Inertia.
- Jarak blok Skills tetap `mt-36 md:mt-44` (sama secara visual dengan sebelumnya: margin penanda + margin Skills).
- `PourTransition.vue`, `PageTransition.vue`, dan `sectionTransitions.ts` dikembalikan ke versi HEAD. Bersama `pageTransitions.ts`, `liquidPour.ts`, `paintColors.ts`, `canvas.ts`, dan `sceneSwap.ts` (baru, belum di-commit), file-file itu kini **tidak diimpor kode aktif** dan menunggu keputusan user (hapus atau simpan untuk nanti).
- Uji setelah pencabutan: buka langsung `/#project` mendarat 98px dan Inertia → `/#achievement` 94px (mobile), tanpa overlay/pin. Setelah digulir habis tidak ada elemen di opacity 0.

Catatan hasil (implementasi sebelum dicabut, untuk referensi):

- **`motion/sceneSwap.ts`** (baru): `createSceneSwap({ marker, overlay, shut, open, render, onActive, onRefresh })`. Scene S/T dicari dari `[data-scene]` sebelum/sesudah penanda. Isinya dua ScrollTrigger:
  - `hold`: pin S tanpa spacing dari `a` ke `b`, dan mengukur `a`, `b`, `c` tiap refresh;
  - `range`: dari `a` sampai `b + 1 layar`, menghitung progres overlay dan clip kedua scene.

  Clip dikelola lewat registri "alasan per batas", karena About dan Projects masing-masing menjadi T di satu batas dan S di batas berikutnya. Modul ini juga mengekspor `sceneAnchor`, `crossesScene`, `settleJump`, dan `pastFirstScene` (yang terakhir untuk Abot mini R18).
- **Penyimpangan dari rencana**:
  1. **Fase buka tanpa pin.** Pin dengan spacing di T akan menggeser semua ScrollTrigger di dalamnya (reveal, rail Timeline, entrance showcase) sejauh spacing itu. T kini scroll alami selama overlay membuka. Panjangnya `min(open × tinggi layar, ruang)`, dengan "ruang" = jarak sebelum konten sesudah T (scene berikutnya atau footer) mulai terlihat. Untuk Achievements → footer di 1280×800, ruang itu ±272px. Halaman tidak bertambah panjang.
  2. **S tetap di-clip sampai satu layar setelah `b`.** GSAP melepas pin tanpa spacing dengan menggeser elemen sejauh durasi tahan (`translate(0, 702px)`), jadi S masih menumpang di atas T sampai tergulir habis. Ini tertangkap di uji pertama (hero terlihat bersama About setelah fase buka).
  3. **Anchor mendarat di `b`, bukan `c`.** Di `c` T sudah tergulir sejauh fase buka, sehingga judul section terpotong (−174px pada uji pertama). Kini `sceneAnchor` → `b` (T tepat di bawah navbar), dan `settleJump` **menyisihkan overlay** batas itu selama pembaca masih di antara `b` dan `c`. Kalau pembaca menggulir naik melewati `b`, overlay muncul lagi dengan fade 0.25s. `b` dibulatkan ke bawah dan lompatan ke atas, dengan toleransi 2px, supaya refresh tidak memunculkan overlay sendiri.
  4. **`refreshPriority`/`pinnedContainer` tidak diperlukan**, karena tidak ada pin berspacing. `ignoreMobileResize` tidak ditambahkan; perlu dicek di perangkat nyata.
- **Navigasi** (`motion/lenis.ts`): anchor dan `scrollToTarget` memakai `landingFor` (`sceneAnchor`, atau scroll-margin biasa). Bila jalurnya melintasi rentang batas, dipakai `coveredJump`: lapisan `bg-background` `z-[45]` (di bawah navbar) 0.15s → lompat instan → 0.25s. Selain itu tetap glide. Fokus yang masuk ke scene ter-clip memakai lompatan yang sama.
- **Bug yang tertangkap & diperbaiki saat uji**:
  - Buka langsung `/#section` tidak pernah mendarat (y tetap 0), karena splash mengunci scroll (`overflow: hidden` + `lenis.stop()`). Kemungkinan sudah ada sebelum R16; Tahap 8 hanya menguji navigasi Inertia. Kini `landOnHash()` dipanggil setelah refresh navigasi dan saat splash selesai (`SplashScreen.vue`).
  - Navigasi Inertia dari All Projects ke `/#achievement` berhenti di 950px, karena Lenis masih memakai tinggi halaman lama. `setScroll` kini memanggil `lenis.resize()` dulu.
- **Markup**: `data-scene` di Hero/About/Projects/Achievements. Achievements `motion-safe:flex motion-safe:min-h-svh motion-safe:flex-col motion-safe:justify-center`. Penanda Projects → Skills dan Achievements → Footer dilepas, undian 2 batas dengan kunci `v2`, dan blok Skills `mt-36 md:mt-44` (jarak sama seperti sebelumnya). Dialog hero tertutup di `bottom 85%` (motion) / `bottom 25%` (reduce). `PageTransition` reduce merender divider garis rambut + kapsul `bg-primary`.
- **Hasil uji di build** (skrip CDP; 1280 light/dark, 375 mobile light/dark, 1280 reduce; jenis acak dan dipaksa `turn,iris`):
  - Sapuan seluruh halaman tiap 4% tinggi layar, turun lalu naik: **0 posisi** dengan dua scene terlihat bersamaan.
  - Cakupan overlay di `b − 3px` dan `b + 3px`: **100%** di ketiga batas (mobile dark bilah terukur 49% karena warna `color-mix` tidak terbaca skrip; screenshot memperlihatkan layar tertutup penuh).
  - Anchor navbar `#achievement`, `#about`, `#project`, `#home` dari atas/bawah: mendarat 97–98px di bawah top, tanpa overlay, hanya scene tujuan yang terlihat.
  - Fokus ke link Projects di tengah fase tutup: lompat, link terlihat.
  - Buka langsung `/#project` (desktop & mobile) dan navigasi Inertia All Projects → `/#achievement`: mendarat 94–98px, tanpa overlay.
  - Landing ↔ All Projects 3× bolak-balik: 3 pin + 3 overlay di landing, 0 di listing, stabil.
  - Reduce: 0 pin, divider tampil di kedua batas lembar.
  - Tidak ada elemen di opacity 0, dan tanpa error console.
- **Konsekuensi yang perlu diketahui**:
  - Animasi masuk di layar pertama section baru (judul, reveal) berjalan saat section itu masih ter-clip di fase tutup, jadi saat overlay membuka kontennya sudah dalam keadaan akhir; transisi itulah entrance-nya. Kalau ingin entrance diputar setelah tukar, perlu penyesuaian di `Reveal`/`SectionHeading`/showcase.
  - Saat dibuka langsung dengan hash, lingkaran splash tetap menutup ke titik robot (yang sudah di luar layar).

### [x] R17 — Transisi kartu Projects & Achievements: lipatan halaman buku

Rencana teknis (satu implementasi di `useShowcase`, sehingga Projects & Achievements **sama persis**):

- **`motion/pageFlip.ts`** (baru): membangun sekali per showcase sebuah lapisan **flipper** absolut di atas tumpukan, berisi rantai **N strip vertikal bersarang** (desktop 8, mobile 4). Tiap strip berisi:
  - `face` dengan `overflow: hidden`, berisi salinan isi `[data-parallax]` kartu yang bergeser `-k × lebar strip`, sehingga gabungan strip = gambar utuh;
  - sisi belakang (`rotateY(180deg)`, `backface-visibility: hidden`) berwarna kertas `color-mix(in oklab, var(--card) 92%, var(--foreground))`;
  - overlay **bayangan** (`color-mix(--foreground 30%)`) dan **kilap** (gradasi `color-mix(--background 40%, transparent)`) yang hanya diubah `opacity`-nya;
  - strip berikutnya, sebagai **saudara** `face` dengan `transform-origin` di tepi kirinya, sehingga rotasi menumpuk dan lembar melengkung mulus. `face` tidak membungkus strip berikutnya, karena `overflow: hidden` akan meratakan 3D.

  Pembungkus memakai `transform-style: preserve-3d`, `perspective` 1600px (desktop) / 1200px (mobile). Strip pertama/terakhir memakai radius sudut kartu.
- **Kurva lipatan**: progres `p` (0 → 1) dipetakan ke sudut kumulatif tiap strip `φ_k(p) = −180° · ease(clamp((p − s·(1 − k/(N−1))) / (1 − s)))`, dengan `s` ≈ 0.35. Strip di tepi bebas mulai lebih dulu (halaman **terangkat dari tepi**), dan strip di dekat engsel menyusul. Rotasi relatif strip k = `φ_k − φ_{k−1}`. Bayangan & kilap per strip = fungsi `sin`/`cos` sudutnya. Ada juga **bayangan jatuh** pada kartu di bawahnya: overlay gradasi `[data-fold-shadow]` baru di `DeckMedia`, dari sisi engsel, `opacity = 0.35 · sin(πp)`. Semua ditulis lewat `gsap.quickSetter` di satu `onUpdate`, hanya `transform` dan `opacity`.
- **Maju** (Next, panah kanan, drag ke kiri): isi flipper diambil dari kartu depan, flipper ditaruh tepat di atasnya, lalu kartu depan disembunyikan (`autoAlpha 0`). Kartu-kartu lain naik satu slot (pose slot R11 tetap). Strip berputar 0 → −180° pada engsel kiri, dan flipper memudar setelah ±120° (pertanyaan #4, disetujui). Di akhir, kartu lama masuk ke slot belakang dalam keadaan tak terlihat, lalu flipper disembunyikan.
- **Mundur** (Prev, panah kiri, drag ke kanan): kartu tujuan ditaruh di depan dalam keadaan tersembunyi, flipper memuat isinya pada −180°, lalu berputar balik ke 0°. Kali ini tepi bebas tiba **terakhir** (kebalikan maju), dan kartu lain turun satu slot. Akhirnya kartu tujuan ditampilkan dan flipper disembunyikan.
- **Teks panel**: `swapText` R11 tetap di timeline yang sama (arah keluar/masuk teks mengikuti arah balik).
- **Durasi**: desktop 0.95s, mobile 0.7s, `power2.inOut` (Keputusan #5).
- **Drag/swipe**: `Draggable` di kartu depan (`type: 'x'`, `allowNativeTouchScrolling: true`), tetapi kartu **tidak digeser**. Jarak horizontal dipetakan ke progres timeline yang di-pause: tarik kiri → maju `p = −dx / (0.9 × lebar)`, tarik kanan → mundur `p = dx / (0.9 × lebar)`. Halaman mengikuti jari, dan bila arah tarikan berbalik melewati 0, timeline arah lain dibangun. Saat dilepas: `p > 0.5` atau flick searah → selesai (`tweenTo(1)`), lalu `active` diperbarui **tanpa** memicu transisi kedua (flag di watcher). Selain itu dibalik ke 0 dan dibersihkan. Klik setelah drag tetap ditelan (R4).
- **Dihapus dari `useShowcase.ts`**: kode tirai (`open`/`closed` clip, `CLIP_PAD`) dan parallax gambar (`IMAGE_SCALE`, `PARALLAX`, lag gambar saat drag) bila tidak dipakai lagi. `DeckMedia.vue` tetap memiliki `[data-parallax]` sebagai lapisan isi yang disalin flipper.
- **Shared element** ke detail: `settle()` menuntaskan timeline lalu menyembunyikan flipper, baru `shareElement` pada `[data-media]` kartu depan (seperti R11).
- **Reduce**: ganti instan (`place()`), flipper tidak dibangun. **Mobile**: 4 strip, tanpa kilap (bayangan saja).

Performa: DOM flipper dibangun **sekali** saat mount (tidak ada pembuatan elemen per transisi), dan isi strip disalin dengan `cloneNode` dari gambar yang sudah dimuat (cache memori, `decoding="sync"` pada salinan). Per frame hanya ada N `transform` + ±2N `opacity` di layer yang sudah di-promote (`will-change` hanya selama timeline). Tanpa WebGL, canvas, atau filter. Target: 60fps, 0 long task (Performance panel, CPU 4×).

File: `motion/pageFlip.ts` (baru), `motion/useShowcase.ts`, `components/site/DeckShowcase.vue` (wadah flipper di tumpukan), `components/site/DeckMedia.vue` (`[data-fold-shadow]`). `Projects.vue`/`Achievements.vue` tidak berubah.

Verifikasi: semua skenario R11 (Next/Prev, panah, Home/End, dua klik cepat, drag pendek kembali, drag kiri maju, drag kanan mundur, tarik bolak-balik melewati 0, klik link) di Projects & Achievements; tepat 1 kartu non-`inert`; blok info cocok; frame tengah memperlihatkan lengkungan (sudut strip tepi > strip engsel saat maju); light/dark; 1280/375/reduce; tanpa elemen di opacity 0.

Risiko:

- Salinan gambar yang belum ter-decode berkedip di frame pertama → salinan dibuat dari `currentSrc` yang sudah tampil, ditambah `img.decode()` sebelum timeline mulai (maks. 1 frame); fallback `background-image` per strip bila tetap berkedip.
- Celah rambut antar strip (subpixel) → strip saling tumpang 1px.
- `preserve-3d` diratakan oleh leluhur dengan `overflow: hidden`/`filter` → flipper diletakkan di luar `<a>` kartu, dan kontainer tumpukan tidak memakai `overflow: hidden`. Ruang putar keluar kolom (mobile) dibatasi `overflow-x: clip` di section, bukan di tumpukan.
- Halaman melintasi panel info di `lg` (pertanyaan #4) → z-index tumpukan di atas panel selama transisi saja.
- Drag yang membangun timeline saat ditekan memakan waktu → dibangun saat `onDragStart` (setelah `minimumMovement`), bukan saat `onPress`.

Catatan hasil:

- **`motion/pageFlip.ts`** (baru): `createPageFlip(stack, { strips, gloss })` membangun flipper **sekali** sebagai anak absolut tumpukan (`z-index 50`, `inert`, `aria-hidden`), berisi 8 strip bersarang di desktop dan 4 di mobile.
  - Tiap strip punya `face` (salinan kartu digeser `−k × lebar strip`), sisi belakang kertas `color-mix(--card 92%, --foreground)` dengan bayangannya sendiri, serta lapisan bayangan dan kilap.
  - `load(card)` menyalin isi kartu (`cloneNode`, gambar `eager`/`sync`) dan menaruh flipper tepat di atasnya.
  - `turn(p)` memutar tiap strip lewat `quickSetter` (`rotationY`). Sudut kumulatif `φ_k = −180° · smoothstep(...)` dengan tepi bebas mendahului spine (`LEAD 0.35`), dan flipper memudar mulai `p 0.62`.
- **`motion/useShowcase.ts`**: tirai dan parallax gambar dihapus.
  - Setiap perpindahan dibangun oleh `build(to, direction, scrub)`. Tombol, keyboard, dan `goTo` memutarnya dengan `power2.inOut` (desktop 0.95s, mobile 0.7s). Drag memakai versi ber-pause yang linear.
  - Maju: salinan kartu depan berputar pergi, kartu lain naik satu slot, dan kartu lama masuk ke slot belakang dalam keadaan tak terlihat. Mundur: kartu tujuan ditaruh tersembunyi di depan, lalu salinannya berputar balik dari −180° dengan tepi bebas tiba terakhir.
  - Kartu yang tersingkap (maju) atau tertutup (mundur) mendapat bayangan lipatan `[data-fold-shadow]` dengan `opacity = sin(πp)`.
  - Teks panel memakai `swapText` R11 di timeline yang sama. Ia kini menahan **kedua** blok terlihat (blok baru juga, karena saat drag `active` belum berubah) dan mengembalikan fungsi `undo` untuk drag yang dibatalkan.
- **Drag**: `Draggable` memakai proxy tak terlihat (`trigger: kartu`), jadi kartu tidak ikut bergeser. Arahnya ditentukan saat jari bergerak > 2px (bukan di `onDragStart` seperti rencana). Tarik kiri = maju, tarik kanan = mundur, dan berbalik arah melewati 0 membangun ulang move ke arah lain.
  - Jari menggerakkan **waktu putaran** (`time = p × durasi`), bukan progres seluruh timeline. Timeline berjalan sedikit lebih panjang dari putaran (kartu kembali ke tumpukan, teks), sehingga pemetaan progres membuat tarikan 45% sudah memutar halaman 66%; ini tertangkap saat uji.
  - Dilepas setelah lewat setengah putaran, atau dengan flick searah > 600px/s → selesai (`power2.out`), lalu `active` diperbarui. Watcher melihat kartu tujuan sudah di depan, jadi tidak ada transisi kedua. Selain itu dikembalikan lalu `place()`.
  - Reduce: arah drag tetap bermakna, ganti instan.
- **`DeckMedia.vue`**: tambah `[data-fold-shadow]`. Lapisan `[data-parallax]` tetap ada sebagai isi yang disalin, tanpa zoom/parallax.
- **Performa, temuan penting**: versi pertama memakai **gradien** (bayangan lipatan dari sisi spine, kilap strip). Trace CDP memperlihatkan satu tugas raster GPU **403ms** (`DoEndRasterCHROMIUM`) di putaran pertama dan 170–350ms di putaran kedua, juga dengan GPU sungguhan (Radeon Vega 8 lewat ANGLE). Eksperimen di halaman uji:
  - flipper disembunyikan → tetap jeda (dari bayangan lipatan);
  - bayangan lipatan dihapus → tetap jeda (dari kilap);
  - keduanya dihapus, atau semua gradien diganti warna solid → maks 33–67ms.

  Bayangan dan kilap kini **lapisan datar** turunan token, dengan opacity per strip/kartu. Pencahayaan bertingkat per strip tetap terbaca sebagai permukaan melengkung. Hasil: p50 16.7ms, p95 16.8–16.9ms, jeda terburuk 100–117ms; itu setara versi tirai HEAD yang diukur dengan cara sama (100–117ms). Mobile maksimum 167ms, tanpa long task (headless tanpa GPU sekali mencatat 59ms).
- **Hasil uji di build** (skrip CDP R11 + skenario R17; Projects 1280 light, Achievements 1280 dark, Projects 375 mobile, 1280 reduce):
  - Next, Prev, panah, End, Home, drag pendek kembali, drag panjang kiri **maju**, drag panjang kanan **mundur**, drag kanan pendek dibatalkan, tarikan setengah yang ditahan lalu dilepas, dan dua Next cepat.
  - Di setiap langkah: tepat 1 kartu non-`inert`, dan blok info + live region cocok dengan kartu depan.
  - Klik link membuka detail dengan `project-media-*` / `achievement-media-*` di kedua sisi view transition.
  - Frame tertahan 15/30/45/60% (dengan gambar uji yang disisipkan skrip, karena data lokal tak bergambar): rata → tepi kanan terangkat melengkung → halaman berdiri memperlihatkan punggung kertas → rebah di atas panel dan memudar. Mundur di dark mode: halaman datang dari kiri dan tepi bebas tiba terakhir.
  - Tidak ada overflow horizontal di 375px. Tanpa error console.

### [x] R18 — Abot mini di atas bubble kontak

Rencana teknis:

- **`components/site/MiniBot.vue`** (baru, hanya di landing): `<button type="button" aria-label="Talk to Abot" aria-expanded aria-controls>` berisi `AbotFigure detail="mini"` (±56px), `position: fixed` di kanan bawah **tepat di atas ContactBubble**: `right` sama dengan bubble, `bottom: calc(max(1.25rem, env(safe-area-inset-bottom) + 0.75rem) + 3.5rem + 0.75rem)` (sm: 1.5rem). `z-40`, di atas overlay transisi `z-30`.
- **Muncul/hilang**: tampil setelah hero lewat, lewat ScrollTrigger pada hero: bawah hero melewati ±25% atas layar, titik yang sama dengan penutupan dialog hero. (Rencana awal memakai titik tukar R16, yang sudah dicabut.) Kembali ke hero → hilang. Masuk = **pop di tempat** (`scale 0.4 → 1.06 → 1` + `autoAlpha`, `brand`, ±0.45s, diikuti lambaian kecil). Keluar = `scale → 0.6` + fade 0.2s. Tidak ada perpindahan posisi. Di luar landing tidak dirender.
- **Gerak**: idle napas + kedip seperti hero tetapi tanpa mata ikut kursor (lebih ringan), dan `speak()` saat bubble/dialog mengetik. Fungsi gerak dipindah dari `HeroBot.vue` ke **`motion/abotMotion.ts`** (`idle`, `blinkLoop`, `wave`, `speak`) supaya dipakai keduanya tanpa duplikasi; gestur penuh hero tetap di `HeroBot`.
- **Bubble chat** (`MiniBotBubble`, bagian dari `MiniBot.vue`): panel HUD kecil (bracket sudut `border-primary`, `bg-card/95 backdrop-blur`, label "ABOT", tanpa ekor) rata kanan di **kiri-atas** Abot mini, `max-w` ±15rem (mobile: `calc(100vw − 2·gutter − 56px)`). Berisi satu kalimat (diketik singkat, ±40 karakter/detik) dan tombol X "Dismiss Abot's message". Bukan live region dan tanpa `role="status"`. Teksnya tetap ada di DOM (terbaca dalam mode baca), tetapi tidak diumumkan. Tidak pernah mengambil fokus. Esc menutup bila fokus ada di area mini.
- **Jadwal** (Keputusan #12, disetujui): pertama setelah 8 detik kumulatif di luar hero, lalu tiap 35–45 detik, tampil 6 detik (dijeda saat hover/fokus), maksimal 4 kali per sesi, X = berhenti untuk sesi itu. Kondisi tunda: ContactModal terbuka, dialog besar atau dialog mini terbuka, interaksi deck/tab/form (fokus di dalam `[data-abot-quiet]` atau `input/textarea/select`, atau `pointerdown` di sana dalam 4 detik terakhir), `document.hidden`. Bila kondisi tunda muncul saat bubble tampil, bubble langsung ditutup. Logika jadwal ada di modul murni **`script/landingPage/abotBubble.ts`** (tanpa DOM) supaya mudah diuji.
- **Isi bubble**: bergiliran dari `buildDialogPages` (sumber yang sama dengan dialog). Halaman `point` ("The projects are right this way") dilewati karena arahnya hanya benar di hero. Setelah R19, tampilan pertama = sapaan jam lokal.
- **Klik Abot mini atau bubble** (pertanyaan #5, disetujui): bubble tertutup, lalu **`BotDialog` lengkap** dibuka di atas Abot mini (instance kedua, posisi pojok; `BotDialog` mendapat prop `placement: 'hero' | 'corner'` untuk kelas posisinya). Fitur sama dengan dialog hero: ketik, Next/Close, Esc, tutup otomatis, reaksi klik beruntun, live region permanen. Kembali ke hero → dialog mini tertutup.
- **Status bersama**: `LandingPage.vue` `provide` satu objek reaktif (`contactOpen`, `heroDialogOpen`, `miniDialogOpen`, `pastHero`). `Hero.vue` dan `MiniBot.vue` mengisinya. Tidak memakai state level modul, supaya aman untuk SSR.
- **ContactBubble**: `bottom` ikut `env(safe-area-inset-bottom)` (rumus yang sama), supaya keduanya tidak tertutup home indicator.
- **Mobile di dasar halaman** (pertanyaan #6, disetujui): di bawah `md`, Abot mini dan bubble-nya disembunyikan selama footer terlihat.
- **Reduce**: Abot mini tampil/hilang instan dan statis (tanpa idle/pop), bubble muncul/hilang tanpa animasi dengan teks langsung utuh. Jadwal tetap sama.

File: `components/site/MiniBot.vue` (baru), `motion/abotMotion.ts` (baru), `script/landingPage/abotBubble.ts` (baru), `components/site/HeroBot.vue` (pakai `abotMotion.ts`), `components/site/BotDialog.vue` (`placement`), `components/contact/ContactBubble.vue` (safe-area), `pages/LandingPage.vue` (provide + mount), `components/ui/landing-page/Hero.vue` (lapor status dialog), `components/site/DeckShowcase.vue` & `Projects.vue` (penanda `data-abot-quiet` di showcase dan tab Skills).

Verifikasi: muncul setelah tukar Hero → About dan hilang saat kembali, tanpa perpindahan posisi; jadwal dengan waktu dipercepat lewat parameter uji (pertama 8 detik, interval, 6 detik, cap 4, X menghentikan); bubble tidak muncul saat modal, dialog besar/mini terbuka, fokus di deck/tab, atau overlay terlihat; klik membuka dialog di pojok dan fokus kembali ke tombol mini saat ditutup; tidak ada perpindahan fokus saat bubble muncul; posisi aman di 375 (safe-area diemulasikan) dan tidak menutup footer; reduce statis; tanpa error console.

Risiko:

- Terasa berisik/mengganggu → cap per sesi, X menghentikan, dan ditunda saat pengguna sibuk; angka jadwal bisa disetel.
- Dua `BotDialog` di satu halaman → id unik per instance (`abot-dialog`, `abot-mini-dialog`), hanya satu yang bisa terbuka (membuka satu menutup yang lain), live region masing-masing.
- Tumpang tindih dengan tombol kontrol showcase di mobile saat tumpukan berada di dasar layar → bubble ditunda saat ada interaksi deck; Abot mini sendiri kecil (56px) dan sejajar ContactBubble.
- `backdrop-filter` pada bubble fixed di atas overlay transisi → bubble tidak tampil saat overlay terlihat.

Catatan hasil:

- **`components/site/MiniBot.vue`** (baru, hanya di landing): `<button aria-label="Talk to Abot">` berisi `AbotFigure detail="mini"` (`h-11`), `fixed` tepat di atas ContactBubble (`right` dan lebar `w-14` sama). Posisi `bottom` = posisi bubble kontak + 4.25rem, keduanya memakai `max(1.25rem, env(safe-area-inset-bottom) + 0.75rem)`.
  - Muncul saat bawah hero melewati 25% atas layar (titik yang sama dengan penutupan dialog hero), dan hilang saat kembali. Di bawah `md` juga hilang selama footer terlihat.
  - Masuk dengan pop di tempat (`scale 0.4 → 1.06 → 1`, `brand`, lalu melambai), keluar `scale 0.6` + fade. Idle napas, antena, dan kedip tanpa mata ikut kursor.
- **Gerak bersama**: `motion/abotMotion.ts` (baru) memuat `wave`, `hop`, `nod`, `dizzy`, `idle`, `gesturePlayer`, dan `speaker`, yang dipindah apa adanya dari `HeroBot.vue`. `HeroBot` kini memakainya; gestur `point` dan mata ikut kursor tetap di `HeroBot` karena khusus hero.
- **Bubble**:
  - Jadwal ada di `script/landingPage/abotBubble.ts` (`BUBBLE`, `bubbleDelay`, `bubbleLines`, status `sessionStorage` `portfolio:abot-bubble:v1` dalam `try/catch`).
  - Penghitung 0.5 detik di `MiniBot` hanya berjalan saat Abot mini terlihat dan tidak ada kondisi tunda. Kondisi tunda: modal kontak, dialog hero/mini, `document.hidden`, fokus di `[data-abot-quiet]`/`input`/`textarea`/`select`/`[contenteditable]`, atau `pointerdown` di sana dalam 4 detik terakhir.
  - Penanda `data-abot-quiet` dipasang di root `DeckShowcase` dan blok Skills.
  - Bubble ditahan saat di-hover/difokus, dan langsung ditutup bila kondisi tunda muncul. Esc menutup bubble saat fokus ada di area mini, X menghentikannya untuk sesi itu.
  - Teksnya diketik 40 karakter/detik; salinan `sr-only` memberi nama tombol. Tanpa `aria-live`/`role="status"`.
- **Dialog mini**: `BotDialog` mendapat prop `placement: 'hero' | 'corner'`. Instance kedua `abot-mini-dialog` muncul rata kanan di atas Abot mini, dengan halaman yang sama (`buildDialogPages`). Gestur dipetakan: `hop`, `nod`, dan sisanya `wave`.
- **Klik beruntun**: logika "≥ 4 klik dalam 1.2 detik → pusing" diekstrak ke `script/landingPage/botClicks.ts` dan dipakai `Hero.vue` maupun `MiniBot.vue`.
- **Status bersama**: `script/landingPage/abotState.ts` (`InjectionKey`). `LandingPage.vue` `provide` `{ contactOpen, heroDialogOpen }`, dan `Hero.vue` mengisi `heroDialogOpen`.
- **`ContactBubble.vue`**: `bottom` kini ikut `env(safe-area-inset-bottom)`.
- **Hasil uji di build** (skrip CDP; 1280 light, 375 mobile dark, 1280 reduce):
  - Di hero tersembunyi; setelah hero lewat terlihat tepat di atas ContactBubble (sejajar tengah, jarak 12px), lalu hilang lagi saat kembali ke hero.
  - Bubble pertama muncul **7.8–8.0 detik** setelah Abot mini terlihat (diukur di dalam halaman). Bubble menghilang setelah 6 detik, tanpa live region, dan fokus tetap di `BODY`.
  - ContactModal terbuka 10 detik → tidak ada bubble; setelah ditutup, bubble muncul. X → `dismissed: true` dan fokus pindah ke tombol Abot mini.
  - Klik Abot mini membuka dialog pojok (desktop 936–1256px; mobile 35–355px dari lebar 375, tetap di layar) dengan `aria-expanded`. Klik beruntun → "Whoa, easy!", dan Esc menutup lalu mengembalikan fokus ke tombol.
  - Mobile: tersembunyi saat footer terlihat. Reduce: muncul/hilang instan, bubble tanpa animasi.
  - Tanpa error console.
  - Catatan uji: skrip pertama mencatat bubble "lebih awal" karena waktu tunggu dihitung setelah screenshot yang memakan beberapa detik di headless; pengukuran di dalam halaman memastikan 8 detik.

**Revisi setelah R18 (2026-10-27): Abot terbang ke pojok.** User meminta animasi perpindahan dari hero ke pojok saat scroll meninggalkan hero. Ini bertentangan dengan aturan R18 "pop di tempat, jangan terbang", jadi ditanyakan dulu; user memilih **"terbang sekali"** (bukan ikut scroll).
- **`MiniBot.vue`**: pop diganti satu nilai `t` (0 = hero, 1 = pojok) yang di-tween `power2.inOut` selama 0.9 detik × jarak tersisa, jadi arah bisa berbalik di tengah jalan.
  - Salinan `AbotFigure` di lapisan `fixed` (`z-40`, `aria-hidden`) digambar tiap frame dari kotak robot hero dan kotak Abot mini yang **diukur langsung**, sehingga jalurnya tetap tepat walau halaman terus digulir.
  - Posisi dan ukuran diinterpolasi, ditambah busur 70px (`sin(πt)`) dan condong −10°. Lebar dan tinggi diset langsung, bukan `scale`, supaya SVG tetap tajam.
  - Mendarat: squash kecil lalu melambai. Robot hero muncul lagi dengan `hop`.
- **Titik berangkat**: desktop saat tengah robot hero di 20% atas layar (lepas landas masih terlihat); mobile saat tengah robot di tepi atas, karena di mobile robot ada di atas teks dan 20% berarti langsung pergi saat dimuat. Kalau halaman dimuat sudah melewati titik itu (link `/#section`), Abot langsung di pojok tanpa terbang.
- **Status bersama**: `AbotState.heroAway`. `Hero.vue` menyembunyikan robot hero (`invisible`) dan menutup dialognya selama Abot pergi.
- **Reduce**: tidak terbang; robot hero tetap, Abot mini muncul/hilang instan (perilaku R18).
- **Uji** (skrip CDP + screencast; 1280 light, 375 mobile dark, 1280 reduce):
  - Turun: robot hero tersembunyi seketika, salinan bergerak dari kotak robot hero (lebar 318px) ke pojok (50px), lalu Abot mini terlihat. Naik: kebalikannya, dan robot hero terlihat lagi setelah salinan tiba.
  - Seluruh skenario R18 (bubble 7–8 detik, modal menunda, dialog pojok, klik beruntun, Esc, X) tetap lolos.
  - Tanpa error console.

### [x] R19 — Greeting sesuai jam lokal device

Rencana teknis:

- `script/landingPage/botDialog.ts`: fungsi murni `greetingFor(hour: number): string` dan `buildDialogPages(name, personal, lastRole, hour?)`. Bila `hour` diberikan, halaman pertama = sapaan dengan gestur `wave`. Gestur halaman berikutnya digeser supaya tidak ada dua lambaian berturut-turut: perkenalan "Hi! I'm Abot" → `nod`, nama/peran → `hop`, `lastRole` → `nod`, projects → `point`.
- Jam dibaca **di klien**: `Hero.vue` dan `MiniBot.vue` menyimpan `hour = ref<number | null>(null)`, diisi di `onMounted` dan **dibaca ulang tiap dialog dibuka / bubble tampil**, sehingga pergantian jam selama kunjungan ikut terbaca. `new Date().getHours()` otomatis mengikuti zona waktu perangkat. Tidak ada akses `Date` di level modul atau saat render server.
- Bubble Abot mini (R18) memakai `greetingFor(hour)` untuk tampilan pertamanya.
- Reduce: tidak ada perbedaan (teks saja).

Pembagian jam & kalimat (**disetujui** 2026-10-26, pertanyaan #7):

| Jam lokal   | Kalimat                                                         |
| ----------- | --------------------------------------------------------------- |
| 05:00–11:59 | "Good morning! Thanks for stopping by."                         |
| 12:00–17:59 | "Good afternoon! Nice of you to drop in."                       |
| 18:00–22:59 | "Good evening! Glad you made it here."                          |
| 23:00–04:59 | "Up this late? Me too, but I'm a robot. Don't forget to sleep!" |

File: `script/landingPage/botDialog.ts`, `components/ui/landing-page/Hero.vue`, `components/site/MiniBot.vue`.

Verifikasi: `getHours` dipalsukan (override `Date` di skrip uji) ke 4, 5, 11, 12, 17, 18, 22, 23 → kalimat sesuai batas; halaman sapaan selalu pertama di dialog hero dan dialog mini, dan menjadi bubble pertama; HTML hasil render server (bila SSR diaktifkan) tidak memuat kalimat sapaan; tanpa error console.

Risiko:

- Jam perangkat salah atau zona waktu VPN → sapaan ikut perangkat, sesuai permintaan (tidak ada data lokasi yang dipakai).
- Dialog yang dibuka tepat saat pergantian jam → jam dibaca sekali saat dibuka dan tidak berubah di tengah dialog.

Catatan hasil:

- **`script/landingPage/botDialog.ts`**: `greetingFor(hour)` dengan pembagian jam yang disetujui (05–11 morning, 12–17 afternoon, 18–22 evening, 23–04 versi larut malam). `buildDialogPages(name, personal, lastRole, hour?)`: bila `hour` ada, halaman pertama = sapaan (`wave`) dan gestur bergeser (perkenalan `nod`, nama/peran `hop`, `lastRole` `nod`, projects `point`); tanpa `hour` sama seperti sebelumnya.
- **`script/landingPage/localHour.ts`** (baru): `useLocalHour()` → `{ hour, read }`, membaca `new Date().getHours()` di `onMounted` (tidak pernah saat render/di level modul).
- **`Hero.vue`** dan **`MiniBot.vue`**: halaman dialog dihitung dari `hour`; saat dialog dibuka, `read()` dipanggil lalu `advance()` di `nextTick` supaya prop `pages` yang baru sudah sampai ke `BotDialog` sebelum halaman pertama. Bubble memanggil `read()` sebelum memilih baris, jadi bubble pertama sesi = sapaan (`bubbleLines` mengambil halaman yang sama). Klik Abot mini saat dialog tertutup kini lewat jalur yang sama dengan klik bubble.
- **Hasil uji di build** (skrip CDP dengan `Date.prototype.getHours` dipalsukan): jam 4 dan 23 → larut malam, 5 dan 11 → morning, 12 dan 17 → afternoon, 18 dan 22 → evening sebagai halaman pertama dialog hero; untuk jam 5 dan 23 bubble pertama dan dialog Abot mini juga dimulai dengan sapaan yang sama. HTML dari server (`curl`) tidak memuat kalimat sapaan. Tanpa error console.


### [x] R20 — Suara robot khas Abot

Ditambahkan user saat menjawab pertanyaan #5. Rencana teknis:

- **`script/landingPage/abotVoice.ts`** (baru, tanpa Vue dan tanpa dependency): satu `AudioContext` yang dibuat **lazily saat gestur pengguna pertama** (klik robot hero/mini), lalu dipakai bersama. Semua bunyi disintesis: `OscillatorNode` (square/triangle) → `BiquadFilter` lowpass (supaya tidak menusuk) → `GainNode` dengan envelope pendek (attack 5ms, decay 40–80ms). Volume master rendah (±0.12). Tanpa file audio.
- **Kosakata bunyi**:
  - `babble`: blip pendek tiap 2–3 karakter selama efek ketik, dengan nada acak dalam satu tangga nada pentatonik (±520–880 Hz), dan satu blip lebih tinggi di akhir kalimat tanya. Ini yang membuat Abot terdengar "bicara".
  - `open`: dua nada naik (chirp "bip-bup") saat dialog dibuka.
  - `close`: dua nada turun saat dialog ditutup.
  - `next`: satu klik pendek saat pindah halaman.
  - `dizzy`: nada bergelombang turun (`frequency` dengan LFO) untuk reaksi klik beruntun.
  - `pop`: satu "bloop" saat Abot mini muncul, hanya bila audio sudah pernah dibuka lewat gestur di sesi itu.
- **Kapan bunyi**:
  - Bunyi hanya di dialog yang **dibuka pengguna** (hero atau mini).
  - Bubble periodik R18 **tetap senyap**: tanpa gestur, browser memblokir audio, dan bunyi berkala yang datang tanpa diminta akan mengganggu.
  - Tidak ada bunyi saat tab tersembunyi.
  - `BotDialog` memanggil hook suara dari tween ketik (`onUpdate`, saat jumlah karakter melewati kelipatan) dan dari event buka/tutup/halaman; tidak ada timer terpisah.
- **Tombol bisu** di header HUD `BotDialog`: ikon speaker, `aria-pressed`, label "Mute Abot"/"Unmute Abot". Status disimpan di `localStorage` `portfolio:abot-sound:v1` (`try/catch`; gagal → hanya di memori) dan berlaku untuk kedua dialog. **Default: bunyi aktif**, karena diminta user dan selalu didahului gestur (klik robot). Kalau tidak diinginkan, cukup ubah default.
- **Reduce motion**: tidak memengaruhi suara (preferensi itu soal gerak); dialog tetap tanpa efek ketik, jadi `babble` diganti satu chirp `open` saja.
- **SSR**: `AudioContext` hanya disentuh di handler klik dan di klien. Tidak ada akses `window` di level modul.

File: `script/landingPage/abotVoice.ts` (baru), `components/site/BotDialog.vue` (hook suara + tombol bisu), `components/ui/landing-page/Hero.vue` (`dizzy` saat reaksi), `components/site/MiniBot.vue` (`pop`, dialog mini).

Verifikasi: tanpa gestur tidak ada `AudioContext` yang dibuat (tidak ada peringatan autoplay di console); klik robot → `open` + `babble` selama mengetik; klik saat mengetik → babble berhenti bersamaan dengan teks yang langsung utuh; Next/Close/Esc berbunyi; bisu tersimpan dan berlaku setelah reload dan di dialog mini; bubble periodik senyap; reduce: satu chirp tanpa babble; tidak ada long task (oscillator dibuat per blip lalu dibuang otomatis); tanpa error console.

Risiko:

- Bunyi mengagetkan atau terlalu ramai → volume rendah, lowpass, babble tiap 2–3 karakter (bukan tiap karakter), dan tombol bisu yang selalu terlihat.
- Safari: `AudioContext` mulai dalam status `suspended` → `resume()` dipanggil di handler klik yang sama.
- WCAG 1.4.2 (kontrol audio): bunyi singkat (< 3 detik per bunyi), hanya muncul setelah aksi pengguna, dan bisa dibisukan.

Catatan hasil:

- **`script/landingPage/abotVoice.ts`** (baru): `unlockVoice()` membuat `AudioContext` (dengan fallback `webkitAudioContext`) dan memanggil `resume()` bila `suspended`; master gain 0.12. `tone()` = oscillator → lowpass 2.2 kHz → envelope (attack 5 ms, decay eksponensial), opsional glide dan vibrato (LFO). Node dilepas setelah `stop()`, dan nada tidak dijadwalkan bila belum ada context, dibisukan, atau `document.hidden`. Kosakata: `open` (659 → 988 Hz), `close` (880 → 587), `next` (klik triangle 1.3 kHz), `blip` (nada acak pentatonik C5–A5, 45 ms; versi naik di akhir kalimat tanya), `dizzy` (triangle 900 → 260 Hz dengan vibrato 11 Hz), `pop` (sine 320 → 720 Hz).
- **Preferensi bisu**: `abotMuted` adalah satu `ref` modul untuk kedua dialog, dibaca dari `localStorage` `portfolio:abot-sound:v1` di `onMounted` (bukan saat render), `try/catch`. Default bunyi aktif.
- **`BotDialog.vue`**: `advance()` yang membuka dialog memanggil `unlockVoice()` + `open` (masih dalam aktivasi gestur klik/Enter, termasuk setelah `nextTick` di R19). Mengetik: satu `blip` tiap 2–3 huruf (spasi dilewati), plus `blip(true)` bila kalimat diakhiri "?". Pindah halaman/kembali dari reaksi: `next`. `close()`: `close`. `interrupt()` (reaksi klik beruntun): `dizzy`. Tombol bisu di header (ikon `Volume2`/`VolumeX`, label tetap "Mute Abot" + `aria-pressed`); membunyikan kembali memberi klik `next` sebagai umpan balik. Reduce: tanpa efek ketik, jadi hanya chirp buka/halaman/tutup.
- **`MiniBot.vue`**: `pop` saat mendarat di pojok; hanya bersuara bila context sudah dibuat oleh klik sebelumnya. Bubble periodik tidak memanggil suara sama sekali.
- **Hasil uji di build** (skrip CDP yang membungkus `AudioContext` dan `OscillatorNode.start`; 1280 light dan reduce):
  - Dimuat tanpa gestur: 0 context, 0 nada; terbang ke pojok sebelum ada klik: senyap.
  - Klik robot hero: 1 context, 2 nada buka, lalu blip selama mengetik; klik berikutnya: 1 `next` + blip halaman baru; klik beruntun: `dizzy` (dengan LFO).
  - Bisu → halaman berikutnya tanpa nada, `localStorage = muted`, `aria-pressed=true`; dibunyikan lagi → 1 klik umpan balik.
  - Terbang ke pojok setelah ada klik → 1 `pop`; bubble periodik → 0 nada.
  - Reduce: buka = 2 nada tanpa blip.
  - Tanpa error console dan tanpa peringatan autoplay.
  - Catatan: headless hanya merender ±6–14 frame/detik saat diuji, jadi jumlah blip per kalimat di sana lebih sedikit (satu blip paling banyak per frame); di 60 fps blip mengikuti ritme 2–3 huruf.

### [x] Revisi setelah R20 — dialog bubble chat & toggle audio di navbar (2026-10-27)

Permintaan user: dialog jangan kaku, bentuk awan atau bubble chat, tanpa pagination supaya natural, dan toggle audio di samping toggle dark mode. Bentuk bubble/awan bertentangan dengan Keputusan #1 ("tanpa speech bubble"), jadi ditanyakan dulu: user memilih **bubble chat** dan alur **satu bubble yang berganti** (bukan thread chat).

- **`BotDialog.vue`** (ditulis ulang):
  - Bentuk: `rounded-3xl`, `bg-card` opak, `border-border`, `shadow-elevated`, ekor = persegi `rotate-45` bersudut 4px dengan border hanya di dua sisi luar. Hero: ekor ke bawah di `lg` (bubble di atas robot) dan ke atas di bawah `lg` (bubble di bawah robot); `corner`: ekor ke bawah, sejajar tengah Abot mini.
  - Dibuang: header "ABOT · ONLINE", bracket HUD, kursor kedip, titik halaman, tombol Next/Close. Tetap: × kecil, Esc, live region permanen, salinan teks utuh `sr-only` (`aria-describedby`), judul `sr-only` "Abot".
  - Alur: fase `typing` → `reading` (jeda baca `clamp(2, 5.5, 1.4 + 0.045 × huruf)` detik) → `dots` (titik-titik memantul 0.8 detik, `motion-reduce:animate-none`) → kalimat berikutnya; kalimat terakhir menutup sendiri setelah ≥ 5 detik. Reaksi klik beruntun tampil lalu kembali sendiri ke kalimat yang sedang berjalan. Klik Abot: menuntaskan ketikan, melewati jeda/titik-titik ke kalimat berikutnya, atau menutup setelah kalimat terakhir. Pointer/fokus di bubble menahan jeda. Reduce: tanpa ketik dan tanpa titik-titik, kalimat berganti setelah jeda baca.
  - Tinggi bubble dianimasikan (0.25 detik) saat kalimat atau titik-titik menggantikan isi sebelumnya; selama mengetik tinggi ditahan oleh salinan tak terlihat.
  - Suara: `open`, blip saat mengetik, `close`, `dizzy` tetap; klik `next` tidak lagi diputar di setiap pergantian otomatis.
- **`MiniBot.vue`**: bubble periodik memakai bentuk yang sama dengan ekor ke kanan (ke Abot mini); label "ABOT" dan bracket dihapus, nama tombol jadi "Abot: {kalimat}" (`sr-only`).
- **`SoundToggle.vue`** (baru): tombol bergaya `ThemeToggle` (ikon `Volume2`/`VolumeX` dengan transisi yang sama), label tetap "Mute Abot" + `aria-pressed`, membaca preferensi di `onMounted`; dipasang di `Navbar.vue` tepat sebelum `ThemeToggle`, **hanya di landing** (`isLandingPage`), karena Abot hanya ada di sana.
- **Hasil uji di build** (skrip CDP; 1280 light, 375 mobile dark): urutan otomatis sapaan → perkenalan → nama → peran terakhir → projects dengan "…" ±0.8 detik di antaranya; hover menahan kalimat lebih dari 7 detik; dua klik = menuntaskan lalu melewati; bubble hero/pojok/periodik tampil dengan ekor ke arah Abot di kedua tema; toggle navbar → `aria-pressed=true`, `localStorage = muted`, lalu kembali `on`; tidak ada di halaman All Projects; tanpa error console.

### [x] Revisi: tombol diam saat hover (2026-10-27)

Permintaan user: semua tombol tetap di tempat saat hover; yang berubah hanya efek seperti warna, ikon yang bergerak, dan sejenisnya. Ini membatalkan sebagian Tahap 7 (efek magnetic CTA).

- **Efek magnetic dilepas** dari "View Projects" (`Hero.vue`) dan `CtaLink.vue` ("See More …"); pembungkus `span` magnetic di `CtaLink` ikut dihapus. Panah di kedua tombol tetap bergeser.
- **`translate`/`scale` dihapus** dari: CTA "Achievement" di hero (ikon medali tetap berputar), ContactBubble (`hover:scale-[1.08]` dan `active:scale-[0.94]`; kecerahan dan putaran ikon tetap; `soft-pulse` hanya `box-shadow`), baris link di ContactModal (ikon dan panah tetap bergerak), tombol GitHub di `ProjectDetail.vue` (bayangan dan panah tetap).
- `transition-all` di tombol-tombol itu dipersempit ke properti warna/bayangan/`filter`.
- `motion/useMagnetic.ts` kini tidak dipakai; menunggu keputusan hapus bersama file transisi R16.
- Di luar lingkup (bukan tombol, belum diubah): kartu listing Projects/Achievements (`useTilt` + naik), tile/pill Skills dan chip peran di hero (naik saat hover), kartu Dashboard admin.
- **Uji di build** (CDP, 1280 light): kotak "View Projects", CTA "Achievement", "See More Projects", ContactBubble, dan tombol Next showcase identik sebelum dan saat hover; tanpa error console.

### [x] Revisi: lipatan sudut kiri bawah → kanan atas (2026-10-27)

Permintaan user: lipatan "next" pada stack kartu Projects & Achievements dari pojok kiri bawah ke pojok kanan atas.

- **`motion/pageFlip.ts`** ditulis ulang (API sama: `load`, `turn`, `hide`, `destroy`), tanpa strip/3D. Geometri 2D dari progres `p`: garis lipat tegak lurus diagonal kiri-bawah → kanan-atas, pada jarak `p × diagonal` dari pojok kiri bawah.
  - Sisa halaman: salinan kartu (layer sendiri, `will-change`) di-`clip-path` ke bagian yang masih rata.
  - Flap: bagian yang terangkat dicerminkan di garis lipat, berwarna punggung kertas `color-mix(--card 90%, --foreground)`. Hanya pita selebar `min(lipat, sisa, 22% diagonal)` di dekat garis lipat yang digambar, sehingga terbaca sebagai kertas melengkung; pita menyempit ke nol saat lipatan mencapai pojok kanan atas.
  - Lekuk (`--foreground` 16%) di 30% pita terdekat lipatan, dan bayangan flap di halaman berupa pantulan yang sama diperbesar 1.12× (jadi bayangan mengikuti bentuk flap). Semua warna datar (pelajaran R17 soal gradien).
- **`motion/useShowcase.ts`**: drag dibalik (kanan = maju, kiri = mundur; flick juga). Akhir tarikan kini di `onRelease` (ketukan tanpa geser tetap menjadi klik), dan tombol/keyboard memanggil `settle()` dulu sehingga tarikan yang masih menggantung tidak pernah terselip.
- **Bug yang ditemukan saat uji & diperbaiki**: lapisan flap ber-padding tetap ikut layout setelah lipatan pertama (`visibility: hidden`), membuat dokumen lebih lebar dari layar. Di mobile Chrome lalu men-zoom-out halaman (ketukan meleset ±1.31×; terlihat sebagai tombol yang "tidak merespons" setelah drag). Perbaikan: flipper `hidden` (`display: none`) saat tidak dipakai, dan section Projects/Achievements `overflow-x-clip` sehingga flap yang menjorok selama animasi dipotong di tepi section tanpa memperlebar dokumen.
- **Performa**: putaran pertama per profil browser punya satu jeda ±350–400ms (kompilasi shader GPU untuk `clip-path` poligon); dengan profil yang sama, run berikutnya p95 16.8ms dan jeda terburuk 33ms. Jadi pengunjung merasakannya sekali, di kunjungan pertama.
- **Hasil uji di build** (skrip CDP; Projects 1280 light, Achievements 1280 dark & 375 mobile, Projects 375 mobile & 1280 reduce): Next/Prev, panah, Home/End, drag pendek kembali, drag kanan maju, drag kiri mundur, tarikan setengah, dua Next cepat, link detail — semua benar, tepat 1 kartu aktif; frame 15/30/45/60% memperlihatkan pojok kiri bawah terlipat dan lipatan menyapu ke kanan atas; mundur di dark mode terlipat kembali dari kanan atas; lebar dokumen tidak bertambah selama/sesudah lipatan dan zoom tetap 1; tanpa error console.

### [x] Tambahan: musik latar + toggle di navbar (2026-10-27)

Permintaan user: backsound untuk web, dengan toggle musik di samping toggle dark mode. File dari user: `resources/js/assets/music/Marimba Mischief.mp3` (3.6 MB), di-import lewat Vite sehingga ter-build dengan hash (`public/build/assets/Marimba Mischief-<hash>.mp3`).

- **`composables/useBacksound.ts`** (baru): satu `Audio` di level modul (dibuat lazily di klien, `loop`, `preload="none"` sehingga file baru diunduh saat pertama diputar), volume 0.3 dengan fade masuk 1.5 detik dan keluar 0.4 detik (`gsap` pada properti `volume`). **Default nyala dan langsung dicoba diputar saat halaman publik dimuat** (permintaan user: tanpa klik). Browser yang mengizinkan autoplay (mis. situs yang sering didengarkan pengunjung) langsung berbunyi; yang menolak (selalu di kunjungan pertama) menolak tanpa error dan musik mulai pada klik/ketukan/tombol pertama di mana saja, atau saat toggle dinyalakan. Tidak ada cara bagi situs untuk memaksa suara tanpa interaksi. Pilihan disimpan di `localStorage` `portfolio:music:v1` (`try/catch`). Berhenti saat tab tersembunyi dan lanjut saat kembali. Reference count seperti Lenis: tetap berjalan melintasi kunjungan Inertia antar-halaman publik, berhenti bila tidak ada halaman publik lagi.
- **`components/site/MusicToggle.vue`** (baru): tombol bergaya `ThemeToggle`, ikon `Headphones`/`HeadphoneOff`, label "Background music" + `aria-pressed`; di `Navbar.vue` tepat sebelum `ThemeToggle` di **semua halaman publik** (toggle suara Abot tetap hanya di landing).
- **Uji di build** (CDP, `--autoplay-policy=user-gesture-required`, 1280 light dan 375 mobile dark): sebelum gestur tidak ada pemutaran dan 0 request mp3; klik pertama → diputar, volume naik ke 0.3; toggle off → pause, `off` tersimpan, tetap mati setelah reload walau halaman diklik; toggle on → diputar lagi; kunjungan Inertia ke All Projects → musik terus berjalan tanpa jeda; tab tersembunyi → pause, terlihat lagi → lanjut; tanpa error console.
  - Uji tambahan: dengan `--autoplay-policy=no-user-gesture-required` musik berbunyi saat halaman dimuat tanpa gestur (volume 0.3); dengan `user-gesture-required` percobaan awal ditolak diam-diam dan klik pertama memulainya.

### [x] Perbaikan: penerbangan Abot ke pojok selalu terlihat (2026-10-30)

Keluhan user: perpindahan robot ke Abot mini kadang tanpa animasi transisi. Penyebab: titik awal penerbangan diukur langsung dari robot hero setiap frame, jadi saat pengunjung terus menggulir (terutama cepat), titik awal ikut keluar layar dan yang terlihat hanya akhir penerbangan; selain itu salinan (`z-40`) berangkat di balik navbar (`z-50`).
- **`MiniBot.vue`**: titik awal **dibekukan dalam koordinat layar saat lepas landas** (salinan `position: fixed` terbang lepas dari halaman), sementara tujuan tetap diukur langsung. Kotak robot hero **dijepit ke dalam layar, di bawah navbar** (`--nav-h`), baik saat berangkat maupun saat mendarat kembali. Berbalik arah di tengah jalan dimulai dari posisi salinan saat itu. Durasi minimal 0.4 × 0.9 detik. Salinan kini `z-[55]` (di atas navbar) selama terbang; condongnya mengikuti arah.
- **Uji** (CDP, 1280 dan 375): lompat langsung ke y = 1500 (robot hero ±1230px di atas layar) → salinan berangkat di y = 74 (desktop) / 70 (mobile), tepat di bawah navbar, lalu ke pojok (sebelumnya ±−1300, tak terlihat); jalur balik pojok → hero utuh; skenario R18 (bubble, dialog, Esc, modal, X) dan reduce tetap lolos; tanpa error console.

