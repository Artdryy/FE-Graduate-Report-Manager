import React, { useState, useEffect, useMemo } from 'react';
import { reportsService } from '../services/reportsService';
import { semestersService } from '../services/semestersService';
import PageHeader from '../components/common/PageHeader';
import SearchBar from '../components/common/SearchBar';
import Modal from '../components/common/Modal';
import ReportForm from '../components/reports/ReportForm';
import KeywordsModal from '../components/keywords/KeywordsModal';
import { useAuth } from '../context/AuthContext';

const sortSemesters = (a = '', b = '') => {
  const normalize = (s) => (typeof s === 'string' ? s.trim() : '');
  const sa = normalize(a);
  const sb = normalize(b);

  const parseValue = (semString) => {
    if (!semString) return 0;
    const parts = semString.split(' ');
    const yearToken = parts[parts.length - 1];
    const year = parseInt(yearToken, 10);
    const periodToken = parts.slice(0, parts.length - 1).join(' ').toUpperCase();
    const isSecond = periodToken.includes('AGO') || periodToken.includes('DIC');
    const periodValue = isSecond ? 2 : 1;
    if (Number.isFinite(year)) return (year * 10) + periodValue;
    return periodValue;
  };

  const valA = parseValue(sa);
  const valB = parseValue(sb);
  return valB - valA;
};

const ReportsPage = () => {
  const [reports, setReports] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSemester, setSelectedSemester] = useState('');
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [currentReport, setCurrentReport] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isKeywordsModalOpen, setIsKeywordsModalOpen] = useState(false);
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
      work_area: '', company_id: '', semester_id: '', keywords: [],
    });
    setIsReportModalOpen(true);
  };

  const handleEdit = (report) => {
    let keywordsArray = [];
    if (report.keywords) {
      if (typeof report.keywords === 'string') {
        try { keywordsArray = JSON.parse(report.keywords); } catch (e) { console.error(e); }
      } else if (Array.isArray(report.keywords)) {
        keywordsArray = report.keywords;
      }
    }
    setCurrentReport({ ...report, keywords: keywordsArray });
    setIsReportModalOpen(true);
  };

  const handleCloseReportModal = () => {
    setIsReportModalOpen(false);
    setCurrentReport(null);
    setSelectedFile(null);
  };

  const handleSaveKeywords = (keywordIds) => {
    setCurrentReport(prev => ({ ...prev, keywords: keywordIds }));
  };

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

  const handleFileChange = (e) => setSelectedFile(e.target.files[0]);

  const handleSubmit = async () => {
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

      if (currentReport.id) {
        if (selectedFile) formData.append('pdf', selectedFile, selectedFile.name);
        await reportsService.updateReport(currentReport.id, formData);
      } else {
        if (!selectedFile) throw new Error('Por favor, seleccione un archivo PDF');
        formData.append('pdf', selectedFile, selectedFile.name);
        await reportsService.createReport(formData);
      }
      handleCloseReportModal();
      const data = await reportsService.getReports();
      setReports(data || []);
    } catch (error) {
      console.error("Failed to save report:", error);
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
        >
          <ReportForm
            report={currentReport}
            setReport={setCurrentReport}
            onFileChange={handleFileChange}
            onOpenKeywordsModal={() => setIsKeywordsModalOpen(true)}
          />
        </Modal>
      )}
      <KeywordsModal
        isOpen={isKeywordsModalOpen}
        onClose={() => setIsKeywordsModalOpen(false)}
        onSave={handleSaveKeywords}
        initialSelectedIds={currentReport?.keywords || []}
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