import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { 
  FiEdit, 
  FiTrash2, 
  FiUserPlus, 
  FiX, 
  FiSave, 
  FiPlus,
  FiMinus,
  FiBook,
  FiUsers
} from 'react-icons/fi';
import '../../css/Admin/teachersmanagement.css';
import '../../css/Admin/teacher-form.css';

const API_URL = 'http://localhost:8000/api';
const ROLE_ENSEIGNANT = 'enseignant';

// Teacher Form Component
const TeacherForm = ({ 
  formData, 
  onChange, 
  onSubmit, 
  onCancel, 
  mode, 
  loading, 
  availableSubjects = [], 
  availableClasses = [],
  selectedSubjects = [],
  selectedClasses = [],
  onSubjectSelect,
  onClassSelect,
  onRemoveSelectedSubject,
  onRemoveSelectedClass,
  currentAssignments = [],
  onRemoveAssignment
}) => {
  // Debug log to check props
  useEffect(() => {
    console.log('TeacherForm - availableSubjects:', availableSubjects);
    console.log('TeacherForm - availableClasses:', availableClasses);
    console.log('TeacherForm - selectedSubjects:', selectedSubjects);
    console.log('TeacherForm - selectedClasses:', selectedClasses);
  }, [availableSubjects, availableClasses, selectedSubjects, selectedClasses]);
  // Debug effect to log assignments and available data
  useEffect(() => {
    console.log('TeacherForm - Current Assignments:', currentAssignments);
    console.log('TeacherForm - Available Subjects:', availableSubjects);
    console.log('TeacherForm - Available Classes:', availableClasses);
    console.log('TeacherForm - Selected Subjects:', selectedSubjects);
    console.log('TeacherForm - Selected Classes:', selectedClasses);
  }, [currentAssignments, availableSubjects, availableClasses, selectedSubjects, selectedClasses]);

  const handleNameChange = (e) => {
    const value = e.target.value;
    const email = value ? value.toLowerCase().replace(/\s+/g, '.') + '@school.ma' : '';
    onChange({ target: { name: 'name', value } });
    onChange({ target: { name: 'email', value: email } });
  };

  // Helper function to get subject/class name by ID
  const getItemName = (id, type) => {
    if (type === 'subject') {
      const subject = availableSubjects.find(s => (s.id || s._id) === id);
      return subject?.name || subject?.nom || `Matière ${id}`;
    } else {
      const cls = availableClasses.find(c => (c.id || c._id) === id);
      return cls?.name || cls?.nom || `Classe ${id}`;
    }
  };

  return (
    <div className="teacher-form-container">
      <h3>{mode === 'add' ? 'Ajouter un enseignant' : 'Modifier l\'enseignant'}</h3>
      <form onSubmit={onSubmit} className="teacher-form">
        <div className="form-row">
          <div className="form-group">
            <label>Nom complet</label>
            <input
              type="text"
              name="name"
              value={formData.name || ''}
              onChange={handleNameChange}
              required
              placeholder="Nom complet"
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email || ''}
              onChange={onChange}
              required
              placeholder="Email"
              disabled={loading}
            />
          </div>
        </div>
        
        {mode === 'add' && (
          <div className="form-group">
            <label>Mot de passe</label>
            <input
              type="password"
              name="password"
              value={formData.password || ''}
              onChange={onChange}
              required
              placeholder="Mot de passe"
              disabled={loading}
            />
          </div>
        )}
        
        <div className="form-section">
          <h4>Affectations</h4>
          <p className="form-hint">Sélectionnez les matières et classes pour cet enseignant</p>
          
          <div className="form-row">
            <div className="form-group">
              <label>Matière</label>
              <select 
                value=""
                onChange={(e) => {
                  if (e.target.value) {
                    onSubjectSelect([...selectedSubjects, e.target.value]);
                    e.target.value = '';
                  }
                }}
                disabled={loading || availableSubjects.length === 0}
              >
                <option value="">
                  {availableSubjects.length === 0 ? 'Chargement...' : 'Sélectionner une matière'}
                </option>
                {availableSubjects
                  .filter(subject => !selectedSubjects.includes(subject.id || subject._id))
                  .map(subject => {
                    const subjectId = subject.id || subject._id;
                    const subjectName = subject.name || subject.nom || `Matière ${subjectId}`;
                    return (
                      <option key={subjectId} value={subjectId}>
                        {subjectName}
                      </option>
                    );
                  })}
              </select>
              
              {selectedSubjects.length > 0 && (
                <div className="selected-items">
                  <label>Matières sélectionnées:</label>
                  <div className="selected-items-list">
                    {selectedSubjects.map((subjectId, index) => (
                      <span key={`${subjectId}-${index}`} className="selected-item">
                        {getItemName(subjectId, 'subject')}
                        <button 
                          type="button" 
                          className="remove-item"
                          onClick={() => onRemoveSelectedSubject(index)}
                          disabled={loading}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="form-group">
              <label>Classe</label>
              <select 
                value=""
                onChange={(e) => {
                  if (e.target.value) {
                    onClassSelect([...selectedClasses, e.target.value]);
                    e.target.value = '';
                  }
                }}
                disabled={loading || availableClasses.length === 0}
              >
                <option value="">
                  {availableClasses.length === 0 ? 'Chargement...' : 'Sélectionner une classe'}
                </option>
                {availableClasses
                  .filter(cls => !selectedClasses.includes(cls.id || cls._id))
                  .map(cls => {
                    const classId = cls.id || cls._id;
                    const className = cls.name || cls.nom || `Classe ${classId}`;
                    return (
                      <option key={classId} value={classId}>
                        {className}
                      </option>
                    );
                  })}
              </select>
              
              {selectedClasses.length > 0 && (
                <div className="selected-items">
                  <label>Classes sélectionnées:</label>
                  <div className="selected-items-list">
                    {selectedClasses.map((classId, index) => (
                      <span key={`${classId}-${index}`} className="selected-item">
                        {getItemName(classId, 'class')}
                        <button 
                          type="button" 
                          className="remove-item"
                          onClick={() => onRemoveSelectedClass(index)}
                          disabled={loading}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {mode !== 'add' && (
            <div className="current-assignments">
              <h5>Affectations actuelles</h5>
              {currentAssignments.length > 0 ? (
                <div>
                  <div className="debug-info" style={{ fontSize: '0.8em', color: '#666', marginBottom: '10px' }}>
                    Debug: {currentAssignments.length} affectation(s) trouvée(s)
                  </div>
                  <table className="assignments-table">
                    <thead>
                      <tr>
                        <th>Matière</th>
                        <th>Classe</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentAssignments.map((assignment, index) => {
                        console.log('Rendering assignment:', assignment);
                        const subjectId = assignment.subject_id?._id || assignment.subject_id || 'N/A';
                        const classId = assignment.class_id?._id || assignment.class_id || 'N/A';
                        return (
                          <tr key={`${subjectId}-${classId}-${index}`}>
                            <td>
                              {getItemName(assignment.subject_id, 'subject')}
                              <div className="debug-id">ID: {subjectId}</div>
                            </td>
                            <td>
                              {getItemName(assignment.class_id, 'class')}
                              <div className="debug-id">ID: {classId}</div>
                            </td>
                            <td>
                              <button 
                                type="button"
                                className="btn-remove"
                                onClick={() => onRemoveAssignment(assignment)}
                                disabled={loading}
                                title="Supprimer cette affectation"
                              >
                                <FiTrash2 /> Supprimer
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="no-assignments">Aucune affectation actuelle</p>
              )}
            </div>
          )}
        </div>
        
        <div className="form-actions">
          <button 
            type="button" 
            className="btn-cancel"
            onClick={onCancel}
            disabled={loading}
          >
            <FiX /> Annuler
          </button>
          <button 
            type="submit" 
            className="btn-save"
            disabled={loading || (selectedSubjects.length === 0 || selectedClasses.length === 0)}
          >
            {loading ? 'Enregistrement...' : <><FiSave /> Enregistrer</>}
          </button>
        </div>
      </form>
    </div>
  );
};

// Assignment Modal Component
const AssignmentModal = ({
  show,
  onClose,
  teacher,
  availableSubjects,
  availableClasses,
  currentAssignments,
  onAddAssignments,
  onRemoveAssignment,
  loading,
  error,
  selectedSubjects,
  selectedClasses,
  onSubjectSelect,
  onClassSelect,
  onSingleAssignmentAdd,
  onRemoveSelectedSubject,
  onRemoveSelectedClass
}) => {
  if (!show) return null;

  // Helper function to get subject/class name by ID
  const getItemName = (id, type) => {
    if (type === 'subject') {
      const subject = availableSubjects.find(s => (s.id || s._id) === id);
      return subject?.name || subject?.nom || `Matière ${id}`;
    } else {
      const cls = availableClasses.find(c => (c.id || c._id) === id);
      return cls?.name || cls?.nom || `Classe ${id}`;
    }
  };

  return (
    <div className="assignment-modal-overlay">
      <div className="assignment-modal">
        <div className="modal-header">
          <h3>Gérer les affectations pour {teacher?.name}</h3>
          <button 
            onClick={onClose}
            className="btn-close"
            disabled={loading}
          >
            ×
          </button>
        </div>
        
        <div className="modal-body">
          <div className="assignment-form">
            <div className="form-row">
              <div className="form-group">
                <label>Matière</label>
                <select 
                  value=""
                  onChange={(e) => {
                    if (e.target.value) {
                      onSubjectSelect([...selectedSubjects, e.target.value]);
                      e.target.value = ''; // Reset the select
                    }
                  }}
                  disabled={loading}
                >
                  <option value="">Sélectionner une matière</option>
                  {availableSubjects
                    .filter(subject => !selectedSubjects.includes(subject.id || subject._id))
                    .map(subject => (
                      <option key={subject.id || subject._id} value={subject.id || subject._id}>
                        {subject.name || subject.nom}
                      </option>
                    ))}
                </select>
                
                {selectedSubjects.length > 0 && (
                  <div className="selected-items">
                    <label>Matières sélectionnées:</label>
                    <div className="selected-items-list">
                      {selectedSubjects.map((subjectId, index) => (
                        <span key={subjectId} className="selected-item">
                          {getItemName(subjectId, 'subject')}
                          <button 
                            type="button" 
                            className="remove-item"
                            onClick={() => onRemoveSelectedSubject(index)}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="form-group">
                <label>Classe</label>
                <select 
                  value=""
                  onChange={(e) => {
                    if (e.target.value) {
                      onClassSelect([...selectedClasses, e.target.value]);
                      e.target.value = ''; // Reset the select
                    }
                  }}
                  disabled={loading}
                >
                  <option value="">Sélectionner une classe</option>
                  {availableClasses
                    .filter(cls => !selectedClasses.includes(cls.id || cls._id))
                    .map(cls => (
                      <option key={cls.id || cls._id} value={cls.id || cls._id}>
                        {cls.name || cls.nom}
                      </option>
                    ))}
                </select>
                
                {selectedClasses.length > 0 && (
                  <div className="selected-items">
                    <label>Classes sélectionnées:</label>
                    <div className="selected-items-list">
                      {selectedClasses.map((classId, index) => (
                        <span key={classId} className="selected-item">
                          {getItemName(classId, 'class')}
                          <button 
                            type="button" 
                            className="remove-item"
                            onClick={() => onRemoveSelectedClass(index)}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="form-actions">
              <button 
                type="button"
                onClick={onAddAssignments}
                disabled={selectedSubjects.length === 0 || selectedClasses.length === 0 || loading}
                className="btn btn-primary"
              >
                {loading ? 'Chargement...' : `Ajouter ${selectedSubjects.length * selectedClasses.length} affectation(s)`}
              </button>
            </div>
            
            {error && <div className="error-message">{error}</div>}
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          <div className="current-assignments">
            <h4>Affectations actuelles</h4>
            {currentAssignments.length === 0 ? (
              <p>Aucune affectation pour le moment</p>
            ) : (
              <table className="assignments-table">
                <thead>
                  <tr>
                    <th>Matière</th>
                    <th>Classe</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentAssignments.map((assignment, index) => (
                    <tr key={`${assignment.subject_id}-${assignment.class_id}-${index}`}>
                      <td>{assignment.subject_name || assignment.subject_id?.name || assignment.subject_id?.nom || `Matière ${assignment.subject_id}`}</td>
                      <td>{assignment.class_name || assignment.class_id?.name || assignment.class_id?.nom || `Classe ${assignment.class_id}`}</td>
                      <td>
                        <button 
                          className="btn-remove"
                          onClick={() => onRemoveAssignment(assignment)}
                          disabled={loading}
                        >
                          <FiTrash2 /> Supprimer
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Component
function TeachersManagement() {
  // State management
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [availableClasses, setAvailableClasses] = useState([]);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState('add');
  const [currentTeacherId, setCurrentTeacherId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: 'password123',
    role: ROLE_ENSEIGNANT
  });
  
  // Assignment selection state
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [selectedClasses, setSelectedClasses] = useState([]);
  const [currentAssignments, setCurrentAssignments] = useState([]);
  
  const formRef = useRef(null);

  // Fetch initial data when component mounts
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        await Promise.all([
          fetchTeachers(),
          fetchAssignmentData()
        ]);
      } catch (error) {
        console.error('Error fetching initial data:', error);
        setError('Erreur lors du chargement des données initiales');
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  // Fetch teachers
  const fetchTeachers = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Non authentifié. Veuillez vous reconnecter.');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/users`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
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
    } catch (error) {
      console.error('Error fetching teachers:', error);
      setError(`Erreur lors du chargement des enseignants: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Fetch available subjects and classes
  const fetchAssignmentData = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Non authentifié. Veuillez vous reconnecter.');
      return;
    }
    
    try {
      setLoading(true);
      console.log('Fetching subjects and classes...');
      
      // Fetch subjects and classes in parallel
      const [subjectsRes, classesRes] = await Promise.all([
        axios.get(`${API_URL}/subjects`, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }),
        axios.get(`${API_URL}/classes`, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        })
      ]);
      
      console.log('Raw subjects response:', subjectsRes);
      console.log('Raw classes response:', classesRes);
      
      // Process subjects response
      let subjectsData = [];
      if (Array.isArray(subjectsRes.data)) {
        subjectsData = subjectsRes.data;
      } else if (subjectsRes.data?.data) {
        subjectsData = subjectsRes.data.data;
      } else if (subjectsRes.data?.subjects) {
        subjectsData = subjectsRes.data.subjects;
      }
      
      // Process classes response
      let classesData = [];
      if (Array.isArray(classesRes.data)) {
        classesData = classesRes.data;
      } else if (classesRes.data?.data) {
        classesData = classesRes.data.data;
      } else if (classesRes.data?.classes) {
        classesData = classesRes.data.classes;
      }
      
      console.log('Processed subjects:', subjectsData);
      console.log('Processed classes:', classesData);
      
      // Update state with the processed data
      setAvailableSubjects(subjectsData);
      setAvailableClasses(classesData);
      
      // Verify the state was updated
      setTimeout(() => {
        console.log('State after update - availableSubjects:', availableSubjects);
        console.log('State after update - availableClasses:', availableClasses);
      }, 1000);
      
      return { subjects: subjectsData, classes: classesData };
      
    } catch (error) {
      console.error('Error fetching assignment data:', error);
      setError(`Erreur lors du chargement des données: ${error.message}`);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Open assignment modal
  const handleOpenAssignmentModal = async (teacher) => {
    setSelectedTeacher(teacher);
    setShowAssignmentModal(true);
    setLoading(true);
    
    try {
      await fetchAssignmentData();
      await fetchTeacherAssignments(teacher.id);
    } catch (error) {
      console.error('Error opening assignment modal:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch teacher's current assignments
  const fetchTeacherAssignments = async (teacherId) => {
    if (!teacherId) {
      console.error('No teacher ID provided to fetch assignments');
      setCurrentAssignments([]);
      return [];
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setError('Non authentifié. Veuillez vous reconnecter.');
      return [];
    }

    try {
      console.log(`Fetching assignments for teacher ${teacherId}...`);
      const response = await axios.get(`${API_URL}/teachers/${teacherId}/subjects`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      console.log('Raw assignments API response:', response.data);

      let assignments = [];
      
      // Handle different response formats
      if (Array.isArray(response.data)) {
        assignments = response.data;
      } else if (response.data?.data) {
        assignments = response.data.data;
      } else if (response.data?.assignments) {
        assignments = response.data.assignments;
      } else if (response.data?.subjects) {
        // Handle case where assignments are in a 'subjects' field
        assignments = response.data.subjects.map(subject => ({
          subject_id: subject.id || subject._id,
          class_id: subject.class_id,
          subject_name: subject.name || subject.nom,
          class_name: subject.class_name
        }));
      } else if (response.data?.subject_classes) {
        // Handle case where assignments are in 'subject_classes' array
        assignments = response.data.subject_classes.map(item => ({
          subject_id: item.subject_id || (item.subject?.id || item.subject?._id),
          class_id: item.class_id || (item.class?.id || item.class?._id),
          subject_name: item.subject?.name || item.subject?.nom,
          class_name: item.class?.name || item.class?.nom
        }));
      }

      // Ensure all assignments have the required fields
      assignments = assignments.map(assignment => ({
        ...assignment,
        subject_id: assignment.subject_id?._id || assignment.subject_id,
        class_id: assignment.class_id?._id || assignment.class_id,
        subject_name: assignment.subject_name || assignment.subject?.name || assignment.subject?.nom || 'Matière inconnue',
        class_name: assignment.class_name || assignment.class?.name || assignment.class?.nom || 'Classe inconnue'
      }));

      console.log('Processed assignments:', assignments);
      setCurrentAssignments(assignments);
      return assignments;
    } catch (error) {
      console.error('Error fetching teacher assignments:', error);
      const errorMsg = error.response?.data?.message || error.message;
      console.error('Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
      setError(`Erreur lors du chargement des affectations: ${errorMsg}`);
      setCurrentAssignments([]);
      return [];
    }
  };

  // Check if assignment already exists
  const assignmentExists = (subjectId, classId) => {
    return currentAssignments.some(
      a => (a.subject_id === subjectId || a.subject_id?._id === subjectId) && 
           (a.class_id === classId || a.class_id?._id === classId)
    );
  };

  // Handle subject selection
  const handleSubjectSelect = (subjectId) => {
    setSelectedSubjects(Array.isArray(subjectId) ? subjectId : [subjectId]);
  };

  // Handle class selection
  const handleClassSelect = (classId) => {
    setSelectedClasses(Array.isArray(classId) ? classId : [classId]);
  };

  // Remove a selected subject
  const handleRemoveSelectedSubject = (index) => {
    const newSubjects = [...selectedSubjects];
    newSubjects.splice(index, 1);
    setSelectedSubjects(newSubjects);
  };

  // Remove a selected class
  const handleRemoveSelectedClass = (index) => {
    const newClasses = [...selectedClasses];
    newClasses.splice(index, 1);
    setSelectedClasses(newClasses);
  };

  // Add multiple assignments
  const handleAddAssignments = async (subjects, classes, teacherId = currentTeacherId) => {
    if (subjects.length === 0 || classes.length === 0) {
      setError('Veuillez sélectionner au moins une matière et une classe');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const newAssignments = [];
      const assignmentPromises = [];

      // Create all assignment combinations
      for (const subjectId of subjects) {
        const subject = availableSubjects.find(s => (s.id || s._id) === subjectId);
        
        for (const classId of classes) {
          const cls = availableClasses.find(c => (c.id || c._id) === classId);
          
          // Skip if this assignment already exists
          if (assignmentExists(subjectId, classId)) continue;
          
          const assignment = {
            teacher_id: selectedTeacher.id,
            subject_id: subjectId,
            class_id: classId,
            subject_name: subject?.name || subject?.nom || `Matière ${subjectId}`,
            class_name: cls?.name || cls?.nom || `Classe ${classId}`
          };

          newAssignments.push(assignment);
          
          // Create API call promise
          assignmentPromises.push(
            axios.post(
              `${API_URL}/assignments`,
              {
                teacher_id: selectedTeacher.id,
                subject_id: subjectId,
                class_id: classId
              },
              {
                headers: { 
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json',
                  'Accept': 'application/json',
                  'X-Request-ID': `assign-${selectedTeacher.id}-${subjectId}-${classId}-${Date.now()}`
                }
              }
            )
          );
        }
      }

      if (newAssignments.length === 0) {
        setError('Toutes les affectations sélectionnées existent déjà');
        return;
      }

      // Execute all API calls in parallel
      const results = await Promise.allSettled(assignmentPromises);

      // Handle results
      const errors = results.filter(r => r.status === 'rejected');
      const successes = results.filter(r => r.status === 'fulfilled');

      if (errors.length > 0) {
        console.error('Some assignments failed:', errors);
        if (successes.length === 0) {
          throw new Error(errors[0].reason?.message || 'Erreur lors de l\'ajout des affectations');
        } else {
          showSuccess(`${successes.length} affectation(s) ajoutée(s) avec succès`);
          setError(`${errors.length} affectation(s) n'ont pas pu être ajoutées`);
        }
      } else {
        showSuccess(`${successes.length} affectation(s) ajoutée(s) avec succès`);
      }

      // Refresh assignments
      await fetchTeacherAssignments(selectedTeacher.id);
      
      // Reset selections if in multi-select mode
      if (isSelecting) {
        setSelectedSubjects([]);
        setSelectedClasses([]);
      }

    } catch (error) {
      console.error('Error adding assignments:', error);
      setError(`Erreur: ${error.message || 'Erreur lors de l\'ajout des affectations'}`);
    } finally {
      setLoading(false);
    }
  };

  // Remove an assignment
  const handleRemoveAssignment = async (assignment) => {
    console.log('Removing assignment:', assignment);
    
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette affectation ?')) {
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Extract IDs with fallbacks
      const teacherId = assignment.teacher_id || currentTeacherId;
      const subjectId = assignment.subject_id?._id || assignment.subject_id;
      const classId = assignment.class_id?._id || assignment.class_id;
      
      console.log('Deleting assignment with IDs:', { teacherId, subjectId, classId });
      
      await axios.delete(`${API_URL}/assignments`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        data: {
          teacher_id: teacherId,
          subject_id: subjectId,
          class_id: classId
        }
      });
      
      showSuccess('Affectation supprimée avec succès');
      
      // Update current assignments list
      setCurrentAssignments(prev => {
        const updated = prev.filter(a => {
          const aSubjectId = a.subject_id?._id || a.subject_id;
          const aClassId = a.class_id?._id || a.class_id;
          const match = aSubjectId === subjectId && aClassId === classId;
          
          console.log('Checking assignment for removal:', {
            a,
            aSubjectId,
            aClassId,
            subjectId,
            classId,
            match
          });
          
          return !match;
        });
        
        console.log('Updated assignments after removal:', updated);
        return updated;
      });
      
      // Refresh the assignments to ensure consistency
      if (currentTeacherId) {
        console.log('Refreshing assignments for teacher:', currentTeacherId);
        await fetchTeacherAssignments(currentTeacherId);
      }
      
    } catch (error) {
      console.error('Error removing assignment:', error);
      console.error('Error details:', {
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText
      });
      setError(`Erreur lors de la suppression: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Toggle teacher form
  const toggleForm = () => {
    setShowForm(!showForm);
    if (!showForm) {
      setFormMode('add');
      setCurrentTeacherId(null);
      setSelectedSubjects([]);
      setSelectedClasses([]);
      setCurrentAssignments([]);
      setFormData({
        name: '',
        email: '',
        password: 'password123',
        role: ROLE_ENSEIGNANT
      });
    } else {
      setSelectedSubjects([]);
      setSelectedClasses([]);
      setCurrentAssignments([]);
    }
    setError('');
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // First save the teacher
      let teacherId = currentTeacherId;
      if (formMode === 'add') {
        const newTeacher = await handleAddTeacher(formData);
        teacherId = newTeacher.id || newTeacher._id;
      } else {
        await handleUpdateTeacher(formData);
      }
      
      // Then handle assignments if any are selected
      if (selectedSubjects.length > 0 && selectedClasses.length > 0) {
        await handleAddAssignments(selectedSubjects, selectedClasses, teacherId);
      }
      
      // Reset form and close
      setShowForm(false);
      setError('');
      setSelectedSubjects([]);
      setSelectedClasses([]);
      
      // Refresh the teachers list
      await fetchTeachers();
    } catch (error) {
      console.error('Error saving teacher:', error);
      setError(`Erreur: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Add a new teacher
  const handleAddTeacher = async (data) => {
    const token = localStorage.getItem('token');
    const response = await axios.post(
      `${API_URL}/users`,
      data,
      {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }
    );
    
    showSuccess('Enseignant ajouté avec succès');
    return response.data.data || response.data;
  };

  // Update an existing teacher
  const handleUpdateTeacher = async (data) => {
    const token = localStorage.getItem('token');
    const { password, ...updateData } = data;
    
    // Only include password if it was changed
    if (password && password !== 'password123') {
      updateData.password = password;
    }
    
    await axios.put(
      `${API_URL}/users/${currentTeacherId}`,
      updateData,
      {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }
    );
    
    showSuccess('Enseignant mis à jour avec succès');
    await fetchTeachers();
  };

  // Edit teacher
  const handleEdit = async (teacher) => {
    try {
      setLoading(true);
      setCurrentTeacherId(teacher.id || teacher._id);
      setFormData({
        name: teacher.name,
        email: teacher.email,
        password: '', // Don't pre-fill password for security
        role: teacher.role || ROLE_ENSEIGNANT
      });
      
      // Reset selection state
      setSelectedSubjects([]);
      setSelectedClasses([]);
      
      // Load teacher's current assignments before showing the form
      console.log(`Loading assignments for teacher: ${teacher.id || teacher._id}`);
      await fetchTeacherAssignments(teacher.id || teacher._id);
      
      // Set form mode and show form only after data is loaded
      setFormMode('edit');
      setShowForm(true);
    } catch (error) {
      console.error('Error in handleEdit:', error);
      setError(`Erreur lors du chargement des données de l'enseignant: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Delete teacher
  const handleDelete = async (teacherId, teacherName) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer l'enseignant ${teacherName} ?`)) {
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      await axios.delete(`${API_URL}/users/${teacherId}`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      showSuccess('Enseignant supprimé avec succès');
      await fetchTeachers();
      
    } catch (error) {
      console.error('Error deleting teacher:', error);
      setError(`Erreur lors de la suppression: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Show success message
  const showSuccess = (message) => {
    // You can replace this with a proper toast/notification system
    alert(message);
  };

  // Get subject name for display
  const getSubjectName = (teacher) => {
    if (!teacher.subjects || teacher.subjects.length === 0) return 'Aucune matière';
    
    if (typeof teacher.subjects[0] === 'string') {
      return teacher.subjects[0];
    }
    
    if (teacher.subjects[0].name) {
      return teacher.subjects[0].name;
    }
    
    if (teacher.subjects[0].subject_id?.name) {
      return teacher.subjects[0].subject_id.name;
    }
    
    return 'Matière inconnue';
  };

  // Check if teacher has subjects
  const hasSubject = (teacher) => {
    return teacher.subjects && teacher.subjects.length > 0;
  };

  // Fetch teachers on component mount
  useEffect(() => {
    fetchTeachers();
  }, []);

  if (loading) return <div className="loading">Chargement...</div>;

  return (
    <div className="teachers-management">
      <div className="page-header">
        <h1>Gestion des enseignants</h1>
        <button 
          className="btn btn-primary"
          onClick={toggleForm}
          disabled={loading || showForm}
        >
          <FiUserPlus /> Ajouter un enseignant
        </button>
      </div>

      {showForm && (
        <div className="teacher-form-wrapper">
          <TeacherForm
            formData={formData}
            onChange={handleInputChange}
            onSubmit={handleFormSubmit}
            onCancel={toggleForm}
            mode={formMode}
            loading={loading}
            availableSubjects={availableSubjects}
            availableClasses={availableClasses}
            selectedSubjects={selectedSubjects}
            selectedClasses={selectedClasses}
            onSubjectSelect={setSelectedSubjects}
            onClassSelect={setSelectedClasses}
            onRemoveSelectedSubject={handleRemoveSelectedSubject}
            onRemoveSelectedClass={handleRemoveSelectedClass}
            currentAssignments={currentAssignments}
            onRemoveAssignment={handleRemoveAssignment}
          />
        </div>
      )}

      {error && <div className="error-message">{error}</div>}

      <div className="teachers-list">
        <table>
          <thead>
            <tr>
              <th>Nom</th>
              <th>Email</th>
              <th>Matière(s)</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {teachers.length === 0 ? (
              <tr>
                <td colSpan="4" className="no-data">Aucun enseignant trouvé</td>
              </tr>
            ) : (
              teachers.map(teacher => (
                <tr key={teacher.id || teacher._id}>
                  <td>{teacher.name}</td>
                  <td>{teacher.email}</td>
                  <td>
                    {hasSubject(teacher) ? getSubjectName(teacher) : 'Aucune matière'}
                    {teacher.subjects?.length > 1 && ` +${teacher.subjects.length - 1} autres`}
                  </td>
                  <td className="actions">
                    <button 
                      className="btn-icon"
                      onClick={() => handleEdit(teacher)}
                      title="Modifier"
                    >
                      <FiEdit />
                    </button>
                    <button 
                      className="btn-icon"
                      onClick={() => handleOpenAssignmentModal(teacher)}
                      title="Gérer les affectations"
                    >
                      <FiBook />
                    </button>
                    <button 
                      className="btn-icon danger"
                      onClick={() => handleDelete(teacher.id || teacher._id, teacher.name)}
                      title="Supprimer"
                      disabled={loading}
                    >
                      <FiTrash2 />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default TeachersManagement;
