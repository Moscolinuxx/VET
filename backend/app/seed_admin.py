"""
Creates a default admin account for first login.
Run once: python -m app.seed_admin
"""
from app.database import SessionLocal, Base, engine
from app import models, auth

Base.metadata.create_all(bind=engine)


def run():
    db = SessionLocal()
    existing = db.query(models.User).filter(models.User.email == "admin@vetguard.ai").first()
    if existing:
        print("Admin already exists.")
        return

    admin = models.User(
        full_name="VetGuard Admin",
        email="admin@vetguard.ai",
        hashed_password=auth.hash_password("Admin123!"),
        role=models.UserRole.admin,
    )
    db.add(admin)
    db.commit()
    print("Created admin account -> email: admin@vetguard.ai / password: Admin123!")


if __name__ == "__main__":
    run()
