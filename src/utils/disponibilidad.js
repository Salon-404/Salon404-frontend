/**
 * Convierte hora en formato "HH:MM" a minutos desde medianoche
 * @param {string} hora - Hora en formato "HH:MM"
 * @returns {number} Minutos desde medianoche
 */
export function convertirHoraAMinutos(hora) {
  const [horas, minutos] = hora.split(':').map(Number)
  return horas * 60 + minutos
}

/**
 * Convierte minutos desde medianoche a formato "HH:MM"
 * @param {number} minutos - Minutos desde medianoche
 * @returns {string} Hora en formato "HH:MM"
 */
export function convertirMinutosAHora(minutos) {
  const horas = Math.floor(minutos / 60) % 24
  const mins = minutos % 60
  return `${String(horas).padStart(2, '0')}:${String(mins).padStart(2, '0')}`
}

/**
 * Verifica si dos rangos de tiempo se solapan
 * @param {number} inicio1 - Inicio del primer rango (minutos)
 * @param {number} fin1 - Fin del primer rango (minutos)
 * @param {number} inicio2 - Inicio del segundo rango (minutos)
 * @param {number} fin2 - Fin del segundo rango (minutos)
 * @returns {boolean} True si se solapan
 */
export function seSolapan(inicio1, fin1, inicio2, fin2) {
  return inicio1 < fin2 && inicio2 < fin1
}

/**
 * Valida que un horario esté dentro de la ventana de apertura del salón
 * @param {number} inicio - Hora de inicio (minutos)
 * @param {number} fin - Hora de fin (minutos)
 * @param {number} apertura - Hora de apertura (minutos)
 * @param {number} cierre - Hora de cierre (minutos)
 * @returns {boolean} True si está dentro de la ventana
 */
export function validarHorarioEnVentana(inicio, fin, apertura, cierre) {
  // Si la ventana cruza medianoche (cierre < apertura), ajustar
  if (cierre < apertura) {
    // Si el horario está en la parte después de medianoche
    if (fin <= cierre + 1440) {
      return inicio >= apertura || fin <= cierre + 1440
    }
    return false
  }
  
  // Ventana normal (mismo día)
  return inicio >= apertura && fin <= cierre
}

/**
 * Obtiene el día de la semana en formato de clave (lunes, martes, etc.)
 * @param {string} fecha - Fecha en formato YYYY-MM-DD
 * @returns {string} Día de la semana
 */
function obtenerDiaSemana(fecha) {
  const dias = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado']
  const date = new Date(fecha + 'T12:00:00') // Usar mediodía para evitar problemas de timezone
  return dias[date.getDay()]
}

/**
 * Calcula los horarios disponibles para un día específico
 * @param {string} fecha - Fecha en formato YYYY-MM-DD
 * @param {Object} tipoEvento - Tipo de evento con duracionMaximaMinutos
 * @param {Array} reservas - Reservas existentes en ese día
 * @param {Object} configSalon - Configuración del salón
 * @returns {Array} Lista de horarios disponibles { inicio, fin }
 */
export function calcularHorariosDisponibles(fecha, tipoEvento, reservas, configSalon) {
  const diaSemana = obtenerDiaSemana(fecha)
  const horarioDia = configSalon.horarios[diaSemana]
  
  if (!horarioDia || !horarioDia.abierto) {
    return []
  }
  
  const apertura = convertirHoraAMinutos(horarioDia.apertura)
  const cierre = convertirHoraAMinutos(horarioDia.cierre)
  const duracionEvento = tipoEvento.duracionMaximaMinutos
  const tiempoLimpieza = configSalon.tiempoLimpiezaMinutos
  
  // Si la duración del evento es mayor que la ventana, no hay horarios disponibles
  const ventanaMinutos = cierre > apertura ? cierre - apertura : (1440 - apertura) + cierre
  if (duracionEvento > ventanaMinutos) {
    return []
  }
  
  // Convertir reservas a rangos con tiempo de limpieza incluido
  const rangosOcupados = reservas.map(r => {
    const inicio = convertirHoraAMinutos(r.horaInicio)
    const fin = convertirHoraAMinutos(r.horaFin) + tiempoLimpieza
    return { inicio, fin }
  })
  
  const horariosDisponibles = []
  const incremento = 30 // Incrementos de 30 minutos
  
  // Generar todos los horarios posibles
  for (let horaInicio = apertura; horaInicio + duracionEvento <= cierre; horaInicio += incremento) {
    const horaFin = horaInicio + duracionEvento
    
    // Verificar que no se solape con ninguna reserva existente
    const hayConflicto = rangosOcupados.some(ocupado =>
      seSolapan(horaInicio, horaFin, ocupado.inicio, ocupado.fin)
    )
    
    if (!hayConflicto) {
      horariosDisponibles.push({
        inicio: convertirMinutosAHora(horaInicio),
        fin: convertirMinutosAHora(horaFin),
      })
    }
  }
  
  return horariosDisponibles
}
