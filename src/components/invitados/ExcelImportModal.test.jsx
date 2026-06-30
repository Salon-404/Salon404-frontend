import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import ExcelImportModal from './ExcelImportModal';

const mockUseExcelImport = vi.fn();

vi.mock('../../hooks/useExcelImport', () => ({
  useExcelImport: () => mockUseExcelImport(),
}));

const defaultHookState = {
  step: 1,
  setStep: vi.fn(),
  file: null,
  preview: null,
  loading: false,
  error: null,
  result: null,
  handleFileSelect: vi.fn(),
  handleImport: vi.fn(),
  handleDownloadTemplate: vi.fn(),
  reset: vi.fn(),
};

function renderModal(hookOverrides = {}, modalProps = {}) {
  const hookState = { ...defaultHookState, ...hookOverrides };
  mockUseExcelImport.mockReturnValue(hookState);

  return render(
    <MemoryRouter>
      <ExcelImportModal
        eventId="ev-1"
        onClose={vi.fn()}
        onSuccess={vi.fn()}
        {...modalProps}
      />
    </MemoryRouter>,
  );
}

describe('ExcelImportModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseExcelImport.mockReturnValue(defaultHookState);
  });

  it('renders modal with step 1 — stepper shows 3 steps, step 1 is active', () => {
    renderModal();

    expect(screen.getByText('Subir archivo')).toBeInTheDocument();
    expect(screen.getByText('Previsualizar')).toBeInTheDocument();
    expect(screen.getByText('Enviar')).toBeInTheDocument();

    // Stepper circles: step 1 should be active (has bg-indigo-600)
    const circles = screen.getByText('1').closest('div');
    expect(circles.className).toContain('bg-indigo-600');
  });

  it('close button calls onClose', async () => {
    const onClose = vi.fn();
    renderModal({}, { onClose });

    await userEvent.click(screen.getByTestId('btn-cerrar'));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('overlay click calls onClose', async () => {
    const onClose = vi.fn();
    renderModal({}, { onClose });

    await userEvent.click(screen.getByTestId('modal-overlay'));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('"Siguiente" disabled without file', () => {
    renderModal({ file: null });

    const btn = screen.getByTestId('btn-siguiente');
    expect(btn).toBeDisabled();
  });

  it('drop zone calls handleFileSelect on file drop', async () => {
    const handleFileSelect = vi.fn();
    renderModal({ step: 1, handleFileSelect });

    const dropZone = screen.getByText(
      'Arrastrá tu archivo .xlsx aquí o hacé clic para seleccionar',
    ).closest('div');

    const file = new File(['test'], 'test.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

    await act(async () => {
      const dropEvent = new Event('drop', { bubbles: true });
      Object.defineProperty(dropEvent, 'dataTransfer', {
        value: { files: [file] },
      });
      dropZone.dispatchEvent(dropEvent);
    });

    expect(handleFileSelect).toHaveBeenCalledWith(file);
  });

  it('file input calls handleFileSelect on file selection', async () => {
    const handleFileSelect = vi.fn();
    renderModal({ step: 1, handleFileSelect });

    const fileInput = screen.getByTestId('file-input');
    const file = new File(['test'], 'test.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

    await userEvent.upload(fileInput, file);

    expect(handleFileSelect).toHaveBeenCalledWith(file);
  });

  it('"Descargar plantilla" calls handleDownloadTemplate', async () => {
    const handleDownloadTemplate = vi.fn();
    renderModal({ step: 1, handleDownloadTemplate });

    await userEvent.click(screen.getByText('Descargar plantilla oficial'));

    expect(handleDownloadTemplate).toHaveBeenCalledTimes(1);
  });

  it('shows error banner when error is set', () => {
    renderModal({ step: 1, error: 'EXTENSION_INVALIDA' });

    expect(
      screen.getByText(
        'Solo se aceptan archivos .xlsx. Descargá la plantilla oficial para asegurar compatibilidad.',
      ),
    ).toBeInTheDocument();
  });

  it('step 2 shows preview table', () => {
    const preview = {
      rows: [
        { rowNumber: 2, fullName: 'Ana García', phone: '123', email: 'ana@test.com', isValid: true },
        { rowNumber: 3, fullName: '', phone: '456', email: '', isValid: false },
      ],
      validCount: 1,
      skippedCount: 1,
      totalRows: 2,
      fileName: 'invitados.xlsx',
    };

    renderModal({ step: 2, preview });

    expect(screen.getByText('Ana García')).toBeInTheDocument();
    expect(screen.getByText('(sin nombre)')).toBeInTheDocument();
    expect(screen.getByText('123')).toBeInTheDocument();
    expect(screen.getByText('ana@test.com')).toBeInTheDocument();
    expect(screen.getByText('Válida')).toBeInTheDocument();
    expect(screen.getByText('Omitida')).toBeInTheDocument();
  });

  it('step 2 shows valid/skipped counts', () => {
    const preview = {
      rows: [
        { rowNumber: 2, fullName: 'Ana García', phone: '123', email: 'ana@test.com', isValid: true },
        { rowNumber: 3, fullName: 'Carlos López', phone: '456', email: 'carlos@test.com', isValid: true },
        { rowNumber: 4, fullName: '', phone: '', email: '', isValid: false },
      ],
      validCount: 2,
      skippedCount: 1,
      totalRows: 3,
      fileName: 'invitados.xlsx',
    };

    renderModal({ step: 2, preview });

    expect(screen.getByText('2 filas válidas')).toBeInTheDocument();
    expect(screen.getByText('1 filas omitidas (sin nombre)')).toBeInTheDocument();
  });

  it('"Volver" in step 2 goes to step 1', async () => {
    const setStep = vi.fn();
    const preview = {
      rows: [{ rowNumber: 2, fullName: 'Ana', phone: '123', email: 'a@b.com', isValid: true }],
      validCount: 1,
      skippedCount: 0,
      totalRows: 1,
      fileName: 'test.xlsx',
    };

    renderModal({ step: 2, setStep, preview });

    await userEvent.click(screen.getByText('Volver'));

    expect(setStep).toHaveBeenCalledWith(1);
  });

  it('"Confirmar y enviar" calls handleImport', async () => {
    const handleImport = vi.fn();
    const preview = {
      rows: [{ rowNumber: 2, fullName: 'Ana', phone: '123', email: 'a@b.com', isValid: true }],
      validCount: 1,
      skippedCount: 0,
      totalRows: 1,
      fileName: 'test.xlsx',
    };

    renderModal({ step: 2, preview, handleImport });

    await userEvent.click(screen.getByTestId('btn-confirmar-enviar'));

    expect(handleImport).toHaveBeenCalledTimes(1);
  });

  it('step 3 shows spinner', () => {
    renderModal({ step: 3, loading: true, preview: { validCount: 5 } });

    expect(screen.getByText('Importando 5 invitados...')).toBeInTheDocument();
    expect(screen.getByText('Esto puede tardar unos segundos. No cierres esta ventana.')).toBeInTheDocument();
  });

  it('step 3 shows error and "Volver" button', async () => {
    const reset = vi.fn();
    renderModal({ step: 3, loading: false, error: 'ERROR_RED', reset });

    expect(
      screen.getByText('No se pudo conectar con el servidor. Revisá tu conexión.'),
    ).toBeInTheDocument();

    await userEvent.click(screen.getByText('Volver'));

    expect(reset).toHaveBeenCalledTimes(1);
  });

  it('success calls onSuccess and onClose after timeout', async () => {
    vi.useFakeTimers();

    const onSuccess = vi.fn();
    const onClose = vi.fn();
    const result = { message: 'Importación exitosa', totalImported: 5 };

    renderModal({ step: 3, loading: false, result }, { onSuccess, onClose });

    // Check that the success message is displayed
    expect(screen.getByText('¡Importación completada!')).toBeInTheDocument();
    expect(screen.getByText('Se importaron 5 invitados correctamente.')).toBeInTheDocument();

    // Advance timers by 1 second
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(onSuccess).toHaveBeenCalledWith(result);
    expect(onClose).toHaveBeenCalledTimes(1);

    vi.useRealTimers();
  });
});
