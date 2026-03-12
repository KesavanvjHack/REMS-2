import csv
import io
from .models import User
from django.db import transaction

class UserImportService:
    @staticmethod
    @transaction.atomic
    def import_users_from_csv(csv_file):
        """
        Expects a CSV file with headers:
        username,fullname,email,mobile,designation,department,role,gender,address
        """
        decoded_file = csv_file.read().decode('utf-8')
        io_string = io.StringIO(decoded_file)
        reader = csv.DictReader(io_string)
        
        created_count = 0
        errors_list = []
        
        for row in reader:
            try:
                # Basic validation
                username = row.get('username')
                if not username:
                    errors_list.append({"row": row, "error": "Username missing"})
                    continue
                
                if User.objects.filter(username=username).exists():
                    errors_list.append({"row": row, "error": f"Username {username} already exists"})
                    continue
                
                # Create user with a default password (they should reset it or use OTP)
                User.objects.create_user(
                    username=username,
                    email=row.get('email', ''),
                    fullname=row.get('fullname', ''),
                    mobile=row.get('mobile', ''),
                    designation=row.get('designation', ''),
                    department=row.get('department', ''),
                    role=row.get('role', 'Employee'),
                    gender=row.get('gender', ''),
                    address=row.get('address', ''),
                    password=f"{username}REMS!2026" 
                )
                created_count += 1
            except Exception as e:
                errors_list.append({"row": row, "error": str(e)})
                
        return {
            "created": created_count,
            "errors": errors_list
        }
