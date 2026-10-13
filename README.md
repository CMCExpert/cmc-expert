# How to Become a CMC Expert

A working professional's roadmap from bench scientist to CMC Director:
career journey, CMC knowledge hub (competency map + essential guidelines),
and a self-testing quiz lab with instant scoring.

**Live site:** https://bearxiongw.github.io/cmc-expert/ (enable GitHub Pages: Settings → Pages → Deploy from branch → `main` → `/(root)`)

## Structure

| File | What it is |
|---|---|
| `index.html` | Landing page: the 5-stage roadmap |
| `journey.html` | Career timeline: strain engineering → microbial fermentation → mammalian upstream → interim Downstream Director → CMC Director |
| `knowledge.html` | CMC Director competency map + essential guidelines table (ICH Q5–Q14, M4Q, FDA PV) |
| `quiz.html` | Quiz Lab shell |
| `assets/js/questions.js` | Question bank — 48 questions, 6 categories, each with explanation |
| `assets/js/quiz.js` | Quiz engine: 10-question rounds, instant feedback, localStorage best scores |
| `assets/css/style.css` | Site styles |

## Updating

Content edits are plain HTML/JS — add questions to `assets/js/questions.js`
following the existing `{c, q, o, a, e}` format and they appear automatically.
