// Simple calendar + reminders stored in localStorage
(() => {
  const DAYS_CONTAINER = document.getElementById('days');
  const MONTH_YEAR = document.getElementById('monthYear');
  const PREV = document.getElementById('prevMonth');
  const NEXT = document.getElementById('nextMonth');
  const SELECTED_TITLE = document.getElementById('selectedDateTitle');
  const REMINDERS_LIST = document.getElementById('remindersList');
  const ADD_BTN = document.getElementById('addReminderBtn');

  const MODAL = document.getElementById('modal');
  const CLOSE_MODAL = document.getElementById('closeModal');
  const CANCEL_BTN = document.getElementById('cancelBtn');
  const FORM = document.getElementById('reminderForm');
  const TITLE = document.getElementById('title');
  const TIME = document.getElementById('time');
  const NOTES = document.getElementById('notes');
  const REMINDER_ID = document.getElementById('reminderId');

  let viewDate = new Date(); // current month view
  let selectedDate = null; // "YYYY-MM-DD"
  const STORAGE_KEY = 'cal_reminders_2026';

  function formatYMD(d) {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
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
    return all[dateStr] || [];
  }

  function addReminder(dateStr, reminder) {
    const all = loadReminders();
    all[dateStr] = all[dateStr] || [];
    all[dateStr].push(reminder);
    saveReminders(all);
  }

  function updateReminder(dateStr, id, newData) {
    const all = loadReminders();
    if (!all[dateStr]) return;
    all[dateStr] = all[dateStr].map(r => r.id === id ? {...r, ...newData} : r);
    saveReminders(all);
  }

  function deleteReminder(dateStr, id) {
    const all = loadReminders();
    if (!all[dateStr]) return;
    all[dateStr] = all[dateStr].filter(r => r.id !== id);
    saveReminders(all);
  }

  function renderCalendar() {
    DAYS_CONTAINER.innerHTML = '';
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    MONTH_YEAR.textContent = viewDate.toLocaleString('es-ES', {month: 'long', year: 'numeric'});

    // first day of month
    const first = new Date(year, month, 1);
    const startDay = first.getDay(); // 0 = Sun
    // last day
    const last = new Date(year, month + 1, 0);
    const daysInMonth = last.getDate();

    // previous month's trailing days
    const prevLast = new Date(year, month, 0).getDate();

    // 42 cells (6 weeks) to keep grid stable
    const totalCells = 42;
    for (let i = 0; i < totalCells; i++) {
      const cell = document.createElement('div');
      cell.className = 'day';
      let dayNumber, cellDate, outside = false;

      const idx = i - startDay + 1;
      if (i < startDay) {
        // previous month
        dayNumber = prevLast - (startDay - 1 - i);
        cell.classList.add('outside');
        cellDate = new Date(year, month - 1, dayNumber);
        outside = true;
      } else if (idx > daysInMonth) {
        // next month
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

      // show up to 3 reminders as chips
      const reminders = getRemindersFor(dateStr);
      reminders.slice(0,3).forEach(r => {
        const chip = document.createElement('span');
        chip.className = 'reminder-chip';
        chip.textContent = r.time ? `${r.time} ${r.title}` : r.title;
        cell.appendChild(chip);
      });

      // highlight today
      const today = formatYMD(new Date());
      if (dateStr === today) cell.classList.add('today');

      // highlight selected
      if (selectedDate === dateStr) cell.classList.add('selected');

      cell.addEventListener('click', () => {
        selectDate(dateStr);
      });

      DAYS_CONTAINER.appendChild(cell);
    }
  }

  function selectDate(dateStr) {
    selectedDate = dateStr;
    SELECTED_TITLE.textContent = new Date(dateStr).toLocaleDateString('es-ES', {weekday:'long', year:'numeric', month:'long', day:'numeric'});
    ADD_BTN.disabled = false;
    renderRemindersList();
    renderCalendar();
  }

  function renderRemindersList() {
    REMINDERS_LIST.innerHTML = '';
    if (!selectedDate) return;
    const list = getRemindersFor(selectedDate).slice().sort((a,b) => (a.time||'') > (b.time||'') ? 1 : -1);
    if (list.length === 0) {
      REMINDERS_LIST.innerHTML = '<p style="color:var(--muted)">No hay recordatorios para esta fecha.</p>';
      return;
    }

    list.forEach(r => {
      const item = document.createElement('div');
      item.className = 'reminder-item';
      const title = document.createElement('div');
      title.textContent = r.title;
      title.style.fontWeight = '700';
      item.appendChild(title);

      if (r.time || r.notes) {
        const meta = document.createElement('div');
        meta.className = 'reminder-meta';
        const left = document.createElement('div');
        left.textContent = r.time || '';
        left.style.color = 'var(--muted)';
        meta.appendChild(left);

        const right = document.createElement('div');
        right.style.color = 'var(--muted)';
        right.textContent = r.notes ? `${r.notes.substring(0,50)}${r.notes.length>50?'…':''}` : '';
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
  }

  function openAddModal() {
    REMINDER_ID.value = '';
    TITLE.value = '';
    TIME.value = '';
    NOTES.value = '';
    document.getElementById('modalTitle').textContent = 'Añadir recordatorio';
    openModal();
  }

  function openEditModal(reminder) {
    REMINDER_ID.value = reminder.id;
    TITLE.value = reminder.title;
    TIME.value = reminder.time || '';
    NOTES.value = reminder.notes || '';
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
      notes: NOTES.value.trim()
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

  // Initialize to today
  (function init(){
    renderCalendar();
    // Select today's date by default
    selectDate(formatYMD(new Date()));
  })();
})();
