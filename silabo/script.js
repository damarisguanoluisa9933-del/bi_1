const syllabusSkills = [
  { name: 'Competencia digital', score: 4 },
  { name: 'Creatividad', score: 4 },
  { name: 'Ética (responsabilidad)', score: 5 },
  { name: 'Liderazgo', score: 3 },
  { name: 'Pensamiento crítico', score: 4 },
  { name: 'Resolución de problemas', score: 4 }
];

const defaultSkillScores = syllabusSkills.map((skill) => skill.score);
const chartRegistry = {};
let toastTimeout;

function readPreference(key, fallback) {
  try {
    return localStorage.getItem(key) || fallback;
  } catch {
    return fallback;
  }
}

function savePreference(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    showToast('La preferencia no se pudo guardar en este navegador.');
  }
}

function showToast(message) {
  const toast = document.querySelector('#toast');
  toast.textContent = message;
  toast.classList.add('is-visible');
  window.clearTimeout(toastTimeout);
  toastTimeout = window.setTimeout(() => toast.classList.remove('is-visible'), 3200);
}

function setTheme(theme) {
  const isDark = theme === 'dark';
  document.documentElement.dataset.theme = isDark ? 'dark' : 'light';
  const button = document.querySelector('#theme-toggle');
  button.setAttribute('aria-pressed', String(isDark));
  button.setAttribute('aria-label', isDark ? 'Activar modo claro' : 'Activar modo oscuro');
  button.title = isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro';
  button.innerHTML = `<i class="fa-solid ${isDark ? 'fa-sun' : 'fa-moon'}" aria-hidden="true"></i>`;
  document.querySelector('meta[name="theme-color"]').content = isDark ? '#141721' : '#f3f4f6';
  savePreference('silabo-bi-theme', isDark ? 'dark' : 'light');
  updateChartTheme();
}

function getPaletteColor(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function updateChartTheme() {
  if (!window.Chart) return;
  const ink = getPaletteColor('--body');
  const grid = getPaletteColor('--line');
  Object.values(chartRegistry).forEach((chart) => {
    chart.options.color = ink;
    if (chart.options.plugins?.legend?.labels) chart.options.plugins.legend.labels.color = ink;
    for (const axis of Object.values(chart.options.scales || {})) {
      if (axis.ticks) axis.ticks.color = ink;
      if (axis.grid) axis.grid.color = grid;
      if (axis.pointLabels) axis.pointLabels.color = ink;
    }
    chart.update('none');
  });
}

function initializeTheme() {
  const savedTheme = readPreference('silabo-bi-theme', 'light');
  const button = document.querySelector('#theme-toggle');
  const isDark = savedTheme === 'dark';
  document.documentElement.dataset.theme = isDark ? 'dark' : 'light';
  button.setAttribute('aria-pressed', String(isDark));
  button.setAttribute('aria-label', isDark ? 'Activar modo claro' : 'Activar modo oscuro');
  button.title = isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro';
  button.innerHTML = `<i class="fa-solid ${isDark ? 'fa-sun' : 'fa-moon'}" aria-hidden="true"></i>`;
  document.querySelector('meta[name="theme-color"]').content = isDark ? '#141721' : '#f3f4f6';
  button.addEventListener('click', () => setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'));
}

function initializeReveal() {
  const targets = document.querySelectorAll('[data-reveal]');
  if (!('IntersectionObserver' in window)) {
    targets.forEach((target) => target.classList.add('is-visible'));
    return;
  }
  const observer = new IntersectionObserver((entries, currentObserver) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      currentObserver.unobserve(entry.target);
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -24px 0px' });
  targets.forEach((target) => observer.observe(target));
}

const tabAliases = new Map([
  ['inicio', 'datos'],
  ['datos-generales', 'datos'],
  ['enfoque', 'datos'],
  ['proyecto', 'plastrack'],
  ['perfil-docente', 'docente']
]);
let activeTabId = 'dashboard';

function tabIdFromHash(hash = window.location.hash) {
  const slug = hash.replace(/^#/, '');
  if ([...document.querySelectorAll('[data-tab-panel]')].some((panel) => panel.dataset.tabPanel === slug)) return slug;
  return tabAliases.get(slug) || 'dashboard';
}

// Cambia el panel visible, actualiza el estado accesible de las pestañas y mantiene el hash sincronizado.
function cambiarPestana(pestanaId, { updateHash = true, addHistory = false, focusTab = false } = {}) {
  const slug = [...document.querySelectorAll('[data-tab-panel]')].some((item) => item.dataset.tabPanel === pestanaId) ? pestanaId : tabIdFromHash(`#${pestanaId}`);
  const panel = [...document.querySelectorAll('[data-tab-panel]')].find((item) => item.dataset.tabPanel === slug);
  if (!panel) return;

  activeTabId = slug;
  document.querySelectorAll('[data-tab-panel]').forEach((item) => {
    const isActive = item === panel;
    item.classList.toggle('is-active', isActive);
    item.hidden = !isActive;
    item.setAttribute('aria-hidden', String(!isActive));
  });
  document.querySelectorAll('[role="tab"][aria-controls]').forEach((tab) => {
    const isActive = tab.getAttribute('aria-controls') === panel.id;
    tab.classList.toggle('is-active', isActive);
    tab.setAttribute('aria-selected', String(isActive));
    tab.tabIndex = isActive ? 0 : -1;
    if (isActive && focusTab) tab.focus();
  });
  panel.querySelectorAll('[data-reveal]').forEach((element) => element.classList.add('is-visible'));

  if (updateHash && window.location.hash !== `#${slug}`) {
    const method = addHistory ? 'pushState' : 'replaceState';
    window.history[method](null, '', `#${slug}`);
  }
  if (slug === 'dashboard') {
    Object.values(chartRegistry).forEach((chart) => chart.resize());
  }
}

function initializeTabs() {
  const tabs = [...document.querySelectorAll('[role="tab"][aria-controls]')];
  tabs.forEach((tab) => {
    tab.dataset.tabId = tab.getAttribute('aria-controls').replace('tab-', '');
    tab.addEventListener('click', (event) => {
      event.preventDefault();
      cambiarPestana(tab.dataset.tabId, { addHistory: true });
    });
    tab.addEventListener('keydown', (event) => {
      const currentIndex = tabs.indexOf(tab);
      let nextIndex = currentIndex;
      if (event.key === 'ArrowRight') nextIndex = (currentIndex + 1) % tabs.length;
      else if (event.key === 'ArrowLeft') nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
      else if (event.key === 'Home') nextIndex = 0;
      else if (event.key === 'End') nextIndex = tabs.length - 1;
      else return;
      event.preventDefault();
      cambiarPestana(tabs[nextIndex].dataset.tabId, { addHistory: true, focusTab: true });
    });
  });

  const syncFromUrl = () => cambiarPestana(tabIdFromHash(), { updateHash: true });
  window.addEventListener('hashchange', syncFromUrl);
  window.addEventListener('popstate', syncFromUrl);
  cambiarPestana(tabIdFromHash(), { updateHash: true });
}

function initializeCopyLinks() {
  document.querySelectorAll('.copy-link').forEach((button) => button.addEventListener('click', async () => {
    const panel = button.closest('[data-tab-panel]');
    const link = new URL(`#${panel.dataset.tabPanel}`, window.location.href).href;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(link);
      } else {
        const temporaryInput = document.createElement('textarea');
        temporaryInput.value = link;
        temporaryInput.setAttribute('readonly', '');
        temporaryInput.style.position = 'fixed';
        temporaryInput.style.opacity = '0';
        document.body.append(temporaryInput);
        temporaryInput.select();
        const copied = document.execCommand('copy');
        temporaryInput.remove();
        if (!copied) throw new Error('No se pudo copiar el enlace.');
      }
      showToast('Enlace de la sección copiado.');
    } catch (error) {
      showToast(error.message || 'No se pudo copiar el enlace.');
    }
  }));
}

function normalizeText(value) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es');
}

function findNormalizedMatch(originalText, query) {
  let normalizedText = '';
  const originalStarts = [];
  const originalEnds = [];
  for (let index = 0; index < originalText.length;) {
    const character = String.fromCodePoint(originalText.codePointAt(index));
    const normalizedCharacter = normalizeText(character);
    for (const normalizedUnit of normalizedCharacter) {
      normalizedText += normalizedUnit;
      originalStarts.push(index);
      originalEnds.push(index + character.length);
    }
    index += character.length;
  }
  const matchIndex = normalizedText.indexOf(query);
  if (matchIndex < 0) return null;
  return { start: originalStarts[matchIndex], end: originalEnds[matchIndex + query.length - 1] };
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
}

// Dato no especificado en el PDF: las horas autónomas faltantes se muestran como guion en HTML.
function initializeTopicSearch() {
  const searchInput = document.querySelector('#buscador');
  const status = document.querySelector('#search-status');
  const topicRows = [...document.querySelectorAll('tr[data-topic]')];
  const emptyRows = new Map();
  document.querySelectorAll('.topic-table tbody').forEach((tbody) => {
    const emptyRow = document.createElement('tr');
    emptyRow.className = 'search-empty-row';
    emptyRow.hidden = true;
    const cell = document.createElement('td');
    cell.colSpan = 4;
    cell.className = 'search-empty';
    cell.textContent = 'No hay temas que coincidan con esta búsqueda.';
    emptyRow.append(cell);
    tbody.append(emptyRow);
    emptyRows.set(tbody, emptyRow);
  });

  searchInput.addEventListener('input', () => {
    const query = normalizeText(searchInput.value.trim());
    let visibleCount = 0;
    const visibleByTable = new Map();
    topicRows.forEach((row) => {
      const cell = row.cells[0];
      const originalText = cell.dataset.originalText || cell.textContent;
      cell.dataset.originalText = originalText;
      const matches = !query || normalizeText(originalText).includes(query);
      row.hidden = !matches;
      if (matches) {
        visibleCount += 1;
        const tbody = row.parentElement;
        visibleByTable.set(tbody, (visibleByTable.get(tbody) || 0) + 1);
        const match = query ? findNormalizedMatch(originalText, query) : null;
        if (match) {
          cell.innerHTML = `${escapeHtml(originalText.slice(0, match.start))}<mark>${escapeHtml(originalText.slice(match.start, match.end))}</mark>${escapeHtml(originalText.slice(match.end))}`;
        } else {
          cell.textContent = originalText;
        }
      }
    });
    emptyRows.forEach((emptyRow, tbody) => {
      const visibleInUnit = visibleByTable.get(tbody) || 0;
      emptyRow.hidden = visibleInUnit > 0;
      if (query && visibleInUnit > 0) tbody.closest('.unit-card').open = true;
    });
    status.textContent = query ? `${visibleCount} ${visibleCount === 1 ? 'tema encontrado' : 'temas encontrados'}` : `${topicRows.length} temas`;
  });
}

function initializeUnitControls() {
  const toggleButton = document.querySelector('#toggle-units');
  const units = [...document.querySelectorAll('.unit-card')];
  toggleButton.addEventListener('click', () => {
    const shouldOpen = units.some((unit) => !unit.open);
    units.forEach((unit) => { unit.open = shouldOpen; });
    toggleButton.textContent = shouldOpen ? 'Colapsar todo' : 'Expandir todo';
    toggleButton.setAttribute('aria-expanded', String(shouldOpen));
  });
  units.forEach((unit) => unit.addEventListener('toggle', () => {
    const allOpen = units.every((item) => item.open);
    toggleButton.textContent = allOpen ? 'Colapsar todo' : 'Expandir todo';
    toggleButton.setAttribute('aria-expanded', String(allOpen));
  }));
}

function currentSkillScores() {
  const storedScores = readPreference('silabo-bi-skill-scores', '');
  if (!storedScores) return [...defaultSkillScores];
  try {
    const parsedScores = JSON.parse(storedScores);
    if (Array.isArray(parsedScores) && parsedScores.length === syllabusSkills.length) {
      return parsedScores.map((score, index) => Number.isFinite(Number(score)) ? Math.min(5, Math.max(1, Number(score))) : defaultSkillScores[index]);
    }
  } catch {}
  return [...defaultSkillScores];
}

function renderSkillSliders(scores) {
  const container = document.querySelector('#skill-slider-grid');
  const fragment = document.createDocumentFragment();
  syllabusSkills.forEach((skill, index) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'skill-slider';
    const label = document.createElement('label');
    label.htmlFor = `skill-score-${index}`;
    label.textContent = skill.name;
    const output = document.createElement('output');
    output.htmlFor = `skill-score-${index}`;
    output.id = `skill-output-${index}`;
    output.value = String(scores[index]);
    output.textContent = `${scores[index]} / 5`;
    const input = document.createElement('input');
    input.type = 'range';
    input.id = `skill-score-${index}`;
    input.min = '1';
    input.max = '5';
    input.step = '1';
    input.value = String(scores[index]);
    input.setAttribute('aria-label', `Puntaje simbólico de ${skill.name}`);
    input.title = 'Puntaje simbólico editable de 1 a 5; no es una calificación académica.';
    input.addEventListener('input', () => {
      const nextScores = [...document.querySelectorAll('.skill-slider input')].map((slider) => Number(slider.value));
      document.querySelector(`#skill-output-${index}`).value = `${input.value} / 5`;
      document.querySelector(`#skill-output-${index}`).textContent = `${input.value} / 5`;
      if (chartRegistry.skills) {
        chartRegistry.skills.data.datasets[0].data = nextScores;
        chartRegistry.skills.update();
      }
      savePreference('silabo-bi-skill-scores', JSON.stringify(nextScores));
    });
    wrapper.append(label, output, input);
    fragment.append(wrapper);
  });
  container.replaceChildren(fragment);
}

function createCharts() {
  if (!window.Chart) {
    document.querySelectorAll('.chart-card').forEach((card) => {
      const note = document.createElement('p');
      note.className = 'chart-load-note';
      note.textContent = 'El gráfico requiere conexión para cargar Chart.js. Los valores de referencia aparecen en el resumen.';
      card.append(note);
    });
    return;
  }
  Chart.defaults.font.family = 'Inter, sans-serif';
  Chart.defaults.color = getPaletteColor('--body');
  const gridColor = getPaletteColor('--line');
  const tooltipOptions = { backgroundColor: '#20243a', padding: 10, titleFont: { weight: '600' }, bodyFont: { size: 11 }, displayColors: true };

  chartRegistry.hours = new Chart(document.querySelector('#hours-chart'), {
    type: 'doughnut',
    data: {
      labels: ['Docencia', 'Prácticas', 'Autónomas'],
      datasets: [{ data: [48, 48, 48], backgroundColor: ['#4F46E5', '#22C55E', '#F59E0B'], borderWidth: 3, borderColor: getPaletteColor('--surface'), hoverOffset: 7 }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '67%',
      plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, pointStyle: 'circle', padding: 16, font: { size: 10 } } }, tooltip: { ...tooltipOptions, callbacks: { label: (context) => ` ${context.label}: ${context.raw} horas (${Math.round(context.raw / 144 * 100)}%)` } } }
    }
  });

  chartRegistry.units = new Chart(document.querySelector('#units-chart'), {
    type: 'bar',
    data: {
      labels: ['Unidad 1', 'Unidad 2', 'Unidad 3'],
      datasets: [{ label: 'Horas docentes', data: [15, 15, 18], backgroundColor: ['#4F46E5', '#22C55E', '#F59E0B'], borderRadius: 5, maxBarThickness: 42 }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { ...tooltipOptions, callbacks: { label: (context) => ` ${context.raw} horas de docencia` } } },
      scales: {
        x: { grid: { display: false }, border: { display: false }, ticks: { font: { size: 10 } } },
        y: { beginAtZero: true, max: 20, ticks: { stepSize: 5, font: { size: 9 } }, grid: { color: gridColor }, border: { display: false } }
      }
    }
  });

  const scores = currentSkillScores();
  chartRegistry.skills = new Chart(document.querySelector('#skills-chart'), {
    type: 'radar',
    data: {
      labels: ['Competencia digital', 'Creatividad', 'Ética', 'Liderazgo', 'Pensamiento crítico', 'Resolución de problemas'],
      datasets: [{ label: 'Nivel simbólico', data: scores, borderColor: '#4F46E5', backgroundColor: 'rgba(79, 70, 229, .16)', pointBackgroundColor: '#22C55E', pointBorderColor: '#fff', pointRadius: 4, borderWidth: 2 }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { ...tooltipOptions, callbacks: { label: (context) => ` Nivel simbólico: ${context.raw} de 5` } } },
      scales: { r: { min: 0, max: 5, beginAtZero: true, ticks: { stepSize: 1, backdropColor: 'transparent', font: { size: 8 } }, grid: { color: gridColor }, angleLines: { color: gridColor }, pointLabels: { color: getPaletteColor('--body'), font: { size: 9, weight: '600' } } } }
    }
  });
  renderSkillSliders(scores);
}

function initializeSkillControls() {
  const resetButton = document.querySelector('#reset-scores');
  resetButton.addEventListener('click', () => {
    savePreference('silabo-bi-skill-scores', JSON.stringify(defaultSkillScores));
    renderSkillSliders(defaultSkillScores);
    if (chartRegistry.skills) {
      chartRegistry.skills.data.datasets[0].data = [...defaultSkillScores];
      chartRegistry.skills.update();
    }
    showToast('Puntajes simbólicos restablecidos.');
  });
}

function setBusy(button, isBusy, busyText) {
  if (!button.dataset.originalHtml) button.dataset.originalHtml = button.innerHTML;
  button.disabled = isBusy;
  button.setAttribute('aria-busy', String(isBusy));
  button.innerHTML = isBusy ? `<i class="fa-solid fa-spinner fa-spin" aria-hidden="true"></i><span>${busyText}</span>` : button.dataset.originalHtml;
}

// La impresión identifica el panel activo; el CSS oculta siempre el dashboard y solo deja visible ese panel.
function imprimirPestana(pestanaId, button) {
  if (!pestanaId || pestanaId === 'tab-dashboard') {
    showToast('El dashboard no está disponible para impresión. Cambie a otra pestaña.');
    return;
  }
  setBusy(button, true, 'Preparando…');
  window.print();
}

function getActionButton(pestanaId, action) {
  return document.querySelector(`#${pestanaId} [data-tab-action="${action}"]`);
}

function getExportablePanel(pestanaId) {
  const source = document.getElementById(pestanaId);
  // El dashboard está marcado como no exportable y se rechaza antes de clonar cualquier contenido.
  if (!source || source.dataset.noExport === 'true' || pestanaId === 'tab-dashboard') {
    throw new Error('El dashboard no está disponible para exportación.');
  }
  if (!source.dataset.exportName) throw new Error('No se encontró el nombre de archivo para esta pestaña.');
  return source;
}

function prepareExportClone(pestanaId) {
  const source = getExportablePanel(pestanaId);
  const clone = source.cloneNode(true);
  clone.removeAttribute('id');
  clone.hidden = false;
  clone.classList.remove('is-active');
  clone.classList.add('export-clone');
  clone.setAttribute('aria-hidden', 'true');
  clone.querySelectorAll('[data-reveal]').forEach((element) => element.classList.add('is-visible'));
  clone.querySelectorAll('.tab-action-bar, .copy-link, .unit-tools, .skill-controls, .reset-scores, .search-empty-row').forEach((element) => element.remove());
  clone.querySelectorAll('details').forEach((details) => { details.open = true; });
  clone.querySelectorAll('tr[data-topic]').forEach((row) => {
    row.hidden = false;
    const topicCell = row.cells[0];
    if (topicCell.dataset.originalText) topicCell.textContent = topicCell.dataset.originalText;
  });
  clone.querySelectorAll('[hidden]').forEach((element) => element.removeAttribute('hidden'));
  clone.style.cssText = 'position:absolute;left:-9999px;top:0;width:1200px;display:block;visibility:visible;background:var(--page);animation:none;';
  document.body.append(clone);
  return clone;
}

// Exporta únicamente el panel solicitado, clonándolo fuera de pantalla para renderizarlo aunque no esté activo.
async function exportarPDF(pestanaId) {
  let button;
  let clone;
  try {
    const panel = getExportablePanel(pestanaId);
    button = getActionButton(pestanaId, 'pdf');
    if (!button) throw new Error('No se encontró el botón para exportar esta pestaña.');
    setBusy(button, true, 'Exportando…');
    if (!window.html2pdf) throw new Error('No se pudo cargar html2pdf.js. Revisa la conexión e inténtalo de nuevo.');
    clone = prepareExportClone(pestanaId);
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    await document.fonts.ready;
    await window.html2pdf().set({
      margin: 10,
      filename: `${panel.dataset.exportName}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, backgroundColor: getPaletteColor('--page'), scrollX: 0, scrollY: 0, windowWidth: 1200 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    }).from(clone).save();
    showToast('El PDF de la pestaña se descargó correctamente.');
  } catch (error) {
    console.error('No se pudo exportar la pestaña a PDF.', error);
    showToast(error.message || 'No se pudo exportar el PDF. Inténtalo de nuevo.');
  } finally {
    clone?.remove();
    if (button) setBusy(button, false);
  }
}

function makeWordDocument(clone, pestanaId) {
  clone.classList.remove('export-clone');
  clone.style.removeProperty('position');
  clone.style.removeProperty('left');
  clone.style.removeProperty('top');
  clone.style.removeProperty('width');
  clone.style.removeProperty('display');
  clone.style.removeProperty('visibility');
  clone.style.removeProperty('background');
  clone.style.removeProperty('animation');
  clone.removeAttribute('aria-hidden');
  clone.querySelectorAll('details').forEach((details) => {
    const heading = document.createElement('h3');
    heading.textContent = details.querySelector('summary').textContent.trim();
    const content = details.querySelector('.unit-content');
    details.replaceWith(heading, content);
  });
  clone.querySelectorAll('a').forEach((link) => {
    if (!link.href.startsWith('mailto:')) link.setAttribute('target', '_blank');
  });
  let syllabusStyles = '';
  for (const stylesheet of document.styleSheets) {
    if (!stylesheet.href?.startsWith(window.location.origin) || !stylesheet.href.endsWith('/styles.css')) continue;
    try {
      syllabusStyles = [...stylesheet.cssRules].map((rule) => rule.cssText).join('\n');
    } catch (error) {
      console.warn('No se pudo incorporar la hoja de estilos al documento Word.', error);
    }
  }
  const style = `body{font-family:Arial,sans-serif;color:#20243a;font-size:11pt;line-height:1.5}h1,h2,h3,h4{color:#312e81}h1{font-size:24pt}h2{font-size:18pt;border-bottom:1px solid #d9dbea;padding-bottom:6px}h3{font-size:13pt}p,li{line-height:1.55}table{border-collapse:collapse;width:100%;margin:10px 0}th,td{border:1px solid #d7d9e0;padding:6px;text-align:left}th{background:#f0efff}a{color:#4338ca}article,section{margin-bottom:12px}.page-shell{width:100%}.tab-panel{display:block!important;background:#fff;color:#20243a}.content-section{margin-bottom:18px}.section-heading h2{font-size:18pt}.word-unit{page-break-before:always}`;
  const title = document.querySelector(`#${pestanaId} .section-heading h2`)?.textContent.trim() || 'Sílabo BI';
  return `<!doctype html><html><head><meta charset="utf-8"><title>${title}</title><style>${syllabusStyles}\n${style}</style></head><body>${clone.outerHTML}</body></html>`;
}

// Exporta a Word solo el panel solicitado usando Blob con el tipo MIME compatible con Microsoft Word.
async function exportarWord(pestanaId) {
  let button;
  let clone;
  try {
    const panel = getExportablePanel(pestanaId);
    button = getActionButton(pestanaId, 'word');
    if (!button) throw new Error('No se encontró el botón para exportar esta pestaña.');
    setBusy(button, true, 'Exportando…');
    clone = prepareExportClone(pestanaId);
    const documentHtml = makeWordDocument(clone, pestanaId);
    const wordBlob = new Blob(['\ufeff', documentHtml], { type: 'application/msword;charset=utf-8' });
    const downloadUrl = URL.createObjectURL(wordBlob);
    const downloadLink = document.createElement('a');
    downloadLink.href = downloadUrl;
    downloadLink.download = `${panel.dataset.exportName}.doc`;
    document.body.append(downloadLink);
    downloadLink.click();
    downloadLink.remove();
    window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
    showToast('El documento Word de la pestaña se descargó correctamente.');
  } catch (error) {
    console.error('No se pudo exportar la pestaña a Word.', error);
    showToast(error.message || 'No se pudo exportar el documento Word.');
  } finally {
    clone?.remove();
    if (button) setBusy(button, false);
  }
}

function initializeTabActions() {
  document.querySelectorAll('[data-tab-action]').forEach((button) => {
    button.addEventListener('click', () => {
      const panel = button.closest('[data-tab-panel]');
      if (button.dataset.tabAction === 'print') imprimirPestana(panel.id, button);
      else if (button.dataset.tabAction === 'pdf') exportarPDF(panel.id);
      else if (button.dataset.tabAction === 'word') exportarWord(panel.id);
    });
  });

  window.addEventListener('beforeprint', () => {
    document.body.dataset.printDashboard = String(activeTabId === 'dashboard');
  });
  window.addEventListener('afterprint', () => {
    delete document.body.dataset.printDashboard;
    document.querySelectorAll('[data-tab-action="print"]').forEach((button) => setBusy(button, false));
  });
}

function initialize() {
  initializeTheme();
  initializeTabs();
  initializeReveal();
  initializeCopyLinks();
  initializeTopicSearch();
  initializeUnitControls();
  initializeSkillControls();
  initializeTabActions();
  createCharts();
  updateChartTheme();
}

initialize();
