import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../../css/admin/subjectsmanagement.css';

const API_URL = 'http://localhost:8000/api';

function SubjectsManagement() {
  const [subjects, setSubjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Filter subjects based on search term
  const filteredSubjects = subjects.filter(subject => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      subject.name?.toLowerCase().includes(searchLower) ||
      subject.id?.toString().includes(searchTerm)
    );
  });

  const fetchSubjects = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Vous devez être connecté.');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(`${API_URL}/subjects`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSubjects(response.data);
    } catch (error) {
      setError(`Erreur lors du chargement: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  const handleEdit = (subjectId) => {
    navigate(`/admin/edit-subject/${subjectId}`);
  };

  const handleDelete = async (subjectId, subjectName) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer la matière ${subjectName} ?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/subjects/${subjectId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Optimistic update
      setSubjects(prev => prev.filter(subject => subject.id !== subjectId));
      alert('Matière supprimée avec succès.');
    } catch (error) {
      alert(`Erreur lors de la suppression: ${error.response?.data?.message || error.message}`);
    }
  };

  const goBack = () => navigate('/admin/dashboard');
  const goToAddSubject = () => navigate('/admin/add-subject');

  if (loading) return <div className="loading">Chargement...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="container">
      <div className="header">
        <button className="btn-back" onClick={goBack}>← Retour</button>
        <h1>Gestion des Matières</h1>
        <button className="btn-add" onClick={goToAddSubject}>
          + Ajouter une matière
        </button>
      </div>

      <div className="search-box">
        <input
          type="text"
          placeholder="Rechercher par nom ou ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <p className="total-count">Total: {filteredSubjects.length} matière(s)</p>

      {filteredSubjects.length === 0 ? (
        <div className="empty-state">
          {searchTerm ? (
            <p>Aucune matière trouvée pour "{searchTerm}"</p>
          ) : (
            <p>Aucune matière disponible.</p>
          )}
        </div>
      ) : (
        <div className="grid">
          {filteredSubjects.map(subject => (
            <div key={subject.id} className="card">
              <div className="card-body">
                <h3>{subject.name}</h3>
                <p>ID: {subject.id}</p>
                <div className="stats">
                  {subject.teachers_count !== undefined && (
                    <span className="stat">
                      <strong>Enseignants:</strong> {subject.teachers_count}
                    </span>
                  )}
                  {subject.classes_count !== undefined && (
                    <span className="stat">
                      <strong>Classes:</strong> {subject.classes_count}
                    </span>
                  )}
                </div>
              </div>
              <div className="card-actions">
                <button onClick={() => handleEdit(subject.id)}>
                  Modifier
                </button>
                <button 
                  className="btn-delete"
                  onClick={() => handleDelete(subject.id, subject.name)}
                >
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SubjectsManagement;