<?php 
    session_start();
    $content = NULL;
    $date = NULL;
    $remark = NULL;
    $id_number = $_SESSION['p_id_number'];
    //$name = $_SESSION['patient'];

    if(isset($_POST['Product_1'])){
        $content .= $_POST['Product_1']."<br>";
    }
    if(isset($_POST['Product_2'])){
        $content .= $_POST['Product_2']."<br>";
    }
    if(isset($_POST['Product_3'])){
        $content .= $_POST['Product_3']."<br>";
    }
    if(isset($_POST['Product_4'])){
        $content .= $_POST['Product_4']."<br>";
    }
    if($content == NULL){
        echo "<script> {window.alert('請輸內容');location.href='nurse_ward_round.php'} </script>";
    }
    else{
        if(isset($_POST['date'])){
            $date = $_POST['date'];
        }
    
        if(isset($_POST['remark'])){
            $remark = $_POST['remark'];
        }
    
        try{
            $conn = new PDO("mysql:host=localhost;dbname=id20011523_nursing", "id20011523_admin", "O&Zp}A5LWd%ARi/8");
            $stmt = $conn->prepare("SELECT m_name FROM member where id_number = '".$_SESSION['p_id_number']."'");
            $stmt->execute();
            $p_name = $stmt->fetchAll()[0][0];
            $stmt = $conn->prepare("INSERT INTO room_round_record(id_number, content, m_date, m_name, remark) VALUES ('".$id_number."','".$content."','".$date."','".$p_name."','".$remark."')");
            $stmt->execute();
            echo "<script> {window.alert('資料儲存成功');location.href='nurse_ward_round.php'} </script>";
        }catch(PDOException $e){
            echo "資料庫連結失敗! 錯誤訊息為 " . $e->getMessage();
        }
    }
       
?>

