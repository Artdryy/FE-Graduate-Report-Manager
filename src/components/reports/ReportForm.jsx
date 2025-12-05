import React, { useEffect, useState, useRef } from 'react';
import { companiesService } from '../../services/companiesService';
import { semestersService } from '../../services/semestersService';

const ReportForm = ({ report, setReport, onFileChange, onOpenKeywordsModal }) => {
  const [companies, setCompanies] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const fileInputRef = useRef(null);
  const [selectedFileName, setSelectedFileName] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [companiesData, semestersData] = await Promise.all([
          companiesService.getCompanies(),
          semestersService.getSemesters(),
        ]);
        setCompanies(companiesData || []);
        setSemesters(semestersData || []);
      } catch (error) {
        console.error("Failed to fetch data for report form", error);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setReport((prev) => ({ ...prev, [name]: value }));
  };

  const handleActualFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFileName(file.name);
    }
    onFileChange(e);
  };

  const keywordDisplay = React.useMemo(() => {
    if (report.keyword_names && report.keyword_names.length > 0) {
      return report.keyword_names.join(', ');
    }
    return 'Ninguna seleccionada';
  }, [report.keyword_names]);

  const currentFileName = report?.pdf_route ? `Archivo actual: ${report.pdf_route.split('/').pop()}` : 'Ningún archivo cargado';
  const newFileName = selectedFileName ? `Nuevo archivo: ${selectedFileName}` : '';

  return (
    <div className="form-grid">
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="student_name">Nombre del Estudiante</label>
          <input type="text" id="student_name" name="student_name" className="modal-input" value={report.student_name || ''} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label htmlFor="control_number">Número de Control</label>
          <input type="text" id="control_number" name="control_number" className="modal-input" value={report.control_number || ''} onChange={handleChange} required readOnly={!!report.id} />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="major">Carrera</label>
          <input type="text" id="major" name="major" className="modal-input" value={report.major || ''} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label htmlFor="report_title">Título del Reporte</label>
          <input type="text" id="report_title" name="report_title" className="modal-input" value={report.report_title || ''} onChange={handleChange} />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="company_id">Empresa</label>
          <select id="company_id" name="company_id" className="modal-input" value={report.company_id || ''} onChange={handleChange} required>
            <option value="">Seleccione una empresa</option>
            {companies.map(c => <option key={c.id} value={c.id}>{c.company_name}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="work_area">Área de Trabajo</label>
          <input type="text" id="work_area" name="work_area" placeholder="Ej: Redes, Desarrollo Web..." className="modal-input" value={report.work_area || ''} onChange={handleChange} />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="semester_id">Semestre</label>
          <select id="semester_id" name="semester_id" className="modal-input" value={report.semester_id || ''} onChange={handleChange} required>
            <option value="">Seleccione un semestre</option>
            {semesters.map(s => <option key={s.id} value={s.id}>{s.semester}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>Palabras Clave</label>
          <div className="keywords-display-box">{keywordDisplay}</div>
          <button type="button" className="btn-secondary" onClick={onOpenKeywordsModal} style={{ marginTop: '8px', width: '100%' }}>
            Administrar Palabras Clave
          </button>
        </div>
      </div>

      <div className="form-group">
        <label>Archivo PDF</label>
        <input type="file" ref={fileInputRef} onChange={handleActualFileChange} accept=".pdf" style={{ display: 'none' }} />
        <button type="button" className="btn-secondary" onClick={() => fileInputRef.current.click()} style={{ width: '100%' }}>
          Seleccionar PDF
        </button>
        <span className="file-name-display">{newFileName || currentFileName}</span>
      </div>
    </div>
  );
};

export default ReportForm;