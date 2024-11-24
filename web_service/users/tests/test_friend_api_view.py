from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase, APIClient
from django.contrib.auth.models import User


class FriendAPITestCase(APITestCase):
    def setUp(self):
        # TODO: use fixtures instead
        self.user1 = User.objects.create_user(username='user1', password='testpass')
        self.user2 = User.objects.create_user(username='user2', password='testpass')
        self.profile1 = self.user1.profile
        self.profile2 = self.user2.profile
        self.profile2.status = "away"
        self.profile2.save()
        self.profile1.friends.add(self.profile2)
        self.profile_id = self.profile1.id
        self.client = APIClient(enforce_csrf_checks=True)
        self.url = reverse("friend")
        return super().setUp()

    def test_get_friends(self):
        response = self.client.get(self.url, {'profile_id': self.profile_id})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('friends', response.data)
        self.assertEqual(len(response.data['friends']), 1)
        self.assertEqual(response.data['friends'][0]['id'], self.profile2.id)
        self.assertEqual(response.data['friends'][0]['status'], 'away')

    def test_get_friends_profile_not_found(self):
        response = self.client.get(self.url, {'profile_id': 999})
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_get_friends_profile_id_not_provided(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)