import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../../css/admin/studentsmanagement.css';

const API_URL = 'http://localhost:8000/api';
const ROLE_ETUDIANT = 'étudiant';

function StudentsManagement() {
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const filteredStudents = students.filter(student => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      student.name?.toLowerCase().includes(searchLower) ||
      student.id?.toString().includes(searchTerm) ||
      student.email?.toLowerCase().includes(searchLower) ||
      student.student?.class?.name?.toLowerCase().includes(searchLower) || ''
    );
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Vous devez être connecté.');
      setLoading(false);
      return;
    }

    const fetchStudents = async () => {
      try {
        const response = await axios.get(`${API_URL}/users`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { role: ROLE_ETUDIANT }
        });
        
        const studentsData = response.data?.data || response.data || [];
        setStudents(studentsData);
        if (studentsData.length === 0) {
          setError('Aucun étudiant trouvé dans la base de données.');
        }
      } catch (error) {
        setError(`Erreur lors du chargement: ${error.response?.data?.message || error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const handleEdit = (studentId) => {
    navigate(`/admin/edit-student/${studentId}`);
  };

  const handleDelete = async (studentId, studentName) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer l'étudiant ${studentName} ?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/users/${studentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setStudents(prev => prev.filter(s => s.id !== studentId));
      alert('Étudiant supprimé avec succès.');
    } catch (error) {
      alert(`Erreur lors de la suppression: ${error.response?.data?.message || error.message}`);
    }
  };

  const goBack = () => navigate('/admin/dashboard');
  const goToAddStudent = () => navigate('/admin/add-student');
  
  const getStudentClassName = (student) => 
    student.student?.class?.name || 'Non assigné';

  if (loading) return <div className="loading">Chargement...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="container">
      <div className="header">
        <button className="btn-back" onClick={goBack}>← Retour</button>
        <h1>Gestion des Étudiants</h1>
        <button className="btn-add" onClick={goToAddStudent}>
          + Ajouter un étudiant
        </button>
      </div>

      <div className="search-box">
        <input
          type="text"
          placeholder="Rechercher par nom, ID, email ou classe..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <p className="total-count">Total: {filteredStudents.length} étudiant(s)</p>

      {filteredStudents.length === 0 ? (
        <div className="empty-state">
          {searchTerm ? (
            <p>Aucun étudiant trouvé pour "{searchTerm}"</p>
          ) : (
            <p>Aucun étudiant disponible.</p>
          )}
        </div>
      ) : (
        <div className="grid">
          {filteredStudents.map(student => (
            <div key={student.id} className="card">
              <div className="card-body">
                <h3>{student.name || 'Nom non disponible'}</h3>
                <p>ID: {student.id || 'N/A'}</p>
                <p>{student.email || 'Email non disponible'}</p>
                <p><strong>Classe: </strong>{getStudentClassName(student)}</p>
              </div>
              <div className="card-actions">
                <button onClick={() => handleEdit(student.id)}>
                  Modifier
                </button>
                <button 
                  className="btn-delete"
                  onClick={() => handleDelete(student.id, student.name)}
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

export default StudentsManagement;