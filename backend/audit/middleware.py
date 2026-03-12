import json
from audit.models import AuditLog

class AuditMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)

        # Log only mutations for authenticated users
        if request.user.is_authenticated and request.method in ['POST', 'PUT', 'PATCH', 'DELETE']:
            # Avoid logging sensitive paths or very large payloads
            if '/login' in request.path or '/signup' in request.path:
                return response

            try:
                # Basic description
                description = f"{request.method} request to {request.path}"
                
                # Try to capture a summary of the payload if it's JSON
                payload_summary = ""
                if request.content_type == 'application/json':
                    try:
                        body = json.loads(request.body)
                        # Remove potentially sensitive fields
                        for sensitive in ['password', 'token', 'secret']:
                            if sensitive in body:
                                body[sensitive] = '***'
                        payload_summary = f"Payload: {json.dumps(body)[:500]}"
                    except:
                        pass

                AuditLog.objects.create(
                    user=request.user,
                    action=f"{request.method} {request.path}",
                    description=f"{description}. {payload_summary}",
                    ip_address=self.get_client_ip(request),
                    module=self.get_module_from_path(request.path)
                )
            except Exception as e:
                # We don't want audit logging to crash the main request
                print(f"Audit log error: {e}")

        return response

    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip

    def get_module_from_path(self, path):
        parts = path.strip('/').split('/')
        if len(parts) > 0:
            return parts[0].upper()
        return "CORE"
