// src/pages/ReportsPage.jsx

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
      setReports(data);
    } catch (err) {
      console.error("Failed to load reports", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleAdd = () => {
    setCurrentReport({ title: '', author: '', publication_year: '' });
    setIsModalOpen(true);
  };

  const handleEdit = (report) => {
    setCurrentReport(report);
    setIsModalOpen(true);
  };

  const handleDelete = async (report) => {
    if (window.confirm(`¿Está seguro de que quiere eliminar el reporte "${report.title}"?`)) {
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
    if (currentReport.id) {
      // Handle Update Logic
      const { id, ...updateData } = currentReport;
      await reportsService.updateReport(id, updateData);
    } else {
      // Handle Create Logic with FormData
      const formData = new FormData();
      formData.append('title', currentReport.title);
      formData.append('author', currentReport.author);
      formData.append('publication_year', currentReport.publication_year);
      formData.append('pdf_file', selectedFile);
      // Append other fields like company_id later
      
      await reportsService.createReport(formData);
    }
    handleCloseModal();
    fetchReports();
  };

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'title', label: 'Título' },
    { key: 'author', label: 'Autor' },
    { key: 'company_name', label: 'Empresa' },
    { key: 'publication_year', label: 'Año' },
  ];

  return (
    <div className="page-container">
      <PageHeader title="Gestión de Reportes" onAdd={handleAdd} />
      <SearchBar placeholder="Buscar por título o autor..." onSearch={() => {}} />
      <DataTable
        columns={columns}
        data={reports}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
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