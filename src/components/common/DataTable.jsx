import React from 'react';

const DataTable = ({ columns, data, loading, onEdit, onDelete, renderActions, renderCell }) => {
  if (loading) {
    return <div className="loading-message">Cargando...</div>;
  }

  if (!data || data.length === 0) {
    return <div className="no-data-message">No hay datos para mostrar.</div>;
  }

  const hasActions = onEdit || onDelete || renderActions;

  return (
    <div className="table-responsive">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key}>{col.label}</th>
            ))}
            {hasActions && <th>Acciones</th>}
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.id}>
              {columns.map((col) => (
                <td key={`${item.id}-${col.key}`}>
                  {(() => {
                    if (renderCell) {
                      const customCell = renderCell(item, col);
                      if (customCell !== undefined) {
                        return customCell;
                      }
                    }
                    return item[col.key];
                  })()}
                </td>
              ))}
              {hasActions && (
                <td className="actions-cell">
                  {renderActions ? (
                    renderActions(item)
                  ) : (
                    <>
                      {onEdit && <button onClick={() => onEdit(item)} className="btn-edit" title="Editar"><i className="fas fa-pencil-alt"></i></button>}
                      {onDelete && <button onClick={() => onDelete(item)} className="btn-delete" title="Eliminar"><i className="fas fa-trash"></i></button>}
                    </>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;