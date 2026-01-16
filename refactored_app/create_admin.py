from app.database import SessionLocal
from app.models import Member


def create_admin():
    db = SessionLocal()
    # Check if admin exists
    admin = db.query(Member).filter(Member.permission == "0").first()
    if admin:
        print(f"Admin already exists: {admin.userid}. Resetting password...")
        admin.password = "admin"
        db.commit()
    else:
        new_admin = Member(
            id_number="A000000000",
            name="Super Admin",
            userid="admin",
            password="admin",  # Plaintext for demo compatibility
            permission="0",
            identity="管理員",
        )
        db.add(new_admin)
        db.commit()
        print("Admin user 'admin' created.")
    db.close()


if __name__ == "__main__":
    create_admin()
