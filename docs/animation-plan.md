# Rencana Refactor Animasi (Motion) — Portfolio

Status: **Selesai** — semua tahap (1–8) sudah dikerjakan.
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
| Maskot "Tejo" (huruf logo "a" putih yang terbang + speech bubble), tombol WhatsApp    | Robot visor milik sendiri yang tinggal di hero, tanpa speech bubble; ContactBubble + modal kontak kita                                        |
| Carousel project yang di-drag (`01 / 12`)                                             | **Stack layering vertikal** (sticky card bertumpuk), bukan carousel                                                                           |
| Susunan section About → Selected work → Experience → Hire me → Contact                | Tetap Hero → About (ID card, stats, timeline) → Projects (+ Skills) → Achievements → Footer                                                   |
| Palet, font, footer, efek langit/laut/wordmark tenggelam, curved wipe, horizontal pin | Palet biru `--primary` + brand red, Poppins, footer & ID card & timeline zigzag & floating sparks yang sudah direstore. Tanpa horizontal pin. |
| Gaya transisi halaman referensi                                                       | Shared-element View Transition: gambar card "terbang" ke hero detail                                                                          |

Ciri khas yang **hanya milik kita**: indikator navbar berbasis `clip-path` (pill biru "membuka" ke item aktif), rail timeline yang tergambar biru mengikuti scroll, deck Achievements yang miring selang-seling, highlight kursor berwarna turunan `--primary`.

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

1. **Hero: maskot robot, bukan foto** (diputuskan 2026-10-26). Komponen baru `site/HeroBot.vue`: robot mungil SVG inline — kepala bergaya kartu dengan visor `fill-primary`, mata LED `fill-primary-foreground`, antena berujung `fill-brand-red`, melayang di atas glow thruster. Semua warna dari class token (tanpa hex). Gerak: masuk sebagai bagian intro (pop + lambaian), idle melayang + kedip acak + antena berdenyut, mata & kepala mengikuti kursor (desktop `pointer: fine`), squint senang saat hover, lompat + melambai saat diklik, parallax saat scroll. Reduce → robot statis.
   Beda dari Tejo (andikadevs): Tejo adalah huruf logo "a" putih flat dengan dua mata, terbang keliling halaman dan menyapa lewat speech bubble. Robot kita bukan bentuk logo/huruf, tanpa speech bubble, tetap di hero (tidak terbang antar section), dan memakai gaya kartu/visor palet biru-merah kita. Splash menutup dengan `clip-path: circle()` yang mengecil tepat ke titik robot, lalu robot "muncul" dari titik itu.
2. **Skills marquee** (Tahap 3) — "pilih yang terbaik": dua baris marquee, baris 1 hard skills (tile ikon + nama) ke kiri, baris 2 soft skills (pill) ke kanan; tab Hard/Soft dihapus; posisi tetap di bawah Projects.
3. **Nama hero**: typewriter diganti SplitText per kata dengan mask per line (lebih ringkas ~0.8s vs ~2s, konsisten dengan heading section). Kepribadian/"fun" dipindah ke robot.
4. **Bento grid Projects & grid Achievements di landing** diganti stack/deck. Halaman All Projects/All Achievements tetap grid + Flip.
5. **Easing**: semua entrance/interaksi memakai `brand`. Pengecualian yang disengaja hanya untuk loop kontinu (melayang robot `sine.inOut`, marquee `none`) karena easing ease-out tidak bisa looping mulus.
6. **Package manager**: `node_modules` lokal dikelola pnpm; `pnpm-lock.yaml` baru belum di-commit (menunggu keputusan).
