import React, { useState, useEffect, useMemo } from 'react'; // Import useMemo
import { reportsService } from '../services/reportsService';
import PageHeader from '../components/common/PageHeader';
// DataTable is no longer used directly, but we keep the custom table
import SearchBar from '../components/common/SearchBar';
import Modal from '../components/common/Modal';
import ReportForm from '../components/reports/ReportForm';
import KeywordsModal from '../components/keywords/KeywordsModal';

const ReportsPage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [currentReport, setCurrentReport] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isKeywordsModalOpen, setIsKeywordsModalOpen] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const reportsPerPage = 15;

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

    const currentReports = useMemo(() => {
    const indexOfLastReport = currentPage * reportsPerPage;
    const indexOfFirstReport = indexOfLastReport - reportsPerPage;
    return reports.slice(indexOfFirstReport, indexOfLastReport);
  }, [reports, currentPage, reportsPerPage]);

  const totalPages = Math.ceil(reports.length / reportsPerPage);

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
      keywords: keywordsArray, // Ensure keywords is always an array
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
      // Append all text fields from the currentReport state
      formData.append('student_name', currentReport.student_name);
      formData.append('control_number', currentReport.control_number);
      formData.append('major', currentReport.major || '');
      formData.append('report_title', currentReport.report_title || '');
      formData.append('work_area', currentReport.work_area || '');
      formData.append('company_id', currentReport.company_id);
      formData.append('semester_id', currentReport.semester_id);
      formData.append('keywords', JSON.stringify(currentReport.keywords || []));

      if (currentReport.id) {
        // UPDATE LOGIC
        // If a new file was selected during the edit, add it.
        if (selectedFile) {
          formData.append('pdf', selectedFile, selectedFile.name);
        }
        await reportsService.updateReport(currentReport.id, formData);
      } else {
        // CREATE LOGIC
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

  const renderReportActions = (report) => (
    <>
      <button onClick={() => handleSelectPdf(report)} className="btn-action btn-pdf" title="Ver PDF">
        <i className="fas fa-eye"></i>
      </button>
      <button onClick={() => handleEdit(report)} className="btn-action btn-edit" title="Editar">
        <i className="fas fa-pencil-alt"></i>
      </button>
      <button onClick={() => handleDelete(report)} className="btn-action btn-delete" title="Eliminar">
        <i className="fas fa-trash"></i>
      </button>
    </>
  );


  return (
    <div className="page-container">
      <PageHeader title="Gestión de Reportes" onAdd={handleAdd} />
      <SearchBar placeholder="Buscar por título, autor o palabra clave..." onSearch={() => {}} />

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
          <tbody>
            {loading ? (
              <tr><td colSpan="6">Cargando...</td></tr>
            ) : (
              // --- UPDATE: Map over currentReports instead of all reports ---
              currentReports.map(report => (
                <React.Fragment key={report.id}>
                  <tr className="report-main-row">
                    <td rowSpan="2" style={{ textAlign: 'center', verticalAlign: 'middle' }}>{report.id}</td>
                    <td>{report.report_title}</td>
                    <td>{report.company_name}</td>
                    <td>{report.work_area}</td>
                    <td>{(report.keyword_names || []).join(', ')}</td>
                    <td rowSpan="2" className="actions-cell">{renderReportActions(report)}</td>
                  </tr>
                  <tr className="report-secondary-row">
                    <td colSpan="4">
                      <div className="report-secondary-row-content">
                        <span>{`Nº Control: ${report.control_number}`}</span>
                        <span>{`Estudiante: ${report.student_name}`}</span>
                        <span>{`Semestre: ${report.semester}`}</span>
                      </div>
                    </td>
                  </tr>
                </React.Fragment>
              ))
            )}
          </tbody>
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