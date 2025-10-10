import React from 'react';

const DataTable = ({ columns, data, onEdit, onDelete, loading }) => {
  const handleEdit = (item) => {
    if (onEdit) onEdit(item);
  };

  const handleDelete = (item) => {
    if (onDelete) onDelete(item);
  };

  return (
    <div className="table-container">
      <table>
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key}>{col.label}</th>
            ))}
            {(onEdit || onDelete) && <th>Acciones</th>}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={columns.length + (onEdit || onDelete ? 1 : 0)}>
                Cargando...
              </td>
            </tr>
          ) : data.length > 0 ? (
            data.map((item) => (
              <tr key={item.id}>
                {columns.map((col) => (
                  <td key={`${item.id}-${col.key}`}>{item[col.key]}</td>
                ))}
                {(onEdit || onDelete) && (
                  <td className="actions-cell">
                    {onEdit && (
                      <button onClick={() => handleEdit(item)} className="btn-edit">
                        <i className="fas fa-pencil-alt"></i>
                      </button>
                    )}
                    {onDelete && (
                      <button onClick={() => handleDelete(item)} className="btn-delete">
                        <i className="fas fa-trash"></i>
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length + (onEdit || onDelete ? 1 : 0)}>
                No hay datos para mostrar.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;