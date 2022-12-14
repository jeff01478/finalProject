<?php
    session_start();
    try {
        $conn = new PDO("mysql:host=localhost;dbname=id20011523_access_test", "id20011523_admin", "kusPR<\YYi\Z3DT|");
        $stmt = $conn->prepare("SELECT MAX(id) FROM esp_test");
        $stmt->execute();
        $Bf_data = $stmt->fetchAll()[0][0];
      } catch (PDOException $e) {
        echo "資料庫連結失敗! 錯誤訊息為 " . $e->getMessage();
      }

    while(true){
        try{
            $stmt = $conn->prepare("SELECT MAX(id) FROM esp_test");
            $stmt->execute();
            $Af_data = $stmt->fetchAll()[0][0];
            if($Bf_data != $Af_data){
                break;
            }
        }catch (PDOException $e) {
            echo "資料庫連結失敗! 錯誤訊息為 " . $e->getMessage();
        }
    }

    $remark = NULL;
    $id_number = $_SESSION['p_id_number'];
    
    try{
        $stmt = $conn->prepare("SELECT temp FROM esp_test WHERE id = ".$Af_data);
        $stmt->execute();
        $T = $stmt->fetchAll()[0][0];
        if($T >= 37.5){
            $remark = "發燒";
        }

        $stmt = $conn->prepare("SELECT m_name FROM member where id_number = '".$_SESSION['p_id_number']."'");
        $stmt->execute();
        $p_name = $stmt->fetchAll()[0][0];
        
        $stmt = $conn->prepare("UPDATE body_data SET id_number = '".$id_number."', T = '".$T."', m_name = '".$p_name."', remark = '".$remark."' WHERE remark = 'good'");
        $stmt->execute();
    }catch(PDOException $e){
        echo "資料庫連結失敗! 錯誤訊息為 " . $e->getMessage();
    }
    echo "<script> {window.alert('已完成測量');location.href='nurse_bodydata.php'} </script>";
?>
