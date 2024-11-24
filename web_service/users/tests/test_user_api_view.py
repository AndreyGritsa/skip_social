from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase, APIClient
from django.contrib.auth.models import User


class UserAPITestCase(APITestCase):
    def setUp(self):
        # TODO: use fixtures instead
        self.user = User.objects.create_user(username='testuser', password='testpass')
        self.profile_id = self.user.profile.id
        self.client = APIClient(enforce_csrf_checks=True)
        self.url = reverse("user")
        return super().setUp()

    def test_get_profile(self):
        response = self.client.get(self.url, {'profile_id': self.profile_id})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'online')

    def test_get_profile_not_found(self):  
        response = self.client.get(self.url, {'profile_id': 999})
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_patch_profile_status(self):  
        data = {'profile_id': self.profile_id, 'status': 'away'}
        response = self.client.patch(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.profile.refresh_from_db()
        self.assertEqual(self.user.profile.status, 'away')

    def test_patch_profile_not_found(self):   
        data = {'profile_id': 999, 'status': 'away'}
        response = self.client.patch(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_patch_profile_invalid_data(self):   
        data = {'profile_id': self.profile_id}
        response = self.client.patch(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)