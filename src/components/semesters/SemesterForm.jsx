import React from 'react';
import { LISTA_PERIODOS, buildSemesterLabel } from '../../utils/semesters';

const ANIO_MINIMO = 1970;
const MAX_LONGITUD = 30; // semester varchar(30) en la base de datos

/**
 * Formulario estructurado (periodo + año) en vez de texto libre, para que los
 * semestres antiguos que se capturan a mano conserven el formato canonico del
 * que depende el ordenamiento. Se deja una salida de texto libre por si hace
 * falta capturar una etiqueta que no siga el patron.
 */
const SemesterForm = ({ semester, setSemester }) => {
  const { periodo, anio, libre, usarTextoLibre } = semester;

  const anioMaximo = new Date().getFullYear() + 1;

  const actualizar = (cambios) => setSemester((prev) => ({ ...prev, ...cambios }));

  const vistaPrevia = usarTextoLibre
    ? (libre || '')
    : buildSemesterLabel(periodo, anio || '');

  return (
    <>
      {!usarTextoLibre && (
        <>
          <div className="input-group">
            <label htmlFor="periodo">Periodo</label>
            <select
              id="periodo"
              name="periodo"
              className="modal-input"
              value={periodo}
              onChange={(e) => actualizar({ periodo: e.target.value })}
              required
            >
              {LISTA_PERIODOS.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <div className="input-group">
            <label htmlFor="anio">Año</label>
            <input
              type="number"
              id="anio"
              name="anio"
              className="modal-input"
              value={anio}
              min={ANIO_MINIMO}
              max={anioMaximo}
              step="1"
              onChange={(e) => actualizar({ anio: e.target.value })}
              required
            />
            <small className="input-hint">
              Para semestres antiguos escribe el año directamente, por ejemplo 1998.
            </small>
          </div>
        </>
      )}

      {usarTextoLibre && (
        <div className="input-group">
          <label htmlFor="libre">Nombre del semestre</label>
          <input
            type="text"
            id="libre"
            name="libre"
            className="modal-input"
            value={libre || ''}
            maxLength={MAX_LONGITUD}
            onChange={(e) => actualizar({ libre: e.target.value })}
            required
          />
          <small className="input-hint">
            Máximo {MAX_LONGITUD} caracteres. Si no sigue el formato
            «Enero - Junio AAAA» puede ordenarse de forma incorrecta.
          </small>
        </div>
      )}

      <div className="input-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={!!usarTextoLibre}
            onChange={(e) => actualizar({ usarTextoLibre: e.target.checked })}
          />
          <span>Otro (texto libre)</span>
        </label>
      </div>

      <div className="input-group">
        <label>Se guardará como</label>
        <p className="semester-preview">{vistaPrevia || '—'}</p>
      </div>
    </>
  );
};

export default SemesterForm;
