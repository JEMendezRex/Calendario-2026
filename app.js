// Calendar + reminders stored in localStorage with improved UX (month/year selects, jump, color, notifications)
(() => {
  const DAYS_CONTAINER = document.getElementById('days');
  const MONTH_SELECT = document.getElementById('monthSelect');
  const YEAR_SELECT = document.getElementById('yearSelect');
  const MONTH_YEAR = document.getElementById('monthYear');
  const PREV = document.getElementById('prevMonth');
  const NEXT = document.getElementById('nextMonth');
  const TODAY_BTN = document.getElementById('todayBtn');
  const JUMP_DATE = document.getElementById('jumpDate');

  const SELECTED_TITLE = document.getElementById('selectedDateTitle');
  const REMINDERS_LIST = document.getElementById('remindersList');
  const REMINDER_COUNT = document.getElementById('reminderCount');
  const ADD_BTN = document.getElementById('addReminderBtn');
  const CLEAR_BTN = document.getElementById('clearDateBtn');

  const MODAL = document.getElementById('modal');
  const CLOSE_MODAL = document.getElementById('closeModal');
  const CANCEL_BTN = document.getElementById('cancelBtn');
  const FORM = document.getElementById('reminderForm');
  const TITLE = document.getElementById('title');
  const TIME = document.getElementById('time');
  const NOTES = document.getElementById('notes');
  const REMINDER_ID = document.getElementById('reminderId');
  const COLOR = document.getElementById('color');

  let viewDate = new Date(); // month being viewed
  let selectedDate = null; // "YYYY-MM-DD"
  const STORAGE_KEY = 'cal_reminders_2026';

  // For in-session notification dedupe: store keys like "YYYY-MM-DD|id|HH:MM"
  const notifiedKeys = new Set();

  function formatYMD(d) {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  function parseYMD(s) {
    const [y,m,d] = s.split('-').map(Number);
    return new Date(y,m-1,d);
  }

  function loadReminders() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    } catch {
      return {};
    }
  }

  function saveReminders(obj) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
  }

  function getRemindersFor(dateStr) {
    const all = loadReminders();
    return all[dateStr] ? JSON.parse(JSON.stringify(all[dateStr])) : []; // return copy
  }

  function setRemindersFor(dateStr, arr) {
    const all = loadReminders();
    if (!arr || arr.length === 0) {
      delete all[dateStr];
    } else {
      all[dateStr] = arr;
    }
    saveReminders(all);
  }

  function addReminder(dateStr, reminder) {
    const list = getRemindersFor(dateStr);
    list.push(reminder);
    setRemindersFor(dateStr, list);
  }

  function updateReminder(dateStr, id, newData) {
    const list = getRemindersFor(dateStr);
    const updated = list.map(r => r.id === id ? {...r, ...newData} : r);
    setRemindersFor(dateStr, updated);
  }

  function deleteReminder(dateStr, id) {
    const list = getRemindersFor(dateStr);
    const filtered = list.filter(r => r.id !== id);
    setRemindersFor(dateStr, filtered);
  }

  function deleteAllFor(dateStr) {
    setRemindersFor(dateStr, []);
  }

  function populateMonthYearControls() {
    // Month select
    const monthNames = [];
    for (let i = 0; i < 12; i++) monthNames.push(new Date(2020, i, 1).toLocaleString('es-ES', {month:'long'}));
    MONTH_SELECT.innerHTML = monthNames.map((m, i) => `<option value="${i}">${m}</option>`).join('');
    // Year select: range ±3 años
    const year = viewDate.getFullYear();
    const start = year - 3;
    YEAR_SELECT.innerHTML = '';
    for (let y = start; y <= year + 3; y++) {
      YEAR_SELECT.innerHTML += `<option value="${y}">${y}</option>`;
    }
    MONTH_SELECT.value = viewDate.getMonth();
    YEAR_SELECT.value = viewDate.getFullYear();

    MONTH_SELECT.addEventListener('change', () => {
      viewDate = new Date(viewDate.getFullYear(), Number(MONTH_SELECT.value), 1);
      renderCalendar();
    });
    YEAR_SELECT.addEventListener('change', () => {
      viewDate = new Date(Number(YEAR_SELECT.value), viewDate.getMonth(), 1);
      renderCalendar();
    });
  }

  function renderCalendar() {
    DAYS_CONTAINER.innerHTML = '';
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    MONTH_YEAR.textContent = viewDate.toLocaleString('es-ES', {month: 'long', year: 'numeric'});

    MONTH_SELECT.value = month;
    YEAR_SELECT.value = year;

    const first = new Date(year, month, 1);
    const startDay = first.getDay(); // 0 = Sun
    const last = new Date(year, month + 1, 0);
    const daysInMonth = last.getDate();
    const prevLast = new Date(year, month, 0).getDate();
    const totalCells = 42;

    for (let i = 0; i < totalCells; i++) {
      const cell = document.createElement('div');
      cell.className = 'day';
      let dayNumber, cellDate, outside = false;

      const idx = i - startDay + 1;
      if (i < startDay) {
        dayNumber = prevLast - (startDay - 1 - i);
        cell.classList.add('outside');
        cellDate = new Date(year, month - 1, dayNumber);
        outside = true;
      } else if (idx > daysInMonth) {
        dayNumber = idx - daysInMonth;
        cell.classList.add('outside');
        cellDate = new Date(year, month + 1, dayNumber);
        outside = true;
      } else {
        dayNumber = idx;
        cellDate = new Date(year, month, dayNumber);
      }

      const dateStr = formatYMD(cellDate);
      cell.dataset.date = dateStr;

      const num = document.createElement('div');
      num.className = 'date-number';
      num.textContent = dayNumber;
      cell.appendChild(num);

      // reminders summary
      const reminders = getRemindersFor(dateStr);
      if (reminders.length > 0) {
        // show up to 3 colored chips
        reminders.slice(0,3).forEach(r => {
          const chip = document.createElement('span');
          chip.className = 'reminder-chip';
          chip.style.background = r.color || 'var(--accent)';
          chip.title = `${r.time ? r.time + ' — ' : ''}${r.title}${r.notes ? '\n' + r.notes : ''}`;
          chip.textContent = (r.time ? `${r.time} ` : '') + r.title;
          cell.appendChild(chip);
        });
        if (reminders.length > 3) {
          const badge = document.createElement('div');
          badge.className = 'day-badge';
          badge.textContent = reminders.length;
          cell.appendChild(badge);
        }
        // set tooltip summarizing reminders
        const tip = reminders.map(r => `${r.time || '--'} • ${r.title}`).join('\n');
        cell.title = `${reminders.length} recordatorio(s)\n${tip}`;
      } else {
        cell.title = `Sin recordatorios`;
      }

      // highlight today
      const today = formatYMD(new Date());
      if (dateStr === today) cell.classList.add('today');

      // highlight selected
      if (selectedDate === dateStr) cell.classList.add('selected');

      cell.addEventListener('click', () => {
        // If clicked an outside day, also jump month
        selectDate(dateStr);
        const cellMonth = cellDate.getMonth();
        if (cellMonth !== viewDate.getMonth()) {
          viewDate = new Date(cellDate.getFullYear(), cellMonth, 1);
        }
        renderCalendar();
      });

      DAYS_CONTAINER.appendChild(cell);
    }
  }

  function selectDate(dateStr) {
    selectedDate = dateStr;
    const date = parseYMD(dateStr);
    SELECTED_TITLE.textContent = date.toLocaleDateString('es-ES', {weekday:'long', year:'numeric', month:'long', day:'numeric'});
    ADD_BTN.disabled = false;
    CLEAR_BTN.disabled = false;
    renderRemindersList();
    renderCalendar();
    // set jump date value
    JUMP_DATE.value = dateStr;
  }

  function renderRemindersList() {
    REMINDERS_LIST.innerHTML = '';
    if (!selectedDate) {
      REMINDERS_LIST.innerHTML = '<p class="muted">No hay fecha seleccionada.</p>';
      REMINDER_COUNT.textContent = '0 recordatorios';
      ADD_BTN.disabled = true;
      CLEAR_BTN.disabled = true;
      return;
    }
    const list = getRemindersFor(selectedDate).slice().sort((a,b) => (a.time||'') > (b.time||'') ? 1 : -1);
    REMINDER_COUNT.textContent = `${list.length} recordatorio${list.length===1?'':'s'}`;
    if (list.length === 0) {
      REMINDERS_LIST.innerHTML = '<p class="muted">No hay recordatorios para esta fecha.</p>';
      return;
    }

    list.forEach(r => {
      const item = document.createElement('div');
      item.className = 'reminder-item';
      const top = document.createElement('div');
      top.className = 'reminder-top';

      const titleWrap = document.createElement('div');
      titleWrap.className = 'reminder-title';
      const dot = document.createElement('span');
      dot.className = 'color-dot';
      dot.style.background = r.color || 'var(--accent)';
      titleWrap.appendChild(dot);
      const title = document.createElement('div');
      title.textContent = r.title;
      titleWrap.appendChild(title);
      top.appendChild(titleWrap);

      const timeDiv = document.createElement('div');
      timeDiv.className = 'muted';
      timeDiv.textContent = r.time || '';
      top.appendChild(timeDiv);

      item.appendChild(top);

      if (r.notes) {
        const meta = document.createElement('div');
        meta.className = 'reminder-meta';
        const left = document.createElement('div');
        left.textContent = r.time || '';
        left.style.color = 'var(--muted)';
        meta.appendChild(left);

        const right = document.createElement('div');
        right.style.color = 'var(--muted)';
        right.textContent = r.notes;
        right.title = r.notes;
        meta.appendChild(right);
        item.appendChild(meta);
      }

      const actions = document.createElement('div');
      actions.className = 'reminder-actions';
      const editBtn = document.createElement('button');
      editBtn.className = 'small-btn';
      editBtn.textContent = 'Editar';
      editBtn.addEventListener('click', () => openEditModal(r));
      const delBtn = document.createElement('button');
      delBtn.className = 'small-btn';
      delBtn.style.borderColor = 'var(--danger)';
      delBtn.style.color = 'var(--danger)';
      delBtn.textContent = 'Borrar';
      delBtn.addEventListener('click', () => {
        if (confirm('¿Eliminar este recordatorio?')) {
          deleteReminder(selectedDate, r.id);
          renderRemindersList();
          renderCalendar();
        }
      });
      actions.appendChild(editBtn);
      actions.appendChild(delBtn);
      item.appendChild(actions);

      REMINDERS_LIST.appendChild(item);
    });
  }

  function openModal() {
    MODAL.setAttribute('aria-hidden','false');
    TITLE.focus();
  }

  function closeModal() {
    MODAL.setAttribute('aria-hidden','true');
    FORM.reset();
    REMINDER_ID.value = '';
    COLOR.value = '#3b82f6';
  }

  function openAddModal() {
    REMINDER_ID.value = '';
    TITLE.value = '';
    TIME.value = '';
    NOTES.value = '';
    COLOR.value = '#3b82f6';
    document.getElementById('modalTitle').textContent = 'Añadir recordatorio';
    openModal();
  }

  function openEditModal(reminder) {
    REMINDER_ID.value = reminder.id;
    TITLE.value = reminder.title;
    TIME.value = reminder.time || '';
    NOTES.value = reminder.notes || '';
    COLOR.value = reminder.color || '#3b82f6';
    document.getElementById('modalTitle').textContent = 'Editar recordatorio';
    openModal();
  }

  FORM.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = REMINDER_ID.value || String(Date.now());
    const data = {
      id,
      title: TITLE.value.trim(),
      time: TIME.value,
      notes: NOTES.value.trim(),
      color: COLOR.value
    };
    if (!selectedDate) {
      alert('Selecciona primero una fecha.');
      return;
    }
    if (REMINDER_ID.value) {
      updateReminder(selectedDate, id, data);
    } else {
      addReminder(selectedDate, data);
    }
    closeModal();
    renderRemindersList();
    renderCalendar();
  });

  ADD_BTN.addEventListener('click', openAddModal);
  CLOSE_MODAL.addEventListener('click', closeModal);
  CANCEL_BTN.addEventListener('click', closeModal);
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });

  PREV.addEventListener('click', () => {
    viewDate = new Date(viewDate.getFullYear(), viewDate.getMonth()-1, 1);
    renderCalendar();
  });
  NEXT.addEventListener('click', () => {
    viewDate = new Date(viewDate.getFullYear(), viewDate.getMonth()+1, 1);
    renderCalendar();
  });

  TODAY_BTN.addEventListener('click', () => {
    const today = new Date();
    viewDate = new Date(today.getFullYear(), today.getMonth(), 1);
    selectDate(formatYMD(today));
    renderCalendar();
  });

  JUMP_DATE.addEventListener('change', () => {
    if (!JUMP_DATE.value) return;
    const d = parseYMD(JUMP_DATE.value);
    viewDate = new Date(d.getFullYear(), d.getMonth(), 1);
    selectDate(JUMP_DATE.value);
    renderCalendar();
  });

  CLEAR_BTN.addEventListener('click', () => {
    if (!selectedDate) return;
    if (confirm('¿Borrar todos los recordatorios de esta fecha?')) {
      deleteAllFor(selectedDate);
      renderRemindersList();
      renderCalendar();
    }
  });

  // Notification helpers
  function requestNotificationPermission() {
    if (!('Notification' in window)) return;
    if (Notification.permission === 'default') {
      Notification.requestPermission().then(() => {});
    }
  }

  function showNotification(title, body) {
    if (!('Notification' in window)) return;
    if (Notification.permission !== 'granted') return;
    try {
      new Notification(title, {body});
    } catch (e) {
      // ignore
    }
  }

  function checkDueReminders() {
    // runs frequently to show notifications for reminders whose time is now
    const now = new Date();
    const ymd = formatYMD(now);
    const reminders = getRemindersFor(ymd);
    const minute = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;

    reminders.forEach(r => {
      if (!r.time) return;
      if (r.time === minute) {
        const key = `${ymd}|${r.id}|${r.time}`;
        if (!notifiedKeys.has(key)) {
          notifiedKeys.add(key);
          showNotification('Recordatorio: ' + r.title, `${r.time} — ${r.notes || ''}`);
        }
      }
    });
  }

  // Init
  (function init(){
    populateMonthYearControls();
    renderCalendar();
    // select today by default
    selectDate(formatYMD(new Date()));
    // request notifications on load (optional)
    requestNotificationPermission();
    // check every 20 seconds for due reminders
    setInterval(checkDueReminders, 20 * 1000);
  })();
})();
