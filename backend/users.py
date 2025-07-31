from sqlalchemy import Column, String, Boolean
from db import Base

class User(Base):
    __tablename__ = 'users'
    id = Column(String, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_admin = Column(Boolean, default=False)
    is_driver = Column(Boolean, default=False)
