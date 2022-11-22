<?php 
    session_start();
    $T = NULL;
    $date = NULL;
    $remark = NULL;
    $name = $_SESSION['patient'];

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
            $conn = new PDO("mysql:host=localhost;dbname=bed_information_system", "root", "");
            $stmt = $conn->prepare("INSERT INTO body_data(T, date, name, remark) VALUES ('".$T."','".$date."','".$name."','".$remark."')");
            $stmt->execute();
            echo "<script> {window.alert('資料儲存成功');location.href='nurse_bodydata.php'} </script>";
        }catch(PDOException $e){
            echo "資料庫連結失敗! 錯誤訊息為 " . $e->getMessage();
        }
    }
       
?>

