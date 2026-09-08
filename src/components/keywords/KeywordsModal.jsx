import React, { useState, useEffect, useMemo } from 'react';
import { keywordsService } from '../../services/keywordsService';
import Modal from '../common/Modal';
import { mensajeDeError } from '../../utils/apiError';

const KeywordsModal = ({ isOpen, onClose, onSave, initialSelectedIds = [] }) => {
  const [allKeywords, setAllKeywords] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [newKeywordName, setNewKeywordName] = useState('');
  const [loading, setLoading] = useState(true);
  const [addError, setAddError] = useState('');

  const [keywordToDelete, setKeywordToDelete] = useState(null);

  // Dos efectos separados a proposito. Antes uno solo dependia de
  // `initialSelectedIds`, un arreglo que la pagina recreaba en cada render:
  // cualquier cambio en el formulario volvia a lanzar la carga y reponia la
  // seleccion, borrando de paso las palabras recien agregadas.
  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    keywordsService.getKeywords()
      .then(data => setAllKeywords(data || []))
      .finally(() => setLoading(false));
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    setSelectedIds(new Set(initialSelectedIds));
  }, [isOpen, initialSelectedIds]);

  const filteredKeywords = useMemo(() => {
    return allKeywords.filter(k =>
      k && k.keyword && k.keyword.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allKeywords, searchTerm]);

  const handleToggleKeyword = (keywordId) => {
    const newSelectedIds = new Set(selectedIds);
    if (newSelectedIds.has(keywordId)) {
      newSelectedIds.delete(keywordId);
    } else {
      newSelectedIds.add(keywordId);
    }
    setSelectedIds(newSelectedIds);
  };

  const handleAddNewKeyword = async () => {
    const keywordToAdd = newKeywordName.trim();
    if (!keywordToAdd) return;
    setAddError('');
    try {
      const newKeywordData = await keywordsService.createKeyword(keywordToAdd);
      const nuevoId = newKeywordData?.id;

      // Sin id no se puede seleccionar la palabra (la seleccion se guarda por
      // id), asi que en ese caso se relee la lista en vez de agregar una
      // pastilla que no responderia al clic.
      if (nuevoId == null) {
        const data = await keywordsService.getKeywords();
        setAllKeywords(data || []);
      } else {
        setAllKeywords(prev => [...prev, { id: nuevoId, keyword: keywordToAdd }]);
      }
      setNewKeywordName('');
    } catch (error) {
      setAddError(mensajeDeError(error, 'No se pudo agregar la palabra clave.'));
    }
  };

  const handleDeleteClick = (e, keywordId) => {
    e.stopPropagation(); 
    setKeywordToDelete(keywordId);
  };

  const confirmDelete = async () => {
    if (!keywordToDelete) return;

    try {
      await keywordsService.deleteKeyword(keywordToDelete);
      setAllKeywords(prev => prev.filter(k => k.id !== keywordToDelete));
      setSelectedIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(keywordToDelete);
        return newSet;
      });
      setKeywordToDelete(null); 
    } catch (error) {
      setAddError(mensajeDeError(error, 'No se pudo eliminar la palabra clave.'));
      setKeywordToDelete(null);
    }
  };

  // Se devuelven tambien los nombres: la caja "Palabras Clave" del formulario
  // los necesita para reflejar la seleccion al instante. Antes solo se
  // enviaban los ids y la caja seguia diciendo "Ninguna seleccionada" hasta
  // que el reporte se guardaba y se volvia a leer del servidor.
  const handleSave = () => {
    const ids = Array.from(selectedIds);
    const names = ids
      .map(id => allKeywords.find(k => k.id === id)?.keyword)
      .filter(Boolean);
    onSave({ ids, names });
    onClose();
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        onSubmit={handleSave}
        title="Administrar Palabras Clave"
        className="keywords-modal-wrapper"
      >
        <div className="keyword-controls">
          <input
            type="text"
            placeholder="Buscar palabras clave..."
            className="modal-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="add-keyword-section">
            <input
              type="text"
              placeholder="Nueva palabra clave"
              className="modal-input"
              value={newKeywordName}
              onChange={(e) => setNewKeywordName(e.target.value)}
            />
            <button type="button" className="btn-primary" onClick={handleAddNewKeyword}>Agregar</button>
          </div>
          {addError && <span className="field-error" role="alert">{addError}</span>}
        </div>
        <div className="keyword-pill-container">
          {loading ? <p>Cargando...</p> : filteredKeywords.map(keyword => (
            <div
              key={keyword.id}
              className={`keyword-pill ${selectedIds.has(keyword.id) ? 'selected' : ''}`}
              onClick={() => handleToggleKeyword(keyword.id)}
            >
              {keyword.keyword}
              <button
                type="button"
                className="delete-keyword-btn"
                onClick={(e) => handleDeleteClick(e, keyword.id)} 
                title="Eliminar permanentemente"
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      </Modal>

      {keywordToDelete && (
        <Modal
          isOpen={!!keywordToDelete}
          onClose={() => setKeywordToDelete(null)}
          onSubmit={confirmDelete}
          title="Eliminar Palabra Clave"
          submitLabel="Eliminar"
          submitClass="btn-danger" 
          className="confirmation-modal" 
        >
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
              ¿Seguro que quieres eliminar esta palabra clave de forma permanente?
            </p>
            <p style={{ color: '#d9534f', fontWeight: '500' }}>
              ⚠ Afectará a todos los reportes que la usen.
            </p>
          </div>
        </Modal>
      )}
    </>
  );
};

export default KeywordsModal;