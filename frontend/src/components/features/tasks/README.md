# Task Management Components

This directory contains components for managing and monitoring background tasks.

## Components

### TaskManager
Main component for viewing and managing background tasks with real-time WebSocket updates.

**Features:**
- Real-time task status updates via WebSocket
- Task progress indicators
- Task cancellation
- Export download links
- Task history management

**Usage:**
```tsx
import { TaskManager } from './components/features/tasks';

function App() {
  const [isTaskManagerOpen, setIsTaskManagerOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsTaskManagerOpen(true)}>
        View Tasks
      </button>
      
      <TaskManager 
        isOpen={isTaskManagerOpen}
        onClose={() => setIsTaskManagerOpen(false)}
      />
    </>
  );
}
```

## API Integration

The TaskManager connects to:
- **WebSocket**: `ws://localhost:3200/ws/tasks/status/`
- **REST API**: `/api/v1/data-processing/tasks/`

## WebSocket Messages

### Subscribe to Task
```json
{
  "action": "subscribe",
  "task_id": "task-id-here"
}
```

### Check Status
```json
{
  "action": "check_status",
  "task_id": "task-id-here"
}
```

### Task Update (Received)
```json
{
  "type": "task_update",
  "task_id": "...",
  "state": "PROGRESS",
  "status": "Processing...",
  "progress": 50
}
```

## Task States

- `PENDING` - Task is queued
- `STARTED` - Task has begun
- `PROGRESS` - Task is running (with progress updates)
- `SUCCESS` - Task completed successfully
- `FAILURE` - Task failed
- `RETRY` - Task is being retried

## Styling

The component uses `TaskManager.css` for styling with support for:
- Light/dark mode
- Responsive design
- Smooth animations
- Accessible color contrasts

