"use client";

import React, { useState } from "react";
import { toast } from 'react-toastify'

// --- Interfaces ---
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
  createdBy: string | { _id: string };
}

interface AdminData {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface Props {
  admin: AdminData;
  users: User[];
}

export default function AdminDashboardClient({ admin, users: initialUsers }: Props) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [editName, setEditName] = useState("");

  // Helper to get cookie token in client
  const getCookieToken = () => {
    if (typeof document === "undefined") return null;
    const match = document.cookie.match(new RegExp("(^| )token=([^;]+)"));
    return match ? match[2] : null;
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

  // --- Delete User ---
  const handleDelete = async (userId: string) => {
    if (!confirm("Delete user?")) return;
    const token = getCookieToken();
    if (!token) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/user/${userId}`, {
        method: "DELETE",
        headers: { authorization: `Bearer ${token}` },
      });
      if (res.ok) setUsers(users.filter((u) => u._id !== userId));
      else alert("Failed");
    } catch (err) { console.error(err); }
  };

  // --- Edit User ---
  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setEditName(user.name);
    setIsEditModalOpen(true);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    const token = getCookieToken();
    if (!token) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/user/${selectedUser._id}`, {
        method: "PUT",
        headers: {
          authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: editName }),
      });
      const data = await res.json();
      if (!res.ok) return alert(data.message || "Failed");

      setUsers(users.map((u) => (u._id === selectedUser._id ? { ...u, name: editName } : u)));
      setIsEditModalOpen(false);
    } catch (err) { console.error(err); }
  };

  // --- View User Tasks ---
  const openViewModal = async (user: User) => {
    setSelectedUser(user);
    setIsViewModalOpen(true);
    const token = getCookieToken();
    if (!token) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/task/admin/${user._id}`, {
        headers: { authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setTasks(Array.isArray(data.result) ? data.result : []);
    } catch (err) { console.error(err); }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* NAVBAR */}
      <div className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-xl font-bold">
              {admin?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
              <p className="text-gray-400">Welcome, {admin?.name}</p>
            </div>
          </div>

          <button
            onClick={
            handleLogout}
            className="px-6 py-2 bg-red-600 rounded-lg"
          >
            Logout
          </button>
        </div>
      </div>

      {/* USERS MANAGEMENT */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-gray-900 border border-gray-800 rounded-lg">
          <div className="p-6 border-b border-gray-800">
            <h2 className="text-2xl font-bold">Users Management</h2>
          </div>

          <div className="p-6">
            {users.length === 0 ? (
              <p className="text-center text-gray-500">No users</p>
            ) : (
              <div className="space-y-4">
                {users.map((user) => (
                  <div
                    key={user._id}
                    className="bg-gray-800 p-4 rounded-lg border border-gray-700 flex justify-between"
                  >
                    <div>
                      <h3 className="font-bold">{user.name}</h3>
                      <p className="text-gray-400 text-sm">{user.email}</p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => openViewModal(user)}
                        className="px-4 py-2 bg-green-600 rounded"
                      >
                        View
                      </button>

                      <button
                        onClick={() => openEditModal(user)}
                        className="px-4 py-2 bg-blue-600 rounded"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => handleDelete(user._id)}
                        className="px-4 py-2 bg-red-600 rounded"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODALS */}
      {isViewModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-2xl">
            <div className="p-6 border-b border-gray-800 flex justify-between">
              <h3 className="text-xl font-bold">User Details</h3>
              <button onClick={() => setIsViewModalOpen(false)}>✕</button>
            </div>
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-2">{selectedUser.name}</h2>
              <p className="text-gray-400">{selectedUser.email}</p>
              <h3 className="text-lg font-bold mt-6">Tasks</h3>
              {tasks.length === 0 ? (
                <p className="text-gray-500 mt-3">No tasks found.</p>
              ) : (
                <div className="mt-4 space-y-3">
                  {tasks.map((task) => (
                    <div
                      key={task._id}
                      className="bg-gray-800 p-3 rounded border border-gray-700 flex justify-between"
                    >
                      <div>
                        <h4 className="font-bold">{task.title}</h4>
                        <p className="text-gray-400 text-sm line-clamp-1">
                          {task.description}
                        </p>
                        <p className="text-xs mt-2 text-gray-500">
                          Status: {task.status}
                        </p>
                      </div>
                      <button
                        className="px-3 py-1 bg-blue-600 rounded h-fit"
                        onClick={() => {
                          setSelectedTask(task);
                          setIsTaskModalOpen(true);
                        }}
                      >
                        View
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="p-4 border-t border-gray-800 flex justify-end">
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="px-4 py-2 bg-gray-700 rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {isTaskModalOpen && selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-md">
            <div className="p-6 border-b border-gray-800 flex justify-between">
              <h3 className="text-xl font-bold">Task Details</h3>
              <button onClick={() => setIsTaskModalOpen(false)}>✕</button>
            </div>
            <div className="p-6">
              <h2 className="text-xl font-bold">{selectedTask.title}</h2>
              <p className="text-gray-300 mt-4 whitespace-pre-wrap">
                {selectedTask.description}
              </p>
              <p className="text-gray-500 mt-4">
                <span className="font-bold">Status:</span> {selectedTask.status}
              </p>
            </div>
            <div className="p-4 border-t border-gray-800 flex justify-end">
              <button
                onClick={() => setIsTaskModalOpen(false)}
                className="px-4 py-2 bg-gray-700 rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
