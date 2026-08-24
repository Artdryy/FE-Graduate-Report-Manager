import React, { useState, useEffect, useMemo } from 'react';
import { semestersService } from '../services/semestersService';
import PageHeader from '../components/common/PageHeader';
import DataTable from '../components/common/DataTable';
import SearchBar from '../components/common/SearchBar';
import Modal from '../components/common/Modal';
import SemesterForm from '../components/semesters/SemesterForm';
import { useAuth } from '../context/AuthContext';
import { PERIODOS, buildSemesterLabel, sortSemesterObjects } from '../utils/semesters';

/** Descompone "Agosto - Diciembre 1998" en { periodo, anio } para poder editarlo. */
const parseSemester = (etiqueta = '') => {
  const partes = String(etiqueta).trim().split(' ');
  const anio = partes[partes.length - 1];
  const periodo = partes.slice(0, -1).join(' ');
  const esCanonico = /^\d{4}$/.test(anio) && Object.values(PERIODOS).includes(periodo);

  if (!esCanonico) {
    return { periodo: PERIODOS.PRIMERO, anio: '', libre: etiqueta, usarTextoLibre: true };
  }
  return { periodo, anio, libre: '', usarTextoLibre: false };
};

const formularioVacio = () => ({
  periodo: PERIODOS.PRIMERO,
  anio: String(new Date().getFullYear()),
  libre: '',
  usarTextoLibre: false,
});

const SemestersPage = () => {
  const [semesters, setSemesters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentSemester, setCurrentSemester] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');

  const { permissions } = useAuth();

  // Los endpoints de semestres estan protegidos por el modulo Reports
  // (ver routes/semester.routes.js en el backend).
  const can = useMemo(() => permissions['Reports']?.permissions || {}, [permissions]);

  const fetchSemesters = async () => {
    setLoading(true);
    try {
      const data = await semestersService.getSemesters();
      setSemesters([...(data || [])].sort(sortSemesterObjects));
    } catch (err) {
      console.error("Failed to load semesters", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSemesters();
  }, []);

  const semestresFiltrados = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return semesters;
    return semesters.filter((s) => String(s.semester).toLowerCase().includes(q));
  }, [semesters, searchQuery]);

  const handleAdd = () => {
    setError('');
    setCurrentSemester(formularioVacio());
    setIsModalOpen(true);
  };

  const handleEdit = (semester) => {
    setError('');
    setCurrentSemester({ id: semester.id, ...parseSemester(semester.semester) });
    setIsModalOpen(true);
  };

  const handleDelete = async (semester) => {
    if (window.confirm(`¿Está seguro de que quiere eliminar el semestre "${semester.semester}"?`)) {
      try {
        await semestersService.deleteSemester(semester.id);
        fetchSemesters();
      } catch (err) {
        const mensaje = err?.response?.data?.message
          || 'No se pudo eliminar el semestre. Puede tener informes asociados.';
        window.alert(mensaje);
      }
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentSemester(null);
    setError('');
  };

  const etiquetaActual = () => {
    if (currentSemester.usarTextoLibre) return (currentSemester.libre || '').trim();
    return buildSemesterLabel(currentSemester.periodo, String(currentSemester.anio).trim());
  };

  const handleSubmit = async () => {
    const semester = etiquetaActual();

    if (!semester || (!currentSemester.usarTextoLibre && !String(currentSemester.anio).trim())) {
      setError('Indica el periodo y el año del semestre.');
      return;
    }

    try {
      if (currentSemester.id) {
        await semestersService.updateSemester({ semester_id: currentSemester.id, semester });
      } else {
        await semestersService.createSemester({ semester });
      }
      handleCloseModal();
      fetchSemesters();
    } catch (err) {
      setError(err?.response?.data?.message || 'No se pudo guardar el semestre.');
    }
  };

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'semester', label: 'Semestre' },
  ];

  const estiloDeshabilitado = {
    opacity: 0.5,
    cursor: 'not-allowed',
    backgroundColor: '#ccc',
    border: '1px solid #999',
  };

  const renderSemesterActions = (semester) => (
    <div className="actions-cell">
      <button
        onClick={() => can.UPDATE && handleEdit(semester)}
        className="btn-edit"
        disabled={!can.UPDATE}
        title={can.UPDATE ? "Editar" : "Permisos insuficientes"}
        style={!can.UPDATE ? estiloDeshabilitado : {}}
      >
        <i className="fas fa-pencil-alt"></i>
      </button>
      <button
        onClick={() => can.DELETE && handleDelete(semester)}
        className="btn-delete"
        disabled={!can.DELETE}
        title={can.DELETE ? "Eliminar" : "Permisos insuficientes"}
        style={!can.DELETE ? estiloDeshabilitado : {}}
      >
        <i className="fas fa-trash"></i>
      </button>
    </div>
  );

  return (
    <div className="page-container">
      <PageHeader title="Gestión de Semestres" onAdd={handleAdd} showAddButton={can.CREATE === 1} />

      <p className="page-description">
        Los dos semestres del año en curso se crean automáticamente. Usa
        «Agregar» para capturar semestres anteriores.
      </p>

      <SearchBar placeholder="Buscar semestre..." onSearch={setSearchQuery} />

      <DataTable
        columns={columns}
        data={semestresFiltrados}
        loading={loading}
        renderActions={renderSemesterActions}
      />

      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSubmit={handleSubmit}
          title={currentSemester?.id ? 'Editar Semestre' : 'Agregar Semestre'}
        >
          <SemesterForm semester={currentSemester} setSemester={setCurrentSemester} />
          {error && <p className="error-message">{error}</p>}
        </Modal>
      )}
    </div>
  );
};

export default SemestersPage;
