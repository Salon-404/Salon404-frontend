const fs = require('fs');

const files = [
  'src/utils/eventos.test.js',
  'src/utils/eventos.js',
  'src/services/eventosService.js',
  'src/pages/eventos/EventoNuevoPage.jsx',
  'src/pages/eventos/CalendarioEventosPage.jsx',
  'src/mocks/tiposEventoMock.js',
  'src/mocks/eventosMock.js',
  'src/hooks/useTiposEvento.js',
  'src/hooks/useReducedMotion.js',
  'src/hooks/useEventos.js',
  'src/hooks/useCalendarSummary.js',
  'src/hooks/useCalendarRole.js',
  'src/constants/auth.js',
  'src/components/eventos/PopoverContent.jsx',
  'src/components/eventos/EstadoEventoBadge.jsx',
  'src/components/eventos/DayEventsPopover.test.jsx'
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    // Reemplaza los bloques de conflicto manteniendo solo la parte de HEAD
    // Regex explanation:
    // <<<<<<< HEAD(?:.*?)[\r\n]+  -> Match the HEAD marker line and newline
    // ([\s\S]*?)                  -> Capture the HEAD content
    // [\r\n]+=======              -> Match newline and the separator
    // [\s\S]*?                    -> Match the develop content
    // [\r\n]+>>>>>>> [^\r\n]*     -> Match newline and the develop marker line
    const regex = /<<<<<<< HEAD[^\r\n]*[\r\n]+([\s\S]*?)[\r\n]+=======[\s\S]*?[\r\n]+>>>>>>> [^\r\n]*/g;
    
    if (content.match(regex)) {
      const newContent = content.replace(regex, '$1');
      fs.writeFileSync(file, newContent, 'utf8');
      console.log(`Resolved: ${file}`);
    } else {
      console.log(`No conflicts found or regex didn't match: ${file}`);
    }
  } else {
    console.log(`File not found: ${file}`);
  }
});
