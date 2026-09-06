(() => {
  const course = window.ITALIANO_COURSE;
  if (!course) return;

  const finalQuestions = {
    "2026-08-23": ["Quale frase è corretta?", ["Chiara ha arrivato tardi.", "Chiara è arrivata tardi.", "Chiara è arrivato tardi."], "b"],
    "2026-08-24": ["Quale frase è corretta?", ["Anna e Sofia hanno svegliato presto.", "Anna e Sofia si sono svegliate presto.", "Anna e Sofia si è svegliata presto."], "b"],
    "2026-08-26": ["Quale frase è corretta?", ["Luca e Davide sono rimasti a tavola.", "Luca e Davide hanno rimasto a tavola.", "Luca e Davide sono rimaste a tavola."], "a"],
    "2026-08-27": ["Quale frase è corretta?", ["Giulia ha seduta vicino alla finestra.", "Giulia si è seduta vicino alla finestra.", "Giulia è seduto vicino alla finestra."], "b"],
    "2026-08-28": ["Quale frase è corretta?", ["Francesca è viaggiata tutta la notte.", "Francesca ha viaggiato tutta la notte.", "Francesca ha viaggiata tutta la notte."], "b"],
    "2026-08-29": ["Quale frase è corretta?", ["Le ragazze si sono sedute sul divano.", "Le ragazze hanno sedute sul divano.", "Le ragazze si è seduta sul divano."], "a"],
    "2026-08-30": ["Quale frase è corretta?", ["Emma e Paolo hanno arrivato insieme.", "Emma e Paolo sono arrivate insieme.", "Emma e Paolo sono arrivati insieme."], "c"],
    "2026-08-31": ["Quale frase è corretta?", ["Sara ha uscita dalla biblioteca.", "Sara è uscita dalla biblioteca.", "Sara è uscito dalla biblioteca."], "b"],
    "2026-09-01": ["Quale frase crea correttamente lo sfondo?", ["Ha fatto caldo e i bambini hanno giocato.", "Faceva caldo e i bambini giocavano.", "Faceva caldo e i bambini hanno giocavano."], "b"],
    "2026-09-05": ["Quale frase presenta correttamente un'azione interrotta?", ["Mentre abbiamo cenato, la luce andava via.", "Mentre cenavamo, la luce è andata via.", "Mentre cenavamo, la luce andava via improvvisamente."], "b"],
    "2026-09-06": ["Quale frase descrive due azioni contemporanee?", ["Mentre Anna sceglieva, Enzo preparava il sacchetto.", "Mentre Anna ha scelto, Enzo preparava il sacchetto.", "Mentre Anna sceglieva, Enzo ha preparato il sacchetto."], "a"]
  };

  const fallback = [
    "Quale ausiliare usano i verbi riflessivi nel passato prossimo?",
    ["Avere", "Essere", "Avere o essere senza differenza"],
    "b"
  ];
  const [prompt, choices, correctAnswer] = finalQuestions[course.date] || fallback;
  const item = document.querySelector('[data-exam="10"]');
  const form = document.querySelector("#lesson-form");
  const checkButton = document.querySelector("#check-exam");
  if (!item || !form || !checkButton) return;

  checkButton.textContent = "Correggi l'esame";
  const examHint = document.querySelector("#esame .exam-intro .hint");
  if (examHint) examHint.textContent = "La pagina assegna il voto finale su tutte le 10 domande.";

  const topReply = document.querySelector("#reply-top");
  if (topReply) {
    topReply.textContent = "Indice";
    topReply.addEventListener(
      "click",
      (event) => {
        event.stopImmediatePropagation();
        window.location.href = "../";
      },
      { capture: true }
    );
  }

  const responseSection = document.querySelector("#risposta");
  if (responseSection) {
    const heading = responseSection.querySelector("h2");
    const lede = responseSection.querySelector(".lede");
    const actions = responseSection.querySelector(".action-row");
    if (heading) heading.textContent = "Il voto resta nel browser";
    if (lede) lede.textContent = "Raggiungi almeno 9/10 e correggi tutte le domande essenziali, poi torna all'indice per sbloccare la lezione successiva.";
    if (actions) {
      actions.replaceChildren();
      const indexLink = document.createElement("a");
      indexLink.className = "button primary";
      indexLink.href = "../";
      indexLink.textContent = "Torna all'indice";
      indexLink.style.textDecoration = "none";
      actions.append(indexLink);
    }
  }
  document.querySelector("#reply-exam")?.remove();
  document.querySelector("#reply-dialog")?.remove();

  const originalPrompt = item.querySelector("label")?.textContent?.replace(/^10\.\s*/, "").trim() || "Scrivi due frasi libere.";
  item.replaceChildren();

  const questionLabel = document.createElement("p");
  questionLabel.className = "question-label";
  questionLabel.id = "exam-10-label";
  questionLabel.textContent = `10. ${prompt}`;
  item.append(questionLabel);

  const group = document.createElement("div");
  group.className = "choice-group";
  group.setAttribute("role", "radiogroup");
  group.setAttribute("aria-labelledby", questionLabel.id);
  group.setAttribute("aria-describedby", "result-10");

  choices.forEach((choice, index) => {
    const value = String.fromCharCode(97 + index);
    const label = document.createElement("label");
    label.className = "choice";
    label.htmlFor = `exam-10-${value}`;
    const input = document.createElement("input");
    input.id = label.htmlFor;
    input.name = "exam_10";
    input.type = "radio";
    input.value = value;
    input.required = true;
    label.append(input, ` ${value}. ${choice}`);
    group.append(label);
  });
  item.append(group);

  const result = document.createElement("span");
  result.className = "field-result";
  result.id = "result-10";
  item.append(result);

  const practice = document.createElement("details");
  practice.style.marginBlockStart = "1rem";
  const summary = document.createElement("summary");
  summary.textContent = "Pratica libera facoltativa";
  const practiceLabel = document.createElement("label");
  practiceLabel.htmlFor = "writing-practice";
  practiceLabel.textContent = originalPrompt;
  const practiceArea = document.createElement("textarea");
  practiceArea.id = "writing-practice";
  practiceArea.name = "writing_practice";
  practice.append(summary, practiceLabel, practiceArea);
  item.append(practice);

  const savedAnswer = localStorage.getItem(`italiano-answer-${course.date}-exam10`);
  if (savedAnswer) {
    const savedInput = form.querySelector(`input[name="exam_10"][value="${savedAnswer}"]`);
    if (savedInput) savedInput.checked = true;
  }

  group.addEventListener("input", () => {
    const selected = form.querySelector('input[name="exam_10"]:checked');
    if (selected) localStorage.setItem(`italiano-answer-${course.date}-exam10`, selected.value);
  });

  checkButton.addEventListener("click", () => setTimeout(gradeAll, 0));

  function gradeAll() {
    const selected = form.querySelector('input[name="exam_10"]:checked');
    item.classList.remove("correct", "incorrect");
    const finalCorrect = selected?.value === correctAnswer;
    item.classList.add(finalCorrect ? "correct" : "incorrect");
    result.textContent = selected ? (finalCorrect ? "Corretta." : "Non ancora. Riprova.") : "Rispondi prima di controllare.";

    const firstNine = [...document.querySelectorAll('[data-exam]')].filter((question) => question.dataset.exam !== "10");
    const objectiveCorrect = firstNine.filter((question) => question.classList.contains("correct")).length;
    const essentialPassed = firstNine
      .filter((question) => question.querySelector(".essential"))
      .every((question) => question.classList.contains("correct"));
    const score = objectiveCorrect + (finalCorrect ? 1 : 0);
    const mastered = score >= 9 && essentialPassed && Boolean(selected);

    const scoreOutput = document.querySelector("#score-output");
    const examStatus = document.querySelector("#exam-status");
    const masteryStatus = document.querySelector("#mastery-status");
    if (scoreOutput) scoreOutput.textContent = `${score}/10`;

    if (mastered) {
      examStatus.textContent = `Padronanza raggiunta: ${score}/10 e tutte le domande essenziali corrette.`;
      masteryStatus.textContent = "Padroneggiato";
      localStorage.setItem(
        `italiano-mastery-${course.date}`,
        JSON.stringify({ mastered: true, score, completedAt: new Date().toISOString() })
      );
    } else {
      examStatus.textContent = selected
        ? `${score}/10. Servono almeno 9/10 e tutte le domande essenziali corrette.`
        : "Completa la domanda 10 per ricevere il voto finale.";
      masteryStatus.textContent = "Da riprovare";
      localStorage.removeItem(`italiano-mastery-${course.date}`);
    }
  }

  if (course.previousDate) {
    const previousState = JSON.parse(localStorage.getItem(`italiano-mastery-${course.previousDate}`) || "null");
    if (!previousState?.mastered) lockLesson();
  }

  function lockLesson() {
    form.inert = true;
    const notice = document.createElement("div");
    notice.className = "note";
    notice.style.marginBlock = "0 3rem";
    const text = document.createElement("p");
    text.textContent = "Questa lezione è bloccata. Supera prima l'esame della lezione precedente.";
    const link = document.createElement("a");
    link.href = "../";
    link.textContent = "Torna all'indice";
    notice.append(text, link);
    form.before(notice);
  }
})();
