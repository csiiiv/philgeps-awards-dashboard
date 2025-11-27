/**
 * Task Manager Component
 * 
 * Manages background tasks with real-time WebSocket updates
 * Shows task progress, history, and allows task cancellation
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Modal } from '../../features/shared/Modal';
import { LoadingSpinner } from '../../features/shared/LoadingSpinner';
import './TaskManager.css';

export interface Task {
  task_id: string;
  type: string;
  status: string;
  state: string;
  progress?: number;
  result?: any;
  error?: string;
  created_at: Date;
  completed_at?: Date;
}

interface TaskManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TaskManager: React.FC<TaskManagerProps> = ({ isOpen, onClose }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTaskCount, setActiveTaskCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  // Connect to WebSocket for real-time updates
  useEffect(() => {
    if (!isOpen) return;

    // Get API URL from environment variable
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3200';
    
    // Parse the API URL to get host and port
    const url = new URL(apiUrl);
    const protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${url.host}/ws/tasks/status/`;

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log('WebSocket message:', data);

        if (data.type === 'task_update') {
          handleTaskUpdate(data);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsConnected(false);
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
      };

      // Cleanup on unmount
      return () => {
        ws.close();
      };
    } catch (error) {
      console.error('WebSocket connection error:', error);
    }
  }, [isOpen]);

  // Handle task updates from WebSocket
  const handleTaskUpdate = useCallback((data: any) => {
    setTasks((prevTasks) => {
      const existingIndex = prevTasks.findIndex(t => t.task_id === data.task_id);
      
      const updatedTask: Task = {
        task_id: data.task_id,
        type: data.type || 'unknown',
        status: data.status || data.state,
        state: data.state,
        progress: data.progress,
        result: data.result,
        error: data.error,
        created_at: existingIndex >= 0 ? prevTasks[existingIndex].created_at : new Date(),
        completed_at: data.state === 'SUCCESS' || data.state === 'FAILURE' ? new Date() : undefined,
      };

      if (existingIndex >= 0) {
        // Update existing task
        const newTasks = [...prevTasks];
        newTasks[existingIndex] = updatedTask;
        return newTasks;
      } else {
        // Add new task
        return [updatedTask, ...prevTasks];
      }
    });
  }, []);

  // Subscribe to a specific task
  const subscribeToTask = useCallback((taskId: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        action: 'subscribe',
        task_id: taskId
      }));
    }
  }, []);

  // Check task status manually
  const checkTaskStatus = async (taskId: string) => {
    try {
      const response = await fetch(`/api/v1/data-processing/tasks/status/?task_id=${taskId}`);
      const data = await response.json();
      handleTaskUpdate({
        task_id: taskId,
        state: data.state,
        status: data.status,
        result: data.result,
        error: data.error,
      });
    } catch (error) {
      console.error('Error checking task status:', error);
    }
  };

  // Cancel a task
  const cancelTask = async (taskId: string) => {
    try {
      const response = await fetch('/api/v1/data-processing/tasks/cancel/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ task_id: taskId }),
      });
      
      if (response.ok) {
        alert('Task cancellation requested');
      }
    } catch (error) {
      console.error('Error cancelling task:', error);
      alert('Failed to cancel task');
    }
  };

  // Clear completed tasks
  const clearCompleted = () => {
    setTasks((prevTasks) => 
      prevTasks.filter(t => t.state !== 'SUCCESS' && t.state !== 'FAILURE')
    );
  };

  // Get task color based on state
  const getTaskColor = (state: string) => {
    switch (state) {
      case 'SUCCESS':
        return 'green';
      case 'FAILURE':
        return 'red';
      case 'PROGRESS':
      case 'STARTED':
        return 'blue';
      default:
        return 'gray';
    }
  };

  // Format duration
  const formatDuration = (task: Task) => {
    if (!task.completed_at) return 'In progress...';
    
    const duration = task.completed_at.getTime() - task.created_at.getTime();
    const seconds = Math.floor(duration / 1000);
    
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m ${seconds % 60}s`;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Task Manager">
      <div className="task-manager">
        {/* Header */}
        <div className="task-manager-header">
          <div className="connection-status">
            <span className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`} />
            {isConnected ? 'Connected' : 'Disconnected'}
          </div>
          <div className="task-stats">
            <span>Active: {tasks.filter(t => t.state === 'PROGRESS' || t.state === 'STARTED').length}</span>
            <span>Total: {tasks.length}</span>
          </div>
          <button onClick={clearCompleted} className="btn btn-secondary">
            Clear Completed
          </button>
        </div>

        {/* Task List */}
        <div className="task-list">
          {tasks.length === 0 ? (
            <div className="empty-state">
              <p>No tasks yet</p>
              <p className="text-muted">Background tasks will appear here when triggered</p>
            </div>
          ) : (
            tasks.map((task) => (
              <div key={task.task_id} className="task-item">
                <div className="task-header">
                  <div className="task-info">
                    <span 
                      className="task-status-badge" 
                      style={{ backgroundColor: getTaskColor(task.state) }}
                    >
                      {task.state}
                    </span>
                    <span className="task-type">{task.type}</span>
                    <span className="task-id text-muted">{task.task_id.substring(0, 8)}</span>
                  </div>
                  <div className="task-actions">
                    {(task.state === 'PROGRESS' || task.state === 'STARTED') && (
                      <button 
                        onClick={() => cancelTask(task.task_id)}
                        className="btn btn-sm btn-danger"
                      >
                        Cancel
                      </button>
                    )}
                    <button 
                      onClick={() => checkTaskStatus(task.task_id)}
                      className="btn btn-sm btn-secondary"
                    >
                      Refresh
                    </button>
                  </div>
                </div>

                <div className="task-body">
                  <p className="task-status">{task.status}</p>
                  
                  {/* Progress Bar */}
                  {task.progress !== undefined && (
                    <div className="progress-bar-container">
                      <div 
                        className="progress-bar" 
                        style={{ width: `${task.progress}%` }}
                      />
                      <span className="progress-text">{task.progress}%</span>
                    </div>
                  )}

                  {/* Duration */}
                  <p className="text-muted text-sm">
                    Duration: {formatDuration(task)}
                  </p>

                  {/* Error Message */}
                  {task.error && (
                    <div className="task-error">
                      <strong>Error:</strong> {task.error}
                    </div>
                  )}

                  {/* Result */}
                  {task.result && task.state === 'SUCCESS' && (
                    <div className="task-result">
                      {task.result.file_path && (
                        <a 
                          href={`/api/v1/downloads/${task.result.export_id}`}
                          download
                          className="btn btn-primary btn-sm"
                        >
                          Download Export
                        </a>
                      )}
                      {task.result.record_count && (
                        <span className="text-muted">
                          {task.result.record_count} records
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Modal>
  );
};

export default TaskManager;

