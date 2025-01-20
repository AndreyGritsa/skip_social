import requests
from rest_framework.response import Response
from django.shortcuts import redirect
from django.conf import settings
from rest_framework import status
from rest_framework.negotiation import BaseContentNegotiation
from rest_framework.authentication import SessionAuthentication
import json

REACTIVE_SERVICE_URL = settings.REACTIVE_SERVICE_URL


class CsrfExemptSessionAuthentication(SessionAuthentication):
    """
    Custom session authentication class that exempts CSRF validation.
    This class overrides the `enforce_csrf` method of the `SessionAuthentication`
    class to bypass the CSRF check for the given request.
    Methods:
        enforce_csrf(request):
            Overrides the default CSRF enforcement to do nothing, effectively
            disabling CSRF protection for requests authenticated using this class.
    """

    def enforce_csrf(self, request):
        return  # To not perform the csrf check


# TODO: Find better sollution to accept text/event-stream
class IgnoreClientContentNegotiation(BaseContentNegotiation):
    """
    Custom content negotiation class that ignores client content negotiation.
    """

    def select_parser(self, request, parsers):
        """
        Select the first parser in the `.parser_classes` list.
        """
        return parsers[0]

    def select_renderer(self, request, renderers, format_suffix):
        """
        Select the first renderer in the `.renderer_classes` list.
        """
        return (renderers[0], renderers[0].media_type)


def handle_reactive_get(request, resource, params):
    """
    Handles a GET request for a reactive resource.
    If the request's "Accept" header includes "text/event-stream", it will
    initiate a stream by sending a POST request to the reactive service and
    redirect to the stream's URL.
    Otherwise, it will send a GET request to the reactive service to fetch
    the resource data.
    Args:
        request: The HTTP request object.
        resource: The resource identifier to be fetched or streamed.
        params: The parameters to be sent with the request.
    Returns:
        A redirect response to the stream URL if streaming is requested,
        otherwise a JSON response with the resource data.
    """

    if "text/event-stream" in request.headers.get("Accept", ""):
        resp = requests.post(
            f"{REACTIVE_SERVICE_URL}/streams/{resource}",
            json=params,
        )
        uuid = resp.text

        return redirect(f"/streams/{uuid}", code=307)

    else:
        resp = requests.post(
            f"{REACTIVE_SERVICE_URL}/snapshot/{resource}",
            json=params,
        )

        if resp.json():
            return Response(resp.json()[0][1], status=status.HTTP_200_OK)
        return Response([], status=status.HTTP_200_OK)


def handle_reactive_put(inputs_name, id, data):
    """
    Sends a PUT request to the reactive service to update the specified input with the given data.
    Args:
        inputs_name (str): The name of the input to be updated.
        id (str): The identifier of the input to be updated.
        data (dict): The data to update the input with.
    Returns:
        Response: The response object from the requests library.
    """
    id = str(id) # Ensure id is a string
    data = [[id, [data]]] if data else [[id, []]]
   
    return requests.patch(
        f"{REACTIVE_SERVICE_URL}/inputs/{inputs_name}",
        json=data,
    )
    


# test utils


def mock_requests_reactive(status_code=200, content=None):
    content = json.dumps(content).encode("utf-8") if content else b"[]"
    mock_response = requests.Response()
    mock_response.status_code = status_code
    mock_response._content = content
    return mock_response
