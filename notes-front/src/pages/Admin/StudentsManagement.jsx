import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FiPlus, FiEdit, FiTrash2, FiX, FiSave, FiUserPlus } from 'react-icons/fi';
import '../../css/Admin/StudentsManagement.css';

const API_URL = 'http://localhost:8000/api';
const ROLE_ETUDIANT = 'étudiant';

// Form component for adding/editing students
const StudentForm = ({ formData, onSubmit, onCancel, mode, classes, loading }) => (
  <div className="student-form-container">
    <h3>{mode === 'add' ? 'Ajouter un étudiant' : 'Modifier l\'étudiant'}</h3>
    <form onSubmit={onSubmit} className="student-form">
      <div className="form-group">
        <label>Nom complet</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={(e) => {
            const value = e.target.value;
            // Generate email based on name
            const email = value 
              ? value.toLowerCase().replace(/\s+/g, '.') + '@school.ma'
              : '';
            
            // Update both name and email
            onSubmit({
              target: { 
                name: 'email',
                value: email
              }
            }, true);
            
            // Update the name
            e.persist();
            onSubmit(e);
          }}
          required
          placeholder="Nom complet"
        />
      </div>
      
      <div className="form-group">
        <label>Email</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={onSubmit}
          required
          placeholder="email@example.com"
        />
      </div>
      
      <div className="form-group">
        <label>Classe</label>
        <select
          name="class_id"
          value={formData.class_id || ''}
          onChange={onSubmit}
          required
        >
          <option value="">Sélectionner une classe</option>
          {classes.map(cls => (
            <option key={cls.id} value={cls.id}>
              {cls.name}
            </option>
          ))}
        </select>
      </div>
      
      {mode === 'add' && (
        <div className="form-group">
          <label>Mot de passe</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={onSubmit}
            required={mode === 'add'}
            placeholder="••••••••"
          />
        </div>
      )}
      
      <div className="form-actions">
        <button 
          type="button" 
          className="btn btn-cancel"
          onClick={onCancel}
          disabled={loading}
        >
          <FiX /> Annuler
        </button>
        <button 
          type="submit" 
          className="btn btn-submit"
          disabled={loading}
        >
          {loading ? 'Enregistrement...' : (
            <>
              <FiSave /> {mode === 'add' ? 'Ajouter' : 'Mettre à jour'}
            </>
          )}
        </button>
      </div>
    </form>
  </div>
);

function StudentsManagement() {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState('add'); // 'add' or 'edit'
  const [currentStudentId, setCurrentStudentId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    class_id: '',
    password: 'password123' // Default password
  });
  const formRef = React.useRef(null);
  
  // Don't fetch students until a class is selected
  const [initialLoad, setInitialLoad] = useState(true);

  // Fetch classes on component mount
  useEffect(() => {
    const fetchClasses = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Vous devez être connecté.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const classesResponse = await axios.get(`${API_URL}/classes`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const classesData = classesResponse.data?.data || classesResponse.data || [];
        setClasses(classesData);
      } catch (error) {
        console.error('Error fetching classes:', error);
        setError(`Erreur lors du chargement des classes: ${error.response?.data?.message || error.message}`);
      } finally {
        setLoading(false);
        setInitialLoad(false);
      }
    };

    fetchClasses();
  }, []);

  // Fetch students when selectedClass changes
  useEffect(() => {
    if (!selectedClass) {
      setStudents([]);
      return;
    }

    const fetchStudents = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        setLoading(true);
        const classStudentsResponse = await axios.get(`${API_URL}/classes/${selectedClass}/students`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const formattedStudents = (classStudentsResponse.data || []).map(item => ({
          ...item.user,
          student: {
            ...item,
            class_id: selectedClass
          }
        }));
        
        setStudents(formattedStudents);
      } catch (error) {
        console.error('Error fetching students:', error);
        setError(`Erreur lors du chargement des étudiants: ${error.response?.data?.message || error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [selectedClass]);
  
  const filteredStudents = students;

  const toggleForm = () => {
    setShowForm(!showForm);
    if (showForm) {
      // Reset form when hiding
      setFormMode('add');
      setCurrentStudentId(null);
      setFormData({
        name: '',
        email: '',
        class_id: '',
        password: 'password123'
      });
    }
  };

  const handleEdit = (student) => {
    // First, scroll to top of the page
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Then update the form data and show the form
    setFormMode('edit');
    setCurrentStudentId(student.id);
    setFormData({
      name: student.name,
      email: student.email,
      class_id: student.student?.class_id || '',
      password: '' // Don't show password in edit mode
    });
    
    // Show the form
    setShowForm(true);
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
      setError('');
      // Show success message
      const successMsg = document.createElement('div');
      successMsg.className = 'success-message';
      successMsg.textContent = 'Étudiant supprimé avec succès';
      document.body.appendChild(successMsg);
      setTimeout(() => successMsg.remove(), 3000);
    } catch (error) {
      setError(`Erreur lors de la suppression: ${error.response?.data?.message || error.message}`);
    }
  };


  
  const getStudentClassName = (student) => {
    // Get the class ID from either the nested class object or directly from class_id
    const classId = student.student?.class?.id || student.student?.class_id;
    
    // Find the class in our classes array
    const studentClass = classes.find(c => c.id == classId);
    
    // Return the class name if found, otherwise return default
    return studentClass?.name || 'Non assigné';
  };

  const handleFormChange = (e, skipSet = false) => {
    if (!skipSet) {
      const { name, value } = e.target;
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const url = formMode === 'add' 
        ? `${API_URL}/register`
        : `${API_URL}/users/${currentStudentId}`;
      
      const payload = {
        name: formData.name,
        email: formData.email,
        role: ROLE_ETUDIANT,
        class_id: formData.class_id,
        ...(formMode === 'add' && { password: formData.password })
      };

      await (formMode === 'add'
        ? axios.post(url, payload, {
            headers: { Authorization: `Bearer ${token}` }
          })
        : axios.put(url, payload, {
            headers: { Authorization: `Bearer ${token}` }
          }));


      // Refresh students list based on current filter
      if (selectedClass) {
        const classStudentsResponse = await axios.get(`${API_URL}/classes/${selectedClass}/students`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const formattedStudents = (classStudentsResponse.data || []).map(item => ({
          ...item.user,
          student: {
            ...item,
            class_id: selectedClass
          }
        }));
        setStudents(formattedStudents);
      } else {
        const allStudentsResponse = await axios.get(`${API_URL}/users?role=étudiant`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const allStudents = allStudentsResponse.data?.data || allStudentsResponse.data || [];
        setStudents(allStudents);
      }

      // Show success message
      const successMsg = document.createElement('div');
      successMsg.className = 'success-message';
      successMsg.textContent = `Étudiant ${formMode === 'add' ? 'ajouté' : 'mis à jour'} avec succès`;
      document.body.appendChild(successMsg);
      setTimeout(() => successMsg.remove(), 3000);

      // Reset form
      toggleForm();
    } catch (error) {
      console.error('Error saving student:', error);
      setError(`Erreur lors de l'enregistrement: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="loading-message">Chargement en cours...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="students-management">
      <div className="page-header">
        <h1 className="page-title">Gestion des Étudiants</h1>
        {!showForm && (
          <button 
            className="btn btn-add" 
            onClick={toggleForm}
          >
            <FiUserPlus /> Ajouter un étudiant
          </button>
        )}
      </div>

      {showForm && (
        <div ref={formRef}>
          <StudentForm
            formData={formData}
            onSubmit={handleFormSubmit}
            onCancel={toggleForm}
            mode={formMode}
            classes={classes}
            loading={isSubmitting}
          />
        </div>
      )}

      {error && <div className="error-message">{error}</div>}
      
      <div className="controls">
        <div className="form-group">
          <label htmlFor="class-select">Sélectionner une classe</label>
          <select
            id="class-select"
            className="class-select"
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value || '')}
            required
          >
            <option value="">-- Sélectionner une classe --</option>
            {classes.map(cls => (
              <option key={cls.id} value={cls.id}>
                {cls.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading">Chargement en cours...</div>
      ) : !selectedClass ? (
        <div className="empty-state">
          <p>Veuillez sélectionner une classe pour afficher les étudiants</p>
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="empty-state">
          <p>Aucun étudiant trouvé dans cette classe</p>
        </div>
      ) : (
        <div className="table-container">
          <p className="total-count">
            {`${filteredStudents.length} étudiant(s) trouvé(s)`}
          </p>
          <table className="students-table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>ID</th>
                <th>Email</th>
                <th>Classe</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map(student => (
                <tr key={student.id}>
                  <td>{student.name || 'Nom non disponible'}</td>
                  <td>{student.id || 'N/A'}</td>
                  <td>{student.email || 'Non disponible'}</td>
                  <td>{getStudentClassName(student)}</td>
                  <td className="actions-cell">
                    <button 
                      onClick={() => handleEdit(student)}
                      className="btn btn-edit"
                      title="Modifier"
                    >
                      <FiEdit />
                    </button>
                    <button 
                      className="btn btn-delete"
                      onClick={() => handleDelete(student.id, student.name)}
                      title="Supprimer"
                    >
                      <FiTrash2 />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default StudentsManagement;