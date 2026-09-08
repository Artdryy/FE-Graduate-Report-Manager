import React, { useState, useEffect, useMemo } from 'react';
import { reportsService } from '../services/reportsService';
import { semestersService } from '../services/semestersService';
import PageHeader from '../components/common/PageHeader';
import SearchBar from '../components/common/SearchBar';
import Modal from '../components/common/Modal';
import ReportForm from '../components/reports/ReportForm';
import KeywordsModal from '../components/keywords/KeywordsModal';
import { useAuth } from '../context/AuthContext';
import { sortSemesters } from '../utils/semesters';
import { mensajeDeError } from '../utils/apiError';


const ReportsPage = () => {
  const [reports, setReports] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSemester, setSelectedSemester] = useState('');
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [currentReport, setCurrentReport] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isKeywordsModalOpen, setIsKeywordsModalOpen] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [pdfError, setPdfError] = useState('');
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false); 
  const [currentPage, setCurrentPage] = useState(1);
  const reportsPerPage = 15;
  const { permissions } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const availableSemesters = useMemo(() => {
    if (!Array.isArray(reports)) return [];
    const semestersSet = new Set();
    reports.forEach(r => {
      if (r && r.semester && String(r.semester).trim() !== '') {
        semestersSet.add(String(r.semester).trim());
      }
    });
    return Array.from(semestersSet).sort(sortSemesters);
  }, [reports]);

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      try {
        const [reportsData, semestersData] = await Promise.all([
          reportsService.getReports(),
          semestersService.getSemesters()
        ]);
        setReports(reportsData || []);
        setSemesters(semestersData || []);
      } catch (err) {
        console.error("Failed to load reports", err);
        setReports([]);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  const processedReports = useMemo(() => {
    let filtered = reports;
    if (searchQuery) {
      const terms = searchQuery.toLowerCase().split(/\s+/).filter(t => t.length > 0);

      filtered = filtered.filter(report => {
        return terms.every(term => {
          const inTitle = report.report_title?.toLowerCase().includes(term);
          const inStudent = report.student_name?.toLowerCase().includes(term);
          const inControlNum = report.control_number?.toLowerCase().includes(term);
          const inCompany = report.company_name?.toLowerCase().includes(term);
          const inArea = report.work_area?.toLowerCase().includes(term);
          const inKeywords = report.keyword_names?.some(k => k.toLowerCase().includes(term));
          
          return inTitle || inStudent || inControlNum || inCompany || inArea || inKeywords;
        });
      });
    }

    if (selectedSemester) {
      filtered = filtered.filter(report => report.semester === selectedSemester);
    }
    return filtered.sort((a, b) => sortSemesters(a.semester, b.semester));
  }, [reports, searchQuery, selectedSemester]);

  const currentReports = useMemo(() => {
    const indexOfLastReport = currentPage * reportsPerPage;
    const indexOfFirstReport = indexOfLastReport - reportsPerPage;
    return processedReports.slice(indexOfFirstReport, indexOfLastReport);
  }, [processedReports, currentPage, reportsPerPage]);

  const totalPages = Math.ceil(processedReports.length / reportsPerPage);
  const can = useMemo(() => permissions['Reports']?.permissions || {}, [permissions]);

  const handleNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const handlePrevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));
  
  const handleAdd = () => {
    setCurrentReport({
      student_name: '', control_number: '', major: '', report_title: '',
      work_area: '', company_id: '', semester_id: '', keywords: [], keyword_names: [],
    });
    setSubmitError('');
    setIsReportModalOpen(true);
  };

  // get_reports devuelve las palabras clave en dos columnas: keyword_ids para
  // poder editarlas y keyword_names para mostrarlas. Antes solo llegaban los
  // nombres, bajo la clave "keywords", y al editar se enviaban como si fueran
  // ids.
  const aArreglo = (valor) => {
    if (Array.isArray(valor)) return valor;
    if (typeof valor === 'string') {
      try {
        const analizado = JSON.parse(valor);
        return Array.isArray(analizado) ? analizado : [];
      } catch {
        return [];
      }
    }
    return [];
  };

  const handleEdit = (report) => {
    setCurrentReport({
      ...report,
      keywords: aArreglo(report.keyword_ids),
      keyword_names: aArreglo(report.keyword_names),
    });
    setSubmitError('');
    setIsReportModalOpen(true);
  };

  const handleCloseReportModal = () => {
    setIsReportModalOpen(false);
    setCurrentReport(null);
    setSelectedFile(null);
    setSubmitError('');
  };

  // El modal devuelve ids y nombres: los ids se envian al servidor y los
  // nombres alimentan la caja del formulario, que antes se quedaba en
  // "Ninguna seleccionada" hasta que el reporte se guardaba y se releia.
  const handleSaveKeywords = ({ ids, names }) => {
    setCurrentReport(prev => ({ ...prev, keywords: ids, keyword_names: names }));
  };

  const keywordsSeleccionadas = useMemo(
    () => currentReport?.keywords || [],
    [currentReport?.keywords]
  );

  const handleDelete = async (report) => {
    if (window.confirm(`¿Está seguro de que quiere eliminar el informe "${report.report_title}"?`)) {
      try {
        await reportsService.deleteReport(report.id);
        const data = await reportsService.getReports();
        setReports(data || []);
      } catch (error) {
        console.error("Failed to delete report:", error);
      }
    }
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
    setPdfError('');
  };

  const handleSubmit = async () => {
    setSubmitError('');
    setPdfError('');

    // El PDF vive en un input oculto que se dispara con un boton, asi que el
    // navegador no puede pintarle su globo de validacion nativo como al resto
    // de los campos: un control con display:none no recibe foco y Chrome se
    // limita a avisar en la consola. El aviso lo damos nosotros, junto al
    // campo.
    if (!currentReport.id && !selectedFile) {
      setPdfError('Debes adjuntar un archivo PDF.');
      setSubmitError('Falta el archivo PDF del reporte.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('student_name', currentReport.student_name);
      formData.append('control_number', currentReport.control_number);
      formData.append('major', currentReport.major || '');
      formData.append('report_title', currentReport.report_title || '');
      formData.append('work_area', currentReport.work_area || '');
      formData.append('company_id', currentReport.company_id);
      formData.append('semester_id', currentReport.semester_id);
      formData.append('keywords', JSON.stringify(currentReport.keywords || []));

      if (selectedFile) formData.append('pdf', selectedFile, selectedFile.name);

      if (currentReport.id) {
        await reportsService.updateReport(currentReport.id, formData);
      } else {
        await reportsService.createReport(formData);
      }
      handleCloseReportModal();
      const data = await reportsService.getReports();
      setReports(data || []);
    } catch (error) {
      console.error("Failed to save report:", error);
      setSubmitError(mensajeDeError(error, 'No se pudo guardar el reporte.'));
    }
  };

  const handleSelectPdf = (report) => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    const pdfUrl = `${apiUrl.replace('/api', '')}/uploads/${report.pdf_route}`;
    window.open(pdfUrl, '_blank');
  };

  return (
    <div className="page-container">
      <PageHeader title="Gestión de Reportes" onAdd={handleAdd} showAddButton={can.CREATE === 1} />

      <div className="search-filter-row">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
          <SearchBar
            placeholder="Buscar (Título, Alumno, Empresa, Área, Palabras Clave)..."
            onSearch={(val) => {
              setSearchQuery(val);
              setCurrentPage(1);
            }}
          />
          <button 
            className="btn-secondary" 
            onClick={() => setIsHelpModalOpen(true)}
            title="Ayuda de búsqueda"
            style={{ 
              padding: '0.5rem', 
              minWidth: '40px', 
              height: '44px', 
              borderRadius: '8px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}
          >
            <i className="fas fa-question-circle" style={{ fontSize: '1.2rem', color: 'var(--gray-2)' }}></i>
          </button>
        </div>

        <div className="semester-filter-wrapper">
          <div style={{ position: 'relative' }}>
            <select
              className="semester-select"
              value={selectedSemester}
              onChange={(e) => {
                setSelectedSemester(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="">Todos los Semestres</option>
              {availableSemesters.map((sem) => (
                <option key={sem} value={sem}>{sem}</option>
              ))}
            </select>
            <i className="fas fa-chevron-down select-icon" style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}></i>
          </div>
        </div>
      </div>

      <div className="datatable-container">
        <table className="datatable">
          <thead>
            <tr>
              <th style={{ width: '5%' }}>Nº</th>
              <th style={{ width: '25%' }}>Título</th>
              <th style={{ width: '20%' }}>Empresa</th>
              <th style={{ width: '15%' }}>Área</th>
              <th style={{ width: '25%' }}>Palabras Clave</th>
              <th style={{ width: '10%' }}>Acciones</th>
            </tr>
          </thead>
          {loading ? (
            <tbody><tr><td colSpan="6">Cargando...</td></tr></tbody>
          ) : (
            currentReports.map(report => (
              <tbody key={report.id} className="report-group">
                <tr className="report-main-row">
                  <td rowSpan="2" style={{ textAlign: 'center', verticalAlign: 'middle' }}>{report.id}</td>
                  <td>{report.report_title}</td>
                  <td>{report.company_name}</td>
                  <td>{report.work_area}</td>
                  <td className="keywords-cell">{(report.keyword_names || []).join(', ')}</td>
                  <td rowSpan="2" className="actions-cell">
                    <div className="actions-wrapper">
                      <button
                        onClick={() => can.READ && handleSelectPdf(report)}
                        className="btn-action btn-pdf"
                        title={can.READ ? "Ver PDF" : "Permisos insuficientes"}
                        disabled={!can.READ}
                        style={!can.READ ? { opacity: 0.5, cursor: 'not-allowed', backgroundColor: '#ccc' } : {}}
                      >
                        <i className="fas fa-eye"></i>
                      </button>
                      <button
                        onClick={() => can.UPDATE && handleEdit(report)}
                        className="btn-action btn-edit"
                        title={can.UPDATE ? "Editar" : "Permisos insuficientes"}
                        disabled={!can.UPDATE}
                        style={!can.UPDATE ? { opacity: 0.5, cursor: 'not-allowed', backgroundColor: '#ccc' } : {}}
                      >
                        <i className="fas fa-pencil-alt"></i>
                      </button>
                      <button
                        onClick={() => can.DELETE && handleDelete(report)}
                        className="btn-action btn-delete"
                        title={can.DELETE ? "Eliminar" : "Permisos insuficientes"}
                        disabled={!can.DELETE}
                        style={!can.DELETE ? { opacity: 0.5, cursor: 'not-allowed', backgroundColor: '#ccc' } : {}}
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
                <tr className="report-secondary-row">
                  <td colSpan="4">
                    <div className="report-secondary-row-content">
                      <span><strong>Nº Control:</strong> {report.control_number}</span>
                      <span><strong>Estudiante:</strong> {report.student_name}</span>
                      <span><strong>Semestre:</strong> {report.semester}</span>
                    </div>
                  </td>
                </tr>
              </tbody>
            ))
          )}
        </table>
      </div>

      {processedReports.length > reportsPerPage && (
        <div className="pagination-controls">
          <button onClick={handlePrevPage} disabled={currentPage === 1} className="btn-secondary">
            &lt; Anterior
          </button>
          <span>Página {currentPage} de {totalPages}</span>
          <button onClick={handleNextPage} disabled={currentPage === totalPages} className="btn-secondary">
            Siguiente &gt;
          </button>
        </div>
      )}

      {isReportModalOpen && (
        <Modal
          isOpen={isReportModalOpen}
          onClose={handleCloseReportModal}
          onSubmit={handleSubmit}
          title={currentReport?.id ? "Editar Reporte" : "Agregar Reporte"}
          className="report-modal-wrapper"
          error={submitError}
        >
          <ReportForm
            report={currentReport}
            setReport={setCurrentReport}
            onFileChange={handleFileChange}
            onOpenKeywordsModal={() => setIsKeywordsModalOpen(true)}
            fileError={pdfError}
          />
        </Modal>
      )}
      <KeywordsModal
        isOpen={isKeywordsModalOpen}
        onClose={() => setIsKeywordsModalOpen(false)}
        onSave={handleSaveKeywords}
        initialSelectedIds={keywordsSeleccionadas}
      />

      <Modal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
        title="Cómo usar la búsqueda"
        onSubmit={() => setIsHelpModalOpen(false)} 
        submitLabel="Entendido"
      >
        <div style={{ padding: '0.5rem', lineHeight: '1.6', color: 'var(--text-dark)' }}>
          <p style={{ marginBottom: '1rem' }}>
            La búsqueda permite encontrar reportes utilizando múltiples términos al mismo tiempo.
          </p>
          <ul style={{ listStyleType: 'disc', paddingLeft: '1.5rem', marginBottom: '1rem' }}>
            <li><strong>Búsqueda Multi-campo:</strong> El sistema busca en Título, Nombre del Estudiante, Número de Control, Empresa, Área y Palabras Clave.</li>
            <li><strong>Combinación de términos:</strong> Si escribes varias palabras separadas por espacio, el sistema buscará reportes que contengan <strong>TODAS</strong> esas palabras, sin importar en qué campo estén.</li>
          </ul>
          <div style={{ background: '#f8f9fa', padding: '1rem', borderRadius: '8px', border: '1px solid #e9ecef' }}>
            <strong>Ejemplos:</strong>
            <ul style={{ marginTop: '0.5rem', listStyle: 'none', padding: 0 }}>
              <li style={{ marginBottom: '0.5rem' }}>
                <code>Peñoles Mantenimiento</code> <br/>
                <small>Encuentra reportes de la empresa "Peñoles" relacionados con "Mantenimiento".</small>
              </li>
              <li>
                <code>React Web Juan</code> <br/>
                <small>Busca reportes que tengan "React", "Web" y "Juan" distribuidos en cualquiera de sus datos.</small>
              </li>
            </ul>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ReportsPage;