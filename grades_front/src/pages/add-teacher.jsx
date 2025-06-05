import React from "react";
import axios from "axios";

class AddTeacher extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      teachers: [],
      subjects: [],
      classes: [],
      teacher_id: "",
      subject_id: "",
      class_id: "",
      message: "",
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  componentDidMount() {
    // Load teachers, subjects, and classes from API
    axios.get("/api/users?role=enseignant") // assuming your endpoint filters by role
      .then(response => {
        this.setState({ teachers: response.data });
      });

    axios.get("/api/subjects")
      .then(response => {
        this.setState({ subjects: response.data });
      });

    axios.get("/api/classes")
      .then(response => {
        this.setState({ classes: response.data });
      });
  }

  handleChange(event) {
    var name = event.target.name;
    var value = event.target.value;
    this.setState({ [name]: value });
  }

  handleSubmit(event) {
    event.preventDefault();

    axios.post("/api/assignments", {
      teacher_id: this.state.teacher_id,
      subject_id: this.state.subject_id,
      class_id: this.state.class_id,
    })
    .then(response => {
      this.setState({ message: "✅ Assignation réussie !" });
    })
    .catch(error => {
      if (error.response && error.response.status === 422) {
        this.setState({ message: error.response.data.message });
      } else {
        this.setState({ message: "❌ Une erreur s'est produite." });
      }
    });
  }

  render() {
    return (
      <div>
        <h2>Assigner un enseignant</h2>
        <form onSubmit={this.handleSubmit}>
          <div>
            <label>Enseignant:</label>
            <select name="teacher_id" value={this.state.teacher_id} onChange={this.handleChange}>
              <option value="">-- Choisir --</option>
              {this.state.teachers.map(function(teacher) {
                return <option key={teacher.id} value={teacher.id}>{teacher.name}</option>;
              })}
            </select>
          </div>

          <div>
            <label>Matière:</label>
            <select name="subject_id" value={this.state.subject_id} onChange={this.handleChange}>
              <option value="">-- Choisir --</option>
              {this.state.subjects.map(function(subject) {
                return <option key={subject.id} value={subject.id}>{subject.name}</option>;
              })}
            </select>
          </div>

          <div>
            <label>Classe:</label>
            <select name="class_id" value={this.state.class_id} onChange={this.handleChange}>
              <option value="">-- Choisir --</option>
              {this.state.classes.map(function(classItem) {
                return <option key={classItem.id} value={classItem.id}>{classItem.name}</option>;
              })}
            </select>
          </div>

          <button type="submit">Assigner</button>
        </form>

        {this.state.message && <p>{this.state.message}</p>}
      </div>
    );
  }
}

export default AddTeacher;
