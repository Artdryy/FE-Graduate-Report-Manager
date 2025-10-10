import React, { useState, useEffect } from 'react';
import { reportsService } from '../services/reportsService';
import PageHeader from '../components/common/PageHeader';
import DataTable from '../components/common/DataTable';
import SearchBar from '../components/common/SearchBar';
import Modal from '../components/common/Modal';
import ReportForm from '../components/reports/ReportForm';

const ReportsPage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentReport, setCurrentReport] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const data = await reportsService.getReports();
      setReports(data || []);
    } catch (err) {
      console.error("Failed to load reports", err);
      setReports([]); // Ensure reports is an array even on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleAdd = () => {
    setCurrentReport({
      student_name: '',
      control_number: '',
      major: '',
      report_title: '',
      company_id: '',
      semester_id: '',
      keywords: [],
    });
    setIsModalOpen(true);
  };

  const handleEdit = (report) => {
    const reportToEdit = {
      ...report,
      // The backend sends keywords as a JSON string, so we parse it for the form
      keywords: report.keywords ? JSON.parse(report.keywords) : [],
    };
    setCurrentReport(reportToEdit);
    setIsModalOpen(true);
  };

  const handleDelete = async (report) => {
    if (window.confirm(`¿Está seguro de que quiere eliminar el reporte "${report.report_title}"?`)) {
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

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentReport(null);
    setSelectedFile(null);
  };

  const handleSubmit = async () => {
    try {
      if (currentReport.id) {
        // Handle Update Logic
        const { id, pdf_route, company_name, semester, ...updateData } = currentReport;
        await reportsService.updateReport(id, {
          ...updateData,
          p_keywords_json: JSON.stringify(updateData.keywords || []),
        });
      } else {
        // Handle Create Logic with FormData
        if (!selectedFile) {
          throw new Error('Por favor, seleccione un archivo PDF');
        }

        const formData = new FormData();
        
        // Convert non-string values to strings
        formData.append('student_name', String(currentReport.student_name));
        formData.append('control_number', String(currentReport.control_number));
        formData.append('major', String(currentReport.major || ''));
        formData.append('report_title', String(currentReport.report_title || ''));
        formData.append('company_id', String(currentReport.company_id));
        formData.append('semester_id', String(currentReport.semester_id));
        formData.append('keywords', JSON.stringify(currentReport.keywords || []));
        
        // Add the file last
        formData.append('pdf', selectedFile, selectedFile.name);
        
        // Log FormData contents for debugging (remove in production)
        for (let pair of formData.entries()) {
          console.log(pair[0] + ': ' + pair[1]);
        }
        
        await reportsService.createReport(formData);
      }
      handleCloseModal();
      fetchReports();
    } catch (error) {
      console.error("Failed to save report:", error);
    }
  };

  const handleSelectPdf = (report) => {
    // Use the 'pdf_route' from your stored procedure
    const pdfUrl = `${import.meta.env.VITE_API_URL.replace('/api', '')}/${report.pdf_route}`;
    window.open(pdfUrl, '_blank');
  };

  // Custom function to render the action buttons for each row
  const renderReportActions = (report) => (
    <>
      <button onClick={() => handleSelectPdf(report)} className="btn-pdf" title="Ver PDF">
        <i className="fas fa-file-pdf"></i>
        <span>Seleccionar.pdf</span>
      </button>
      <button onClick={() => handleEdit(report)} className="btn-edit" title="Editar">
        <i className="fas fa-pencil-alt"></i>
      </button>
      <button onClick={() => handleDelete(report)} className="btn-delete" title="Eliminar">
        <i className="fas fa-trash"></i>
      </button>
    </>
  );

  // Match the keys to your stored procedure's output
  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'report_title', label: 'Título' },
    { key: 'student_name', label: 'Estudiante' },
    { key: 'company_name', label: 'Empresa' },
    { key: 'semester', label: 'Semestre' }, 
  ];

  return (
    <div className="page-container">
      <PageHeader title="Gestión de Reportes" onAdd={handleAdd} />
      <SearchBar placeholder="Buscar por título, autor o palabra clave..." onSearch={() => {}} />
      <DataTable
        columns={columns}
        data={reports}
        loading={loading}
        renderActions={renderReportActions}
      />
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSubmit={handleSubmit}
          title={currentReport.id ? "Editar Reporte" : "Agregar Reporte"}
        >
          <ReportForm
            report={currentReport}
            setReport={setCurrentReport}
            onFileChange={handleFileChange}
          />
        </Modal>
      )}
    </div>
  );
};

export default ReportsPage;