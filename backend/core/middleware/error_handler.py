import logging
import traceback
from django.http import JsonResponse
from django.core.exceptions import PermissionDenied, ValidationError
from rest_framework.response import Response
from rest_framework import status

logger = logging.getLogger('django')

class EnterpriseErrorMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        try:
            response = self.get_response(request)
            return response
        except Exception as e:
            return self.handle_exception(request, e)

    def handle_exception(self, request, e):
        # Determine status code
        if isinstance(e, PermissionDenied):
            status_code = 403
            message = "You do not have permission to perform this action."
        elif isinstance(e, ValidationError):
            status_code = 400
            message = str(e)
        else:
            status_code = 500
            message = "An internal server error occurred."
            # Log the full traceback for 500 errors
            logger.error(f"Internal Server Error: {str(e)}\n{traceback.format_exc()}")

        # Ensure we return a consistent JSON response
        response_data = {
            "success": False,
            "error": message,
            "code": status_code,
            "path": request.path
        }

        # Return JsonResponse if it's a standard Django request, 
        # or we can just always use JsonResponse for the middleware layer
        return JsonResponse(response_data, status=status_code)

class RequestLoggingMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Log request
        logger.info(f"Request: {request.method} {request.path} - User: {request.user}")
        
        response = self.get_response(request)
        
        # Log response status
        logger.info(f"Response: {request.method} {request.path} - Status: {response.status_code}")
        
        return response
