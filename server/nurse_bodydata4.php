<?php
    echo "請開始測量體溫";
    $date = NULL;
    if(isset($_POST['date'])){
        $date = $_POST['date'];
    }

    try {
        $conn = new PDO("mysql:host=localhost;dbname=id20011523_admin", "id20011523_admin", "O&Zp}A5LWd%ARi/8");
        $stmt = $conn->prepare("INSERT INTO body_data(m_date, remark) VALUES ('".$date."', 'good')");
        $stmt->execute();
    }catch (PDOException $e) {
        echo "資料庫連結失敗! 錯誤訊息為 " . $e->getMessage();
    }

    echo "<script> {location.href='nurse_bodydata3.php'} </script>";
?>