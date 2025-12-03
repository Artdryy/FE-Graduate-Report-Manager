import React, { useState, useEffect, useMemo } from 'react';
import { reportsService } from '../services/reportsService';
import { semestersService } from '../services/semestersService';
import PageHeader from '../components/common/PageHeader';
import SearchBar from '../components/common/SearchBar';
import Modal from '../components/common/Modal';
import ReportForm from '../components/reports/ReportForm';
import KeywordsModal from '../components/keywords/KeywordsModal';
import { useAuth } from '../context/AuthContext';

// Helper: comparator for semester strings like "ENE-JUN 2023" and "AGO-DIC 2023".
// Returns a positive/negative number so it can be used in Array.prototype.sort for
// descending order (most recent first).
const sortSemesters = (a = '', b = '') => {
  // Normalize and early return
  const normalize = (s) => (typeof s === 'string' ? s.trim() : '');
  const sa = normalize(a);
  const sb = normalize(b);

  const parseValue = (semString) => {
    if (!semString) return 0;
    const parts = semString.split(' ');
    const yearToken = parts[parts.length - 1];
    const year = parseInt(yearToken, 10);
    const periodToken = parts.slice(0, parts.length - 1).join(' ').toUpperCase();
    // second period (AGO-DIC) weights higher than first (ENE-JUN)
    const isSecond = periodToken.includes('AGO') || periodToken.includes('DIC');
    const periodValue = isSecond ? 2 : 1;
    // Multiply by 10 to ensure period weight is less significant than year
    if (Number.isFinite(year)) return (year * 10) + periodValue;
    return periodValue; // in case year not present, just period
  };

  const valA = parseValue(sa);
  const valB = parseValue(sb);
  // For descending order (newest first), we do valB - valA
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
  const [currentPage, setCurrentPage] = useState(1);
  const reportsPerPage = 15;
  const { permissions } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredReportId, setHoveredReportId] = useState(null);

  // Step 2: Calculate availableSemesters (active semesters present in the current reports)
  const availableSemesters = useMemo(() => {
    if (!Array.isArray(reports)) return [];
    const semestersSet = new Set();
    reports.forEach(r => {
      if (r && r.semester && String(r.semester).trim() !== '') {
        semestersSet.add(String(r.semester).trim());
      }
    });
    // Convert to array and sort using our comparator
    return Array.from(semestersSet).sort(sortSemesters);
  }, [reports]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const data = await reportsService.getReports();
      setReports(data || []);
    } catch (err) {
      console.error("Failed to load reports", err);
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // Fetch inicial de Datos
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Cargar reportes y semestres en paralelo
        const [reportsData, semestersData] = await Promise.all([
          reportsService.getReports(),
          semestersService.getSemesters()
        ]);
        setReports(reportsData || []);
        setSemesters(semestersData || []);
      } catch (err) {
        console.error("Error cargando datos:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Lógica Maestra de Filtrado
  const processedReports = useMemo(() => {
    let filtered = reports;

    // 1. Filtro de Texto (Búsqueda)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(report => {
        const titleMatch = report.report_title?.toLowerCase().includes(query);
        const keywordMatch = report.keyword_names?.some(k => k.toLowerCase().includes(query));
        const studentMatch = report.student_name?.toLowerCase().includes(query);
        return titleMatch || keywordMatch || studentMatch;
      });
    }

    // 2. Filtro de Semestre (Combobox)
    if (selectedSemester) {
      filtered = filtered.filter(report =>
        report.semester === selectedSemester // Compara el string exacto "ENE-JUN 2023"
      );
    }

    // 3. Ordenamiento (usa la función auxiliar sortSemesters)
    return filtered.sort((a, b) => sortSemesters(a.semester, b.semester));
  }, [reports, searchQuery, selectedSemester]);

  const currentReports = useMemo(() => {
    const indexOfLastReport = currentPage * reportsPerPage;
    const indexOfFirstReport = indexOfLastReport - reportsPerPage;
    return processedReports.slice(indexOfFirstReport, indexOfLastReport);
  }, [processedReports, currentPage, reportsPerPage]);

  const totalPages = Math.ceil(processedReports.length / reportsPerPage);
  const can = useMemo(() => permissions['Reports']?.permissions || {}, [permissions]);

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleAdd = () => {
    setCurrentReport({
      student_name: '',
      control_number: '',
      major: '',
      report_title: '',
      work_area: '',
      company_id: '',
      semester_id: '',
      keywords: [],
    });
    setIsReportModalOpen(true);
  };

  const handleEdit = (report) => {
    let keywordsArray = [];
    if (report.keywords) {
      if (typeof report.keywords === 'string') {
        try {
          keywordsArray = JSON.parse(report.keywords);
        } catch (e) {
          console.error("Failed to parse keywords JSON:", e);
        }
      } else if (Array.isArray(report.keywords)) {
        keywordsArray = report.keywords;
      }
    }

    const reportToEdit = {
      ...report,
      keywords: keywordsArray,
    };
    setCurrentReport(reportToEdit);
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
        fetchReports();
      } catch (error) {
        console.error("Failed to delete report:", error);
      }
    }
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

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
        if (selectedFile) {
          formData.append('pdf', selectedFile, selectedFile.name);
        }
        await reportsService.updateReport(currentReport.id, formData);
      } else {
        if (!selectedFile) {
          throw new Error('Por favor, seleccione un archivo PDF');
        }
        formData.append('pdf', selectedFile, selectedFile.name);
        await reportsService.createReport(formData);
      }

      handleCloseReportModal();
      fetchReports();
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
        <SearchBar
          placeholder="Buscar por título o palabra clave..."
          onSearch={(val) => {
            setSearchQuery(val);
            setCurrentPage(1);
          }}
        />

        {/* Semester dropdown filter */}
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
            <tbody>
              <tr><td colSpan="6">Cargando...</td></tr>
            </tbody>
          ) : (
            currentReports.map(report => (
              <tbody key={report.id} className="report-group">
                <tr className="report-main-row">
                  <td rowSpan="2" style={{ textAlign: 'center', verticalAlign: 'middle' }}>{report.id}</td>
                  <td>{report.report_title}</td>
                  <td>{report.company_name}</td>
                  <td>{report.work_area}</td>
                  <td className="keywords-cell">
                    {(report.keyword_names || []).join(', ')}
                  </td>
                  <td rowSpan="2" className="actions-cell">
                    <div className="actions-wrapper">

                      {/* BOTÓN VER - SIEMPRE VISIBLE PERO DESHABILITADO SI NO HAY PERMISO */}
                      <button
                        onClick={() => can.READ && handleSelectPdf(report)}
                        className="btn-action btn-pdf"
                        title={can.READ ? "Ver PDF" : "Permisos insuficientes"}
                        disabled={!can.READ}
                        style={!can.READ ? { opacity: 0.5, cursor: 'not-allowed', backgroundColor: '#ccc', border: '1px solid #999' } : {}}
                      >
                        <i className="fas fa-eye"></i>
                      </button>

                      {/* BOTÓN EDITAR - SIEMPRE VISIBLE PERO DESHABILITADO SI NO HAY PERMISO */}
                      <button
                        onClick={() => can.UPDATE && handleEdit(report)}
                        className="btn-action btn-edit"
                        title={can.UPDATE ? "Editar" : "Permisos insuficientes"}
                        disabled={!can.UPDATE}
                        style={!can.UPDATE ? { opacity: 0.5, cursor: 'not-allowed', backgroundColor: '#ccc', border: '1px solid #999' } : {}}
                      >
                        <i className="fas fa-pencil-alt"></i>
                      </button>

                      {/* BOTÓN ELIMINAR - SIEMPRE VISIBLE PERO DESHABILITADO SI NO HAY PERMISO */}
                      <button
                        onClick={() => can.DELETE && handleDelete(report)}
                        className="btn-action btn-delete"
                        title={can.DELETE ? "Eliminar" : "Permisos insuficientes"}
                        disabled={!can.DELETE}
                        style={!can.DELETE ? { opacity: 0.5, cursor: 'not-allowed', backgroundColor: '#ccc', border: '1px solid #999' } : {}}
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

      {/* --- ADD PAGINATION CONTROLS --- */}
      {reports.length > reportsPerPage && (
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

      {/* Modals remain the same */}
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
    </div>
  );
};

export default ReportsPage;