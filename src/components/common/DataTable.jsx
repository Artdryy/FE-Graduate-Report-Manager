import React from 'react';

const DataTable = ({ columns, data, loading, onEdit, onDelete, renderActions }) => {
  return (
    <div className="table-container">
      <table>
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key}>{col.label}</th>
            ))}
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={columns.length + 1}>Cargando...</td></tr>
          ) : data.length > 0 ? (
            data.map((item) => (
              <tr key={item.id}>
                {columns.map((col) => (
                  <td key={`${item.id}-${col.key}`}>{item[col.key]}</td>
                ))}
                <td className="actions-cell">
                  {/* THE FIX IS HERE: Use renderActions if it's provided, otherwise show default buttons */}
                  {renderActions ? (
                    renderActions(item)
                  ) : (
                    <>
                      {onEdit && <button onClick={() => onEdit(item)} className="btn-edit" title="Editar"><i className="fas fa-pencil-alt"></i></button>}
                      {onDelete && <button onClick={() => onDelete(item)} className="btn-delete" title="Eliminar"><i className="fas fa-trash"></i></button>}
                    </>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr><td colSpan={columns.length + 1}>No hay datos para mostrar.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;