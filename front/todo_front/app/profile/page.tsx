'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { toast } from 'react-toastify';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface Task {
  _id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  dueDate?: string;
  createdAt: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const hasCheckedAuth = useRef(false); // Prevent multiple auth checks
  const [user, setUser] = useState<User | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', status: 'PENDING', priority: 'MEDIUM', dueDate: '' });
  const [editTask, setEditTask] = useState({ title: '', description: '', status: '', priority: '', dueDate: '' });

  useEffect(() => {
    // Prevent multiple executions
    if (hasCheckedAuth.current) return;
    hasCheckedAuth.current = true;

    const token = localStorage.getItem('token');
    if (!token) {
      router.replace('/auth/login');
      return;
    }
    fetchProfile();
    fetchTasks();
  }, [router]);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/user/me`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUser(response.data.result);
    } catch (error: any) {
     let msg: any=  error.response.data.result
      toast.error( Object.values(msg)[0] as string, {
        position: "top-right",
        autoClose: 4000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/task/mytasks`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTasks(response.data.result);
    } catch (error: any) {
     let msg: any=  error.response.data.result
      toast.error( Object.values(msg)[0] as string, {
        position: "top-right",
        autoClose: 4000,
      });
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      
      const taskData = {
        ...newTask,
        userId: user?._id
      };
      
      await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/task`,
        taskData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Task created successfully!');
      setShowCreateModal(false);
      setNewTask({ title: '', description: '', status: 'PENDING', priority: 'MEDIUM', dueDate: '' });
      fetchTasks();
    } catch (error: any) {
     let msg: any=  error.response.data.result
      toast.error( Object.values(msg)[0] as string, {
        position: "top-right",
        autoClose: 4000,
      });
    }
  };

  // Helper function to format date for input field (YYYY-MM-DD)
  const formatDateForInput = (dateString?: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch (error) {
      return '';
    }
  };

  const handleViewTask = async (taskId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/task/${taskId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSelectedTask(response.data.result);
      setEditTask({
        title: response.data.result.title,
        description: response.data.result.description,
        status: response.data.result.status,
        priority: response.data.result.priority,
        dueDate: formatDateForInput(response.data.result.dueDate)
      });
      setShowViewModal(true);
      setIsEditing(false);
    } catch (error: any) {
      let msg: any=  error.response.data.result
      toast.error( Object.values(msg)[0] as string, {
        position: "top-right",
        autoClose: 4000,
      });
    }
  };

  const handleUpdateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask) return;

    try {
      const token = localStorage.getItem('token');
      
      // Include userId in the update request
      const updateData = {
        ...editTask,
        userId: user?._id
      };
      
      await axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/task/${selectedTask._id}`,
        updateData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Task updated successfully!');
      setShowViewModal(false);
      setIsEditing(false);
      fetchTasks();
    } catch (error: any) {
      let msg: any=  error.response.data.result
      toast.error( Object.values(msg)[0] as string, {
        position: "top-right",
        autoClose: 4000,
      });
    }
  };

  const handleDeleteTask = async () => {
    if (!selectedTask) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/task/${selectedTask._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Task deleted successfully!');
      setShowDeleteConfirm(false);
      setShowViewModal(false);
      fetchTasks();
    } catch (error: any) {
     let msg: any=  error.response.data.result
      toast.error( Object.values(msg)[0] as string, {
        position: "top-right",
        autoClose: 4000,
      });
    }
  };

  const openDeleteConfirm = (task: Task) => {
    setSelectedTask(task);
    setShowDeleteConfirm(true);
  };

  const handleLogout = () => {
    // Clear tokens
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    
    // Show message
    toast.success("Logged out successfully!");
    // router.push("/login")
    // Force a hard navigation to login page
    window.location.href = '/auth/login';
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No due date';
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <p className="text-white text-xl">Loading...</p>
      </div>
    );
  }

  


  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Profile</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 rounded-lg hover:bg-red-700 transition"
          >
            Logout
          </button>
        </div>

        {/* Profile Card */}
        <div className="bg-gray-900 rounded-lg p-6 mb-8 border border-gray-800">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-20 h-20 bg-linear-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-3xl font-bold">
              {user?.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-2xl font-bold">{user?.name}</h2>
              <p className="text-gray-400">{user?.email}</p>
              <span className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-semibold ${
                user?.role === 'admin' ? 'bg-purple-600' : 'bg-blue-600'
              }`}>
                {user?.role === 'admin' ? '👑 Admin' : '👤 User'}
              </span>
            </div>
          </div>

          {user?.role === 'admin' && (
            <button
              onClick={() => router.push('/admin')}
              className="mt-4 px-6 py-2 bg-purple-600 rounded-lg hover:bg-purple-700 transition font-semibold"
            >
              🔧 Go to Admin Dashboard
            </button>
          )}
        </div>

        {/* Tasks Section */}
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">My Tasks ({tasks.length})</h2>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-green-600 rounded-lg hover:bg-green-700 transition font-semibold"
            >
              + Create Task
            </button>
          </div>

          {/* Tasks Grid */}
          {tasks.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-xl mb-2">No tasks yet</p>
              <p>Create your first task to get started!</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {tasks.map((task) => (
                <div
                  key={task._id}
                  className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition cursor-pointer"
                  onClick={() => handleViewTask(task._id)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold truncate flex-1">{task.title}</h3>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ml-2 ${
                      task.status === 'COMPLETED' ? 'bg-green-600' :
                      task.status === 'IN_PROGRESS' ? 'bg-yellow-600' :
                      'bg-gray-600'
                    }`}>
                      {task.status === 'IN_PROGRESS' ? 'In Progress' : 
                       task.status === 'COMPLETED' ? 'Completed' : 'Pending'}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                    {task.description || 'No description'}
                  </p>
                  <div className="flex justify-between items-center text-xs">
                    <span className={`px-2 py-1 rounded ${
                      task.priority === 'HIGH' ? 'bg-red-600' :
                      task.priority === 'MEDIUM' ? 'bg-yellow-500' :
                      'bg-blue-600'
                    }`}>
                      {task.priority}
                    </span>
                    <span className="text-gray-500">{formatDate(task.dueDate)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Task Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-lg p-6 max-w-md w-full border border-gray-800 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Create New Task</h2>
            <form onSubmit={handleCreateTask}>
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-2">Title</label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded focus:outline-none focus:border-blue-500 text-white"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-2">Description</label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded focus:outline-none focus:border-blue-500 h-24 text-white"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-2">Status</label>
                <select
                  value={newTask.status}
                  onChange={(e) => setNewTask({ ...newTask, status: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded focus:outline-none focus:border-blue-500 text-white"
                >
                  <option value="PENDING">Pending</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-2">Priority</label>
                <select
                  value={newTask.priority}
                  onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded focus:outline-none focus:border-blue-500 text-white"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-semibold mb-2">Due Date (Optional)</label>
                <input
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded focus:outline-none focus:border-blue-500 text-white"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-600 rounded hover:bg-green-700 transition font-semibold"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-700 rounded hover:bg-gray-600 transition font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View/Edit Task Modal */}
      {showViewModal && selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-lg p-6 max-w-2xl w-full border border-gray-800 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Task Details</h2>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>

            {!isEditing ? (
              <div>
                <div className="mb-4">
                  <label className="text-sm text-gray-400">Title</label>
                  <p className="text-xl font-bold">{selectedTask.title}</p>
                </div>
                <div className="mb-4">
                  <label className="text-sm text-gray-400">Description</label>
                  <p className="text-gray-300">{selectedTask.description || 'No description'}</p>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="text-sm text-gray-400 mr-1">Status</label>
                    <p className={`inline-block px-3 py-1 rounded mt-1 ${
                      selectedTask.status === 'COMPLETED' ? 'bg-green-600' :
                      selectedTask.status === 'IN_PROGRESS' ? 'bg-yellow-600' :
                      'bg-gray-600'
                    }`}>
                      {selectedTask.status === 'IN_PROGRESS' ? 'In Progress' : 
                       selectedTask.status === 'COMPLETED' ? 'Completed' : 'Pending'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 mr-1">Priority</label>
                    <p className={`inline-block px-3 py-1 rounded mt-1 ${
                      selectedTask.priority === 'HIGH' ? 'bg-red-600' :
                      selectedTask.priority === 'MEDIUM' ? 'bg-yellow-600' :
                      'bg-blue-600'
                    }`}>
                      {selectedTask.priority}
                    </p>
                  </div>
                </div>
                <div className="mb-6">
                  <label className="text-sm text-gray-400">Due Date</label>
                  <p className="text-gray-300">{formatDate(selectedTask.dueDate)}</p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex-1 px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 transition font-semibold"
                  >
                    Edit Task
                  </button>
                  <button
                    onClick={() => openDeleteConfirm(selectedTask)}
                    className="flex-1 px-4 py-2 bg-red-600 rounded hover:bg-red-700 transition font-semibold"
                  >
                    Delete Task
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleUpdateTask}>
                <div className="mb-4">
                  <label className="block text-sm font-semibold mb-2">Title</label>
                  <input
                    type="text"
                    value={editTask.title}
                    onChange={(e) => setEditTask({ ...editTask, title: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded focus:outline-none focus:border-blue-500 text-white"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-semibold mb-2">Description</label>
                  <textarea
                    value={editTask.description}
                    onChange={(e) => setEditTask({ ...editTask, description: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded focus:outline-none focus:border-blue-500 h-24 text-white"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-semibold mb-2">Status</label>
                  <select
                    value={editTask.status}
                    onChange={(e) => setEditTask({ ...editTask, status: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded focus:outline-none focus:border-blue-500 text-white"
                  >
                    <option value="PENDING">Pending</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-semibold mb-2">Priority</label>
                  <select
                    value={editTask.priority}
                    onChange={(e) => setEditTask({ ...editTask, priority: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded focus:outline-none focus:border-blue-500 text-white"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-semibold mb-2">Due Date</label>
                  <input
                    type="date"
                    value={ editTask.dueDate? new Date(editTask.dueDate).toISOString().slice(0, 10): undefined}
                    onChange={(e) => setEditTask({ ...editTask, dueDate: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded focus:outline-none focus:border-blue-500 text-white"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-green-600 rounded hover:bg-green-700 transition font-semibold"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="flex-1 px-4 py-2 bg-gray-700 rounded hover:bg-gray-600 transition font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-lg p-6 max-w-md w-full border border-red-800">
            <h2 className="text-2xl font-bold mb-4 text-red-500">Confirm Delete</h2>
            <p className="text-gray-300 mb-6">
              Are you sure you want to delete the task <span className="font-bold">"{selectedTask.title}"</span>? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDeleteTask}
                className="flex-1 px-4 py-2 bg-red-600 rounded hover:bg-red-700 transition font-semibold"
              >
                Yes, Delete
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 bg-gray-700 rounded hover:bg-gray-600 transition font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}