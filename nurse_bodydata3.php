<?php
    session_start();
    try {
        $conn = new PDO("mysql:host=localhost;dbname=access_test", "root", "");
        $stmt = $conn->prepare("SELECT MAX id FROM esp_test");
        $stmt->execute();
        $Bf_data = $stmt->fetchAll();
      } catch (PDOException $e) {
        echo "資料庫連結失敗! 錯誤訊息為 " . $e->getMessage();
      }

      //echo "正在等待測量數據";

?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
    <input type="button" value="nmsl" onclick="myFunction()"></input>

    <script>
        function myFunction() {
            document.write("nmsl");
        }
    </script>
    <input type="button" name="test" id="test" value="RUN"  onclick="<?php testfun(); ?>" /><br/>

    <?php
        function testfun()
        {
            echo "Your test function on button click is working";
        //   while(true){
        //     $stmt = $conn->prepare("SELECT MAX id FROM esp_test");
        //     $stmt->execute();
        //     $Af_data = $stmt->fetchAll();
        //     if($Bf_data != $Af_data){
        //         echo "nmsl";
        //         break;
        //     }
        //     sleep(5);
        //   }
        }
    ?>
</body>
</html>