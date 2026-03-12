from .models import AlertLog
from accounts.models import User
import logging

logger = logging.getLogger(__name__)

class NotificationService:
    @staticmethod
    def notify_user(user, title, message, alert_type="INFO", category="SYSTEM"):
        """
        Primary method to notify a user. 
        Creates a DB alert and logs a mock email/SMS.
        """
        # 1. Create In-App Alert
        AlertLog.objects.create(
            user=user,
            title=title,
            message=message,
            alert_type=alert_type,
            category=category
        )
        
        # 2. Mock Email/SMS Stub
        logger.info(f"[NOTIFY] [EMAIL STUB] To: {user.email} | Subject: {title} | Body: {message}")
        print(f"📧 EMAIL SENT TO {user.email}: {title} - {message[:30]}...")

    @staticmethod
    def notify_manager(user, title, message):
        """Helper to find and notify the manager of a specific user"""
        # In a real system, we'd look up the user's manager in the Org chart or User model
        # For now, we notify all Admins or leave it as a placeholder
        admins = User.objects.filter(role="Admin")
        for admin in admins:
            NotificationService.notify_user(admin, f"Manager Alert: {title}", message, alert_type="WARNING")

    @staticmethod
    def alert_critical_failure(message):
        """System-wide critical alert for admins"""
        admins = User.objects.filter(role="Admin")
        for admin in admins:
            NotificationService.notify_user(admin, "CRITICAL SYSTEM ALERT", message, alert_type="CRITICAL")
