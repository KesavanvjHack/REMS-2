from django.contrib import admin
from .models import AttendanceRecord, LeaveRequest, Holiday

@admin.register(AttendanceRecord)
class AttendanceRecordAdmin(admin.ModelAdmin):
    list_display = ('user', 'date', 'status', 'net_work_hours', 'is_late')
    list_filter = ('status', 'date', 'is_late')
    search_fields = ('user__username', 'remarks')

@admin.register(LeaveRequest)
class LeaveRequestAdmin(admin.ModelAdmin):
    list_display = ('user', 'leave_type', 'start_date', 'end_date', 'status')
    list_filter = ('status', 'leave_type', 'start_date')
    search_fields = ('user__username', 'reason')
    actions = ['approve_leaves', 'reject_leaves']

    def approve_leaves(self, request, queryset):
        queryset.update(status='APPROVED', reviewed_by=request.user)
    approve_leaves.short_description = "Approve selected leave requests"

    def reject_leaves(self, request, queryset):
        queryset.update(status='REJECTED', reviewed_by=request.user)
    reject_leaves.short_description = "Reject selected leave requests"

@admin.register(Holiday)
class HolidayAdmin(admin.ModelAdmin):
    list_display = ('name', 'date')
    list_filter = ('date',)
    search_fields = ('name', 'description')
