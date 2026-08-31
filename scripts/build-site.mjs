import { cp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const outputsDir = path.join(root, "outputs");
const siteDir = path.join(root, "site");
const lessonsDir = path.join(siteDir, "lessons");
const assetsDir = path.join(siteDir, "assets");

const stripTags = (value) =>
  value
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/\s+/g, " ")
    .trim();

const lessonFiles = (await readdir(outputsDir))
  .filter((name) => /^italian-lesson-\d{4}-\d{2}-\d{2}\.html$/.test(name))
  .sort();

if (lessonFiles.length === 0) {
  throw new Error("No lesson HTML files found in outputs/.");
}

await rm(siteDir, { recursive: true, force: true });
await mkdir(lessonsDir, { recursive: true });
await mkdir(assetsDir, { recursive: true });

const lessons = [];

for (let index = 0; index < lessonFiles.length; index += 1) {
  const filename = lessonFiles[index];
  const source = await readFile(path.join(outputsDir, filename), "utf8");
  const date = filename.match(/(\d{4}-\d{2}-\d{2})/)[1];
  const title = stripTags(source.match(/<h1[^>]*>(.*?)<\/h1>/s)?.[1] ?? filename);
  const number = Number(source.match(/Lezione\s+(\d+)/)?.[1] ?? index + 1);
  const concept = stripTags(
    source.match(/<dt>Concetto attivo<\/dt><dd>(.*?)<\/dd>/s)?.[1] ?? "Italiano A2"
  );
  const previousDate = index > 0 ? lessons[index - 1].date : null;

  const courseConfig = JSON.stringify({ date, previousDate, number, title });
  const publicHtml = source
    .replace(
      '<a class="brand" href="#top" aria-label="Italiano quotidiano, torna all\'inizio">',
      '<a class="brand" href="../" aria-label="Italiano quotidiano, torna all\'indice">'
    )
    .replace(
      "</body>",
      `<script>window.ITALIANO_COURSE=${courseConfig};</script>\n<script src="../assets/grader.js"></script>\n</body>`
    );

  await writeFile(path.join(lessonsDir, filename), publicHtml);
  lessons.push({ filename, date, title, number, concept, previousDate });
}

await cp(path.join(root, "site-assets", "grader.js"), path.join(assetsDir, "grader.js"));
await writeFile(path.join(siteDir, ".nojekyll"), "");
await writeFile(path.join(siteDir, "index.html"), renderIndex(lessons));

console.log(`Built ${lessons.length} lessons in site/.`);

function renderIndex(items) {
  const rows = items
    .map(
      (lesson) => `
        <li class="lesson" data-date="${lesson.date}" data-previous="${lesson.previousDate ?? ""}">
          <a href="lessons/${lesson.filename}">
            <span class="lesson-number">Lezione ${lesson.number}</span>
            <strong>${escapeHtml(lesson.title)}</strong>
            <span class="lesson-concept">${escapeHtml(lesson.concept)}</span>
            <span class="lesson-state">Da fare</span>
          </a>
        </li>`
    )
    .join("");

  return `<!doctype html>
<html lang="it">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="Lezioni quotidiane di italiano A2 con ripasso dilazionato ed esami di padronanza.">
  <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='14' fill='%23b83a28'/%3E%3Cpath d='M20 15h24v7h-8v28h-8V22h-8z' fill='%23fffaf0'/%3E%3C/svg%3E">
  <title>Italiano quotidiano</title>
  <style>
    :root { color-scheme: light; --paper:#f2ebdd; --cream:#fffaf0; --ink:#20231e; --muted:#68675f; --red:#b83a28; --olive:#58684d; --line:#c7bba7; --serif:Iowan Old Style,Baskerville,Georgia,serif; --sans:Inter,ui-sans-serif,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif; }
    * { box-sizing:border-box; }
    body { margin:0; background:radial-gradient(circle at 15% 5%,#fffaf0 0,transparent 28rem),var(--paper); color:var(--ink); font:1rem/1.6 var(--sans); }
    a:focus-visible, button:focus-visible { outline:3px solid var(--red); outline-offset:3px; }
    header { min-height:70svh; display:grid; align-content:end; border-block-end:1px solid var(--line); padding:clamp(1.25rem,6vw,5rem); }
    .eyebrow { color:var(--red); font-size:.74rem; font-weight:850; letter-spacing:.15em; text-transform:uppercase; }
    h1 { max-width:9ch; margin:.4rem 0 1.2rem; font:500 clamp(4.5rem,13vw,11rem)/.88 var(--serif); letter-spacing:-.07em; }
    header p { max-width:42rem; margin:0; color:var(--muted); font:clamp(1.15rem,2vw,1.45rem)/1.55 var(--serif); }
    main { max-width:76rem; margin:auto; padding:clamp(3rem,8vw,7rem) clamp(1rem,4vw,3rem); }
    h2 { margin:0 0 2rem; font:500 clamp(2.4rem,5vw,4.5rem)/1 var(--serif); letter-spacing:-.04em; }
    ol { margin:0; padding:0; list-style:none; }
    .lesson { border-block-start:1px solid var(--line); }
    .lesson:last-child { border-block-end:1px solid var(--line); }
    .lesson a { display:grid; grid-template-columns:8rem minmax(12rem,1fr) minmax(12rem,1fr) auto; gap:1rem; align-items:center; min-height:7.5rem; color:inherit; text-decoration:none; transition:padding 160ms ease,background 160ms ease; }
    .lesson a:hover { background:rgba(255,255,255,.32); padding-inline:.8rem; }
    .lesson-number { color:var(--red); font-size:.72rem; font-weight:850; letter-spacing:.1em; text-transform:uppercase; }
    .lesson strong { font:500 clamp(1.3rem,3vw,2rem)/1.1 var(--serif); }
    .lesson-concept { color:var(--muted); font-size:.9rem; }
    .lesson-state { border:1px solid var(--line); border-radius:999px; min-width:6rem; padding:.35rem .7rem; text-align:center; font-size:.74rem; font-weight:800; }
    .lesson.mastered .lesson-state { border-color:var(--olive); color:var(--olive); }
    .lesson.locked { opacity:.48; }
    .lesson.locked a { cursor:not-allowed; }
    .notice { margin-block-end:2.5rem; border-inline-start:.25rem solid var(--red); padding-inline-start:1rem; color:var(--muted); }
    footer { border-block-start:1px solid var(--line); padding:2rem clamp(1rem,4vw,3rem); color:var(--muted); font-family:var(--serif); }
    @media (max-width:760px) { header { min-height:60svh; } .lesson a { grid-template-columns:1fr auto; padding-block:1.2rem; } .lesson-concept { grid-column:1/-1; } .lesson-number { grid-column:1; } .lesson strong { grid-column:1; } .lesson-state { grid-column:2; grid-row:1/3; } }
    @media (prefers-reduced-motion:reduce) { * { scroll-behavior:auto!important; transition:none!important; } }
  </style>
</head>
<body>
  <header>
    <span class="eyebrow">A2 → B1 · ogni giorno</span>
    <h1>Italiano quotidiano</h1>
    <p>Storie brevi, recupero dilazionato ed esami che richiedono vera padronanza prima di sbloccare la lezione successiva.</p>
  </header>
  <main>
    <h2>Le lezioni</h2>
    <p class="notice">I risultati restano su questo dispositivo. Supera ogni esame con almeno il 90% e tutte le domande essenziali corrette.</p>
    <ol>${rows}
    </ol>
  </main>
  <footer>Italiano quotidiano. Il tuo progresso resta privato nel browser.</footer>
  <script>
    document.querySelectorAll('.lesson').forEach((item) => {
      const date = item.dataset.date;
      const previous = item.dataset.previous;
      const state = JSON.parse(localStorage.getItem('italiano-mastery-' + date) || 'null');
      const previousState = previous ? JSON.parse(localStorage.getItem('italiano-mastery-' + previous) || 'null') : { mastered: true };
      const link = item.querySelector('a');
      const label = item.querySelector('.lesson-state');
      if (state?.mastered) {
        item.classList.add('mastered');
        label.textContent = 'Padroneggiata';
      } else if (!previousState?.mastered) {
        item.classList.add('locked');
        label.textContent = 'Bloccata';
        link.dataset.href = link.href;
        link.removeAttribute('href');
        link.setAttribute('aria-disabled', 'true');
        link.addEventListener('click', (event) => event.preventDefault());
      }
    });
  </script>
</body>
</html>`;
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
}
