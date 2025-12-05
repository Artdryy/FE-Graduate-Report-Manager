import React, { useState, useEffect, useMemo } from 'react'; 
import { companiesService } from '../services/companiesService';
import PageHeader from '../components/common/PageHeader';
import DataTable from '../components/common/DataTable';
import SearchBar from '../components/common/SearchBar';
import Modal from '../components/common/Modal';
import CompanyForm from '../components/companies/CompanyForm';
import { useAuth } from '../context/AuthContext';

const CompaniesPage = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCompany, setCurrentCompany] = useState(null);

  const { permissions } = useAuth();
  
  const can = useMemo(() => permissions['Companies']?.permissions || {}, [permissions]);

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
        const companyData = {
            ...currentCompany,
            company_id: currentCompany.id 
        };
        delete companyData.id; 

        await companiesService.updateCompany(companyData);
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
    { key: 'company_name', label: 'Nombre' },
    { key: 'description', label: 'Descripción' },
    { key: 'address', label: 'Dirección' },
    { key: 'phone_number', label: 'Teléfono' },
    { key: 'email', label: 'Email' },
  ];

const renderCompanyActions = (company) => (
    <div className="actions-cell">
      <button 
        onClick={() => can.UPDATE && handleEdit(company)} 
        className="btn-edit" 
        disabled={!can.UPDATE}
        title={can.UPDATE ? "Editar" : "Permisos insuficientes"}
        style={!can.UPDATE ? { 
          opacity: 0.5, 
          cursor: 'not-allowed', 
          backgroundColor: '#ccc', 
          border: '1px solid #999' 
        } : {}}
      >
        <i className="fas fa-pencil-alt"></i>
      </button>
      <button 
        onClick={() => can.DELETE && handleDelete(company)} 
        className="btn-delete" 
        disabled={!can.DELETE}
        title={can.DELETE ? "Eliminar" : "Permisos insuficientes"}
        style={!can.DELETE ? { 
          opacity: 0.5, 
          cursor: 'not-allowed', 
          backgroundColor: '#ccc', 
          border: '1px solid #999' 
        } : {}}
      >
        <i className="fas fa-trash"></i>
      </button>
    </div>
  );

  return (
    <div className="page-container">
      <PageHeader title="Gestión de Empresas" onAdd={handleAdd} showAddButton={can.CREATE === 1} />
      <SearchBar placeholder="Buscar por nombre de empresa..." onSearch={() => {}} />
      
      <DataTable
        columns={columns}
        data={companies}
        loading={loading}
        renderActions={renderCompanyActions} 
      />
      
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSubmit={handleSubmit}
          title={currentCompany.id ? "Editar Empresa" : "Agregar Empresa"}
        >
          <CompanyForm company={currentCompany} setCompany={setCurrentCompany} />
        </Modal>
      )}
    </div>
  );
};

export default CompaniesPage;