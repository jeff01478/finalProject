<?php 
    session_start();
    $med = NULL;
    $date = NULL;
    $remark = NULL;
    $id_number = $_SESSION['p_id_number'];
    //$name = $_SESSION['patient'];

    if(isset($_POST['Product_1'])){
        $med .= $_POST['Product_1']."<br>";
    }
    if(isset($_POST['Product_2'])){
        $med .= $_POST['Product_2']."<br>";
    }
    if(isset($_POST['Product_3'])){
        $med .= $_POST['Product_3']."<br>";
    }
    if($med == NULL){
        echo "<script> {window.alert('請輸入藥物');location.href='nurse_med_time.php'} </script>";
    }
    else{
        if(isset($_POST['date'])){
            $date = $_POST['date'];
        }
    
        if(isset($_POST['remark'])){
            $remark = $_POST['remark'];
        }
    
        try{
            $conn = new PDO("mysql:host=localhost;dbname=id20011523_access_test", "id20011523_admin", "kusPR<\YYi\Z3DT|");

            $stmt = $conn->prepare("SELECT m_name FROM member where id_number = '".$_SESSION['p_id_number']."'");
            $stmt->execute();
            $p_name = $stmt->fetchAll()[0][0];

            $stmt = $conn->prepare("INSERT INTO med_time(id_number, med, m_date, m_name, remark) VALUES ('".$id_number."','".$med."','".$date."','".$p_name."','".$remark."')");
            $stmt->execute();
            echo "<script> {window.alert('資料儲存成功');location.href='nurse_med_time.php'} </script>";
        }catch(PDOException $e){
            echo "資料庫連結失敗! 錯誤訊息為 " . $e->getMessage();
        }
    }
       
?>

