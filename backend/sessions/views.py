from rest_framework import status, views, response, permissions
from .services import SessionService
from .serializers import WorkSessionSerializer, BreakSessionSerializer
from .models import WorkSession, BreakSession

class PunchView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        """Get current active session status"""
        session = WorkSession.objects.filter(user=request.user, end_time__isnull=True).first()
        if session:
            return response.Response({
                "is_punched_in": True,
                "session": WorkSessionSerializer(session).data
            })
        return response.Response({"is_punched_in": False})

    def post(self, request):
        action = request.data.get('action') # 'in' or 'out'
        if action == 'in':
            ip = request.META.get('REMOTE_ADDR')
            ua = request.META.get('HTTP_USER_AGENT')
            session = SessionService.punch_in(request.user, ip, ua)
            return response.Response(WorkSessionSerializer(session).data, status=status.HTTP_201_CREATED)
        elif action == 'out':
            session = SessionService.punch_out(request.user)
            if session:
                return response.Response(WorkSessionSerializer(session).data)
            return response.Response({"error": "No active session found"}, status=status.HTTP_400_BAD_REQUEST)
        return response.Response({"error": "Invalid action"}, status=status.HTTP_400_BAD_REQUEST)

class BreakView(views.APIView):
    def post(self, request):
        action = request.data.get('action') # 'start' or 'stop'
        if action == 'start':
            break_type = request.data.get('break_type', 'SHORT')
            brk = SessionService.start_break(request.user, break_type)
            if brk:
                return response.Response(BreakSessionSerializer(brk).data, status=status.HTTP_201_CREATED)
            return response.Response({"error": "No active work session"}, status=status.HTTP_400_BAD_REQUEST)
        elif action == 'stop':
            brk = SessionService.stop_break(request.user)
            if brk:
                return response.Response(BreakSessionSerializer(brk).data)
            return response.Response({"error": "No active break found"}, status=status.HTTP_400_BAD_REQUEST)
        return response.Response({"error": "Invalid action"}, status=status.HTTP_400_BAD_REQUEST)

class HeartbeatView(views.APIView):
    def post(self, request):
        # Activity tracking logic
        # For now, just return success
        return response.Response({"status": "active"})
