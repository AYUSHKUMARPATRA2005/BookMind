/* app.js – BookMind */
(function () {
  'use strict';

  const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent';

  if (typeof pdfjsLib !== 'undefined') {
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  }

  const apiKey = 'AIzaSyAVK16SAemhS73krICDoeYsY-prSXpqwlQ';
  let currentText = '';
  let flashcards = [];
  let fcIndex = 0;
  let qaData = [];
  let summaryText = '';
  let keypointsData = [];

  const $ = id => document.getElementById(id);
  const generateBtn    = $('generate-btn');
  const bookTextarea   = $('book-text');
  const charCount      = $('char-count');
  const tabPaste       = $('tab-paste');
  const tabUpload      = $('tab-upload');
  const panelPaste     = $('panel-paste');
  const panelUpload    = $('panel-upload');
  const uploadZone     = $('upload-zone');
  const fileInput      = $('file-input');
  const uploadPreview  = $('upload-preview');
  const uploadFileName = $('upload-file-name');
  const removeFile     = $('remove-file');
  const loadingOverlay = $('loading-overlay');
  const resultsSection = $('results-section');
  const inputSection   = $('input-section');

  function updateGenerateBtn() {
    const hasText = currentText.trim().length >= 100;
    generateBtn.disabled = !hasText;
  }

  /* ── Tabs ── */
  tabPaste.addEventListener('click', () => switchInputTab('paste'));
  tabUpload.addEventListener('click', () => switchInputTab('upload'));

  function switchInputTab(tab) {
    tabPaste.classList.toggle('active', tab === 'paste');
    tabUpload.classList.toggle('active', tab === 'upload');
    panelPaste.classList.toggle('active', tab === 'paste');
    panelUpload.classList.toggle('active', tab === 'upload');
    if (tab === 'paste') currentText = bookTextarea.value;
    updateGenerateBtn();
  }

  bookTextarea.addEventListener('input', () => {
    currentText = bookTextarea.value;
    charCount.textContent = currentText.length.toLocaleString();
    updateGenerateBtn();
  });

  /* ── File Upload ── */
  uploadZone.addEventListener('click', () => fileInput.click());
  uploadZone.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') fileInput.click(); });
  uploadZone.addEventListener('dragover', e => { e.preventDefault(); uploadZone.classList.add('drag-over'); });
  uploadZone.addEventListener('dragleave', () => uploadZone.classList.remove('drag-over'));
  uploadZone.addEventListener('drop', e => {
    e.preventDefault();
    uploadZone.classList.remove('drag-over');
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  });
  fileInput.addEventListener('change', () => { if (fileInput.files[0]) handleFile(fileInput.files[0]); });

  async function handleFile(file) {
    const ext = file.name.split('.').pop().toLowerCase();
    try {
      if (ext === 'pdf') {
        currentText = await extractPdfText(file);
      } else {
        currentText = await new Promise((resolve, reject) => {
          const r = new FileReader();
          r.onload = ev => resolve(ev.target.result);
          r.onerror = () => reject(new Error('Failed to read file'));
          r.readAsText(file);
        });
      }
      uploadFileName.textContent = file.name;
      uploadPreview.hidden = false;
      updateGenerateBtn();
    } catch (err) {
      alert('Error reading file: ' + (err.message || 'Unknown error'));
    }
  }

  async function extractPdfText(file) {
    const buf = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
    const pages = [];
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      pages.push(content.items.map(item => item.str).join(' '));
    }
    return pages.join('\n\n');
  }

  removeFile.addEventListener('click', () => {
    currentText = '';
    fileInput.value = '';
    uploadPreview.hidden = true;
    updateGenerateBtn();
  });

  /* ── Generate ── */
  generateBtn.addEventListener('click', generate);

  async function generate() {
    if (currentText.trim().length < 100) return;
    showLoading();
    try {
      const summaryLen = $('summary-length').value;
      const fcCount = parseInt($('flashcard-count').value, 10);
      const qaCount = parseInt($('qa-count').value, 10);
      const lengths = { brief: '1-2 paragraphs', standard: '3-4 paragraphs', detailed: '5+ paragraphs' };

      setLoadingStep(1);
      const result = await callGemini(buildPrompt(currentText, lengths[summaryLen], fcCount, qaCount));
      setLoadingStep(2);
      await delay(250);
      setLoadingStep(3);
      const parsed = parseResult(result);
      setLoadingStep(4);
      await delay(250);

      summaryText = parsed.summary;
      keypointsData = parsed.keypoints;
      flashcards = parsed.flashcards;
      qaData = parsed.qa;

      renderResults();
      hideLoading();
      resultsSection.hidden = false;
      resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (err) {
      hideLoading();
      alert('Error: ' + (err.message || 'Something went wrong. Check your API key and try again.'));
    }
  }

  function buildPrompt(text, summaryLen, fcCount, qaCount) {
    return `You are an expert study assistant. Analyze the following text and produce a structured response in this EXACT JSON format (no markdown fences, just raw JSON):

{
  "summary": "<summary of ${summaryLen}>",
  "keypoints": ["point 1", "point 2", "point 3", "...up to 8 points"],
  "flashcards": [
    {"front": "concept or term", "back": "definition or explanation"},
    ... (${fcCount} total)
  ],
  "qa": [
    {"question": "...", "answer": "..."},
    ... (${qaCount} total)
  ]
}

TEXT TO ANALYZE:
"""
${text.slice(0, 12000)}
"""

Return ONLY valid JSON. No extra text before or after.`;
  }

  async function callGemini(prompt) {
    const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.4, maxOutputTokens: 4096 }
      })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message || `HTTP ${res.status}`);
    }
    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  }

  function parseResult(raw) {
    try {
      const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      return JSON.parse(cleaned);
    } catch {
      return {
        summary: raw,
        keypoints: ['Could not parse key points. See the summary tab for raw output.'],
        flashcards: [{ front: 'Parse error', back: 'The AI response could not be parsed. Try again.' }],
        qa: [{ question: 'Parse error?', answer: 'The AI response could not be parsed. Try again.' }]
      };
    }
  }

  /* ── Render ── */
  function renderResults() {
    $('summary-text').textContent = summaryText;

    const kpList = $('keypoints-list');
    kpList.innerHTML = '';
    keypointsData.forEach(pt => {
      const li = document.createElement('li');
      li.textContent = pt;
      kpList.appendChild(li);
    });

    fcIndex = 0;
    renderFlashcard();

    const qaList = $('qa-list');
    qaList.innerHTML = '';
    qaData.forEach((item, i) => {
      const div = document.createElement('div');
      div.className = 'qa-item';
      div.innerHTML = `
        <div class="qa-question" role="button" tabindex="0">
          <span class="qa-q-label">Q</span>
          <span>${escHtml(item.question)}</span>
          <span class="qa-toggle">&#9662;</span>
        </div>
        <div class="qa-answer">
          <span class="qa-a-label">A</span>${escHtml(item.answer)}
        </div>`;
      const q = div.querySelector('.qa-question');
      q.addEventListener('click', () => div.classList.toggle('open'));
      q.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') div.classList.toggle('open'); });
      qaList.appendChild(div);
    });

    switchResultTab('rpanel-summary');
  }

  function renderFlashcard() {
    if (!flashcards.length) return;
    const card = flashcards[fcIndex];
    $('fc-front').querySelector('span').textContent = card.front;
    $('fc-back').querySelector('span').textContent = card.back;
    $('flashcard').classList.remove('flipped');
    $('fc-current').textContent = fcIndex + 1;
    $('fc-total').textContent = flashcards.length;
    $('fc-progress-bar').style.width = ((fcIndex + 1) / flashcards.length * 100) + '%';
  }

  $('flashcard-scene').addEventListener('click', () => $('flashcard').classList.toggle('flipped'));
  $('flashcard-scene').addEventListener('keydown', e => {
    if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); $('flashcard').classList.toggle('flipped'); }
    if (e.key === 'ArrowRight') { e.preventDefault(); nextCard(); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); prevCard(); }
  });
  $('fc-next').addEventListener('click', nextCard);
  $('fc-prev').addEventListener('click', prevCard);

  function nextCard() { fcIndex = (fcIndex + 1) % flashcards.length; renderFlashcard(); }
  function prevCard() { fcIndex = (fcIndex - 1 + flashcards.length) % flashcards.length; renderFlashcard(); }

  document.querySelectorAll('.rtab').forEach(btn => {
    btn.addEventListener('click', () => switchResultTab(btn.dataset.target));
  });

  function switchResultTab(targetId) {
    document.querySelectorAll('.rtab').forEach(b => b.classList.toggle('active', b.dataset.target === targetId));
    document.querySelectorAll('.rpanel').forEach(p => p.hidden = p.id !== targetId);
  }

  /* ── Copy ── */
  $('copy-summary').addEventListener('click', () => copyText(summaryText, 'copy-summary'));
  $('copy-keypoints').addEventListener('click', () => copyText(keypointsData.map((p, i) => `${i + 1}. ${p}`).join('\n'), 'copy-keypoints'));
  $('copy-qa').addEventListener('click', () => copyText(qaData.map(q => `Q: ${q.question}\nA: ${q.answer}`).join('\n\n'), 'copy-qa'));

  function copyText(text, btnId) {
    navigator.clipboard.writeText(text).then(() => {
      const btn = $(btnId);
      const orig = btn.textContent;
      btn.textContent = 'Copied';
      setTimeout(() => btn.textContent = orig, 1200);
    });
  }

  /* ── Export ── */
  $('export-txt').addEventListener('click', () => {
    const content = [
      'SUMMARY', '='.repeat(40), summaryText, '',
      'KEY POINTS', '='.repeat(40), keypointsData.map((p, i) => `${i + 1}. ${p}`).join('\n'), '',
      'FLASHCARDS', '='.repeat(40), flashcards.map(f => `Q: ${f.front}\nA: ${f.back}`).join('\n\n'), '',
      'Q&A', '='.repeat(40), qaData.map(q => `Q: ${q.question}\nA: ${q.answer}`).join('\n\n')
    ].join('\n');
    downloadFile('bookmind-results.txt', content, 'text/plain');
  });

  $('export-json').addEventListener('click', () => {
    const data = { summary: summaryText, keypoints: keypointsData, flashcards, qa: qaData };
    downloadFile('bookmind-results.json', JSON.stringify(data, null, 2), 'application/json');
  });

  $('export-pdf').addEventListener('click', () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const margin = 20;
    const pw = doc.internal.pageSize.getWidth() - margin * 2;
    let y = margin;

    function addText(text, size, bold) {
      doc.setFontSize(size);
      doc.setFont('helvetica', bold ? 'bold' : 'normal');
      doc.splitTextToSize(text, pw).forEach(line => {
        if (y + size * 0.5 > doc.internal.pageSize.getHeight() - margin) { doc.addPage(); y = margin; }
        doc.text(line, margin, y);
        y += size * 0.5;
      });
      y += 4;
    }

    addText('BookMind - Analysis Results', 16, true); y += 4;
    addText('SUMMARY', 13, true); addText(summaryText, 10, false); y += 4;
    addText('KEY POINTS', 13, true);
    keypointsData.forEach((pt, i) => addText(`${i + 1}. ${pt}`, 10, false)); y += 4;
    addText('FLASHCARDS', 13, true);
    flashcards.forEach(f => { addText(`Q: ${f.front}`, 10, true); addText(`A: ${f.back}`, 10, false); y += 2; }); y += 4;
    addText('Q&A PAIRS', 13, true);
    qaData.forEach(q => { addText(`Q: ${q.question}`, 10, true); addText(`A: ${q.answer}`, 10, false); y += 2; });
    doc.save('bookmind-results.pdf');
  });

  function downloadFile(name, content, type) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([content], { type }));
    a.download = name;
    a.click();
  }

  $('new-analysis-btn').addEventListener('click', () => {
    resultsSection.hidden = true;
    bookTextarea.value = '';
    currentText = '';
    charCount.textContent = '0';
    updateGenerateBtn();
    inputSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  /* ── Loading ── */
  function showLoading() { loadingOverlay.hidden = false; resetLoadingSteps(); }
  function hideLoading() { loadingOverlay.hidden = true; }
  function resetLoadingSteps() { for (let i = 1; i <= 4; i++) $(`lstep-${i}`).className = 'lstep'; }
  function setLoadingStep(n) {
    for (let i = 1; i < n; i++) $(`lstep-${i}`).className = 'lstep done';
    $(`lstep-${n}`).className = 'lstep active';
  }

  function delay(ms) { return new Promise(r => setTimeout(r, ms)); }
  function escHtml(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

  updateGenerateBtn();
})();
