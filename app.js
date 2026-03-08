
const APP_KEY = "tai_app_gen_v1";
let bank = null;
let quiz = null;
let currentIndex = 0;
let timerHandle = null;
let timeLeft = 0;
let deferredPrompt = null;

const generationTemplates = {
  "Constitución": {
    block: "I",
    items: [
      {
        stem: "La soberanía nacional reside en:",
        options: ["El Rey","Las Cortes Generales","El pueblo español","El Gobierno"],
        answer: "C",
        explanation: "El artículo 1.2 CE establece que la soberanía nacional reside en el pueblo español."
      },
      {
        stem: "La forma política del Estado español es:",
        options: ["República parlamentaria","Monarquía parlamentaria","Monarquía absoluta","Estado federal"],
        answer: "B",
        explanation: "El artículo 1.3 CE establece que la forma política es la monarquía parlamentaria."
      },
      {
        stem: "El artículo que recoge la igualdad ante la ley es el:",
        options: ["Artículo 9","Artículo 14","Artículo 16","Artículo 27"],
        answer: "B",
        explanation: "La igualdad ante la ley se reconoce en el artículo 14 CE."
      },
      {
        stem: "El Tribunal Constitucional se compone de:",
        options: ["8 miembros","10 miembros","12 miembros","15 miembros"],
        answer: "C",
        explanation: "El artículo 159 CE fija en 12 el número de miembros del Tribunal Constitucional."
      },
      {
        stem: "La organización territorial del Estado se regula en el Título:",
        options: ["IV","VI","VIII","X"],
        answer: "C",
        explanation: "El Título VIII CE regula la organización territorial del Estado."
      }
    ]
  },
  "Bases de datos": {
    block: "III",
    items: [
      {
        stem: "¿Qué significa ACID en bases de datos?",
        options: ["Atomicidad, Consistencia, Aislamiento y Durabilidad","Acceso, Control, Integridad y Distribución","Atomicidad, Coherencia, Integridad y Durabilidad","Aislamiento, Consistencia, Integridad y Duración"],
        answer: "A",
        explanation: "ACID define las propiedades de una transacción correcta."
      },
      {
        stem: "Una clave foránea es:",
        options: ["Una clave no relacionada","Un atributo que referencia la clave primaria de otra tabla","Una clave primaria duplicada","Un índice obligatorio"],
        answer: "B",
        explanation: "La clave foránea mantiene la integridad referencial entre tablas."
      },
      {
        stem: "CREATE TABLE pertenece a:",
        options: ["DML","DDL","DCL","TCL"],
        answer: "B",
        explanation: "CREATE TABLE define estructura; por tanto es DDL."
      },
      {
        stem: "La 1FN exige principalmente:",
        options: ["Eliminar dependencias transitivas","Eliminar grupos repetitivos y valores no atómicos","Eliminar dependencias parciales","Usar siempre clave compuesta"],
        answer: "B",
        explanation: "La Primera Forma Normal exige atributos atómicos."
      },
      {
        stem: "COMMIT y ROLLBACK pertenecen a:",
        options: ["DDL","DML","DCL","TCL"],
        answer: "D",
        explanation: "TCL es el lenguaje de control de transacciones."
      }
    ]
  },
  "Redes": {
    block: "IV",
    items: [
      {
        stem: "La capa del modelo OSI encargada del direccionamiento lógico es:",
        options: ["Enlace","Red","Transporte","Aplicación"],
        answer: "B",
        explanation: "La capa de red maneja direcciones lógicas y encaminamiento."
      },
      {
        stem: "UDP se caracteriza por ser:",
        options: ["Orientado a conexión","Sin conexión","Con entrega garantizada","Más fiable que TCP"],
        answer: "B",
        explanation: "UDP es no orientado a conexión y no garantiza entrega."
      },
      {
        stem: "El protocolo que traduce nombres a direcciones IP es:",
        options: ["HTTP","DNS","DHCP","FTP"],
        answer: "B",
        explanation: "DNS resuelve nombres de dominio a direcciones IP."
      },
      {
        stem: "La máscara equivalente a /24 es:",
        options: ["255.255.0.0","255.255.255.0","255.0.0.0","255.255.255.255"],
        answer: "B",
        explanation: "Un prefijo /24 equivale a 255.255.255.0."
      },
      {
        stem: "El dispositivo que trabaja típicamente en capa 3 es:",
        options: ["Hub","Switch","Router","Repetidor"],
        answer: "C",
        explanation: "El router trabaja en capa de red."
      }
    ]
  },
  "Sistemas operativos": {
    block: "II",
    items: [
      {
        stem: "La función principal del kernel es:",
        options: ["Diseñar la interfaz gráfica","Gestionar procesos, memoria y dispositivos","Editar archivos de usuario","Crear bases de datos"],
        answer: "B",
        explanation: "El kernel es el núcleo del sistema operativo."
      },
      {
        stem: "¿Qué estructura sigue FIFO?",
        options: ["Pila","Cola","Árbol","Grafo"],
        answer: "B",
        explanation: "En una cola, el primero en entrar es el primero en salir."
      },
      {
        stem: "La ALU forma parte de:",
        options: ["La CPU","La RAM","La GPU","El bus"],
        answer: "A",
        explanation: "La ALU es una unidad interna de la CPU."
      },
      {
        stem: "Un SSD almacena datos usando:",
        options: ["Discos magnéticos","Memoria no volátil","Cinta magnética","Solo RAM"],
        answer: "B",
        explanation: "Los SSD usan memoria flash no volátil."
      },
      {
        stem: "Dijkstra se utiliza para:",
        options: ["Ordenar listas","Calcular caminos mínimos","Comprimir archivos","Cifrar datos"],
        answer: "B",
        explanation: "Dijkstra resuelve caminos mínimos con pesos no negativos."
      }
    ]
  }
};

async function loadBank() {
  const r = await fetch("questions.json");
  bank = await r.json();
  document.getElementById("bankCount").textContent = bank.questions.length;
  updateTopStats();
}

function loadState() {
  try { return JSON.parse(localStorage.getItem(APP_KEY)) || { history: [], wrongIds: {} }; }
  catch (e) { return { history: [], wrongIds: {} }; }
}
function saveState(s) { localStorage.setItem(APP_KEY, JSON.stringify(s)); }
function resetState() { localStorage.removeItem(APP_KEY); }
function updateTopStats() {
  const s = loadState();
  document.getElementById("topStats").textContent = "Tests: " + s.history.length + " · Falladas: " + Object.keys(s.wrongIds).length;
}
function shuffle(arr) {
  const a = arr.slice();
  for (let i=a.length-1;i>0;i--) {
    const j = Math.floor(Math.random() * (i+1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function getPool(mode, block) {
  let qs = bank.questions.slice();
  if (block !== "ALL") qs = qs.filter(q => q.block === block);
  if (mode === "wrong") {
    const wrongSet = new Set(Object.keys(loadState().wrongIds));
    qs = qs.filter(q => wrongSet.has(q.id));
  }
  return qs;
}
function startQuiz() {
  const mode = document.getElementById("mode").value;
  const block = document.getElementById("block").value;
  const count = parseInt(document.getElementById("count").value, 10);
  const marking = document.getElementById("marking").value;
  let qs = getPool(mode, block);
  if (!qs.length) { alert("No hay preguntas para ese filtro."); return; }
  qs = shuffle(qs).slice(0, Math.min(count, qs.length));
  quiz = { mode, block, marking, questions: qs, answers: [] };
  currentIndex = 0;
  document.getElementById("resultsCard").classList.add("hidden");
  document.getElementById("quizCard").classList.remove("hidden");
  if (timerHandle) { clearInterval(timerHandle); timerHandle = null; }
  if (mode === "exam") {
    timeLeft = 120 * 60;
    timerHandle = setInterval(() => {
      timeLeft--;
      const m = Math.floor(timeLeft/60), s = timeLeft % 60;
      document.getElementById("timer").textContent = "Tiempo: " + m + ":" + String(s).padStart(2,"0");
      if (timeLeft <= 0) { clearInterval(timerHandle); finishQuiz(); }
    }, 1000);
  } else {
    document.getElementById("timer").textContent = "";
  }
  renderQuestion();
}
function renderQuestion() {
  const q = quiz.questions[currentIndex];
  document.getElementById("meta").innerHTML =
    '<span class="pill">Bloque ' + q.block + '</span>' +
    '<span class="pill">' + (q.topic || q.source || "") + '</span>' +
    '<span class="pill">' + (q.exam || q.source || "") + '</span>' +
    '<span class="pill">Pregunta ' + (currentIndex + 1) + '/' + quiz.questions.length + '</span>';
  document.getElementById("qtext").textContent = q.question;
  const options = document.getElementById("options");
  options.innerHTML = "";
  ["A","B","C","D"].forEach(letter => {
    const btn = document.createElement("button");
    btn.className = "option";
    btn.textContent = letter + ") " + q.options[letter];
    btn.onclick = () => selectAnswer(letter);
    options.appendChild(btn);
  });
  const blankBtn = document.createElement("button");
  blankBtn.className = "option";
  blankBtn.textContent = "Dejar en blanco";
  blankBtn.onclick = () => selectAnswer(null);
  options.appendChild(blankBtn);
  document.getElementById("explanation").classList.add("hidden");
  document.getElementById("nextBtn").disabled = true;
}
function selectAnswer(letter) {
  const q = quiz.questions[currentIndex];
  const buttons = Array.from(document.querySelectorAll("#options button"));
  buttons.forEach(b => b.disabled = true);
  const correct = (letter === q.answer);
  buttons.forEach(b => {
    if (q.answer && b.textContent.startsWith(q.answer + ")")) b.classList.add("correct");
    if (letter && b.textContent.startsWith(letter + ")") && !correct) b.classList.add("wrong");
  });
  quiz.answers.push({ id: q.id, chosen: letter, correct, blank: letter === null });
  const st = loadState();
  if (letter !== null && !correct) st.wrongIds[q.id] = true;
  else if (quiz.mode === "wrong" && correct) delete st.wrongIds[q.id];
  saveState(st);
  if (quiz.mode === "study") {
    const ex = document.getElementById("explanation");
    ex.innerHTML = "<strong>" + (letter===null ? "— En blanco" : (correct ? "✔ Correcto" : "✘ Incorrecto")) + "</strong><br>" +
      "Respuesta correcta: <strong>" + (q.answer || "ANULADA") + "</strong><br>" +
      (q.explanation || "");
    ex.classList.remove("hidden");
  }
  document.getElementById("nextBtn").disabled = false;
  updateTopStats();
}
function nextQuestion() {
  if (currentIndex < quiz.questions.length - 1) {
    currentIndex++;
    renderQuestion();
  } else finishQuiz();
}
function finishQuiz() {
  if (timerHandle) { clearInterval(timerHandle); timerHandle = null; }
  const total = quiz.questions.length;
  const hits = quiz.answers.filter(a => a.correct).length;
  const miss = quiz.answers.filter(a => !a.correct && !a.blank).length;
  const blank = quiz.answers.filter(a => a.blank).length;
  const finalScore = quiz.marking === "tai" ? (hits - (miss/3)).toFixed(2) : hits;
  const st = loadState();
  st.history.push({ when:new Date().toISOString(), mode:quiz.mode, block:quiz.block, total,hits,miss,blank,score:finalScore });
  saveState(st);
  document.getElementById("quizCard").classList.add("hidden");
  document.getElementById("resultsCard").classList.remove("hidden");
  document.getElementById("scoreHits").textContent = hits;
  document.getElementById("scoreMiss").textContent = miss;
  document.getElementById("scoreBlank").textContent = blank;
  document.getElementById("scoreFinal").textContent = finalScore;
  document.getElementById("resultsText").innerHTML = "Las preguntas falladas se han guardado para <strong>Repasar falladas</strong>.";
  updateTopStats();
}

function generateQuestions() {
  const topic = document.getElementById("genTopic").value;
  const count = parseInt(document.getElementById("genCount").value, 10);
  const pack = generationTemplates[topic];
  if (!pack) { alert("Tema no disponible."); return; }
  const generated = [];
  for (let i = 0; i < count; i++) {
    const base = pack.items[i % pack.items.length];
    const stamp = Date.now().toString(36) + "_" + i;
    generated.push({
      id: "GEN_" + stamp,
      year: 2026,
      exam: "Generada",
      section: "generada",
      number: null,
      block: pack.block,
      topic: topic,
      source: "Generada",
      question: base.stem,
      options: { A: base.options[0], B: base.options[1], C: base.options[2], D: base.options[3] },
      answer: base.answer,
      explanation: base.explanation
    });
  }
  bank.questions = bank.questions.concat(generated);
  document.getElementById("bankCount").textContent = bank.questions.length;
  document.getElementById("genStatus").textContent = "Añadidas " + generated.length + " preguntas nuevas de " + topic + ".";
}

function downloadBank() {
  const blob = new Blob([JSON.stringify({ version: 1, questions: bank.questions }, null, 2)], {type: "application/json"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "questions_actualizado.json";
  a.click();
  URL.revokeObjectURL(url);
}
function replaceBankFromFile(ev) {
  const file = ev.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const obj = JSON.parse(reader.result);
      if (!obj.questions || !Array.isArray(obj.questions)) throw new Error("Formato inválido");
      bank = obj;
      document.getElementById("bankCount").textContent = bank.questions.length;
      document.getElementById("genStatus").textContent = "Banco cargado desde archivo.";
    } catch (e) {
      alert("No se pudo cargar el archivo JSON.");
    }
  };
  reader.readAsText(file, "utf-8");
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js');
}
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  const hint = document.getElementById('installHint');
  hint.textContent = "La app se puede instalar. En Android/Chrome usa ‘Instalar aplicación’ o ‘Añadir a pantalla de inicio’.";
});

document.getElementById("startBtn").onclick = startQuiz;
document.getElementById("nextBtn").onclick = nextQuestion;
document.getElementById("finishBtn").onclick = finishQuiz;
document.getElementById("againBtn").onclick = () => {
  document.getElementById("resultsCard").classList.add("hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });
};
document.getElementById("resetBtn").onclick = () => {
  if (confirm("¿Borrar estadísticas y falladas guardadas?")) { resetState(); updateTopStats(); }
};
document.getElementById("genBtn").onclick = generateQuestions;
document.getElementById("downloadBtn").onclick = downloadBank;
document.getElementById("loadJson").addEventListener("change", replaceBankFromFile);

loadBank();
