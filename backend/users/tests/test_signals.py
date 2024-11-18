from django.test import TestCase
from django.contrib.auth.models import User
from users.models import Profile

class UserProfileSignalTestCase(TestCase):
    def test_profile_created_on_user_creation(self):
        # Create a user
        user = User.objects.create_user(username='testuser', password='testpass')
        
        # Check that a Profile instance is created
        self.assertTrue(Profile.objects.filter(user=user).exists())
        
        # Check the Profile instance
        profile = Profile.objects.get(user=user)
        self.assertEqual(profile.user, user)
        self.assertEqual(profile.status, 'online')  # Assuming 'online' is the default status

    def test_profile_saved_on_user_save(self):
        # Create a user
        user = User.objects.create_user(username='testuser', password='testpass')
        
        # Get the associated Profile instance
        profile = Profile.objects.get(user=user)
        
        # Update the user's username
        user.username = 'updateduser'
        user.save()
        
        # Check that the Profile instance is still associated with the user
        profile.refresh_from_db()
        self.assertEqual(profile.user.username, 'updateduser')