from utils import (
    handle_reactive_get,
    CsrfExemptSessionAuthentication,
    IgnoreClientContentNegotiation,
)
from rest_framework.views import APIView, Response


class StreamingIssueView(APIView):
    content_negotiation_class = IgnoreClientContentNegotiation
    authentication_classes = (CsrfExemptSessionAuthentication,)

    def get(self, request):
        return handle_reactive_get(request, "issue", {})
        
        # this way works
        # if not "text/event-stream" in request.headers.get("Accept", ""):
        #     return Response("Skip non-streaming requests", status=200) 
        # else:
        #     return handle_reactive_get(request, "issue", {})
