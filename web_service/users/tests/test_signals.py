from django.test import TestCase
from django.contrib.auth.models import User
from users.models import Profile, FriendRequest

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

class FriendRequestSignalTestCase(TestCase):
    def setUp(self):
        # Create users and profiles for testing
        self.user1 = User.objects.create_user(username='user1', password='testpass')
        self.user2 = User.objects.create_user(username='user2', password='testpass')
        self.profile1 = self.user1.profile
        self.profile2 = self.user2.profile

    def test_create_friendship(self):
        # Create a friend request from profile1 to profile2
        FriendRequest.objects.create(from_profile=self.profile1, to_profile=self.profile2)
        
        # Create a reciprocal friend request from profile2 to profile1
        FriendRequest.objects.create(from_profile=self.profile2, to_profile=self.profile1)
        
        # Check that the profiles are now friends
        self.assertIn(self.profile2, self.profile1.friends.all())
        self.assertIn(self.profile1, self.profile2.friends.all())

        # Check that the friend requests are deleted
        self.assertFalse(FriendRequest.objects.filter(from_profile=self.profile1, to_profile=self.profile2).exists())
        self.assertFalse(FriendRequest.objects.filter(from_profile=self.profile2, to_profile=self.profile1).exists())

    def test_no_friendship_on_single_request(self):
        # Create a friend request from profile1 to profile2
        FriendRequest.objects.create(from_profile=self.profile1, to_profile=self.profile2)
        
        # Check that the profiles are not friends yet
        self.assertNotIn(self.profile2, self.profile1.friends.all())
        self.assertNotIn(self.profile1, self.profile2.friends.all())

        # Check that the friend request still exists
        self.assertTrue(FriendRequest.objects.filter(from_profile=self.profile1, to_profile=self.profile2).exists())