from sqlalchemy import Column, Integer, String, Text, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base


class Member(Base):
    __tablename__ = "member"
    id_number = Column(String, primary_key=True, index=True)
    name = Column(String, unique=True)
    permission = Column(String)
    identity = Column(String)
    userid = Column(String, index=True)
    password = Column(String)  # Will store hashed password


class BedManage(Base):
    __tablename__ = "bed_manage"
    id_number = Column(String, primary_key=True)  # Seems to be used as an ID
    bed_no = Column(String)
    name = Column(String, nullable=True)
    p_condition = Column(String)


class BodyData(Base):
    __tablename__ = "body_data"
    id = Column(Integer, primary_key=True, index=True)
    date = Column(String)
    T = Column(String)  # Temperature
    bp_sys = Column(Integer, nullable=True)  # Systolic BP
    bp_dia = Column(Integer, nullable=True)  # Diastolic BP
    pulse = Column(Integer, nullable=True)  # Heart Rate
    name = Column(String)
    remark = Column(String, nullable=True)


class DataChangeText(Base):
    __tablename__ = "data_change_text"
    id = Column(Integer, primary_key=True, index=True)
    text = Column(Text, nullable=True)


class MedTime(Base):
    __tablename__ = "med_time"
    id = Column(Integer, primary_key=True, index=True)
    med = Column(Text)
    date = Column(String)
    name = Column(String)
    remark = Column(String, nullable=True)


class PatientAdmissionInfo(Base):
    __tablename__ = "patient_admission_info"
    id = Column(Integer, primary_key=True, index=True)
    ward_no = Column(String)
    bed_no = Column(String)
    phone_no = Column(String)
    address = Column(String)
    emergency_contact = Column(String)
    emergency_contact_no = Column(String)
    hospitalization_date = Column(String)
    observation_time = Column(String)
    attending_physician = Column(String)
    nurse = Column(String)
    current_condition = Column(String)
    transaction_info = Column(String)
    name = Column(String)
    # The legacy table has many 'r1', 'r2' columns which were empty. Omitted for cleanliness.


class PatientBasicInfo(Base):
    __tablename__ = "patient_basic_info"
    id = Column(Integer, primary_key=True, index=True)
    id_no = Column(String)
    chart_no = Column(String)  # Chart number
    name = Column(String)
    gender = Column(String)
    birth_date = Column(String)
    blood = Column(String)
    rh = Column(String)
    major_illness = Column(String)
    allergies = Column(String)


class ResponsibleNurse(Base):
    __tablename__ = "responsible_nurse"
    id_number = Column(String, ForeignKey("member.id_number"), primary_key=True)
    name = Column(String)
    p1 = Column(String, nullable=True)
    p2 = Column(String, nullable=True)
    p3 = Column(String, nullable=True)
    p4 = Column(String, nullable=True)

    # Relationships
    member = relationship("Member")


class RoomRoundRecord(Base):
    __tablename__ = "room_round_record"
    id = Column(Integer, primary_key=True, index=True)
    date = Column(String)
    content = Column(Text)
    name = Column(String)
    remark = Column(String, nullable=True)


class ShiftNote(Base):
    __tablename__ = "shift_note"
    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text)
    author_id = Column(String, ForeignKey("member.id_number"))
    created_at = Column(String)

    author = relationship("Member")
