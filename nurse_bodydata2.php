<?php 
    session_start();
    $T = NULL;
    $date = NULL;
    $remark = NULL;
    $id_number = $_SESSION['p_id_number'];

    if(isset($_POST['temperature'])){
        $T .= $_POST['temperature'];
    }

    if($T == NULL){
        echo "<script> {window.alert('請輸體溫');location.href='nurse_bodydata.php'} </script>";
    }
    else{
        if(isset($_POST['date'])){
            $date = $_POST['date'];
        }
    
        if(isset($_POST['remark'])){
            $remark = $_POST['remark'];
        }
    
        try{
            $conn = new PDO("mysql:host=localhost;dbname=access_test", "root", "");
            
            $stmt = $conn->prepare("SELECT m_name FROM member where id_number = '".$_SESSION['p_id_number']."'");
            $stmt->execute();
            $p_name = $stmt->fetchAll()[0][0];

            $stmt = $conn->prepare("INSERT INTO body_data(id_number, T, m_date, m_name, remark) VALUES ('".$id_number."','".$T."','".$date."','".$p_name."','".$remark."')");
            $stmt->execute();
            echo "<script> {window.alert('資料儲存成功');location.href='nurse_bodydata.php'} </script>";
        }catch(PDOException $e){
            echo "資料庫連結失敗! 錯誤訊息為 " . $e->getMessage();
        }
    }
       
?>

