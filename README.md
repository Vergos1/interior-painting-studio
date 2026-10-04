# Savrik

Landing page for a painting contractor — wall, ceiling and decorative painting with transparent pricing, a live cost estimator and a lead form.

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)
![GSAP](https://img.shields.io/badge/GSAP-88CE02?style=flat&logo=greensock&logoColor=black)
![Lenis](https://img.shields.io/badge/Lenis-smooth%20scroll-000000?style=flat)

## About

Savrik is a single-page marketing website for **Valerii Savratskyi**, a painter working on apartments, houses and offices since 2014. The goal of the page is simple: turn a visitor into a measurement request.

Instead of a generic "we paint walls" template, the page is built around trust and clarity: a fixed price per m², a written estimate within 24 hours, a 2-year guarantee, real prices for every type of work, before/after proof, reviews and a form that shows an approximate cost before the visitor even submits it.

The site is fully static — no framework, no build step, no backend required to view it. Content language: **Ukrainian** (`lang="uk"`).

## Features

- **Animated hero** — large paint-reveal headline, hero photo and a rotating circular guarantee badge
- **Bento advantages grid** — animated counters (340+ objects, 12 years, 24 h estimate, 2-year guarantee) and a "what you get" promise card
- **Sticky-stack services** — five service cards with full price lists that stack on scroll
- **Before / After slider** — draggable comparison with an accessible range input fallback
- **Filterable gallery** — categories (flats, houses, offices, decor) with a project preview lightbox: photo thumbnails, facts, work list, prev/next navigation
- **Process section** — 5 steps from measurement to handover, with floating image preview on hover
- **Review reels** — two infinite marquee rows moving in opposite directions, with 4.9 average rating block
- **FAQ accordion** — accessible expand/collapse with `aria-expanded` and region roles
- **Lead form with live estimate** — choose work types, drag sliders for area, and see price range, timeline, paint volume and a visual work plan update in real time
- **Photo upload** — attach up to 5 wall photos to the request
- **Success state** — animated confirmation after submit with reset option
- **Smooth scrolling** — Lenis-powered inertia scroll synced with GSAP ScrollTrigger
- **UI details** — scroll progress bar, custom cursor, mobile fullscreen menu, sticky call bar on mobile, scroll-to-top button with progress ring
- **SEO basics** — title, meta description, theme color, semantic landmarks and heading hierarchy



## Page Structure


| #   | Section            | Description                                                                 |
| --- | ------------------ | --------------------------------------------------------------------------- |
| 1   | **Header**         | Logo, anchor navigation, phone, CTA button and mobile burger menu           |
| 2   | **Hero**           | Headline, lead text, CTAs, photo, guarantee badge and services ticker       |
| 3   | **Manifest**       | Short statement of the working approach                                     |
| 4   | **Advantages**     | Bento grid with counters, photo and promise list                            |
| 5   | **Services**       | Sticky-stack price cards for each type of work                              |
| 6   | **Before / After** | Interactive comparison slider                                               |
| 7   | **Works**          | Filterable gallery with project lightbox                                    |
| 8   | **Steps**          | Five-step workflow with durations                                           |
| 9   | **Reviews**        | Rating summary and two scrolling review reels                               |
| 10  | **FAQ**            | Answers about price, materials, timing, living on site, paint and guarantee |
| 11  | **Lead form**      | Contact form with live cost estimate and work plan preview                  |
| 12  | **Footer**         | Contacts, working hours, marquee call-to-action                             |




## Services and Pricing Model

All prices are for labour only; materials are charged separately. The final amount is fixed in a written estimate after a free on-site measurement.


| Service                               | Starting price           |
| ------------------------------------- | ------------------------ |
| Walls, 2 coats                        | from 110 UAH/m²          |
| Ceiling, 2 coats                      | from 130 UAH/m²          |
| Airless spraying                      | from 140 UAH/m²          |
| Two-colour walls                      | from 160 UAH/m²          |
| Priming, 1 coat                       | from 35 UAH/m²           |
| Finishing putty, 2 coats + sanding    | from 170 UAH/m²          |
| Mesh reinforcement                    | from 70 UAH/m²           |
| Old paint removal                     | from 60 UAH/m²           |
| Slopes painting                       | from 90 UAH/linear m     |
| Slopes preparation                    | from 160 UAH/linear m    |
| Mouldings and plinths                 | from 60–150 UAH/linear m |
| Decorative paint (silk, velvet, sand) | from 350 UAH/m²          |
| Concrete or Venetian effect           | from 450 UAH/m²          |
| Stencil and geometry                  | from 400 UAH/m²          |
| Doors with casing, both sides         | from 650 UAH/pc          |
| Radiators                             | from 250 UAH/pc          |
| Wood and metal                        | from 160–180 UAH/m²      |




## Tech Stack


| Technology         | Purpose                                                  |
| ------------------ | -------------------------------------------------------- |
| HTML5              | Semantic markup                                          |
| CSS3               | Layout, theming and responsive design (`style.css`)      |
| Vanilla JavaScript | Interactions, form logic, estimator (`script.js`)        |
| GSAP 3.12          | Animations                                               |
| ScrollTrigger      | Scroll-driven animations and the pinned/stacked sections |
| Flip               | Smooth layout transitions (gallery filtering)            |
| Lenis 1.1          | Smooth scrolling                                         |
| Google Fonts       | Onest (text) and Unbounded (headings)                    |
| Lucide icons       | Inline SVG icons                                         |


All libraries are loaded from CDNs, so there is nothing to install.

## Project Structure

```text
.
├── index.html     # Markup for all sections
├── style.css      # Styles, design tokens and responsive rules
├── script.js      # Animations, slider, gallery, lightbox, form and estimator
└── README.md
```



## Getting Started

The project has no build step. Open `index.html` in a browser, or serve the folder locally:

```bash
# Option 1: Node
npx serve .

# Option 2: Python
python3 -m http.server 3000
```

Then open `http://localhost:3000`.

> An internet connection is required on first load for the CDN scripts, Google Fonts and demo images.



## Customization

Replace the placeholders before publishing:


| What                    | Where                                                                                      |
| ----------------------- | ------------------------------------------------------------------------------------------ |
| Phone number            | `+380 63 000 00 00` and `tel:+380630000000` in the header, hero, menu, footer and call bar |
| Telegram                | `https://t.me/your_username` in the mobile menu and footer                                 |
| Viber                   | `viber://chat?number=%2B380630000000` in the mobile menu and footer                        |
| City and districts      | Title, meta description, hero tag, badge text, gallery captions and review locations       |
| Prices                  | Service cards in section `#services`, FAQ answers and the estimator in `script.js`         |
| Photos                  | Demo images come from Unsplash and Pexels; replace them with real project photos           |
| Reviews and rating      | Review reels and the `4,9 / 86 reviews` block in section `#reviews`                        |
| Brand colours and fonts | Design tokens at the top of `style.css`                                                    |




## Lead Form

The form collects name, phone, selected work types, quantities and optional photos, and shows an estimate range in real time. The front end validates input and displays the success state, but **sending the request needs a backend or form service**. Connect the submit handler in `script.js` to one of:

- Telegram Bot API
- Formspree, Web3Forms or a similar service
- Your own endpoint (e.g. a serverless function)



## Accessibility and UX

- Skip-friendly semantic structure with labelled sections (`aria-labelledby`)
- Keyboard-operable accordion, menu, filters and slider
- Decorative elements are hidden from assistive tech with `aria-hidden`
- Screen-reader-only heading text in the hero
- Form errors announced with `role="alert"`
- Lazy-loaded images with explicit `width` and `height` to prevent layout shift
- Mobile-first extras: fullscreen menu and sticky call bar



## Deployment

Any static hosting works: GitHub Pages, Netlify, Vercel, Cloudflare Pages or a regular web server. Upload the project folder as is.

## Author

Designed and developed by **Vergos1**
[Portfolio](https://example.com) · [GitHub](https://github.com/vergos1)

Client: **Valerii Savratskyi**, painting works.