from sqlalchemy import Column, Integer, String, Text, Enum, ForeignKey, TIMESTAMP
from datetime import datetime
from lineapi.database import Base


class Chat(Base):
    __tablename__ = 'resv_chat'

    id = Column(Integer, primary_key=True, autoincrement=True)
    reservation_id = Column(Integer, ForeignKey('resv_reservation.id', ondelete='CASCADE'))
    sender_id = Column(String(255), nullable=False)
    sender_type = Column(Enum('user', 'cast'), nullable=False)
    message = Column(Text, nullable=False)
    created_at = Column(TIMESTAMP, default=datetime.utcnow)
