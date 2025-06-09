import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../../css/admin/classesmanagement.css';

const API_URL = 'http://localhost:8000/api';

function ClassesManagement() {
  const [classes, setClasses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Filter classes based on search term
  const filteredClasses = classes.filter(classItem => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      classItem.name?.toLowerCase().includes(searchLower) ||
      classItem.id?.toString().includes(searchTerm)
    );
  });

  const fetchClasses = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Vous devez être connecté.');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(`${API_URL}/classes`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setClasses(response.data);
    } catch (error) {
      setError(`Erreur lors du chargement: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  const handleEdit = (classId) => {
    navigate(`/admin/edit-class/${classId}`);
  };

  const handleDelete = async (classId, className) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer la classe ${className} ?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/classes/${classId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Optimistic update
      setClasses(prev => prev.filter(c => c.id !== classId));
      alert('Classe supprimée avec succès.');
    } catch (error) {
      alert(`Erreur lors de la suppression: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleViewDetails = (classId) => {
    navigate(`/admin/class/${classId}`);
  };

  const goBack = () => navigate('/admin/dashboard');
  const goToAddClass = () => navigate('/admin/add-class');

  if (loading) return <div className="loading">Chargement...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="container">
      <div className="header">
        <button className="btn-back" onClick={goBack}>← Retour</button>
        <h1>Gestion des Classes</h1>
        <button className="btn-add" onClick={goToAddClass}>
          + Ajouter une classe
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

      <p className="total-count">Total: {filteredClasses.length} classe(s)</p>

      {filteredClasses.length === 0 ? (
        <div className="empty-state">
          {searchTerm ? (
            <p>Aucune classe trouvée pour "{searchTerm}"</p>
          ) : (
            <p>Aucune classe disponible.</p>
          )}
        </div>
      ) : (
        <div className="grid">
          {filteredClasses.map(classItem => (
            <div key={classItem.id} className="card">
              <div className="card-body">
                <h3>{classItem.name}</h3>
                <p>ID: {classItem.id}</p>
                <div className="stats">
                  <span className="stat">
                    <strong>Étudiants:</strong> {classItem.students_count || 0}
                  </span>
                </div>
              </div>
              <div className="card-actions">
                <button onClick={() => handleViewDetails(classItem.id)}>
                  Détails
                </button>
                <button onClick={() => handleEdit(classItem.id)}>
                  Modifier
                </button>
                <button 
                  className="btn-delete"
                  onClick={() => handleDelete(classItem.id, classItem.name)}
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

export default ClassesManagement;