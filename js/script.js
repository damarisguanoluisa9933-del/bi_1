const questions = [
  {
    question: '¿Cuál es el objetivo principal de BI?',
    answers: ['Acumular la mayor cantidad posible de datos', 'Convertir datos en información útil para decidir', 'Automatizar todas las tareas de una empresa', 'Crear gráficos aunque no respondan una pregunta'],
    correct: 1,
    explanation: '¡Exacto! BI conecta datos con decisiones informadas.'
  },
  {
    question: 'En ETL, ¿qué sucede durante la etapa de Transformar?',
    answers: ['Se recopilan datos desde sus fuentes', 'Se publican los resultados en un informe', 'Se limpian, combinan y estandarizan los datos', 'Se eliminan todas las fuentes originales'],
    correct: 2,
    explanation: 'Así es: transformar deja los datos coherentes y listos para analizar.'
  },
  {
    question: 'Un club unifica nombres de equipos y corrige resultados antes de analizar. ¿Qué hace?',
    answers: ['Extraer', 'Transformar', 'Cargar', 'Visualizar'],
    correct: 1,
    explanation: 'Correcto: estandarizar y corregir son tareas de transformación.'
  },
  {
    question: '¿Qué decisión podría apoyar un dashboard de ventas por producto?',
    answers: ['Qué productos conviene reponer primero', 'Qué color debería tener el logotipo', 'Cuándo se inventó la tienda', 'Qué datos conviene ignorar'],
    correct: 0,
    explanation: '¡Sí! Los datos de ventas ayudan a priorizar inventario y reposición.'
  }
];

const teams = [
  { name: 'Barcelona SC', played: 12, wins: 7, draws: 4, losses: 1, goalsFor: 20, goalsAgainst: 8, points: 25 },
  { name: 'Independiente del Valle', played: 12, wins: 7, draws: 3, losses: 2, goalsFor: 19, goalsAgainst: 11, points: 24 },
  { name: 'LDU Quito', played: 12, wins: 6, draws: 3, losses: 3, goalsFor: 18, goalsAgainst: 10, points: 21 },
  { name: 'Universidad Católica', played: 12, wins: 5, draws: 4, losses: 3, goalsFor: 16, goalsAgainst: 13, points: 19 },
  { name: 'Aucas', played: 12, wins: 4, draws: 4, losses: 4, goalsFor: 15, goalsAgainst: 14, points: 16 },
  { name: 'Emelec', played: 12, wins: 4, draws: 3, losses: 5, goalsFor: 14, goalsAgainst: 14, points: 15 },
  { name: 'Deportivo Cuenca', played: 12, wins: 4, draws: 2, losses: 6, goalsFor: 13, goalsAgainst: 16, points: 14 },
  { name: 'Orense SC', played: 12, wins: 3, draws: 3, losses: 6, goalsFor: 12, goalsAgainst: 17, points: 12 },
  { name: 'Macará', played: 12, wins: 2, draws: 3, losses: 7, goalsFor: 9, goalsAgainst: 18, points: 9 },
  { name: 'Mushuc Runa', played: 12, wins: 2, draws: 3, losses: 7, goalsFor: 7, goalsAgainst: 22, points: 9 }
];

const recentPoints = [
  { name: 'Barcelona SC', points: 13, wins: 4, draws: 1, losses: 0 },
  { name: 'Independiente del Valle', points: 10, wins: 3, draws: 1, losses: 1 },
  { name: 'LDU Quito', points: 9, wins: 3, draws: 0, losses: 2 },
  { name: 'Universidad Católica', points: 8, wins: 2, draws: 2, losses: 1 },
  { name: 'Aucas', points: 7, wins: 2, draws: 1, losses: 2 },
  { name: 'Emelec', points: 9, wins: 3, draws: 0, losses: 2 },
  { name: 'Deportivo Cuenca', points: 4, wins: 1, draws: 1, losses: 3 },
  { name: 'Orense SC', points: 5, wins: 1, draws: 2, losses: 2 },
  { name: 'Macará', points: 3, wins: 1, draws: 0, losses: 4 },
  { name: 'Mushuc Runa', points: 2, wins: 0, draws: 2, losses: 3 }
];

const resultsBySeason = [44, 32, 44];
const resultsByRecent = [20, 10, 20];
const chartColors = ['#6c954f', '#ed7955', '#79a8c0'];
const chartInstances = {};
let currentQuestion = 0;
let score = 0;
let answered = false;
let currentView = 'season';

const questionText = document.querySelector('#question-text');
const answerList = document.querySelector('#answer-list');
const feedback = document.querySelector('#quiz-feedback');
const nextButton = document.querySelector('#quiz-next');

function renderQuestion() {
  const item = questions[currentQuestion];
  answered = false;
  document.querySelector('#question-number').textContent = `PREGUNTA ${String(currentQuestion + 1).padStart(2, '0')} / 04`;
  questionText.textContent = item.question;
  feedback.textContent = '';
  feedback.classList.remove('is-wrong');
  nextButton.disabled = true;
  nextButton.innerHTML = currentQuestion === questions.length - 1 ? 'Ver resultado <span aria-hidden="true">→</span>' : 'Siguiente pregunta <span aria-hidden="true">→</span>';
  answerList.replaceChildren(...item.answers.map((answer, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'answer-option';
    button.textContent = `${String.fromCharCode(65 + index)}. ${answer}`;
    button.addEventListener('click', () => chooseAnswer(index));
    return button;
  }));
}

function chooseAnswer(selectedIndex) {
  if (answered) return;
  answered = true;
  const item = questions[currentQuestion];
  const options = [...answerList.querySelectorAll('.answer-option')];
  const isCorrect = selectedIndex === item.correct;
  if (isCorrect) score += 1;
  options.forEach((option, index) => {
    option.disabled = true;
    if (index === item.correct) option.classList.add('is-correct');
    else if (index === selectedIndex) option.classList.add('is-wrong');
  });
  feedback.textContent = isCorrect ? item.explanation : `No pasa nada. ${item.explanation}`;
  feedback.classList.toggle('is-wrong', !isCorrect);
  document.querySelector('#score-count').textContent = String(score).padStart(2, '0');
  const progress = ((currentQuestion + 1) / questions.length) * 100;
  document.querySelector('#progress-fill').style.width = `${progress}%`;
  document.querySelector('.quiz-progress').setAttribute('aria-valuenow', String(currentQuestion + 1));
  nextButton.disabled = false;
}

function showResult() {
  document.querySelector('#quiz-content').hidden = true;
  document.querySelector('#quiz-result').hidden = false;
  document.querySelector('#final-score').textContent = String(score);
  const message = document.querySelector('#result-message');
  const detail = document.querySelector('#result-detail');
  if (score === 4) {
    message.textContent = '¡Partido perfecto!';
    detail.textContent = 'Tienes claros los fundamentos de BI. Ahora mira los datos en acción.';
  } else if (score >= 2) {
    message.textContent = '¡Buen juego!';
    detail.textContent = 'Ya tienes una buena base. Explora el tablero y sigue conectando ideas.';
  } else {
    message.textContent = 'Cada fecha se aprende.';
    detail.textContent = 'Repasa los ejemplos y vuelve a intentarlo. La práctica también cuenta.';
  }
}

nextButton.addEventListener('click', () => {
  if (!answered) return;
  if (currentQuestion === questions.length - 1) showResult();
  else {
    currentQuestion += 1;
    renderQuestion();
  }
});

document.querySelector('#quiz-restart').addEventListener('click', () => {
  currentQuestion = 0;
  score = 0;
  document.querySelector('#score-count').textContent = '00';
  document.querySelector('#progress-fill').style.width = '0%';
  document.querySelector('.quiz-progress').setAttribute('aria-valuenow', '0');
  document.querySelector('#quiz-result').hidden = true;
  document.querySelector('#quiz-content').hidden = false;
  renderQuestion();
});

function renderStandings(view) {
  const body = document.querySelector('#standings-body');
  const standings = teams.map((team, index) => {
    const recent = recentPoints[index];
    const displayedPoints = view === 'recent' ? recent.points : team.points;
    const displayedWins = view === 'recent' ? recent.wins : team.wins;
    const displayedDraws = view === 'recent' ? recent.draws : team.draws;
    const displayedLosses = view === 'recent' ? recent.losses : team.losses;
    return { ...team, points: displayedPoints, wins: displayedWins, draws: displayedDraws, losses: displayedLosses };
  }).sort((a, b) => b.points - a.points || b.wins - a.wins);

  body.replaceChildren(...standings.map((team, index) => {
    const row = document.createElement('tr');
    const values = [String(index + 1).padStart(2, '0'), team.name, view === 'recent' ? '5' : team.played, team.wins, team.draws, team.losses, view === 'recent' ? '—' : `${team.goalsFor - team.goalsAgainst > 0 ? '+' : ''}${team.goalsFor - team.goalsAgainst}`, team.points];
    values.forEach((value) => {
      const cell = document.createElement('td');
      cell.textContent = String(value);
      row.append(cell);
    });
    return row;
  }));
}

function getChartDefaults() {
  return {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 450 },
    plugins: {
      legend: { display: false },
      tooltip: { backgroundColor: '#20261f', padding: 10, titleFont: { family: 'DM Sans' }, bodyFont: { family: 'DM Sans' }, displayColors: false }
    }
  };
}

function createPointsChart() {
  const context = document.querySelector('#points-chart').getContext('2d');
  chartInstances.points = new Chart(context, {
    type: 'bar',
    data: { labels: teams.slice(0, 5).map((team) => team.name), datasets: [{ data: teams.slice(0, 5).map((team) => team.points), backgroundColor: ['#6c954f', '#8da875', '#a9bd91', '#c5d3b4', '#dbe2d2'], borderRadius: 2, maxBarThickness: 36 }] },
    options: {
      ...getChartDefaults(),
      indexAxis: 'y',
      scales: {
        x: { beginAtZero: true, max: 30, grid: { color: '#eceee7' }, border: { display: false }, ticks: { color: '#7b8076', font: { family: 'DM Mono', size: 9 }, stepSize: 5 } },
        y: { grid: { display: false }, border: { display: false }, ticks: { color: '#4c5249', font: { family: 'DM Sans', size: 9 } } }
      }
    }
  });
}

function createResultsChart() {
  const context = document.querySelector('#results-chart').getContext('2d');
  chartInstances.results = new Chart(context, {
    type: 'doughnut',
    data: { labels: ['Victorias', 'Empates', 'Derrotas'], datasets: [{ data: resultsBySeason, backgroundColor: chartColors, borderWidth: 0, hoverOffset: 5 }] },
    options: { ...getChartDefaults(), cutout: '76%', plugins: { ...getChartDefaults().plugins, tooltip: { ...getChartDefaults().plugins.tooltip, callbacks: { label: (context) => ` ${context.label}: ${context.raw} partidos` } } } }
  });
  renderResultsLegend(resultsBySeason);
}

function renderResultsLegend(values) {
  const legend = document.querySelector('#results-legend');
  const labels = ['Victorias', 'Empates', 'Derrotas'];
  legend.replaceChildren(...labels.map((label, index) => {
    const item = document.createElement('div');
    item.className = 'chart-legend-item';
    const swatch = document.createElement('i');
    swatch.style.backgroundColor = chartColors[index];
    const name = document.createElement('span');
    name.textContent = label;
    const value = document.createElement('strong');
    value.textContent = `${values[index]} · ${Math.round((values[index] / values.reduce((sum, count) => sum + count, 0)) * 100)}%`;
    item.append(swatch, name, value);
    return item;
  }));
}

function cumulative(values) {
  return values.reduce((totals, value, index) => {
    totals.push(value + (totals[index - 1] || 0));
    return totals;
  }, []);
}

function createEvolutionChart() {
  const context = document.querySelector('#evolution-chart').getContext('2d');
  const dates = ['F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12'];
  chartInstances.evolution = new Chart(context, {
    type: 'line',
    data: {
      labels: dates,
      datasets: [
        { label: 'Barcelona SC', data: cumulative([3, 1, 3, 3, 1, 3, 3, 0, 1, 3, 1, 3]), borderColor: chartColors[0], backgroundColor: chartColors[0], pointRadius: 2, pointHoverRadius: 4, borderWidth: 2, tension: .3 },
        { label: 'Independiente del Valle', data: cumulative([3, 3, 0, 3, 3, 1, 3, 0, 3, 1, 1, 3]), borderColor: chartColors[1], backgroundColor: chartColors[1], pointRadius: 2, pointHoverRadius: 4, borderWidth: 2, tension: .3 },
        { label: 'LDU Quito', data: cumulative([1, 3, 3, 0, 3, 3, 1, 3, 3, 0, 1, 0]), borderColor: chartColors[2], backgroundColor: chartColors[2], pointRadius: 2, pointHoverRadius: 4, borderWidth: 2, tension: .3 }
      ]
    },
    options: {
      ...getChartDefaults(),
      interaction: { intersect: false, mode: 'index' },
      scales: {
        x: { grid: { display: false }, border: { display: false }, ticks: { color: '#85897f', font: { family: 'DM Mono', size: 9 } } },
        y: { beginAtZero: true, max: 30, grid: { color: '#eceee7' }, border: { display: false }, ticks: { color: '#85897f', font: { family: 'DM Mono', size: 9 }, stepSize: 5 } }
      }
    }
  });
}

function updateDashboard(view) {
  currentView = view;
  const recent = view === 'recent';
  document.querySelector('.league-topline').lastElementChild.textContent = recent ? 'DATOS SIMULADOS · ÚLTIMAS 5 FECHAS' : 'DATOS SIMULADOS · FECHA 12';
  document.querySelector('.leader-name').textContent = recent ? recentPoints[0].name : teams[0].name;
  document.querySelector('.leader-points').textContent = recent ? `${recentPoints[0].points} PTS` : `${teams[0].points} PTS`;
  document.querySelector('.goals-value').textContent = recent ? '60' : '143';
  document.querySelector('.average-value').textContent = recent ? '2.40' : '2.38';
  document.querySelector('.matches-value').textContent = recent ? '25' : '60';
  document.querySelector('.donut-center strong').textContent = recent ? '50' : '120';

  const chartTeams = [...teams].map((team, index) => ({ ...team, points: recentPoints[index].points })).sort((a, b) => b.points - a.points);
  const topFive = recent ? chartTeams.slice(0, 5) : teams.slice(0, 5);
  chartInstances.points.data.labels = topFive.map((team) => team.name);
  chartInstances.points.data.datasets[0].data = topFive.map((team) => team.points);
  chartInstances.points.options.scales.x.max = recent ? 15 : 30;
  chartInstances.points.update();

  const resultValues = recent ? resultsByRecent : resultsBySeason;
  chartInstances.results.data.datasets[0].data = resultValues;
  chartInstances.results.update();
  renderResultsLegend(resultValues);

  const lineValues = recent ? [
    [3, 1, 3, 3, 3], [3, 3, 0, 1, 3], [1, 3, 3, 0, 2]
  ] : [
    [3, 1, 3, 3, 1, 3, 3, 0, 3, 3, 2, 3],
    [3, 3, 0, 3, 3, 1, 3, 0, 3, 3, 1, 3],
    [1, 3, 3, 0, 3, 3, 1, 3, 3, 0, 1, 3]
  ];
  chartInstances.evolution.data.labels = recent ? ['F8', 'F9', 'F10', 'F11', 'F12'] : ['F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12'];
  chartInstances.evolution.data.datasets.forEach((dataset, index) => { dataset.data = cumulative(lineValues[index]); });
  chartInstances.evolution.options.scales.y.max = recent ? 15 : 30;
  chartInstances.evolution.update();
  document.querySelector('.evolution-panel .panel-unit').textContent = recent ? 'PUNTOS · ÚLTIMAS 5 FECHAS' : 'PUNTOS ACUMULADOS';
  document.querySelector('.wins-panel .chart-foot span:last-child').textContent = recent ? 'ÚLTIMAS 5 FECHAS' : 'TEMPORADA';
  document.querySelector('.standings-table th:nth-child(3)').textContent = recent ? 'PJ' : 'PJ';
  renderStandings(view);
}

document.querySelector('#season-view').addEventListener('change', (event) => updateDashboard(event.target.value));

const themeToggle = document.querySelector('#theme-toggle');
const rootElement = document.documentElement;

function applyTheme(theme) {
  const isDark = theme === 'dark';
  rootElement.dataset.theme = isDark ? 'dark' : 'light';
  themeToggle.setAttribute('aria-checked', String(isDark));
  themeToggle.setAttribute('aria-label', isDark ? 'Activar tema claro' : 'Activar tema oscuro');
  themeToggle.querySelector('.theme-icon').textContent = isDark ? '☼' : '☾';
  themeToggle.querySelector('.theme-label').textContent = isDark ? 'Claro' : 'Oscuro';
  document.querySelector('meta[name="theme-color"]').content = isDark ? '#171c17' : '#f4f4ed';
  try {
    localStorage.setItem('datos-en-juego-theme', isDark ? 'dark' : 'light');
  } catch {}
  updateChartTheme();
}

function updateChartTheme() {
  const isDark = rootElement.dataset.theme === 'dark';
  const labelColor = isDark ? '#b4bcb0' : '#7b8076';
  const gridColor = isDark ? '#384038' : '#eceee7';
  Object.values(chartInstances).forEach((chart) => {
    for (const axis of Object.values(chart.options.scales || {})) {
      if (axis.ticks) axis.ticks.color = labelColor;
      if (axis.grid && axis.grid.display !== false) axis.grid.color = gridColor;
    }
    chart.update('none');
  });
}

let savedTheme = 'light';
try {
  savedTheme = localStorage.getItem('datos-en-juego-theme') || 'light';
} catch {}
rootElement.dataset.theme = savedTheme === 'dark' ? 'dark' : 'light';
themeToggle.addEventListener('click', () => applyTheme(rootElement.dataset.theme === 'dark' ? 'light' : 'dark'));

const tourSteps = [
  { selector: '#fundamentos .section-heading', title: 'BI: decidir con contexto', description: 'La inteligencia de negocios conecta datos confiables con preguntas que ayudan a tomar mejores decisiones.' },
  { selector: '.etl-flow', title: 'El recorrido ETL', description: 'Extrae datos desde sus fuentes, transfórmalos para corregirlos y unificarlos, y cárgalos listos para analizar.' },
  { selector: '#quiz-title', title: 'Pon a prueba lo aprendido', description: 'Responde el cuestionario, recibe retroalimentación inmediata y consulta tu marcador al terminar.' },
  { selector: '.metric-grid', title: 'Una lectura rápida de la liga', description: 'Las métricas resumen goles, promedio, partidos y al equipo que lidera la tabla.' },
  { selector: '.standings-panel', title: 'Puntos por equipo', description: 'Compara los puntos de los cinco clubes mejor ubicados en el gráfico de barras.' },
  { selector: '#season-view', title: 'Cambia el periodo y exporta', description: 'Alterna entre la temporada completa y las últimas cinco fechas. Exporta o imprime el tablero de la vista elegida.' },
  { selector: '.standings-table-wrap', title: 'La clasificación completa', description: 'Consulta partidos, victorias, empates, derrotas, diferencia de goles y puntos de los diez equipos.' }
];

const tourDialog = document.querySelector('#tour-dialog');
const tourBackdrop = document.querySelector('#tour-backdrop');
let tourStepIndex = 0;
let tourTarget = null;

function closeTour() {
  if (tourTarget) tourTarget.classList.remove('tour-target');
  tourTarget = null;
  tourDialog.hidden = true;
  tourBackdrop.hidden = true;
  document.querySelector('#tour-launch').focus();
}

function renderTourStep(index) {
  if (tourTarget) tourTarget.classList.remove('tour-target');
  tourStepIndex = index;
  const step = tourSteps[tourStepIndex];
  tourTarget = document.querySelector(step.selector);
  if (tourTarget) {
    tourTarget.classList.add('tour-target');
    tourTarget.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
  document.querySelector('#tour-step-count').textContent = `PASO ${tourStepIndex + 1} DE ${tourSteps.length}`;
  document.querySelector('#tour-title').textContent = step.title;
  document.querySelector('#tour-description').textContent = step.description;
  document.querySelector('#tour-previous').disabled = tourStepIndex === 0;
  document.querySelector('#tour-next').textContent = tourStepIndex === tourSteps.length - 1 ? 'Finalizar ✓' : 'Siguiente →';
}

function openTour() {
  tourBackdrop.hidden = false;
  tourDialog.hidden = false;
  renderTourStep(0);
  document.querySelector('#tour-next').focus();
}

document.querySelector('#tour-launch').addEventListener('click', openTour);
document.querySelector('#tour-close').addEventListener('click', closeTour);
tourBackdrop.addEventListener('click', closeTour);
document.querySelector('#tour-previous').addEventListener('click', () => {
  if (tourStepIndex > 0) renderTourStep(tourStepIndex - 1);
});
document.querySelector('#tour-next').addEventListener('click', () => {
  if (tourStepIndex === tourSteps.length - 1) closeTour();
  else renderTourStep(tourStepIndex + 1);
});
tourDialog.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closeTour();
    return;
  }
  if (event.key !== 'Tab') return;
  const focusable = [...tourDialog.querySelectorAll('button:not(:disabled)')];
  if (event.shiftKey && document.activeElement === focusable[0]) {
    event.preventDefault();
    focusable.at(-1).focus();
  } else if (!event.shiftKey && document.activeElement === focusable.at(-1)) {
    event.preventDefault();
    focusable[0].focus();
  }
});

function getVisibleTable() {
  const headers = [...document.querySelectorAll('.standings-table thead th')].map((cell) => cell.textContent.trim());
  const rows = [...document.querySelectorAll('#standings-body tr')].map((row) => [...row.cells].map((cell) => cell.textContent.trim()));
  return [headers, ...rows];
}

function getReportData() {
  const viewName = currentView === 'recent' ? 'Últimas 5 fechas' : 'Temporada completa';
  const date = new Date().toISOString().slice(0, 10);
  const summary = [
    ['Liga Pro 2026 · Reporte'],
    ['Vista', viewName],
    ['Fecha de exportación', new Date().toLocaleDateString('es-EC')],
    ['Goles anotados', document.querySelector('.goals-value').textContent.trim()],
    ['Equipo líder', document.querySelector('.leader-name').textContent.trim()],
    ['Puntos del líder', document.querySelector('.leader-points').textContent.trim()],
    ['Promedio de goles', document.querySelector('.average-value').textContent.trim()],
    ['Partidos', document.querySelector('.matches-value').textContent.trim()]
  ];
  const outcomeCounts = currentView === 'recent' ? resultsByRecent : resultsBySeason;
  const outcomes = [
    ['Resultado', 'Partidos', 'Porcentaje'],
    ...['Victorias', 'Empates', 'Derrotas'].map((label, index) => [label, outcomeCounts[index], `${Math.round((outcomeCounts[index] / outcomeCounts.reduce((sum, count) => sum + count, 0)) * 100)}%`])
  ];
  return { date, viewName, summary, outcomes, standings: getVisibleTable() };
}

function downloadCsvFallback(report) {
  const rows = [
    ...report.summary,
    [],
    ['Resultados'],
    ...report.outcomes,
    [],
    ['Clasificación'],
    ...report.standings
  ];
  const csv = rows.map((row) => row.map((value) => `"${String(value ?? '').replaceAll('"', '""')}"`).join(';')).join('\r\n');
  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `liga-pro-2026-${currentView}-${report.date}.csv`;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  document.querySelector('#export-status').textContent = 'Se descargó el informe completo como CSV compatible con Excel.';
}

function exportReport() {
  const report = getReportData();
  try {
    if (typeof XLSX === 'undefined') throw new Error('La biblioteca de Excel no está disponible.');
    const workbook = XLSX.utils.book_new();
    const summarySheet = XLSX.utils.aoa_to_sheet(report.summary);
    summarySheet['!cols'] = [{ wch: 25 }, { wch: 30 }];
    const standingsSheet = XLSX.utils.aoa_to_sheet(report.standings);
    standingsSheet['!cols'] = [{ wch: 8 }, { wch: 30 }, ...Array(6).fill({ wch: 10 })];
    const outcomesSheet = XLSX.utils.aoa_to_sheet(report.outcomes);
    outcomesSheet['!cols'] = [{ wch: 18 }, { wch: 14 }, { wch: 14 }];
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Resumen');
    XLSX.utils.book_append_sheet(workbook, standingsSheet, 'Clasificación');
    XLSX.utils.book_append_sheet(workbook, outcomesSheet, 'Resultados');
    XLSX.writeFile(workbook, `liga-pro-2026-${currentView}-${report.date}.xlsx`);
    document.querySelector('#export-status').textContent = `Reporte Excel exportado: ${report.viewName.toLowerCase()}, clasificación y resultados.`;
  } catch (error) {
    console.error('No se pudo exportar el reporte como Excel; se intentará descargar como CSV.', error);
    downloadCsvFallback(report);
  }
}

document.querySelector('#export-report').addEventListener('click', exportReport);
document.querySelector('#print-dashboard').addEventListener('click', () => window.print());

const navLinks = [...document.querySelectorAll('.nav-link')];
const sections = [...document.querySelectorAll('#fundamentos, #liga')];
const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    navLinks.forEach((link) => link.classList.toggle('is-active', link.dataset.nav === entry.target.id));
  });
}, { rootMargin: '-25% 0px -60% 0px' });
sections.forEach((section) => sectionObserver.observe(section));

renderQuestion();
renderStandings(currentView);
if (typeof Chart !== 'undefined') {
  createPointsChart();
  createResultsChart();
  createEvolutionChart();
  updateChartTheme();
}