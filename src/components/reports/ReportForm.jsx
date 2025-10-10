import React, { useEffect, useState } from 'react';

const ReportForm = ({ report, setReport, onFileChange }) => {
  const [companies, setCompanies] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [keywords, setKeywords] = useState([]);

  useEffect(() => {
    // We will fetch companies, semesters, and keywords here in the next step
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setReport((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <>
      <div className="input-group">
        <label htmlFor="student_name">Nombre del Estudiante</label>
        <input
          type="text" id="student_name" name="student_name" className="modal-input"
          value={report.student_name || ''} onChange={handleChange} required
        />
      </div>
      <div className="input-group">
        <label htmlFor="control_number">Número de Control</label>
        <input
          type="text" id="control_number" name="control_number" className="modal-input"
          value={report.control_number || ''} onChange={handleChange} required
        />
      </div>
      <div className="input-group">
        <label htmlFor="major">Carrera</label>
        <input
          type="text" id="major" name="major" className="modal-input"
          value={report.major || ''} onChange={handleChange}
        />
      </div>
      <div className="input-group">
        <label htmlFor="report_title">Título del Reporte</label>
        <input
          type="text" id="report_title" name="report_title" className="modal-input"
          value={report.report_title || ''} onChange={handleChange}
        />
      </div>
      <div className="input-group">
        <label htmlFor="company_id">Empresa</label>
        <select
          id="company_id" name="company_id" className="modal-input"
          value={report.company_id || ''} onChange={handleChange} required >
          <option value="">Seleccione una empresa</option>
          {/* Options will be populated from API call */}
        </select>
      </div>
      <div className="input-group">
        <label htmlFor="semester_id">Semestre</label>
        <select
          id="semester_id" name="semester_id" className="modal-input"
          value={report.semester_id || ''} onChange={handleChange} required >
          <option value="">Seleccione un semestre</option>
          {/* Options will be populated from API call */}
        </select>
      </div>
      <div className="input-group">
        <label>Palabras Clave</label>
        <p style={{ fontSize: '0.8rem', color: '#888' }}>El selector de palabras clave se implementará a continuación.</p>
      </div>
      <div className="input-group">
        <label htmlFor="pdf_file">Archivo PDF</label>
        <input
          type="file" id="pdf_file" name="pdf_file" className="modal-input"
          accept=".pdf" onChange={onFileChange} required={!report.id}
        />
      </div>
    </>
  );
};

export default ReportForm;