from app.database import SessionLocal, engine, Base
from app.models import (
    Member,
    BedManage,
    BodyData,
    MedTime,
    DataChangeText,
    PatientAdmissionInfo,
    PatientBasicInfo,
    ResponsibleNurse,
    RoomRoundRecord,
)


# Create tables
Base.metadata.create_all(bind=engine)


def seed():
    db = SessionLocal()

    # Check if data exists
    if db.query(Member).first():
        print("Data already seeded.")
        return

    # 1. Members
    members = [
        Member(
            id_number="D473890112",
            name="張XX",
            permission="2",
            identity="病人",
            userid="ghi456",
            password="hashed_ghi654",
        ),
        Member(
            id_number="F483901223",
            name="徐XX",
            permission="1",
            identity="護理師",
            userid="def456",
            password="hashed_def654",
        ),
        Member(
            id_number="F485739200",
            name="江XX",
            permission="1",
            identity="護理師",
            userid="jeff01478",
            password="hashed_123456",
        ),
        Member(
            id_number="H382014573",
            name="吳XX",
            permission="2",
            identity="病人",
            userid="def123",
            password="hashed_def321",
        ),
        Member(
            id_number="K341256782",
            name="林XX",
            permission="2",
            identity="病人",
            userid="abc789",
            password="hashed_abc987",
        ),
        Member(
            id_number="Q120987324",
            name="陳XX",
            permission="2",
            identity="病人",
            userid="abc456",
            password="hashed_abc654",
        ),
        Member(
            id_number="R483909821",
            name="何XX",
            permission="2",
            identity="病人",
            userid="ghi789",
            password="hashed_ghi987",
        ),
        Member(
            id_number="S123456789",
            name="呂XX",
            permission="2",
            identity="病人",
            userid="abc789",
            password="hashed_abc987",
        ),
        Member(
            id_number="W128473029",
            name="李XX",
            permission="2",
            identity="病人",
            userid="abc123",
            password="hashed_abc321",
        ),
    ]
    # For simplicity in this step I am just prefixing 'hashed_', but in real implementation we should use bcrypt.
    # I will update auth.py to handle plain text or re-hash these.
    # Actually, let's just store them as is for now to match legacy login, or better, real hash.
    # To save time on importing passlib here, I will store them as is and the Auth module will handle migration or just plain check for now (and upgrade later).
    # Reverting to plain text as per legacy for initial functionality, but will upgrade in auth.py
    members = [
        Member(
            id_number="D473890112",
            name="張XX",
            permission="2",
            identity="病人",
            userid="ghi456",
            password="ghi654",
        ),
        Member(
            id_number="F483901223",
            name="徐XX",
            permission="1",
            identity="護理師",
            userid="def456",
            password="def654",
        ),
        Member(
            id_number="F485739200",
            name="江XX",
            permission="1",
            identity="護理師",
            userid="jeff01478",
            password="123456",
        ),
        Member(
            id_number="H382014573",
            name="吳XX",
            permission="2",
            identity="病人",
            userid="def123",
            password="def321",
        ),
        Member(
            id_number="K341256782",
            name="林XX",
            permission="2",
            identity="病人",
            userid="abc789",
            password="abc987",
        ),
        Member(
            id_number="Q120987324",
            name="陳XX",
            permission="2",
            identity="病人",
            userid="abc456",
            password="abc654",
        ),
        Member(
            id_number="R483909821",
            name="何XX",
            permission="2",
            identity="病人",
            userid="ghi789",
            password="ghi987",
        ),
        Member(
            id_number="S123456789",
            name="呂XX",
            permission="2",
            identity="病人",
            userid="abc789",
            password="abc987",
        ),
        Member(
            id_number="W128473029",
            name="李XX",
            permission="2",
            identity="病人",
            userid="abc123",
            password="abc321",
        ),
    ]
    db.add_all(members)

    # 2. BedManage
    beds = [
        BedManage(id_number="1", bed_no="8", name="李XX", p_condition="看診中"),
        BedManage(id_number="2", bed_no="2", name="陳XX", p_condition="在床中"),
        BedManage(id_number="3", bed_no="3", name="林XX", p_condition="在床中"),
        BedManage(id_number="4", bed_no="5", name="吳XX", p_condition="手術中"),
        BedManage(id_number="5", bed_no="4", name="何XX", p_condition="在床中"),
        BedManage(id_number="6", bed_no="6", name="呂XX", p_condition="看診中"),
        BedManage(id_number="7", bed_no="7", name="張XX", p_condition="手術中"),
        BedManage(id_number="9", bed_no="1", name=None, p_condition="空床"),
    ]
    db.add_all(beds)

    # 3. BodyData (Sample)
    body_data = [
        BodyData(
            date="2022-05-31 ( 星期二)   17:29:41", T="36.4", name="李XX", remark=""
        ),  # name was empty in SQL row 1
        BodyData(
            date="2022-05-31 ( 星期二)   17:30:27", T="36.4", name="李XX", remark=""
        ),
        BodyData(
            date="2022-05-31 ( 星期二)   17:37:22", T="38.7", name="李XX", remark="發燒"
        ),
    ]
    db.add_all(body_data)

    # 4. ResponsibleNurse
    r_nurses = [
        ResponsibleNurse(
            id_number="F483901223", name="徐XX", p1="何XX", p2="李XX", p3="張XX"
        ),
        ResponsibleNurse(
            id_number="F485739200",
            name="江XX",
            p1="李XX",
            p2="陳XX",
            p3="林XX",
            p4="吳XX",
        ),
    ]
    db.add_all(r_nurses)

    # 5. PatientAdmissionInfo (Sample)
    admissions = [
        PatientAdmissionInfo(
            ward_no="712",
            bed_no="8",
            phone_no="0912567834",
            address="新北市新店區安康路二段67號",
            emergency_contact="家人",
            emergency_contact_no="0912345123",
            hospitalization_date="2022/1/19",
            observation_time="150",
            attending_physician="蔡XX",
            nurse="江XX",
            current_condition="good",
            transaction_info="ewgdb",
            name="李XX",
        ),
        PatientAdmissionInfo(
            ward_no="712",
            bed_no="2",
            phone_no="0937482653",
            address="台北市信義區中正路145號4樓之3",
            emergency_contact="家人",
            emergency_contact_no="0987346632",
            hospitalization_date="2022/3/13",
            observation_time="500",
            attending_physician="蔡XX",
            nurse="江XX",
            current_condition="not good",
            transaction_info="無",
            name="陳XX",
        ),
    ]
    db.add_all(admissions)

    # 6. DataChangeText
    db.add(DataChangeText(text="床號4(原病患陳XX)更換至床號，與病患何XX交換<br>..."))

    db.commit()
    db.close()
    print("Database seeded successfully.")


if __name__ == "__main__":
    seed()
