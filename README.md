# Italiano quotidiano

A daily Italian course that starts with an A2 review and builds toward B1. Each lesson includes a story, retrieval practice, and a ten-question mastery exam.

## How grading works

- Every mastery exam receives a score out of 10 in the browser.
- A learner needs at least 9/10 and every essential item correct.
- The next lesson unlocks only after the previous lesson is mastered.
- Progress stays in the learner's browser through local storage. The site does not collect answers.

## Build locally

```sh
npm run build
python3 -m http.server 8000 --directory site
```

## Publishing

Pushes to `main` trigger `.github/workflows/pages.yml`, which builds the static course and deploys it to GitHub Pages.
