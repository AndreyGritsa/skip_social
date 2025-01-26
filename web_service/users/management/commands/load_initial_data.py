from django.core.management.base import BaseCommand
from django.core.management import call_command
from channels.models import Message

class Command(BaseCommand):
    help = 'Load initial data if the database is empty'

    def handle(self, *args, **kwargs):
        if not Message.objects.exists():
            self.stdout.write(self.style.SUCCESS('Cleaning the database...'))
            call_command('flush', '--noinput')
            self.stdout.write(self.style.SUCCESS('Loading initial data...'))
            call_command('loaddata', 'fixtures/initial_data.json')
        else:
            self.stdout.write(self.style.SUCCESS('Initial data already loaded.'))