import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Tasks.css'; // Import the CSS

function Tasks() {
  const [tasks, setTasks] = useState([]); // State to hold tasks
  const [newTask, setNewTask] = useState(''); // State for new task input
  const [editingTaskId, setEditingTaskId] = useState(null); // State to track task being edited
  const [taskToEdit, setTaskToEdit] = useState(''); // State for task being edited

  // Fetch tasks from Django backend when component mounts
  useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/tasks/')
      .then(response => setTasks(response.data))
      .catch(error => console.error("Error fetching tasks:", error));
  }, []);

  // Handle adding a new task
  const handleAddTask = () => {
    const taskData = { task_name: newTask, description: "", completed: false };
    axios.post('http://127.0.0.1:8000/api/tasks/', taskData)
      .then(response => {
        setTasks([...tasks, response.data]);  // Update tasks list
        setNewTask('');  // Clear input field
      })
      .catch(error => console.error("Error adding task:", error));
  };

  // Handle marking a task as done or undoing it
  const handleMarkAsDone = (id) => {
    const task = tasks.find(t => t.id === id);
    axios.put(`http://127.0.0.1:8000/api/tasks/${id}/`, { ...task, completed: !task.completed })
      .then(response => {
        setTasks(tasks.map(t => t.id === id ? response.data : t));  // Update task status
      })
      .catch(error => console.error("Error updating task:", error));
  };

  // Handle editing an existing task
  const handleEditTask = (id) => {
    axios.put(`http://127.0.0.1:8000/api/tasks/${id}/`, { task_name: taskToEdit })
      .then(response => {
        setTasks(tasks.map(task => task.id === id ? response.data : task));  // Update tasks list
        setEditingTaskId(null);  // Exit edit mode
        setTaskToEdit('');  // Clear edit input
      })
      .catch(error => console.error("Error editing task:", error));
  };

  // Handle deleting a task
  const handleDeleteTask = (id) => {
    axios.delete(`http://127.0.0.1:8000/api/tasks/${id}/`)
      .then(() => {
        setTasks(tasks.filter(task => task.id !== id));  // Remove task from list
      })
      .catch(error => console.error("Error deleting task:", error));
  };

  // Handle deleting all tasks
  const handleDeleteAllTasks = () => {
    axios.delete('http://127.0.0.1:8000/api/tasks/delete_all/') // Assuming a custom route in Django for deleting all
      .then(() => {
        setTasks([]);  // Clear tasks list
      })
      .catch(error => console.error("Error deleting all tasks:", error));
  };

  return (
    <div className="tasks-container">
      <h1>To-Do List</h1>

      {/* Add Task Form */}
      <div className="add-task">
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Add a new task..."
        />
        <button onClick={handleAddTask}>Add Task</button>
      </div>

      {/* Pending Tasks */}
      <h2>Pending Tasks</h2>
      <ul className="task-list pending-tasks">
        {tasks.filter(task => !task.completed).map(task => (
          <li key={task.id} className="task-item">
            {editingTaskId === task.id ? (
              <>
                <input
                  type="text"
                  value={taskToEdit}
                  onChange={(e) => setTaskToEdit(e.target.value)}
                />
                <button onClick={() => handleEditTask(task.id)}>Save</button>
                <button onClick={() => setEditingTaskId(null)}>Cancel</button>
              </>
            ) : (
              <>
                <span>{task.task_name}</span>
                <div className="task-buttons">
                  <button className="done-btn" onClick={() => handleMarkAsDone(task.id)}>Mark as Done</button>
                  <button onClick={() => {
                    setEditingTaskId(task.id);
                    setTaskToEdit(task.task_name);
                  }}>Edit</button>
                  <button className="delete-btn" onClick={() => handleDeleteTask(task.id)}>Delete</button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>

      {/* Completed Tasks */}
      <h2>Completed Tasks</h2>
      <ul className="task-list completed-tasks">
        {tasks.filter(task => task.completed).map(task => (
          <li key={task.id} className="task-item completed">
            <span>{task.task_name}</span>
            <div className="task-buttons">
              <button className="undo-btn" onClick={() => handleMarkAsDone(task.id)}>Undo</button>
              <button className="delete-btn" onClick={() => handleDeleteTask(task.id)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>

      {/* Delete All Tasks Button */}
      <button className="delete-all-btn" onClick={handleDeleteAllTasks}>Delete All Tasks</button>
    </div>
  );
}

export default Tasks;
