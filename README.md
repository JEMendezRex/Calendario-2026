```markdown
# Calendario 2026 - Recordatorios (corrección)

Qué arreglé:
- Añadí el elemento `div#monthYear` al HTML para mostrar el mes/año — esto evita el error JS que detenía la ejecución y hacía que el calendario no se pintara.
- Verifiqué que los ids en index.html coincidan con los que usa app.js (monthSelect, yearSelect, prevMonth, nextMonth, todayBtn, jumpDate, days, modal, closeModal, etc.).
- Mantengo las mejoras solicitadas: selects de mes y año, botón "Hoy", jump date, colores, badge, notificaciones en pestaña.

Cómo probar:
1. Reemplaza tus archivos por los anteriores (index.html, style.css, app.js).
2. Abre `index.html` en tu navegador.
3. Si no ves el calendario, abre la consola (F12) y pega aquí el mensaje de error exacto para corregirlo.

Siguiente (opcional):
- Puedo integrarlo en tu repo `JEMendezRex/Calendario-2026` en una rama (ej. `feature/calendar-fix`) y abrir un PR.
- Si quieres que lo adapte (por ejemplo, eventos recurrentes o sincronización con Google Calendar), dime cuál y lo implemento.
```
