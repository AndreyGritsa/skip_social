# Generated by Django 5.1.3 on 2024-11-24 09:28

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('users', '0003_alter_friendrequest_from_profile_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='Server',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=255)),
            ],
        ),
        migrations.CreateModel(
            name='Member',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('role', models.CharField(max_length=255)),
                ('profile', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='servers', to='users.profile')),
                ('server', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='members', to='servers.server')),
            ],
        ),
    ]
