from . import settings
from celery import Celery

app = Celery('philgeps_data_explorer')
app.config_from_object('philgeps_data_explorer.settings', namespace='CELERY')
app.autodiscover_tasks()

# Optional: debug task for testing
@app.task(bind=True)
def debug_task(self):
    print(f'Request: {self.request!r}')