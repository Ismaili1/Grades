import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../../css/admin/teachersmanagement.css';

const API_URL = 'http://localhost:8000/api';
const ROLE_ENSEIGNANT = 'enseignant';

function TeachersManagement() {
  const [teachers, setTeachers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const filteredTeachers = teachers.filter(teacher => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      teacher.name?.toLowerCase().includes(searchLower) ||
      teacher.id?.toString().includes(searchTerm) ||
      teacher.email?.toLowerCase().includes(searchLower)
    );
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Vous devez être connecté.');
      setLoading(false);
      return;
    }

    const fetchTeachers = async () => {
      try {
        const response = await axios.get(`${API_URL}/users`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { role: ROLE_ENSEIGNANT }
        });
        
        let teachersData = [];
        if (Array.isArray(response.data)) {
          teachersData = response.data;
        } else if (response.data?.users) {
          teachersData = response.data.users;
        } else if (response.data?.data) {
          teachersData = response.data.data;
        }

        setTeachers(teachersData);
        if (teachersData.length === 0) {
          setError('Aucun enseignant trouvé dans la base de données.');
        }
      } catch (error) {
        setError(`Erreur lors du chargement: ${error.response?.data?.message || error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchTeachers();
  }, []);

  const handleEdit = (teacherId) => {
    navigate(`/admin/edit-teacher/${teacherId}`);
  };

  const handleDelete = async (teacherId, teacherName) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer l'enseignant ${teacherName} ?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/users/${teacherId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setTeachers(prev => prev.filter(t => t.id !== teacherId));
      alert('Enseignant supprimé avec succès.');
    } catch (error) {
      alert(`Erreur lors de la suppression: ${error.response?.data?.message || error.message}`);
    }
  };

  const goBack = () => navigate('/admin/dashboard');
  const goToAddTeacher = () => navigate('/admin/add-teacher');
  
  const getSubjectName = (teacher) => 
    teacher.teacher?.subjects?.[0]?.name || 'Aucune matière assignée';
    
  const hasSubject = (teacher) => 
    !!teacher.teacher?.subjects?.length;

  if (loading) return <div className="loading">Chargement...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="container">
      <div className="header">
        <button className="btn-back" onClick={goBack}>← Retour</button>
        <h1>Gestion des Enseignants</h1>
        <button className="btn-add" onClick={goToAddTeacher}>
          + Ajouter un enseignant
        </button>
      </div>

      <div className="search-box">
        <input
          type="text"
          placeholder="Rechercher par nom, ID ou email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <p className="total-count">Total: {filteredTeachers.length} enseignant(s)</p>

      {filteredTeachers.length === 0 ? (
        <div className="empty-state">
          {searchTerm ? (
            <p>Aucun enseignant trouvé pour "{searchTerm}"</p>
          ) : (
            <p>Aucun enseignant disponible.</p>
          )}
        </div>
      ) : (
        <div className="grid">
          {filteredTeachers.map(teacher => (
            <div key={teacher.id} className="card">
              <div className="card-body">
                <h3>{teacher.name || 'Nom non disponible'}</h3>
                <p>ID: {teacher.id || 'N/A'}</p>
                <p>{teacher.email || 'Email non disponible'}</p>
                <p><strong>Matière:</strong> {getSubjectName(teacher)}</p>
                <p className={`status ${hasSubject(teacher) ? 'assigned' : 'unassigned'}`}>
                  {hasSubject(teacher) ? 'Assigné' : 'Non assigné'}
                </p>
              </div>
              <div className="card-actions">
                <button onClick={() => handleEdit(teacher.id)}>
                  Modifier
                </button>
                <button 
                  className="btn-delete"
                  onClick={() => handleDelete(teacher.id, teacher.name)}
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

export default TeachersManagement;