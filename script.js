(() => {
  const sidebar = document.getElementById('sidebar');
  const toggleBtn = document.getElementById('collapseToggle');
  const navLinks = Array.from(document.querySelectorAll('.nav-link'));
  const panels = Array.from(document.querySelectorAll('.panel'));
  const registrationsPanel = document.getElementById('registrationsPanel');
  const registrationsTableBody = document.getElementById('registrationsTableBody');
  const registrationsSummary = document.getElementById('registrationsSummary');
  const registrationDetail = document.getElementById('registrationDetail');
  const refreshRegistrationsBtn = document.getElementById('refreshRegistrationsBtn');
  const formTypeMap = {
    excoForm: 'exco',
    juryForm: 'jury',
    officialForm: 'official',
    participantForm: 'participant',
    ecForm: 'committee',
  };

  function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = 'toast-notify';
    toast.style.position = 'fixed';
    toast.style.bottom = '24px';
    toast.style.right = '24px';
    toast.style.background = type === 'success' ? '#0a6b4b' : '#a63c3c';
    toast.style.color = 'white';
    toast.style.padding = '14px 24px';
    toast.style.borderRadius = '48px';
    toast.style.fontWeight = '500';
    toast.style.backdropFilter = 'blur(8px)';
    toast.style.boxShadow = '0 12px 24px rgba(0,0,0,0.2)';
    toast.style.zIndex = '9999';
    toast.style.fontSize = '0.9rem';
    toast.style.display = 'flex';
    toast.style.alignItems = 'center';
    toast.style.gap = '10px';

    const icon = document.createElement('i');
    icon.className = type === 'success' ? 'fas fa-bell' : 'fas fa-triangle-exclamation';
    toast.appendChild(icon);
    toast.appendChild(document.createTextNode(message));
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3200);
  }

  const registrationsCache = new Map();
  let registrationsLoaded = false;
  let selectedRegistrationRef = null;

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, character => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    }[character]));
  }

  function formatDateTime(value) {
    if (!value) return 'Unknown';
    const parsed = new Date(String(value).replace(' ', 'T'));
    if (Number.isNaN(parsed.getTime())) return String(value);
    return new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short' }).format(parsed);
  }

  function formatRegistrationType(value) {
    return String(value || 'unknown').replace(/_/g, ' ');
  }

  function formatStatus(value) {
    return String(value || 'pending').replace(/_/g, ' ');
  }

  function renderRegistrationSummary(items) {
    if (!registrationsSummary) return;
    const counts = items.reduce((accumulator, item) => {
      const type = formatRegistrationType(item.registration_type);
      accumulator.total += 1;
      accumulator.types.set(type, (accumulator.types.get(type) || 0) + 1);
      return accumulator;
    }, { total: 0, types: new Map() });

    const chips = [
      `<span class="summary-pill summary-pill-primary">${counts.total} total</span>`,
      ...Array.from(counts.types.entries()).map(([type, count]) => `<span class="summary-pill">${escapeHtml(type)} ${count}</span>`),
    ];
    registrationsSummary.innerHTML = chips.join('');
  }

  function setEmptyRegistrationTable(message) {
    if (!registrationsTableBody) return;
    registrationsTableBody.innerHTML = `<tr><td colspan="5" class="empty-state">${escapeHtml(message)}</td></tr>`;
  }

  function renderRegistrationRows(items) {
    if (!registrationsTableBody) return;
    if (!items.length) {
      setEmptyRegistrationTable('No registrations yet.');
      return;
    }

    registrationsTableBody.innerHTML = items.map(item => {
      const reference = escapeHtml(item.reference_code);
      const type = escapeHtml(formatRegistrationType(item.registration_type));
      const status = escapeHtml(formatStatus(item.status));
      const created = escapeHtml(formatDateTime(item.created_at));
      const selected = item.reference_code === selectedRegistrationRef ? ' is-selected' : '';
      return `
        <tr class="registration-row${selected}" data-reference="${reference}">
          <td><button type="button" class="row-button" data-reference="${reference}">${reference}</button></td>
          <td>${escapeHtml(item.full_name || '')}</td>
          <td><span class="status-pill status-pill-type">${type}</span></td>
          <td><span class="status-pill status-pill-${escapeHtml(String(item.status || 'pending'))}">${status}</span></td>
          <td>${created}</td>
        </tr>
      `;
    }).join('');

    registrationsTableBody.querySelectorAll('.row-button').forEach(button => {
      button.addEventListener('click', () => {
        const reference = button.getAttribute('data-reference');
        if (reference) selectRegistration(reference);
      });
    });
  }

  function renderRegistrationDetail(registration) {
    if (!registrationDetail) return;
    const attachments = Array.isArray(registration.attachments_json) ? registration.attachments_json : [];
    const rawPayload = registration.raw_payload && typeof registration.raw_payload === 'object'
      ? JSON.stringify(registration.raw_payload, null, 2)
      : '';

    registrationDetail.innerHTML = `
      <div class="detail-grid">
        <div class="detail-group">
          <span class="detail-label">Reference</span>
          <strong>${escapeHtml(registration.reference_code || '')}</strong>
        </div>
        <div class="detail-group">
          <span class="detail-label">Type</span>
          <strong>${escapeHtml(formatRegistrationType(registration.registration_type))}</strong>
        </div>
        <div class="detail-group">
          <span class="detail-label">Status</span>
          <strong><span class="status-pill status-pill-${escapeHtml(String(registration.status || 'pending'))}">${escapeHtml(formatStatus(registration.status))}</span></strong>
        </div>
        <div class="detail-group">
          <span class="detail-label">Created</span>
          <strong>${escapeHtml(formatDateTime(registration.created_at))}</strong>
        </div>
      </div>
      <div class="detail-group wide">
        <span class="detail-label">Full name</span>
        <strong>${escapeHtml(registration.full_name || '')}</strong>
      </div>
      <div class="detail-grid">
        <div class="detail-group"><span class="detail-label">Email</span><strong>${escapeHtml(registration.email || '')}</strong></div>
        <div class="detail-group"><span class="detail-label">Country</span><strong>${escapeHtml(registration.country || '—')}</strong></div>
        <div class="detail-group"><span class="detail-label">Organization</span><strong>${escapeHtml(registration.organization || '—')}</strong></div>
        <div class="detail-group"><span class="detail-label">Position</span><strong>${escapeHtml(registration.position || '—')}</strong></div>
      </div>
      <div class="detail-grid">
        <div class="detail-group"><span class="detail-label">Phone / WhatsApp</span><strong>${escapeHtml(registration.phone_whatsapp || '—')}</strong></div>
        <div class="detail-group"><span class="detail-label">Passport / ID</span><strong>${escapeHtml(registration.passport_or_id || '—')}</strong></div>
        <div class="detail-group"><span class="detail-label">Arrival date</span><strong>${escapeHtml(registration.arrival_date || '—')}</strong></div>
        <div class="detail-group"><span class="detail-label">Category / Role</span><strong>${escapeHtml(registration.category || registration.role_name || '—')}</strong></div>
      </div>
      <div class="detail-group wide">
        <span class="detail-label">Project / Team</span>
        <strong>${escapeHtml(registration.project_title || registration.team_name || '—')}</strong>
      </div>
      <div class="detail-group wide">
        <span class="detail-label">Notes</span>
        <div class="detail-text">${escapeHtml(registration.notes || 'No notes recorded.')}</div>
      </div>
      <div class="detail-group wide">
        <span class="detail-label">Attachments</span>
        ${attachments.length ? `<ul class="attachment-list">${attachments.map(item => `<li><span>${escapeHtml(item.field_name || 'file')}</span><a href="${escapeHtml(item.url || '#')}" target="_blank" rel="noreferrer">${escapeHtml(item.original_name || 'Open file')}</a></li>`).join('')}</ul>` : '<div class="detail-text">No uploaded files.</div>'}
      </div>
      ${rawPayload ? `<div class="detail-group wide"><span class="detail-label">Raw payload</span><pre class="raw-payload">${escapeHtml(rawPayload)}</pre></div>` : ''}
    `;
  }

  function setRegistrationLoading(message) {
    if (registrationsTableBody) {
      registrationsTableBody.innerHTML = `<tr><td colspan="5" class="empty-state">${escapeHtml(message)}</td></tr>`;
    }
  }

  async function selectRegistration(reference) {
    selectedRegistrationRef = reference;
    renderRegistrationRows(Array.from(registrationsCache.values()));

    if (!registrationDetail) return;
    registrationDetail.innerHTML = '<div class="empty-state detail-empty">Loading registration detail...</div>';

    try {
      const response = await fetch(`/api/registrations/${encodeURIComponent(reference)}`);
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || 'Unable to load registration detail');
      }
      renderRegistrationDetail(data);
    } catch (error) {
      registrationDetail.innerHTML = `<div class="empty-state detail-empty">${escapeHtml(error.message || 'Unable to load registration detail')}</div>`;
    }
  }

  async function loadRegistrations({ silent = false } = {}) {
    if (!silent) {
      setRegistrationLoading('Loading registrations...');
    }

    try {
      const response = await fetch('/api/registrations?limit=12');
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || 'Unable to load registrations');
      }

      const items = Array.isArray(data.items) ? data.items : [];
      registrationsCache.clear();
      items.forEach(item => registrationsCache.set(item.reference_code, item));
      renderRegistrationSummary(items);
      renderRegistrationRows(items);

      if (items.length && !selectedRegistrationRef) {
        await selectRegistration(items[0].reference_code);
      } else if (!items.length && registrationDetail) {
        registrationDetail.innerHTML = '<div class="empty-state detail-empty">No registrations have been saved yet.</div>';
      }
    } catch (error) {
      setRegistrationLoading(error.message || 'Unable to load registrations');
      if (registrationDetail) {
        registrationDetail.innerHTML = `<div class="empty-state detail-empty">${escapeHtml(error.message || 'Unable to load registrations')}</div>`;
      }
    }
  }

  function setActiveLink(panelId) {
    navLinks.forEach(link => {
      const target = link.getAttribute('data-panel');
      link.classList.toggle('active', target === panelId);
    });
  }

  function activatePanel(panelId) {
    panels.forEach(panel => panel.classList.remove('active-panel'));
    const targetPanel = document.getElementById(panelId);
    if (targetPanel) targetPanel.classList.add('active-panel');
    setActiveLink(panelId);
    if (panelId === 'qrAccreditation' && !qrDemoGenerated) {
      setTimeout(() => {
        generateSampleQRCode();
        qrDemoGenerated = true;
      }, 150);
    }
    if (panelId === 'registrationsPanel' && !registrationsLoaded) {
      registrationsLoaded = true;
      loadRegistrations();
    }
  }

  if (toggleBtn && sidebar) {
    toggleBtn.addEventListener('click', () => {
      sidebar.classList.toggle('collapsed');
      const icon = toggleBtn.querySelector('i');
      if (!icon) return;
      const collapsed = sidebar.classList.contains('collapsed');
      icon.classList.toggle('fa-chevron-left', !collapsed);
      icon.classList.toggle('fa-chevron-right', collapsed);
    });
  }

  navLinks.forEach(link => {
    link.addEventListener('click', event => {
      event.preventDefault();
      const panelId = link.getAttribute('data-panel');
      if (panelId) activatePanel(panelId);
    });
  });

  async function submitRegistration(formEl) {
    const formId = formEl.id;
    const registrationType = formTypeMap[formId];
    const button = formEl.querySelector('button[type="submit"]');
    const originalHtml = button ? button.innerHTML : '';

    try {
      if (button) {
        button.disabled = true;
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
      }

      const formData = new FormData(formEl);
      formData.set('registration_type', registrationType || formId);

      const response = await fetch('/api/registrations', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || 'Unable to save registration');
      }

      showToast(`Registration saved: ${data.reference}`, 'success');
      formEl.reset();
      await loadRegistrations({ silent: true });
      if (registrationType === 'participant') {
        showToast('Team project recorded. Uploaded files were stored on the server.', 'success');
      }
    } catch (error) {
      showToast(error.message || 'Submission failed', 'error');
    } finally {
      if (button) {
        button.disabled = false;
        button.innerHTML = originalHtml;
      }
    }
  }

  ['excoForm', 'juryForm', 'officialForm', 'participantForm', 'ecForm'].forEach(formId => {
    const formEl = document.getElementById(formId);
    if (!formEl) return;
    formEl.addEventListener('submit', event => {
      event.preventDefault();
      submitRegistration(formEl);
    });
  });

  if (refreshRegistrationsBtn) {
    refreshRegistrationsBtn.addEventListener('click', () => {
      registrationsLoaded = true;
      loadRegistrations();
    });
  }

  const syncBtn = document.getElementById('simulateSyncBtn');
  if (syncBtn) {
    syncBtn.addEventListener('click', () => {
      showToast('AI sync complete: Pending approvals and missing docs were refreshed.', 'success');
    });
  }

  let qrDemoGenerated = false;
  const qrContainer = document.getElementById('qrcodeDynamic');
  const generateQrBtn = document.getElementById('generateQRdemoBtn');

  function generateSampleQRCode() {
    if (!qrContainer || typeof QRCode === 'undefined') return;
    qrContainer.innerHTML = '';
    const randomId = `APICTA2026/${Math.floor(Math.random() * 90000 + 10000)}`;
    const qrData = `ACC://JKT2026|DELEGATE|${randomId}|ROLE:PARTICIPANT|ACCESS:ALL`;
    new QRCode(qrContainer, {
      text: qrData,
      width: 180,
      height: 180,
      colorDark: '#0a5c70',
      colorLight: '#ffffff',
      correctLevel: QRCode.CorrectLevel.M,
    });
    showToast('Digital accreditation QR generated.', 'success');
  }

  if (generateQrBtn) {
    generateQrBtn.addEventListener('click', () => {
      generateSampleQRCode();
      qrDemoGenerated = true;
    });
  }

  if (document.getElementById('qrAccreditation')?.classList.contains('active-panel')) {
    setTimeout(() => {
      generateSampleQRCode();
      qrDemoGenerated = true;
    }, 200);
  }

  loadRegistrations({ silent: true });

  document.querySelectorAll('.stat-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
      card.style.transform = 'translateY(-4px)';
      card.style.transition = '0.2s';
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'translateY(0)';
    });
  });

  console.log('APICTA 2026 Platform ready | Python backend connected');
})();
