```markdown
# Calendario 2026 - Recordatorios (mejorado)

Mejoras incluidas:
- Selección de mes y año con selects.
- Botón "Hoy" y entrada de fecha para saltar rápidamente a cualquier día.
- Visualización compacta de recordatorios en cada casilla del calendario.
- Badge con el número de recordatorios cuando hay más de 3.
- Color por recordatorio (selector en el modal).
- Borrar todos los recordatorios de una fecha.
- Notificaciones del navegador cuando llegue la hora del recordatorio (requiere permiso y que la pestaña esté abierta).
- Mejoras de accesibilidad y responsive.

Cómo usar:
1. Abre `index.html` en el navegador.
2. Usa las flechas o los selects para cambiar de mes/año. Usa "Hoy" para volver a la fecha actual.
3. Haz clic en un día para seleccionarlo. El panel lateral mostrará los recordatorios.
4. Pulsa "Añadir recordatorio" para crear uno (puedes elegir hora, notas y color).
5. Si permites notificaciones, recibirás alertas cuando la hora del recordatorio llegue (mientras la pestaña esté abierta).

Limitaciones y mejoras posibles:
- Persistencia local con localStorage: no hay sincronización entre dispositivos.
- Notificaciones solo funcionan si la página está abierta (no hay service worker).
- Posibles mejoras: integración con Google Calendar / backend, recordatorios recurrentes, envío de notificaciones push (con service worker), filtros por etiqueta.
```
