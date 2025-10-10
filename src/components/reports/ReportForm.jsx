import React, { useEffect, useState } from 'react';
import { companiesService } from '../../services/companiesService';
import { semestersService } from '../../services/semestersService';
import { keywordsService } from '../../services/keywordsService';
import MultiSelect from '../common/MultiSelect';

const ReportForm = ({ report, setReport, onFileChange }) => {
  const [companies, setCompanies] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [allKeywords, setAllKeywords] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [companiesData, semestersData, keywordsData] = await Promise.all([
          companiesService.getCompanies(),
          semestersService.getSemesters(),
          keywordsService.getKeywords(),
        ]);
        setCompanies(companiesData);
        setSemesters(semestersData);
        // Map keywords to the { id, name } format our component expects
        setAllKeywords(keywordsData.map(k => ({ id: k.id, name: k.keyword })));
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

  const handleKeywordsChange = (selectedKeywords) => {
    const keywordIds = selectedKeywords.map(k => k.id);
    setReport((prev) => ({ ...prev, keywords: keywordIds }));
  };

  // Find the full keyword objects from the IDs stored in the report state
  const selectedKeywordObjects = allKeywords.filter(k => (report.keywords || []).includes(k.id));

  return (
    <>
      <div className="input-group">
        <label htmlFor="student_name">Nombre del Estudiante</label>
        <input type="text" id="student_name" name="student_name" className="modal-input" value={report.student_name || ''} onChange={handleChange} required />
      </div>
      <div className="input-group">
        <label htmlFor="control_number">Número de Control</label>
        <input type="text" id="control_number" name="control_number" className="modal-input" value={report.control_number || ''} onChange={handleChange} required />
      </div>
      <div className="input-group">
        <label htmlFor="major">Carrera</label>
        <input type="text" id="major" name="major" className="modal-input" value={report.major || ''} onChange={handleChange} />
      </div>
      <div className="input-group">
        <label htmlFor="report_title">Título del Reporte</label>
        <input type="text" id="report_title" name="report_title" className="modal-input" value={report.report_title || ''} onChange={handleChange} />
      </div>
      <div className="input-group">
        <label htmlFor="company_id">Empresa</label>
        <select id="company_id" name="company_id" className="modal-input" value={report.company_id || ''} onChange={handleChange} required>
          <option value="">Seleccione una empresa</option>
          {companies.map(c => <option key={c.id} value={c.id}>{c.company_name}</option>)}
        </select>
      </div>
      <div className="input-group">
        <label htmlFor="semester_id">Semestre</label>
        <select id="semester_id" name="semester_id" className="modal-input" value={report.semester_id || ''} onChange={handleChange} required>
          <option value="">Seleccione un semestre</option>
          {semesters.map(s => <option key={s.id} value={s.id}>{s.semester_name}</option>)}
        </select>
      </div>
      <div className="input-group">
        <label>Palabras Clave</label>
        <MultiSelect
          options={allKeywords}
          selected={selectedKeywordObjects}
          onChange={handleKeywordsChange}
          placeholder="Seleccione palabras clave..."
        />
      </div>
      <div className="input-group">
        <label htmlFor="pdf_file">Archivo PDF</label>
        <input type="file" id="pdf_file" name="pdf_file" className="modal-input" accept=".pdf" onChange={onFileChange} required={!report.id} />
      </div>
    </>
  );
};

export default ReportForm;