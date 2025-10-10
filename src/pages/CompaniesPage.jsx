import React, { useState, useEffect } from 'react';
import { companiesService } from '../services/companiesService';
import PageHeader from '../components/common/PageHeader';
import DataTable from '../components/common/DataTable';
import SearchBar from '../components/common/SearchBar';
import Modal from '../components/common/Modal';
import CompanyForm from '../components/companies/CompanyForm';

const CompaniesPage = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCompany, setCurrentCompany] = useState(null);

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const data = await companiesService.getCompanies();
      setCompanies(data);
    } catch (err) {
      console.error("Failed to load companies", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

const handleAdd = () => {
    setCurrentCompany({ company_name: '', description: '', address: '', phone_number: '', email: '' });
    setIsModalOpen(true);
};

  const handleEdit = (company) => {
    setCurrentCompany(company);
    setIsModalOpen(true);
  };

  const handleDelete = async (company) => {
    if (window.confirm(`¿Está seguro de que quiere eliminar la empresa "${company.company_name}"?`)) {
      try {
        await companiesService.deleteCompany(company.id);
        fetchCompanies();
      } catch (error) {
        console.error("Failed to delete company:", error);
      }
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentCompany(null);
  };

  const handleSubmit = async () => {
    try {
      if (currentCompany.id) {
        const { id, ...updateData } = currentCompany;
        await companiesService.updateCompany(id, updateData);
      } else {
        await companiesService.createCompany(currentCompany);
      }
      handleCloseModal();
      fetchCompanies();
    } catch (error) {
      console.error("Failed to save company:", error);
    }
  };

  const handleSearch = (query) => console.log("Searching for company:", query);
  
  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'company_name', label: 'Nombre de la Empresa' },
    { key: 'city', label: 'Ciudad' },
    { key: 'state', label: 'Estado' },
  ];

  return (
    <div className="page-container">
      <PageHeader title="Gestión de Empresas" onAdd={handleAdd} />
      <SearchBar onSearch={handleSearch} placeholder="Buscar por empresa o ciudad..." />
      <DataTable
        columns={columns}
        data={companies}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSubmit={handleSubmit}
          title={currentCompany && currentCompany.id ? "Editar Empresa" : "Agregar Empresa"}
        >
          <CompanyForm company={currentCompany} setCompany={setCurrentCompany} />
        </Modal>
      )}
    </div>
  );
};

export default CompaniesPage;