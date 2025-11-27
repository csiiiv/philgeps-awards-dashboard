"""
WebSocket consumers for real-time task updates
"""
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from celery.result import AsyncResult


class TaskStatusConsumer(AsyncWebsocketConsumer):
    """
    WebSocket consumer for real-time task status updates.
    
    Usage:
        ws://localhost:8000/ws/tasks/status/
    """
    
    async def connect(self):
        """Accept WebSocket connection and add to task_updates group"""
        self.group_name = 'task_updates'
        
        # Join task updates group
        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )
        
        await self.accept()
        
        # Send welcome message
        await self.send(text_data=json.dumps({
            'type': 'connection',
            'message': 'Connected to task status updates'
        }))
    
    async def disconnect(self, close_code):
        """Leave task updates group on disconnect"""
        await self.channel_layer.group_discard(
            self.group_name,
            self.channel_name
        )
    
    async def receive(self, text_data):
        """
        Handle incoming WebSocket messages
        
        Expected message format:
        {
            "action": "subscribe",
            "task_id": "task-id-here"
        }
        or
        {
            "action": "check_status",
            "task_id": "task-id-here"
        }
        """
        try:
            data = json.loads(text_data)
            action = data.get('action')
            task_id = data.get('task_id')
            
            if action == 'subscribe' and task_id:
                # Subscribe to specific task updates
                await self.subscribe_to_task(task_id)
                
            elif action == 'check_status' and task_id:
                # Get current task status
                status = await self.get_task_status(task_id)
                await self.send(text_data=json.dumps({
                    'type': 'task_status',
                    'task_id': task_id,
                    'data': status
                }))
                
            elif action == 'unsubscribe' and task_id:
                # Unsubscribe from specific task
                await self.unsubscribe_from_task(task_id)
                
        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'Invalid JSON format'
            }))
        except Exception as e:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': str(e)
            }))
    
    async def subscribe_to_task(self, task_id):
        """Subscribe to updates for a specific task"""
        task_group = f'task_{task_id}'
        await self.channel_layer.group_add(
            task_group,
            self.channel_name
        )
        
        await self.send(text_data=json.dumps({
            'type': 'subscribed',
            'task_id': task_id,
            'message': f'Subscribed to task {task_id}'
        }))
    
    async def unsubscribe_from_task(self, task_id):
        """Unsubscribe from updates for a specific task"""
        task_group = f'task_{task_id}'
        await self.channel_layer.group_discard(
            task_group,
            self.channel_name
        )
        
        await self.send(text_data=json.dumps({
            'type': 'unsubscribed',
            'task_id': task_id,
            'message': f'Unsubscribed from task {task_id}'
        }))
    
    @database_sync_to_async
    def get_task_status(self, task_id):
        """Get current status of a Celery task"""
        task = AsyncResult(task_id)
        
        status_data = {
            'task_id': task_id,
            'state': task.state,
            'ready': task.ready(),
        }
        
        if task.state == 'PENDING':
            status_data['status'] = 'Task is waiting to be executed'
        elif task.state == 'STARTED':
            status_data['status'] = 'Task has started'
        elif task.state == 'PROGRESS':
            status_data['status'] = 'Task is in progress'
            status_data['meta'] = task.info
        elif task.state == 'SUCCESS':
            status_data['status'] = 'Task completed successfully'
            status_data['result'] = task.result
        elif task.state == 'FAILURE':
            status_data['status'] = 'Task failed'
            status_data['error'] = str(task.info)
        elif task.state == 'RETRY':
            status_data['status'] = 'Task is being retried'
            status_data['meta'] = task.info
        
        return status_data
    
    # Handler for task update messages sent via channel layer
    async def task_update(self, event):
        """
        Handle task_update messages sent to the group
        
        Called when channel_layer.group_send() is used with type='task_update'
        """
        await self.send(text_data=json.dumps({
            'type': 'task_update',
            'task_id': event['task_id'],
            'state': event['state'],
            'status': event.get('status'),
            'progress': event.get('progress'),
            'result': event.get('result'),
            'error': event.get('error'),
        }))

