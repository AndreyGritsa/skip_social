from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase, APIClient
from django.contrib.auth.models import User
from unittest.mock import patch
from utils import mock_requests_reactive


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

    @patch('requests.get')
    def test_get_friends(self, mock_requests_get):
        get_content = [[f"{self.profile2.id}", {'id': self.profile2.id, 'status': 'away'}]]
        mock_requests_get.return_value = mock_requests_reactive(content=get_content)
        response = self.client.get(self.url, {'profile_id': self.profile_id})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['id'], self.profile2.id)
        self.assertEqual(response.data['status'], 'away')

    @patch('requests.get')
    def test_get_friends_profile_not_found(self, mock_requests_get):
        mock_requests_get.return_value = mock_requests_reactive()
        response = self.client.get(self.url, {'profile_id': 999})
        self.assertEqual(response.data, [])

    @patch('requests.get')
    def test_get_friends_profile_id_not_provided(self, mock_requests_get):
        mock_requests_get.return_value = mock_requests_reactive()
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)