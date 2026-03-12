import logging
import traceback
from django.http import JsonResponse
from django.utils import timezone
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
        # Determine status code and message
        if isinstance(e, PermissionDenied):
            status_code = 403
            message = "Authentication credentials were not provided or are invalid."
        elif isinstance(e, ValidationError):
            status_code = 400
            message = "Validation Error: " + str(e)
        else:
            status_code = getattr(e, 'status_code', 500)
            message = getattr(e, 'detail', "An unexpected system error occurred.")
            
            if status_code == 500:
                message = "Internal Server Interruption. Our engineers have been notified."
                logger.error(f"CRITICAL ERROR: {str(e)}\n{traceback.format_exc()}")

        # Consistent Enterprise Response Structure
        response_data = {
            "success": False,
            "error": {
                "message": str(message),
                "type": e.__class__.__name__,
                "code": status_code
            },
            "meta": {
                "path": request.path,
                "timestamp": str(timezone.now() if 'timezone' in globals() else "")
            }
        }

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
