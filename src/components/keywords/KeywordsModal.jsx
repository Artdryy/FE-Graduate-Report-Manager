import React, { useState, useEffect, useMemo } from 'react';
import { keywordsService } from '../../services/keywordsService';
import Modal from '../common/Modal';

const KeywordsModal = ({ isOpen, onClose, onSave, initialSelectedIds = [] }) => {
  const [allKeywords, setAllKeywords] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [newKeywordName, setNewKeywordName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      keywordsService.getKeywords()
        .then(data => setAllKeywords(data))
        .finally(() => setLoading(false));
      
      setSelectedIds(new Set(initialSelectedIds));
    }
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
    try {
      const newKeywordData = await keywordsService.createKeyword(keywordToAdd);
      const fullNewKeyword = { id: newKeywordData.id, keyword: keywordToAdd };
      setAllKeywords(prev => [...prev, fullNewKeyword]);
      setNewKeywordName('');
    } catch (error) {
      alert('Error: La palabra clave ya existe o no se pudo agregar.');
    }
  };

  const handleDeleteKeyword = async (e, keywordId) => {
    e.stopPropagation();
    if (window.confirm('¿Seguro que quieres eliminar esta palabra clave de forma permanente? Afectará a todos los reportes que la usen.')) {
      try {
        await keywordsService.deleteKeyword(keywordId);
        setAllKeywords(prev => prev.filter(k => k.id !== keywordId));
        setSelectedIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(keywordId);
          return newSet;
        });
      } catch (error) {
        alert('No se pudo eliminar la palabra clave.');
      }
    }
  };
  
  const handleSave = () => {
    onSave(Array.from(selectedIds));
    onClose();
  };

  return (
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
              onClick={(e) => handleDeleteKeyword(e, keyword.id)}
              title="Eliminar permanentemente"
            >
              &times;
            </button>
          </div>
        ))}
      </div>
    </Modal>
  );
};

export default KeywordsModal;