<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>資料更動</title>
</head>
<body>
    <?php 
        session_start();
        $conn = new PDO("mysql:host=localhost;dbname=access_test", "root", "");
        $updata = array();
        $data_amount = $_POST['data']; //資料數量
        $data_change_text = "";

        for($i = 0 ; $i < $data_amount * 2 ; $i++){ //將要更改的資料存到陣列
            $updata[$i] = $_POST["info".($i+1)];
            echo $updata[$i]."<br>";
        }

        $stmt = $conn ->prepare("SELECT bed_no FROM bed_manage WHERE id_number='".$_SESSION['p_id_number']."'"); //先將原本病患原床位取出
        $stmt->execute();
        $Bf_bed_no = $stmt->fetchAll()[0][0];

        $stmt = $conn ->prepare("SELECT id_number FROM bed_manage WHERE bed_no='".$updata[2]."'"); //將第二位病患身分號取出
        $stmt->execute();
        $Af_bed_id = $stmt->fetchAll()[0][0];

        $stmt = $conn ->prepare("SELECT m_name FROM member WHERE id_number ='".$_SESSION['p_id_number']."'"); //原病患姓名
        $stmt->execute();
        $Bf_bed_name = $stmt->fetchAll()[0][0];

        $stmt = $conn ->prepare("SELECT bed_no FROM bed_manage WHERE bed_no='".$updata[2]."'"); //將第二位病患床位取出
        $stmt->execute();
        $Af_bed_no = $stmt->fetchAll()[0][0];
        if($Bf_bed_no != $Af_bed_no){ //若無更動床位，則只更新資料
            if($Af_bed_id == NULL){ //若換過去的床位為空床，則只更新bed_manage的資料
                echo $Af_bed_no;
                $stmt = $conn ->prepare("UPDATE bed_manage SET bed_no = '".$Bf_bed_no."' WHERE bed_no = '".$updata[2]."'");
                $stmt->execute();
                $data_change_text = "床號".$Bf_bed_no."(原病患".$Bf_bed_name.")更換至床號".$Af_bed_no."<br>"; //將異動資訊更新，並更新至資料庫
                $data_change_text .= $_SESSION['data_change_text'];
                $_SESSION['data_change_text'] = $data_change_text;
                $stmt = $conn ->prepare("UPDATE data_change_text SET record = '".$data_change_text."' WHERE id = 1");
                $stmt->execute();
            }
            else{
                //將第二位被換床位的病患換到第一位病患的床位
                $stmt = $conn ->prepare("UPDATE patient_admission_info SET bed_no = '".$Bf_bed_no."' WHERE bed_no = '".$updata[2]."'");
                $stmt->execute();
                $stmt = $conn ->prepare("UPDATE bed_manage SET bed_no = '".$Bf_bed_no."' WHERE bed_no = '".$updata[2]."'");
                $stmt->execute();
    
                $stmt = $conn ->prepare("SELECT m_name FROM bed_manage WHERE id_number='".$Af_bed_id."'"); //將原第二位病患名子取出
                $stmt->execute();
                $Af_bed_name = $stmt->fetchAll()[0][0];
    
                $data_change_text = "床號".$Bf_bed_no."(原病患".$Bf_bed_name.")更換至床號".$Af_bed_no."，與病患".$Af_bed_name."交換<br>"; //將異動資訊更新，並更新至資料庫
                $data_change_text .= $_SESSION['data_change_text'];
                $_SESSION['data_change_text'] = $data_change_text;
                $stmt = $conn ->prepare("UPDATE data_change_text SET record = '".$data_change_text."' WHERE id = 1");
                $stmt->execute();
            }
        }
        
        try {
            $data = array('ward_no','r1','bed_no','r2','phone_no','r3','address','r4','emergency_contact','r5','emergency_contact_no','r6',
            'hospitalization_date','r7','observation_time','r8','attending_physician','r9','nurse','r10','current_condition','r11'); //資料庫欄位

            for($i = 0 ; $i < count($data) ; $i++){ //將要更新資料更新至資料庫
                $stmt = $conn ->prepare("UPDATE patient_admission_info SET ".$data[$i]."='".$updata[$i]."' WHERE id_number = '".$_SESSION['p_id_number']."'");
                $stmt->execute();
            }
            $stmt = $conn ->prepare("UPDATE bed_manage SET bed_no = '".$updata[2]."' WHERE id_number = '".$_SESSION['p_id_number']."'");
            $stmt->execute();
            echo "<script> {window.alert('資料存成功');location.href='nurse_info.php'} </script>";

        } catch (PDOException $e) {
            echo "資料庫連結失敗! 錯誤訊息為 " . $e->getMessage();
        }

    ?>
</body>
</html>

