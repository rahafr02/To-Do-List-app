// src/App.js
import React, { useEffect, useState } from "react";
import { auth, db } from "./firebase"; //import database and auth 
import Auth from "./components/Auth";
import { FaPlus, FaTrash, FaEdit, FaCheck } from "react-icons/fa";
import {
  collection,
  addDoc,
  onSnapshot,
  doc,
  deleteDoc,
  updateDoc,
  query,
  where
} from "firebase/firestore";
import "./App.css";

function App() {
  const [user, setUser] = useState(null);
  const [task, setTask] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [dueDate, setDueDate] = useState("");
  const [tasks, setTasks] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [editingTask, setEditingTask] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return; //if there is no user exit 

    const q = query(
      collection(db, "tasks"), //retreive taks for currnet user
      where("uid", "==", user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => { 
      const priorityMap = { High: 1, Medium: 2, Low: 3 };
      const items = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          priorityValue: priorityMap[data.priority] || 4
        };
      });

      items.sort((a, b) => a.priorityValue - b.priorityValue);
      setTasks(items);
    });

    return () => unsubscribe();
  }, [user]);

  const resetForm = () => { //return all fields to default values
    setTask("");
    setPriority("Medium");
    setDueDate("");
    setEditingTask(null);
  };

  const addOrUpdateTask = async () => {
    if (!task.trim()) return;
    const priorityMap = { High: 1, Medium: 2, Low: 3 };
    const taskData = {
      text: task,
      priority,
      priorityValue: priorityMap[priority],
      dueDate: dueDate ? new Date(dueDate) : null
    };

    if (editingTask) {
      await updateDoc(doc(db, "tasks", editingTask.id), taskData);
    } else {
      await addDoc(collection(db, "tasks"), {
        uid: user.uid,
        completed: false,
        createdAt: new Date(),
        ...taskData
      });
    }
    resetForm();
  };

  const deleteTask = async (id) => { //delet task asociated with user id 
    await deleteDoc(doc(db, "tasks", id));
  };

  const toggleComplete = async (task) => { //define sunction takes task 
    await updateDoc(doc(db, "tasks", task.id), {
      completed: !task.completed
    });
  };

  const startEditing = (task) => { //takes task from user to update it 
    setTask(task.text);
    setPriority(task.priority);
    setDueDate(task.dueDate ? new Date(task.dueDate.seconds * 1000).toISOString().split("T")[0] : "");
    setEditingTask(task);
  };

  const logout = async () => { //logout function
    try {
      await auth.signOut();
    } catch (err) {
      console.error("Logout error:", err.message);
      alert("فشل تسجيل الخروج. حاول مرة أخرى.");
    }
  };

  const filteredTasks = tasks.filter((t) => { //to show tasks based on fillter 
    const matchText = t.text.toLowerCase().includes(search.toLowerCase()); //shearching 
    const matchStatus =
      statusFilter === "All" ||
      (statusFilter === "Completed" && t.completed) ||
      (statusFilter === "Incomplete" && !t.completed);
    const matchPriority =
      priorityFilter === "All" || t.priority === priorityFilter;
    return matchText && matchStatus && matchPriority;
  });

  if (!user) return <Auth onUserChange={setUser} />;//if user not regestered auth page appear

  return (
    <div className="app-container">
      <img src="/university-logo.png" alt="University Logo" className="logo" />
      <h2 className="title">To-Do List</h2>
      <button onClick={logout} className="logout-btn">Logout 🔓</button>

      <div className="show-row"> {/*enter task field*/}
        <h3 className='subtitle'>Enter Task</h3>
        <input //take input from user and pass it to setTask function 
          placeholder="Task description"
          value={task}
          onChange={(e) => setTask(e.target.value)}
          className="input"
        /> </div>

      <div className="show-row">
        <h3 className='subtitle'>Priority</h3> {/*takes priority from user*/}
        <select value={priority} onChange={(e) => setPriority(e.target.value)} className="input">
          <option >High</option>
          <option>Medium</option>
          <option>Low</option>
        </select> </div>
      <div className="show-row">
        <h3 className='subtitle'>Date</h3>
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="input"
        />
        <button onClick={addOrUpdateTask} className="icon-btn add"> {/*for add or edit task*/}
          {editingTask ? <FaEdit /> : <FaPlus />}
        </button>
        {editingTask && <button onClick={resetForm} className="cancel-btn">Cancel</button>}
      </div>

      <div className="filters"> {/* select show filter */}
        <h3 className='subtitle'>Show by</h3>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input">
          <option>All</option>
          <option>Completed</option>
          <option>Incomplete</option>
        </select>
        <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className="input">
          <option>All</option>
          <option>High</option>
          <option>Medium</option>
          <option>Low</option>
        </select>
      </div>

      <div className="show-row"> {/* search for spicific task */}
        <h3 className='subtitle'>Search</h3>
        <input
          placeholder="Search tasks..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input"
        />
      </div>
      <h3 className="subtitle">Tasks List </h3>
      <ul className="task-list"> {/* list to show tasks */}
        {/*pass throug each task*/} {filteredTasks.map((t) => (
          <li key={t.id} className={`task-item ${t.completed ? 'completed' : ''}`}> {/* each component is a task */}
            <div><strong>{t.text}</strong></div> {/* show task content */}
            <div>Priority: {t.priority} | Due: {t.dueDate ? new Date(t.dueDate.seconds * 1000).toLocaleDateString("en-US") : "N/A"}</div>
            <div className="task-actions"> {/* compelete, edit, delete task */}
              <button onClick={() => toggleComplete(t)} className="icon-btn complete"><FaCheck /></button>
              <button onClick={() => startEditing(t)} className="icon-btn edit"><FaEdit /></button>
              <button onClick={() => deleteTask(t.id)} className="icon-btn delete"><FaTrash /></button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
