<?php
    echo "請開始測量體溫";
    $date = NULL;
    if(isset($_POST['date'])){
        $date = $_POST['date'];
    }

    try {
        $conn = new PDO("mysql:host=localhost;dbname=access_test", "root", "");
        $stmt = $conn->prepare("INSERT INTO body_data(m_date, remark) VALUES ('".$date."', 'good')");
        $stmt->execute();
    }catch (PDOException $e) {
        echo "資料庫連結失敗! 錯誤訊息為 " . $e->getMessage();
    }

    echo "<script> {location.href='nurse_bodydata3.php'} </script>";
?>