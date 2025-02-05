from rest_framework.views import APIView
from rest_framework.response import Response

class HealthAPIView(APIView):
    def get(self, request):
        return Response({"status": "healthy"}, status=200)