<?php
/*
    if(isset($_POST['signup'])){
        header("Location: signup.html");
    }


    session_start();
    if($_SESSION['login'] == 1){
        header("Location: login.html");
    }
*/

?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>醫護登入</title>
</head>
<body>
<?php
    //登入認證
    try {
        $conn = new PDO("mysql:host=localhost;dbname=access_test", "root", "");
        $stmt = $conn ->prepare("SELECT * FROM member WHERE userid=? AND password=?");
        $stmt-> execute([  $_POST['account'], $_POST['password']  ]);
        $result =  $stmt->fetchAll();   
        if(count($result) == 1 ){
            session_start();
            $_SESSION["login"] = 1;
            $_SESSION["account"] = $_POST["account"];
            $stmt = $conn ->prepare("SELECT id_number FROM member where userid = '".$_POST['account']."'"); //讀取登入帳號的身分號
            $stmt-> execute();
            $_SESSION["id_number"] = $stmt->fetchAll()[0][0];
            $stmt = $conn ->prepare("SELECT m_name FROM member where userid = '".$_POST['account']."'"); //讀取登入帳號的name
            $stmt-> execute();
            $_SESSION["name"] = $stmt->fetchAll()[0][0];
            $stmt = $conn ->prepare("SELECT identity FROM member where userid = '".$_POST['account']."'"); //讀取登入帳號的identity
            $stmt-> execute();
            $_SESSION["identity"] = $stmt->fetchAll()[0][0]; 
            $stmt = $conn ->prepare("SELECT permission FROM member where userid = '".$_POST['account']."'"); //讀取登入帳號的權限
            $stmt-> execute();
            $result =  $stmt->fetchAll()[0][0];
            $stmt = $conn ->prepare("SELECT record FROM data_change_text where id = 1"); //讀取異動資訊
            $stmt-> execute();
            $_SESSION['data_change_text'] =  $stmt->fetchAll()[0][0]; 
            switch($result){
                case 1: //登入帳號為護理師
                    $_SESSION["permission"] = 1;
                    echo "<script> {window.alert('登入成功');location.href='nurse_index.php'} </script>";break; 
                case 2: //登入帳號為病人
                    $_SESSION["permission"] = 2;
                    echo "<script> {window.alert('登入成功');location.href='patient_main.php'} </script>";break;
            }
            
            //$_SESSION['user'] = $_POST['user'];
            //$_SESSION['name'] = $result[0][1];
            
        }else{
            echo "<script> {window.alert('Login failed!! Incorrect account or password');location.href='login.html'} </script>";
        }
    } catch(PDOException $e ) {
        echo "資料庫連結失敗! 錯誤訊息為 " . $e->getMessage();
    }
?>
</body>
</html>