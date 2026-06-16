import { useState, useEffect } from 'react';

export default function CronogramaFormModal({ isOpen, onClose, onSave, item = null }) {
  const isEditing = Boolean(item);

  const [formData, setFormData] = useState({
    horaInicio: '',
    duracionEstimada: '',
    actividad: '',
    responsable: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (item) {
        setFormData({ ...item });
      } else {
        setFormData({
          horaInicio: '',
          duracionEstimada: '',
          actividad: '',
          responsable: '',
        });
      }
      setErrors({});
    }
  }, [isOpen, item]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.horaInicio.trim()) newErrors.horaInicio = 'Requerido';
    if (!formData.actividad.trim()) newErrors.actividad = 'Requerido';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    setIsSubmitting(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      // Manejado en el padre
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-800">
            {isEditing ? 'Editar Ítem' : 'Nuevo Ítem de Cronograma'}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
            disabled={isSubmitting}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Hora Inicio *</label>
              <input
                type="time"
                name="horaInicio"
                value={formData.horaInicio}
                onChange={handleChange}
                className={`w-full rounded-md border ${errors.horaInicio ? 'border-red-500' : 'border-slate-300'} px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500`}
                disabled={isSubmitting}
              />
              {errors.horaInicio && <p className="mt-1 text-xs text-red-500">{errors.horaInicio}</p>}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Duración Est.</label>
              <input
                type="text"
                name="duracionEstimada"
                placeholder="Ej: 30 min"
                value={formData.duracionEstimada}
                onChange={handleChange}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Actividad/Descripción *</label>
            <input
              type="text"
              name="actividad"
              value={formData.actividad}
              onChange={handleChange}
              className={`w-full rounded-md border ${errors.actividad ? 'border-red-500' : 'border-slate-300'} px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500`}
              disabled={isSubmitting}
            />
            {errors.actividad && <p className="mt-1 text-xs text-red-500">{errors.actividad}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Responsable</label>
            <input
              type="text"
              name="responsable"
              placeholder="Ej: Catering, DJ, etc."
              value={formData.responsable}
              onChange={handleChange}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              disabled={isSubmitting}
            />
          </div>

          <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
